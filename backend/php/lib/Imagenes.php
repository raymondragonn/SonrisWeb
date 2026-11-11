<?php

declare(strict_types=1);

/**
 * Imágenes reemplazadas desde el modo edición.
 *
 * Astro sirve cada imagen con varios anchos (srcset) para que el móvil descargue la
 * pequeña. Una imagen reemplazada tiene que hacer lo mismo o empeora la carga de la
 * página: al subirla se generan en WebP los mismos anchos que tenía la compilada, y
 * al aplicarla se reescriben src, srcset, width, height y alt conservando el resto
 * de la etiqueta (sizes, loading, decoding, clases y estilos).
 *
 * Los archivos van a subidas/ en la raíz web, no dentro de storage/, para no abrir
 * excepciones en la regla que protege storage/. Esa carpeta lleva su propio
 * .htaccess que impide ejecutar código: sin él, una imagen manipulada sería código
 * ejecutable.
 */
final class Imagenes
{
    private const RUTA_WEB = '/subidas';
    private const CLAVE = '[a-z0-9][a-z0-9.\-]*';
    private const PESO_MAXIMO = 20 * 1024 * 1024;   // 20 MB, igual que el php.ini
    private const ANCHO_MAXIMO = 2000;              // por encima no aporta nada visible
    private const PIXELES_MAXIMOS = 50000000;       // freno a imágenes que agotan la memoria
    private const CALIDAD = 80;

    private const TIPOS = ['image/jpeg' => true, 'image/png' => true, 'image/webp' => true];

    private static function archivo(): string
    {
        $dir = getenv('CMS_STORAGE') ?: __DIR__ . '/../storage';

        return rtrim($dir, '/') . '/imagenes.json';
    }

    /**
     * Carpeta física de las imágenes subidas. En producción cuelga del sitio
     * publicado; en Docker vive fuera y Apache la expone con un Alias, porque Astro
     * vacía la salida en cada compilación.
     */
    private static function directorio(): string
    {
        return rtrim(getenv('CMS_SUBIDAS') ?: __DIR__ . '/../subidas', '/');
    }

    /** @return array<string, array{src: string, srcset: string, width: int, height: int, alt: string, anchos: list<int>}> */
    public static function todo(): array
    {
        $crudo = is_readable(self::archivo()) ? file_get_contents(self::archivo()) : '';
        $datos = $crudo === '' || $crudo === false ? null : json_decode($crudo, true);

        return is_array($datos['fijas'] ?? null) ? $datos['fijas'] : [];
    }

    /**
     * Valida la subida, genera las variantes y la registra bajo la clave. Sirve para
     * imágenes fijas (<img> marcada) y para fondos (data-cms-fondo en un style).
     *
     * @param array $archivo entrada de $_FILES
     * @throws InvalidArgumentException|RuntimeException
     */
    public static function reemplazar(string $clave, array $archivo, string $alt): array
    {
        if (!preg_match('/^' . self::CLAVE . '$/', $clave)) {
            throw new InvalidArgumentException("Clave de imagen inválida: {$clave}");
        }

        // Destino (tipo, anchos y mínimo) leído del HTML compilado una sola vez y
        // guardado: tras el primer reemplazo el HTML publicado ya lleva los de la
        // subida, y leerlos de ahí haría que cada reemplazo heredara los del anterior.
        $guardada = self::todo()[$clave] ?? null;
        $destino = isset($guardada['tipo'], $guardada['anchos'], $guardada['minimo'])
            ? ['tipo' => $guardada['tipo'], 'anchos' => $guardada['anchos'], 'minimo' => $guardada['minimo']]
            : self::destino($clave);
        if ($destino === null) {
            throw new InvalidArgumentException("La imagen {$clave} no existe en el sitio publicado.");
        }

        $alt = trim(preg_replace('/\s+/u', ' ', $alt) ?? '');
        if ($destino['tipo'] === 'img' && $alt === '') {
            // Sin texto alternativo se pierde accesibilidad y contexto para buscadores.
            // Un fondo es decorativo y no lo lleva.
            throw new InvalidArgumentException('El texto alternativo es obligatorio.');
        }
        if (mb_strlen($alt) > 250) {
            throw new InvalidArgumentException('El texto alternativo es demasiado largo (máximo 250 caracteres).');
        }

        [$ruta, $tipo, $ancho, $alto] = self::validarArchivo($archivo);
        self::exigirMinimo($ancho, $alto, $destino['minimo']);

        return self::registrar(
            $clave,
            self::convertir($ruta, $tipo, $ancho, $alto, $destino['anchos']) + ['alt' => $alt] + $destino
        );
    }

