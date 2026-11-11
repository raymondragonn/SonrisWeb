<?php

declare(strict_types=1);

require_once __DIR__ . '/Imagenes.php';

/**
 * Vídeos propios reemplazados desde el modo edición (los de YouTube son un enlace y
 * van por Contenido, con la clave "….youtube").
 *
 * En un hosting compartido no hay ffmpeg: el vídeo no se recomprime, se valida
 * (tipo real y peso) y se publica tal cual. Por eso el tope de peso y el aviso en el
 * editor: un vídeo pesado en la portada ralentiza la carga de la página.
 *
 * El bloque marcado <!--cms-video:clave-->…<!--/cms-video--> puede contener un
 * <video> (src, poster) o un botón que abre el vídeo en un diálogo (data-video,
 * data-poster y la <img> de portada). Se cambian esos atributos y nada más.
 */
final class Videos
{
    private const RUTA_WEB = '/subidas';
    private const CLAVE = '[a-z0-9][a-z0-9.\-]*';
    public const PESO_MAXIMO = 50 * 1024 * 1024;

    private const TIPOS = ['video/mp4' => 'mp4', 'video/webm' => 'webm'];

    private static function archivo(): string
    {
        $dir = getenv('CMS_STORAGE') ?: __DIR__ . '/../storage';

        return rtrim($dir, '/') . '/videos.json';
    }

    private static function directorio(): string
    {
        return rtrim(getenv('CMS_SUBIDAS') ?: __DIR__ . '/../subidas', '/');
    }

    /** @return array<string, array{src: string, poster?: string, posterWidth?: int, posterHeight?: int}> */
    public static function todo(): array
    {
        $crudo = is_readable(self::archivo()) ? file_get_contents(self::archivo()) : '';
        $datos = $crudo === '' || $crudo === false ? null : json_decode($crudo, true);

        return is_array($datos) ? $datos : [];
    }

