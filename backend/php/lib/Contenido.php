<?php

declare(strict_types=1);

require_once __DIR__ . '/Derivados.php';

/**
 * Textos editados desde el modo edición.
 *
 * contenido.json es la fuente de verdad; el HTML publicado es una copia derivada.
 * Al guardar se reescriben los .html del sitio, así el visitante recibe HTML estático
 * puro y no hay coste alguno en cada visita.
 *
 * El sitio funciona igual si contenido.json está vacío o se pierde: lo editado es una
 * capa encima del texto del código fuente, nunca un reemplazo.
 *
 * Cuatro tipos de marcador, todos emitidos por src/lib/cms.ts al compilar:
 *
 *  - Texto visible:  <!--cms:clave-->texto<!--/cms-->
 *  - Atributos:      data-cms-attr='{"href":[{"k":"contacto.telefono@tel","v":"tel:+34…"}]}'
 *  - <title>:        data-cms-texto='[segmentos]'
 *  - JSON-LD:        data-cms-ld='{"/@graph/0/telephone":[segmentos]}'
 *
 * Los tres últimos usan "segmentos": una lista de trozos de texto fijo y de
 * referencias {k, v} a una clave, con v = el valor compilado. Así un atributo
 * compuesto ("Escríbenos por WhatsApp al 658 746 117") cambia solo en su parte
 * editable, y una clave sin editar conserva exactamente lo que había.
 */
final class Contenido
{
    private static function archivo(): string
    {
        $dir = getenv('CMS_STORAGE') ?: __DIR__ . '/../storage';

        return rtrim($dir, '/') . '/contenido.json';
    }

    /** Clave: minúsculas, números, punto y guion. Debe coincidir con src/lib/cms.ts. */
    public const CLAVE = '[a-z0-9][a-z0-9.\-]*';

    /** Plantilla de llms.txt que genera el build (bloqueada a la web por .htaccess). */
    private const PLANTILLA_LLMS = '/cms-plantillas/llms.json';

    private const LARGO_MAXIMO = 20000;
    private const CLAVES_MAXIMAS = 2000;

    /** @return array<string, string> */
    public static function todo(): array
    {
        $crudo = is_readable(self::archivo()) ? file_get_contents(self::archivo()) : '';
        $datos = $crudo === '' || $crudo === false ? null : json_decode($crudo, true);

        return is_array($datos) ? array_filter($datos, 'is_string') : [];
    }

    /**
     * Guarda los cambios y los aplica al HTML publicado.
     *
     * @param array<string, string> $cambios
     * @return int cuántos archivos se modificaron
     * @throws InvalidArgumentException|RuntimeException
     */
    public static function guardar(array $cambios): int
    {
        $limpios = self::validar($cambios);
        $todo = array_merge(self::todo(), $limpios);

        if (count($todo) > self::CLAVES_MAXIMAS) {
            throw new InvalidArgumentException('Demasiadas claves guardadas.');
        }

        self::escribir($todo);

        return self::aplicar();
    }

    /**
     * Reescribe los .html y llms.txt con lo guardado. Idempotente: correrlo dos
     * veces da el mismo resultado que una. Es lo que se ejecuta tras cada despliegue.
     *
     * @return int archivos modificados
     */
    public static function aplicar(): int
    {
        require_once __DIR__ . '/Imagenes.php';
        require_once __DIR__ . '/Videos.php';
        $valores = self::todo();
        $modificados = 0;
        $fallidos = [];

        foreach (self::archivosHtml() as $ruta) {
            $antes = file_get_contents($ruta);
            if ($antes === false) {
                $fallidos[] = basename($ruta);
                continue;
            }

            $despues = Videos::aplicar(Imagenes::aplicar(self::transformar($antes, $valores)));
            if ($despues === $antes) {
                continue;
            }

            // Se silencia el aviso de PHP y se informa por excepción: un warning
            // impreso aquí se colaría en medio de la respuesta JSON y la rompería.
            if (@file_put_contents($ruta, $despues, LOCK_EX) === false) {
                $fallidos[] = basename($ruta);
                continue;
            }
            $modificados++;
        }

        $llms = self::aplicarLlms($valores);
        if ($llms === false) {
            $fallidos[] = 'llms.txt';
        } elseif ($llms === true) {
            $modificados++;
        }

        // Nunca en silencio: si el sitio no se pudo reescribir, el editor debe decirlo.
        // Dar por publicado lo que no lo está es la peor forma de fallar aquí.
        if ($fallidos !== []) {
            throw new RuntimeException(
                'Sin permiso de escritura sobre ' . implode(', ', array_slice($fallidos, 0, 5))
                . (count($fallidos) > 5 ? '…' : '') . '. El servidor web debe poder modificar los archivos del sitio.'
            );
        }

        return $modificados;
    }

