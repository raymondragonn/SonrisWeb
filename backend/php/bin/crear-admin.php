<?php

declare(strict_types=1);

// Solo por consola. Expuesto por web sería una puerta trasera para crear administradores.
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("Este script solo se ejecuta por consola.\n");
}

require __DIR__ . '/../lib/Auth.php';

fwrite(STDOUT, "Alta de administrador — Sonris\n\n");

fwrite(STDOUT, 'Usuario: ');
$usuario = trim((string) fgets(STDIN));

// Sin eco de la contraseña: quedaría en pantalla y, por consola remota, en el historial.
$clave = leerOculto('Contraseña (mínimo 12 caracteres): ');
$repetida = leerOculto('Repite la contraseña: ');

if ($clave !== $repetida) {
    exit("\nLas contraseñas no coinciden. No se creó nada.\n");
}

try {
    Auth::crear($usuario, $clave);
} catch (InvalidArgumentException | RuntimeException $e) {
    fwrite(STDERR, "\nNo se creó el administrador: " . $e->getMessage() . "\n");
    exit(1);
}

fwrite(STDOUT, "\nListo. Entra en /entrar con esas credenciales.\n");

function leerOculto(string $mensaje): string
{
    fwrite(STDOUT, $mensaje);

    // `stty` no existe en todas partes (Windows); si falla, se pide en claro.
    if (shell_exec('command -v stty 2>/dev/null') !== null) {
        shell_exec('stty -echo 2>/dev/null');
        $valor = trim((string) fgets(STDIN));
        shell_exec('stty echo 2>/dev/null');
        fwrite(STDOUT, "\n");

        return $valor;
    }

    return trim((string) fgets(STDIN));
}