    /**
     * @param array $video entrada de $_FILES
     * @param array|null $portada entrada de $_FILES, o null para conservar la actual
     * @throws InvalidArgumentException|RuntimeException
     */
    public static function reemplazar(string $clave, array $video, ?array $portada): array
    {
        if (!preg_match('/^' . self::CLAVE . '$/', $clave)) {
            throw new InvalidArgumentException("Clave de vídeo inválida: {$clave}");
        }
        $bloque = self::bloque($clave);
        if ($bloque === null) {
            throw new InvalidArgumentException("El vídeo {$clave} no existe en el sitio publicado.");
        }

        if (($video['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            throw new InvalidArgumentException(
                in_array($video['error'] ?? 0, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)
                    ? 'El vídeo supera el tamaño que admite el servidor.'
                    : 'No se recibió el vídeo completo. Inténtalo de nuevo.'
            );
        }
        if (($video['size'] ?? 0) > self::PESO_MAXIMO) {
            throw new InvalidArgumentException('El vídeo pesa más de 50 MB. Compróbalo o recórtalo antes de subirlo.');
        }
        if (!is_uploaded_file($video['tmp_name'] ?? '')) {
            throw new InvalidArgumentException('Archivo inválido.');
        }

        // El tipo real, no la extensión: un ejecutable renombrado a .mp4 no pasa.
        $tipo = (new finfo(FILEINFO_MIME_TYPE))->file($video['tmp_name']);
        if (!isset(self::TIPOS[$tipo])) {
            throw new InvalidArgumentException('Solo se aceptan vídeos MP4 o WebM.');
        }

        $todo = self::todo();
        $anterior = $todo[$clave] ?? [];
        $dir = self::directorio();

        // La portada primero: si no cumple, se rechaza todo antes de guardar el vídeo,
        // y no queda en subidas/ un archivo que no usa nadie.
        $imagen = null;
        if ($portada !== null && ($portada['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            // Mismo mínimo que el hueco donde se ve la portada (data-cms-min del HTML).
            $imagen = Imagenes::unaVariante($portada, Imagenes::leerMinimo($bloque));
        }

        $nombre = date('Ymd') . '-' . bin2hex(random_bytes(6)) . '.' . self::TIPOS[$tipo];
        if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir) || !move_uploaded_file($video['tmp_name'], $dir . '/' . $nombre)) {
            if ($imagen !== null) {
                @unlink($dir . '/' . basename($imagen['src']));
            }
            throw new RuntimeException('No se pudo guardar el vídeo. Revisa los permisos de subidas/.');
        }
        @chmod($dir . '/' . $nombre, 0644);

        $nuevo = ['src' => self::RUTA_WEB . '/' . $nombre];
        if ($imagen !== null) {
            $nuevo += ['poster' => $imagen['src'], 'posterWidth' => $imagen['width'], 'posterHeight' => $imagen['height']];
        } elseif (isset($anterior['poster'])) {
            // Sin portada nueva se conserva la que ya se había subido.
            $nuevo += array_intersect_key($anterior, array_flip(['poster', 'posterWidth', 'posterHeight']));
        }

        $todo[$clave] = $nuevo;
        self::escribir($todo);

        // Lo que ya no usa nadie solo ocuparía espacio en el hosting.
        foreach (['src', 'poster'] as $campo) {
            $viejo = $anterior[$campo] ?? null;
            if ($viejo !== null && $viejo !== ($nuevo[$campo] ?? null) && str_starts_with($viejo, self::RUTA_WEB . '/')) {
                @unlink($dir . '/' . basename($viejo));
            }
        }

        return $nuevo;
    }

    /** Escribe los vídeos reemplazados en un documento. */
    public static function aplicar(string $html): string
    {
        $videos = self::todo();
        if ($videos === []) {
            return $html;
        }

        return (string) preg_replace_callback(
            '/<!--cms-video:(' . self::CLAVE . ')-->(.*?)<!--\/cms-video-->/s',
            static function (array $m) use ($videos): string {
                $v = $videos[$m[1]] ?? null;

                return $v === null
                    ? $m[0]
                    : '<!--cms-video:' . $m[1] . '-->' . self::cambiarBloque($m[2], $v) . '<!--/cms-video-->';
            },
            $html
        );
    }

    private static function cambiarBloque(string $bloque, array $v): string
    {
        $cambiar = static function (string $etiqueta, array $atributos): string {
            foreach ($atributos as $nombre => $valor) {
                $nuevo = ' ' . $nombre . '="' . htmlspecialchars((string) $valor, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '"';
                $patron = '/\s' . preg_quote($nombre, '/') . '="[^"]*"/i';
                if (preg_match($patron, $etiqueta)) {
                    $etiqueta = (string) preg_replace_callback($patron, static fn (): string => $nuevo, $etiqueta, 1);
                }
            }

            return $etiqueta;
        };

        // <video src poster> y el botón que abre el diálogo (data-video, data-poster).
        $bloque = (string) preg_replace_callback(
            '/<(video|[a-z]+[^>]*\sdata-video=)[^>]*>/i',
            static function (array $m) use ($v, $cambiar): string {
                $esVideo = stripos($m[0], '<video') === 0;
                $atributos = $esVideo ? ['src' => $v['src']] : ['data-video' => $v['src']];
                if (isset($v['poster'])) {
                    $atributos[$esVideo ? 'poster' : 'data-poster'] = $v['poster'];
                }

                return $cambiar($m[0], $atributos);
            },
            $bloque
        );

        // La <img> de portada que pinta el botón antes de abrir el vídeo.
        if (isset($v['poster'])) {
            $bloque = (string) preg_replace_callback(
                '/<img\s[^>]*>/i',
                static fn (array $m): string => $cambiar($m[0], [
                    'src' => $v['poster'],
                    'width' => $v['posterWidth'],
                    'height' => $v['posterHeight'],
                ]),
                $bloque,
                1
            );
        }

        return $bloque;
    }

    /** El bloque marcado de esa clave en el HTML publicado; null si no existe. */
    private static function bloque(string $clave): ?string
    {
        require_once __DIR__ . '/Contenido.php';
        $patron = '/<!--cms-video:' . preg_quote($clave, '/') . '-->(.*?)<!--\/cms-video-->/s';
        foreach (Contenido::archivosHtml() as $ruta) {
            if (preg_match($patron, (string) file_get_contents($ruta), $m)) {
                return $m[1];
            }
        }

        return null;
    }

    private static function escribir(array $datos): void
    {
        $dir = dirname(self::archivo());
        if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
            throw new RuntimeException("No se pudo crear {$dir}.");
        }

        $tmp = self::archivo() . '.' . getmypid() . '.tmp';
        $json = json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if (file_put_contents($tmp, $json, LOCK_EX) === false || !rename($tmp, self::archivo())) {
            @unlink($tmp);

            throw new RuntimeException('No se pudo guardar ' . self::archivo() . '.');
        }
    }
}