    /**
     * Una imagen más pequeña que el hueco se vería borrosa: se rechaza con el motivo.
     *
     * @param array{0: int, 1: int}|null $minimo
     * @throws InvalidArgumentException
     */
    public static function exigirMinimo(int $ancho, int $alto, ?array $minimo): void
    {
        if ($minimo === null || ($ancho >= $minimo[0] && $alto >= $minimo[1])) {
            return;
        }

        throw new InvalidArgumentException(
            "La imagen es demasiado pequeña: mide {$ancho} × {$alto} px y el mínimo para este espacio es "
            . "{$minimo[0]} × {$minimo[1]} px. Usa una de mayor resolución."
        );
    }

    /** "880x580" → [880, 580]; null si falta o no se entiende. */
    public static function leerMinimo(string $etiqueta): ?array
    {
        return preg_match('/\sdata-cms-min="(\d+)x(\d+)"/', $etiqueta, $m) ? [(int) $m[1], (int) $m[2]] : null;
    }

    // ------------------------------------------------------------------ subida

    /**
     * Una sola variante WebP, sin registrar clave: la portada de un vídeo.
     *
     * @return array{src: string, srcset: string, width: int, height: int}
     * @throws InvalidArgumentException|RuntimeException
     */
    public static function unaVariante(array $archivo, ?array $minimo = null): array
    {
        [$ruta, $tipo, $ancho, $alto] = self::validarArchivo($archivo);
        self::exigirMinimo($ancho, $alto, $minimo);

        return self::convertir($ruta, $tipo, $ancho, $alto, $minimo === null ? [] : [$minimo[0]]);
    }

