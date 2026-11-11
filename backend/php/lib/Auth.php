<?php

declare(strict_types=1);

/**
 * Acceso de administrador. Sin base de datos: los usuarios viven en storage/admin.json,
 * que PHP puede reescribir (así la contraseña se cambia desde el sitio, sin FTP).
 */
final class Auth
{
    /**
     * En producción storage/ vive dentro del sitio publicado. En Docker se mueve
     * fuera con CMS_STORAGE: Astro vacía la carpeta de salida en cada compilación y
     * se llevaría por delante el punto de montaje del volumen.
     */
    private static function archivo(): string
    {
        $dir = getenv('CMS_STORAGE') ?: __DIR__ . '/../storage';

        return rtrim($dir, '/') . '/admin.json';
    }
    private const VIDA_SESION = 7200;      // 2 h de inactividad
    private const FALLOS_LIBRES = 3;       // a partir del cuarto intento hay espera
    private const ESPERA_MAXIMA = 300;     // 5 min: molesta al atacante, no bloquea al dueño

    public static function iniciar(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            // En local se sirve por HTTP; forzar Secure impediría entrar a probar.
            'secure' => !empty($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        session_name('sonris_sesion');
        session_start();

        // Caducidad por inactividad.
        if (isset($_SESSION['visto']) && time() - $_SESSION['visto'] > self::VIDA_SESION) {
            self::cerrar();
            session_start();
        }
        $_SESSION['visto'] = time();
    }

    public static function usuarioActual(): ?string
    {
        self::iniciar();

        return $_SESSION['usuario'] ?? null;
    }

    public static function hayAdministrador(): bool
    {
        return self::datos()['usuarios'] !== [];
    }

    /**
     * Segundos que faltan antes de poder reintentar. 0 = puede intentar ya.
     */
    public static function esperaRestante(string $ip): int
    {
        $intento = self::datos()['intentos'][$ip] ?? null;
        if ($intento === null || $intento['n'] <= self::FALLOS_LIBRES) {
            return 0;
        }

        // Retardo progresivo, no bloqueo permanente: un bloqueo definitivo sería una
        // forma trivial de dejar al cliente fuera de su propio sitio.
        $espera = min(2 ** ($intento['n'] - self::FALLOS_LIBRES), self::ESPERA_MAXIMA);

        return max(0, $intento['ultimo'] + $espera - time());
    }

    public static function entrar(string $usuario, string $clave, string $ip): bool
    {
        self::iniciar();
        $datos = self::datos();

        $encontrado = null;
        foreach ($datos['usuarios'] as $u) {
            if (hash_equals($u['usuario'], $usuario)) {
                $encontrado = $u;
                break;
            }
        }

        // Se comprueba el hash incluso sin usuario, contra un hash de descarte, para que
        // acertar el nombre no se delate por tardar más en responder.
        $hash = $encontrado['hash'] ?? '$2y$12$invalidoinvalidoinvalidoinvalidoinvalidoinvalidoinvalidoinv';
        if (!password_verify($clave, $hash) || $encontrado === null) {
            $datos['intentos'][$ip] = [
                'n' => ($datos['intentos'][$ip]['n'] ?? 0) + 1,
                'ultimo' => time(),
            ];
            self::guardar($datos);

            return false;
        }

        unset($datos['intentos'][$ip]);
        self::guardar($datos);

        session_regenerate_id(true);
        $_SESSION['usuario'] = $encontrado['usuario'];
        $_SESSION['visto'] = time();
        self::marcarNavegador(true);

        return true;
    }

    public static function cerrar(): void
    {
        self::iniciar();
        $_SESSION = [];
        self::marcarNavegador(false);
        session_destroy();
    }

    public static function crear(string $usuario, string $clave): void
    {
        if (strlen($clave) < 12) {
            throw new InvalidArgumentException('La contraseña debe tener al menos 12 caracteres.');
        }
        if (!preg_match('/^[A-Za-z0-9._-]{3,32}$/', $usuario)) {
            throw new InvalidArgumentException('Usuario inválido: 3-32 caracteres, letras, números, punto, guion o guion bajo.');
        }

        $datos = self::datos();
        $datos['usuarios'] = array_values(array_filter(
            $datos['usuarios'],
            static fn (array $u): bool => $u['usuario'] !== $usuario
        ));
        $datos['usuarios'][] = [
            'usuario' => $usuario,
            'hash' => password_hash($clave, PASSWORD_DEFAULT),
            'creado' => date('c'),
        ];
        self::guardar($datos);
    }

    /**
     * Alta del primer administrador, desde la web y una sola vez.
     *
     * Se cierra sola en cuanto existe un administrador. El cerrojo evita la única
     * grieta real: dos peticiones simultáneas que comprueben "no hay nadie" a la vez
     * y creen dos cuentas, quedando una de ellas fuera del control del dueño.
     *
     * @throws InvalidArgumentException|RuntimeException
     */
    public static function crearPrimero(string $usuario, string $clave): void
    {
        $dir = dirname(self::archivo());
        if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
            throw new RuntimeException("No se pudo crear {$dir}.");
        }

        $cerrojo = @fopen($dir . '/.alta.lock', 'c');
        if ($cerrojo === false || !flock($cerrojo, LOCK_EX)) {
            throw new RuntimeException('No se pudo asegurar el alta. Inténtalo de nuevo.');
        }

        try {
            // Se vuelve a comprobar ya dentro del cerrojo, no antes.
            if (self::hayAdministrador()) {
                throw new RuntimeException('Ya existe un administrador. Esta página quedó cerrada.');
            }
            self::crear($usuario, $clave);
        } finally {
            flock($cerrojo, LOCK_UN);
            fclose($cerrojo);
            @unlink($dir . '/.alta.lock');
        }
    }