    /**
     * Aplica todos los marcadores de texto a un documento. Público para los tests.
     *
     * @param array<string, string> $valores
     */
    public static function transformar(string $html, array $valores): string
    {
        if ($valores === []) {
            return $html;
        }

        $html = self::textos($html, $valores);
        $html = self::atributos($html, $valores);
        $html = self::titulos($html, $valores);

        return self::jsonLd($html, $valores);
    }

    // ------------------------------------------------------------ marcadores

    /**
     * Texto visible entre comentarios. Una sola pasada para todas las claves.
     *
     * Se usa callback en vez de preg_replace porque un texto con "$1" o "\" se
     * interpretaría como referencia hacia atrás y corrompería el resultado.
     *
     * @param array<string, string> $valores
     */
    private static function textos(string $html, array $valores): string
    {
        return (string) preg_replace_callback(
            '/<!--cms:(' . self::CLAVE . ')-->.*?<!--\/cms-->/s',
            static function (array $m) use ($valores): string {
                if (!array_key_exists($m[1], $valores)) {
                    return $m[0]; // Sin valor guardado: se deja el texto del código fuente.
                }

                // El administrador escribe texto plano, nunca código. Escapar aquí es lo
                // que impide que un descuido o una cuenta comprometida inyecte HTML.
                // Los marcadores se conservan, o el campo dejaría de ser editable.
                return '<!--cms:' . $m[1] . '-->' . self::html($valores[$m[1]]) . '<!--/cms-->';
            },
            $html
        );
    }

    /**
     * Atributos de cualquier etiqueta con data-cms-attr. Astro escapa los atributos
     * (no puede haber un ">" literal dentro), así que la etiqueta termina en el
     * primer ">".
     *
     * @param array<string, string> $valores
     */
    private static function atributos(string $html, array $valores): string
    {
        return (string) preg_replace_callback(
            '/<[a-zA-Z][^>]*\sdata-cms-attr="([^"]*)"[^>]*>/',
            static function (array $m) use ($valores): string {
                $mapa = self::decodificarAtributo($m[1]);
                $etiqueta = $m[0];

                foreach ($mapa as $atributo => $segmentos) {
                    if (!is_array($segmentos) || !self::tocado($segmentos, $valores)
                        || !preg_match('/^[a-z][a-z0-9:-]*$/', (string) $atributo)) {
                        continue;
                    }
                    $nuevo = ' ' . $atributo . '="' . self::html(self::segmentos($segmentos, $valores)) . '"';
                    $patron = '/\s' . preg_quote((string) $atributo, '/') . '="[^"]*"/';

                    $etiqueta = preg_match($patron, $etiqueta)
                        ? (string) preg_replace_callback($patron, static fn (): string => $nuevo, $etiqueta, 1)
                        : (string) preg_replace('/^<([a-zA-Z][a-zA-Z0-9-]*)/', '<$1' . str_replace('$', '\$', $nuevo), $etiqueta, 1);
                }

                return $etiqueta;
            },
            $html
        );
    }