    /**
     * @return array{0: string, 1: string, 2: int, 3: int} ruta temporal, tipo, ancho, alto
     * @throws InvalidArgumentException
     */
    private static function validarArchivo(array $archivo): array
    {
        if (($archivo['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            throw new InvalidArgumentException(self::mensajeError((int) ($archivo['error'] ?? UPLOAD_ERR_NO_FILE)));
        }
        if (($archivo['size'] ?? 0) > self::PESO_MAXIMO) {
            throw new InvalidArgumentException('La imagen pesa más de 20 MB.');
        }
        if (!is_uploaded_file($archivo['tmp_name'] ?? '')) {
            throw new InvalidArgumentException('Archivo inválido.');
        }

        // El tipo real, no la extensión: un .php renombrado a .jpg pasaría el filtro
        // de nombre sin problema. Este formulario está expuesto a internet.
        $tipo = (new finfo(FILEINFO_MIME_TYPE))->file($archivo['tmp_name']);
        if (!isset(self::TIPOS[$tipo])) {
            throw new InvalidArgumentException('Solo se aceptan imágenes JPG, PNG o WebP.');
        }

        $medidas = @getimagesize($archivo['tmp_name']);
        if ($medidas === false) {
            throw new InvalidArgumentException('El archivo no es una imagen válida.');
        }
        if ($medidas[0] * $medidas[1] > self::PIXELES_MAXIMOS) {
            throw new InvalidArgumentException('La imagen tiene demasiados píxeles.');
        }

        return [$archivo['tmp_name'], $tipo, $medidas[0], $medidas[1]];
    }

    /**
     * Genera una variante WebP por cada ancho que usaba la imagen compilada. src
     * apunta a la mayor, como en la compilada.
     *
     * @param list<int> $anchos
     * @return array{src: string, srcset: string, width: int, height: int}
     * @throws RuntimeException
     */
    private static function convertir(string $origen, string $tipo, int $ancho, int $alto, array $anchos): array
    {
        $dir = self::directorio();
        if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
            throw new RuntimeException('No se pudo crear la carpeta de subidas.');
        }
        if (!is_writable($dir)) {
            throw new RuntimeException('Sin permiso de escritura en subidas/. Da permiso al usuario del servidor web.');
        }
        if (!function_exists('imagewebp')) {
            throw new RuntimeException('El servidor no tiene soporte WebP en GD.');
        }

        $imagen = match ($tipo) {
            'image/jpeg' => @imagecreatefromjpeg($origen),
            'image/png' => @imagecreatefrompng($origen),
            'image/webp' => @imagecreatefromwebp($origen),
        };
        if ($imagen === false) {
            throw new RuntimeException('No se pudo leer la imagen.');
        }

        // Un PNG con transparencia quedaría con fondo negro sin esto.
        imagepalettetotruecolor($imagen);
        imagealphablending($imagen, false);
        imagesavealpha($imagen, true);

        // Los mismos anchos que tenía la compilada, ni uno más: añadir uno mayor haría
        // que las pantallas grandes descargaran más que antes. Sin srcset, una sola
        // variante. Nunca se agranda la original.
        $maximo = min($ancho, self::ANCHO_MAXIMO);
        $objetivos = array_values(array_unique(array_filter($anchos, static fn (int $a): bool => $a <= $maximo)));
        if ($objetivos === []) {
            $objetivos = [$anchos === [] ? $maximo : min($maximo, max($anchos))];
        }
        sort($objetivos);

        $base = date('Ymd') . '-' . bin2hex(random_bytes(6));
        $variantes = [];

        try {
            foreach ($objetivos as $w) {
                $h = (int) round($alto * $w / $ancho);
                $escalada = $w === $ancho ? $imagen : imagescale($imagen, $w, $h, IMG_BICUBIC);
                if ($escalada === false) {
                    throw new RuntimeException('No se pudo redimensionar la imagen.');
                }
                imagesavealpha($escalada, true);

                $nombre = "{$base}-{$w}.webp";
                $ok = imagewebp($escalada, $dir . '/' . $nombre, self::CALIDAD);
                if ($escalada !== $imagen) {
                    imagedestroy($escalada);
                }
                if (!$ok) {
                    throw new RuntimeException('No se pudo guardar la imagen convertida.');
                }
                @chmod($dir . '/' . $nombre, 0644);
                $variantes[] = ['src' => self::RUTA_WEB . '/' . $nombre, 'w' => $w, 'h' => $h];
            }
        } finally {
            imagedestroy($imagen);
        }

        $mayor = end($variantes);

        return [
            'src' => $mayor['src'],
            'srcset' => implode(', ', array_map(static fn (array $v): string => "{$v['src']} {$v['w']}w", $variantes)),
            'width' => $mayor['w'],
            'height' => $mayor['h'],
        ];
    }

    /**
     * Qué hay que generar para esa clave, leído del HTML compilado: tipo, anchos del
     * srcset (los mismos que emitió Astro) y resolución mínima. Se lee en el
     * servidor, no se acepta del navegador: así nadie puede pedir otra cosa.
     *
     * @return array{tipo: string, anchos: list<int>, minimo: array{0: int, 1: int}|null}|null
     */
    private static function destino(string $clave): ?array
    {
        require_once __DIR__ . '/Contenido.php';
        $marca = '<!--cms-img:' . $clave . '-->';
        $fondo = '/<[a-zA-Z][^>]*\sdata-cms-fondo="' . preg_quote($clave, '/') . '"[^>]*>/';

        foreach (Contenido::archivosHtml() as $ruta) {
            $html = (string) file_get_contents($ruta);

            $inicio = strpos($html, $marca);
            if ($inicio !== false) {
                $fin = strpos($html, '<!--/cms-img-->', $inicio);
                $bloque = substr($html, $inicio, $fin === false ? 0 : $fin - $inicio);
                $anchos = [];
                if (preg_match('/\ssrcset="([^"]*)"/', $bloque, $m)) {
                    preg_match_all('/\s(\d+)w(?:,|$)/', ' ' . html_entity_decode($m[1]), $w);
                    $anchos = array_values(array_filter(array_map('intval', $w[1]), static fn (int $a): bool => $a > 0 && $a <= self::ANCHO_MAXIMO));
                }

                // alt="" a propósito (una foto que repite a otra): decorativa, sin descripción.
                $decorativa = (bool) preg_match('/<img\s[^>]*\salt=""/i', $bloque);

                return ['tipo' => $decorativa ? 'decorativa' : 'img', 'anchos' => $anchos, 'minimo' => self::leerMinimo($bloque)];
            }

            if (preg_match($fondo, $html, $m)) {
                $minimo = self::leerMinimo($m[0]);

                // Un fondo se sirve a un solo ancho: el de la compilada.
                return ['tipo' => 'fondo', 'anchos' => $minimo === null ? [] : [$minimo[0]], 'minimo' => $minimo];
            }
        }

        return null;
    }

    /** @param array{src: string, srcset: string, width: int, height: int, alt: string, anchos: list<int>} $imagen */
    private static function registrar(string $clave, array $imagen): array
    {
        $datos = ['fijas' => self::todo()];
        $anterior = $datos['fijas'][$clave] ?? null;
        $datos['fijas'][$clave] = $imagen;
        self::escribir($datos);

        // Las variantes anteriores ya no las usa nadie: solo ocuparían espacio.
        if ($anterior !== null) {
            preg_match_all('#' . self::RUTA_WEB . '/([A-Za-z0-9._-]+\.webp)#', (string) ($anterior['srcset'] ?? '') . ' ' . $anterior['src'], $m);
            foreach (array_unique($m[1]) as $nombre) {
                @unlink(self::directorio() . '/' . $nombre);
            }
        }

        return $imagen;
    }

    // --------------------------------------------------------------- aplicar

    /** Escribe las imágenes reemplazadas en un documento. */
    public static function aplicar(string $html): string
    {
        $fijas = self::todo();
        if ($fijas === []) {
            return $html;
        }

        $html = (string) preg_replace_callback(
            '/<!--cms-img:(' . self::CLAVE . ')-->(.*?)<!--\/cms-img-->/s',
            static function (array $m) use ($fijas): string {
                $img = $fijas[$m[1]] ?? null;

                return $img === null
                    ? $m[0]
                    : '<!--cms-img:' . $m[1] . '-->' . self::cambiarAtributos($m[2], $img) . '<!--/cms-img-->';
            },
            $html
        );

        // Fondos: solo la url() del style de la etiqueta marcada.
        return (string) preg_replace_callback(
            '/<[a-zA-Z][^>]*\sdata-cms-fondo="(' . self::CLAVE . ')"[^>]*>/',
            static function (array $m) use ($fijas): string {
                $img = $fijas[$m[1]] ?? null;
                if ($img === null) {
                    return $m[0];
                }
                $url = 'url(' . htmlspecialchars($img['src'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . ')';

                return (string) preg_replace_callback(
                    '/(\sstyle="[^"]*?)url\([^)]*\)/',
                    static fn (array $s): string => $s[1] . $url,
                    $m[0],
                    1
                );
            },
            $html
        );
    }

    /** src, srcset, alt, width y height de la primera <img> del bloque. */
    private static function cambiarAtributos(string $bloque, array $img): string
    {
        return (string) preg_replace_callback(
            '/<img\s[^>]*>/i',
            static function (array $m) use ($img): string {
                $etiqueta = $m[0];
                $nuevos = [
                    'src' => $img['src'],
                    'alt' => $img['alt'],
                    'width' => (string) $img['width'],
                    'height' => (string) $img['height'],
                ];
                // srcset solo si la compilada lo tenía: si no, sizes no existe y un
                // srcset suelto haría que el navegador eligiera sin contexto.
                if (preg_match('/\ssrcset="/i', $etiqueta) && $img['srcset'] !== '') {
                    $nuevos['srcset'] = $img['srcset'];
                }

                foreach ($nuevos as $atributo => $valor) {
                    $nuevo = ' ' . $atributo . '="' . htmlspecialchars($valor, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '"';
                    $patron = '/\s' . $atributo . '="[^"]*"/i';
                    $etiqueta = preg_match($patron, $etiqueta)
                        ? (string) preg_replace_callback($patron, static fn (): string => $nuevo, $etiqueta, 1)
                        : (string) preg_replace_callback('/^<img/i', static fn (): string => '<img' . $nuevo, $etiqueta, 1);
                }

                return $etiqueta;
            },
            $bloque,
            1
        );
    }

    // ------------------------------------------------------------------ apoyo

    private static function mensajeError(int $codigo): string
    {
        return match ($codigo) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'La imagen es demasiado grande.',
            UPLOAD_ERR_PARTIAL => 'La subida se interrumpió. Inténtalo de nuevo.',
            UPLOAD_ERR_NO_FILE => 'No se recibió ninguna imagen.',
            default => 'No se pudo subir la imagen.',
        };
    }

    private static function escribir(array $datos): void
    {
        $dir = dirname(self::archivo());
        if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
            throw new RuntimeException("No se pudo crear {$dir}.");
        }
        if (!is_writable($dir)) {
            throw new RuntimeException("Sin permiso de escritura en {$dir}.");
        }

        $tmp = self::archivo() . '.' . getmypid() . '.tmp';
        $json = json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if (file_put_contents($tmp, $json, LOCK_EX) === false || !rename($tmp, self::archivo())) {
            @unlink($tmp);

            throw new RuntimeException('No se pudo guardar ' . self::archivo() . '.');
        }
    }
}