    /**
     * Cambia la contraseña del usuario con sesión abierta.
     *
     * Se exige la contraseña actual aunque ya haya sesión: si alguien encuentra el
     * equipo desatendido, sin esto podría dejar al dueño fuera de su propio sitio.
     *
     * @throws InvalidArgumentException|RuntimeException
     */
    public static function cambiarClave(string $actual, string $nueva): void
    {
        self::iniciar();
        $usuario = self::usuarioActual();

        if ($usuario === null) {
            throw new RuntimeException('No hay sesión iniciada.');
        }

        $datos = self::datos();
        $indice = null;
        foreach ($datos['usuarios'] as $i => $u) {
            if ($u['usuario'] === $usuario) {
                $indice = $i;
                break;
            }
        }

        if ($indice === null || !password_verify($actual, $datos['usuarios'][$indice]['hash'])) {
            throw new InvalidArgumentException('La contraseña actual no es correcta.');
        }
        if (strlen($nueva) < 12) {
            throw new InvalidArgumentException('La nueva contraseña debe tener al menos 12 caracteres.');
        }
        if ($nueva === $actual) {
            throw new InvalidArgumentException('La nueva contraseña debe ser distinta de la actual.');
        }

        $datos['usuarios'][$indice]['hash'] = password_hash($nueva, PASSWORD_DEFAULT);
        $datos['usuarios'][$indice]['clave_cambiada'] = date('c');
        self::guardar($datos);

        // Identificador nuevo: si alguien había robado la cookie, deja de servirle.
        session_regenerate_id(true);
    }

    public static function tokenCsrf(): string
    {
        self::iniciar();
        if (empty($_SESSION['csrf'])) {
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
        }

        return $_SESSION['csrf'];
    }

    public static function csrfValido(?string $token): bool
    {
        self::iniciar();

        return is_string($token)
            && !empty($_SESSION['csrf'])
            && hash_equals($_SESSION['csrf'], $token);
    }

    public static function ip(): string
    {
        return $_SERVER['REMOTE_ADDR'] ?? 'desconocida';
    }

    /**
     * Pista legible para el navegador: deja que Layout.astro decida si carga el editor
     * sin pedir nada al servidor. No autoriza — eso lo valida siempre la sesión.
     */
    private static function marcarNavegador(bool $activa): void
    {
        setcookie('sonris_edit', $activa ? '1' : '', [
            'expires' => $activa ? 0 : time() - 3600,
            'path' => '/',
            'secure' => !empty($_SERVER['HTTPS']),
            'httponly' => false,
            'samesite' => 'Strict',
        ]);
    }

    /** @return array{usuarios: list<array{usuario: string, hash: string, creado: string}>, intentos: array<string, array{n: int, ultimo: int}>} */
    private static function datos(): array
    {
        $crudo = is_readable(self::archivo()) ? file_get_contents(self::archivo()) : '';
        $datos = $crudo === '' || $crudo === false ? null : json_decode($crudo, true);

        return [
            'usuarios' => is_array($datos['usuarios'] ?? null) ? $datos['usuarios'] : [],
            'intentos' => is_array($datos['intentos'] ?? null) ? $datos['intentos'] : [],
        ];
    }

    /**
     * @throws RuntimeException si no se pudo escribir. Nunca debe fallar en silencio:
     *   un alta que dice "listo" sin guardar nada deja al dueño fuera de su sitio.
     */
    private static function guardar(array $datos): void
    {
        $dir = dirname(self::archivo());
        if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
            throw new RuntimeException("No se pudo crear {$dir}.");
        }
        if (!is_writable($dir)) {
            throw new RuntimeException("Sin permiso de escritura en {$dir}. Da permiso al usuario del servidor web.");
        }

        // Escritura atómica: un corte a media escritura dejaría el archivo corrupto
        // y a nadie capaz de entrar.
        $tmp = self::archivo() . '.' . getmypid() . '.tmp';
        $json = json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if (file_put_contents($tmp, $json, LOCK_EX) === false || !rename($tmp, self::archivo())) {
            @unlink($tmp);

            throw new RuntimeException('No se pudo guardar ' . self::archivo() . '.');
        }

        @chmod(self::archivo(), 0640);
    }
}