    /**
     * <title>: su contenido es texto crudo, donde un comentario marcador se vería
     * tal cual en la pestaña del navegador y en Google.
     *
     * @param array<string, string> $valores
     */
    private static function titulos(string $html, array $valores): string
    {
        return (string) preg_replace_callback(
            '/(<title\b[^>]*\sdata-cms-texto="([^"]*)"[^>]*>).*?(<\/title>)/s',
            static function (array $m) use ($valores): string {
                $segmentos = self::decodificarAtributo($m[2]);
                if (!self::tocado($segmentos, $valores)) {
                    return $m[0];
                }

                return $m[1] . self::html(self::segmentos($segmentos, $valores)) . $m[3];
            },
            $html
        );
    }

    /**
     * Datos estructurados. Se decodifica el JSON, se cambian solo las rutas del mapa
     * y se vuelve a codificar: nunca se toca el JSON como texto, así que ningún valor
     * puede romper su sintaxis. JSON_HEX_TAG escribe "<" y ">" como < y >:
     * un texto con "</script>" no puede cerrar la etiqueta.
     *
     * Si ninguna clave del mapa está editada, el bloque queda byte a byte como lo
     * compiló Astro.
     *
     * @param array<string, string> $valores
     */
    private static function jsonLd(string $html, array $valores): string
    {
        return (string) preg_replace_callback(
            '/(<script\b[^>]*\sdata-cms-ld="([^"]*)"[^>]*>)(.*?)(<\/script>)/s',
            static function (array $m) use ($valores): string {
                $mapa = self::decodificarAtributo($m[2]);
                $tocados = array_filter($mapa, static fn ($s): bool => is_array($s) && self::tocado($s, $valores));
                if ($tocados === []) {
                    return $m[0];
                }

                $datos = json_decode($m[3]);
                if ($datos === null) {
                    return $m[0]; // JSON ilegible: mejor no tocarlo que romperlo más.
                }

                foreach ($tocados as $puntero => $segmentos) {
                    self::fijarPuntero($datos, (string) $puntero, self::segmentos($segmentos, $valores));
                }

                $json = json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);

                return $json === false ? $m[0] : $m[1] . $json . $m[4];
            },
            $html
        );
    }

    /**
     * llms.txt: texto plano, sin sitio para marcadores. El build deja al lado su
     * plantilla en segmentos y aquí se regenera entera.
     *
     * @param array<string, string> $valores
     * @return bool|null true si cambió, null si no hizo falta, false si no se pudo escribir
     */
    private static function aplicarLlms(array $valores): ?bool
    {
        $raiz = dirname(__DIR__);
        $plantilla = $raiz . self::PLANTILLA_LLMS;
        $segmentos = is_readable($plantilla) ? json_decode((string) file_get_contents($plantilla), true) : null;
        if (!is_array($segmentos)) {
            return null; // Sin plantilla no hay nada que regenerar.
        }

        $destino = $raiz . '/llms.txt';
        $nuevo = self::segmentos($segmentos, $valores);
        if (is_readable($destino) && file_get_contents($destino) === $nuevo) {
            return null;
        }

        return @file_put_contents($destino, $nuevo, LOCK_EX) !== false;
    }

    // ------------------------------------------------------------ segmentos

    /**
     * @param list<string|array{k: string, v: string}> $segmentos
     * @param array<string, string> $valores
     */
    public static function segmentos(array $segmentos, array $valores): string
    {
        $texto = '';
        foreach ($segmentos as $s) {
            if (is_string($s)) {
                $texto .= $s;
                continue;
            }
            if (!is_array($s) || !is_string($s['k'] ?? null)) {
                continue;
            }

            [$clave, $derivado] = Derivados::separar($s['k']);
            $texto .= array_key_exists($clave, $valores)
                ? Derivados::aplicar($valores[$clave], $derivado)
                : (string) ($s['v'] ?? '');
        }

        return $texto;
    }

    /** @param array<string, string> $valores */
    private static function tocado(array $segmentos, array $valores): bool
    {
        foreach ($segmentos as $s) {
            if (is_array($s) && is_string($s['k'] ?? null)
                && array_key_exists(Derivados::separar($s['k'])[0], $valores)) {
                return true;
            }
        }

        return false;
    }

    private static function decodificarAtributo(string $valor): array
    {
        $datos = json_decode(html_entity_decode($valor, ENT_QUOTES | ENT_HTML5, 'UTF-8'), true);

        return is_array($datos) ? $datos : [];
    }

    /** Puntero JSON (RFC 6901): /@graph/0/telephone */
    private static function fijarPuntero(mixed &$nodo, string $puntero, string $valor): void
    {
        if ($puntero === '' || $puntero[0] !== '/') {
            return;
        }

        $actual = &$nodo;
        foreach (explode('/', substr($puntero, 1)) as $parte) {
            $parte = str_replace(['~1', '~0'], ['/', '~'], $parte);
            if (is_array($actual) && ctype_digit($parte) && array_key_exists((int) $parte, $actual)) {
                $actual = &$actual[(int) $parte];
            } elseif (is_object($actual) && property_exists($actual, $parte)) {
                $actual = &$actual->{$parte};
            } else {
                return; // La ruta ya no existe en este JSON: no se inventa.
            }
        }
        $actual = $valor;
    }

    private static function html(string $texto): string
    {
        return htmlspecialchars($texto, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    // ------------------------------------------------------------ guardado

    /**
     * @param array<string, string> $cambios
     * @return array<string, string>
     */
    private static function validar(array $cambios): array
    {
        $limpios = [];

        foreach ($cambios as $clave => $texto) {
            if (!is_string($clave) || !preg_match('/^' . self::CLAVE . '$/', $clave)) {
                throw new InvalidArgumentException("Clave inválida: {$clave}");
            }
            if (!is_string($texto)) {
                throw new InvalidArgumentException("Valor no textual en {$clave}");
            }
            if (mb_strlen($texto) > self::LARGO_MAXIMO) {
                throw new InvalidArgumentException("Texto demasiado largo en {$clave}");
            }

            // Normaliza saltos y espacios: el HTML los colapsa igualmente, y así dos
            // guardados del mismo texto no se ven como cambios distintos.
            $limpio = trim(preg_replace('/\s+/u', ' ', $texto) ?? '');
            if ($limpio === '') {
                throw new InvalidArgumentException("El texto de {$clave} no puede quedar vacío.");
            }
            Derivados::validar($clave, $limpio);
            $limpios[$clave] = $limpio;
        }

        return $limpios;
    }

    /** @return list<string> */
    public static function archivosHtml(): array
    {
        $raiz = dirname(__DIR__); // en producción: la raíz web, junto a index.html
        $rutas = [];

        $iterador = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($raiz, FilesystemIterator::SKIP_DOTS)
        );

        foreach ($iterador as $archivo) {
            if ($archivo->isFile() && strtolower($archivo->getExtension()) === 'html') {
                $rutas[] = $archivo->getPathname();
            }
        }

        return $rutas;
    }

    /** @param array<string, string> $datos */
    private static function escribir(array $datos): void
    {
        $dir = dirname(self::archivo());
        if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
            throw new RuntimeException("No se pudo crear {$dir}.");
        }
        if (!is_writable($dir)) {
            throw new RuntimeException("Sin permiso de escritura en {$dir}.");
        }

        // Escritura atómica: un corte a media escritura dejaría el archivo corrupto
        // y se perdería todo el contenido editado.
        $tmp = self::archivo() . '.' . getmypid() . '.tmp';
        $json = json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if (file_put_contents($tmp, $json, LOCK_EX) === false || !rename($tmp, self::archivo())) {
            @unlink($tmp);

            throw new RuntimeException('No se pudo guardar ' . self::archivo() . '.');
        }
    }
}
