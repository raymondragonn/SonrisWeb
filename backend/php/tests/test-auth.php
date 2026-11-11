<?php

declare(strict_types=1);

/**
 * Comprobación de Auth. Sin framework: `php backend/php/tests/test-auth.php`.
 * Usa un storage/ temporal para no tocar el admin.json real.
 */

$raiz = sys_get_temp_dir() . '/gr-auth-' . getmypid();
mkdir($raiz . '/storage', 0775, true);
mkdir($raiz . '/lib', 0775, true);
copy(__DIR__ . '/../lib/Auth.php', $raiz . '/lib/Auth.php');

require $raiz . '/lib/Auth.php';

$_SERVER['REMOTE_ADDR'] = '203.0.113.7';
$archivo = $raiz . '/storage/admin.json';
$ip = Auth::ip();

// --- Sin administrador dado de alta ---
assert(Auth::hayAdministrador() === false, 'no debería haber admin al empezar');
assert(Auth::entrar('admin', 'lo-que-sea', $ip) === false, 'no se puede entrar sin admin');

// --- Alta ---
Auth::crear('admin', 'contrasena-larga-1');
assert(Auth::hayAdministrador() === true, 'el admin debería existir tras crearlo');

$guardado = json_decode(file_get_contents($archivo), true);
$hash = $guardado['usuarios'][0]['hash'];
assert(!str_contains($hash, 'contrasena-larga-1'), 'la contraseña NUNCA debe guardarse en claro');
assert(password_verify('contrasena-larga-1', $hash), 'el hash debe validar la contraseña');

// --- Reglas de alta ---
$rechazada = false;
try {
    Auth::crear('otro', 'corta');
} catch (InvalidArgumentException) {
    $rechazada = true;
}
assert($rechazada, 'una contraseña de menos de 12 caracteres debe rechazarse');

$rechazado = false;
try {
    Auth::crear('usuario invalido!', 'contrasena-larga-1');
} catch (InvalidArgumentException) {
    $rechazado = true;
}
assert($rechazado, 'un usuario con caracteres raros debe rechazarse');

// --- Credenciales ---
assert(Auth::entrar('admin', 'incorrecta', $ip) === false, 'contraseña mala no entra');
assert(Auth::entrar('nadie', 'contrasena-larga-1', $ip) === false, 'usuario inexistente no entra');
assert(Auth::entrar('admin', 'contrasena-larga-1', $ip) === true, 'las credenciales correctas entran');
assert(Auth::usuarioActual() === 'admin', 'la sesión debe recordar al usuario');

// --- Cerrar sesión ---
Auth::cerrar();
assert(Auth::usuarioActual() === null, 'tras salir no debe quedar sesión');

// --- Retardo progresivo ---
$otraIp = '198.51.100.9';
assert(Auth::esperaRestante($otraIp) === 0, 'sin fallos no hay espera');
for ($i = 0; $i < 6; $i++) {
    Auth::entrar('admin', 'incorrecta', $otraIp);
}
assert(Auth::esperaRestante($otraIp) > 0, 'varios fallos seguidos deben imponer espera');

// Un acierto limpia el contador; si no, el dueño quedaría fuera de su propio sitio.
$datos = json_decode(file_get_contents($archivo), true);
$datos['intentos'] = [];
file_put_contents($archivo, json_encode($datos));
assert(Auth::entrar('admin', 'contrasena-larga-1', $ip) === true, 'debe poder entrar tras limpiar');
$datos = json_decode(file_get_contents($archivo), true);
assert(($datos['intentos'] ?? []) === [], 'entrar bien debe borrar los intentos fallidos');

// --- Alta del primer administrador (pantalla /alta) ---
// Ya existe un admin en este punto: la puerta debe estar cerrada.
$cerrada = false;
try { Auth::crearPrimero('intruso', 'contrasena-larga-9'); }
catch (RuntimeException) { $cerrada = true; }
assert($cerrada, 'con un administrador existente, el alta debe rechazarse');

$antes = count(json_decode(file_get_contents($archivo), true)['usuarios']);
assert($antes === 1, 'no debe haberse creado un segundo usuario');

// Sin ningún administrador sí se permite, una vez.
file_put_contents($archivo, json_encode(['usuarios' => [], 'intentos' => []]));
assert(Auth::hayAdministrador() === false, 'punto de partida sin administrador');
Auth::crearPrimero('duenio', 'contrasena-larga-7');
assert(Auth::hayAdministrador() === true, 'el primer alta debe funcionar');

$reintento = false;
try { Auth::crearPrimero('otro', 'contrasena-larga-8'); }
catch (RuntimeException) { $reintento = true; }
assert($reintento, 'el alta debe cerrarse tras el primer administrador');
assert(count(json_decode(file_get_contents($archivo), true)['usuarios']) === 1, 'debe quedar un solo usuario');

// Las mismas reglas de contraseña que el resto.
file_put_contents($archivo, json_encode(['usuarios' => [], 'intentos' => []]));
$corta = false;
try { Auth::crearPrimero('duenio', 'corta'); }
catch (InvalidArgumentException) { $corta = true; }
assert($corta, 'el alta debe exigir contraseña larga');
assert(Auth::hayAdministrador() === false, 'un alta fallida no debe dejar la puerta cerrada');

// Se rehace el estado que esperan las comprobaciones siguientes.
file_put_contents($archivo, json_encode(['usuarios' => [], 'intentos' => []]));
Auth::crear('admin', 'contrasena-larga-1');

// --- Cambio de contraseña ---
Auth::entrar('admin', 'contrasena-larga-1', $ip);

$rechazo = null;
try { Auth::cambiarClave('la-que-no-es', 'contrasena-larga-2'); }
catch (InvalidArgumentException $e) { $rechazo = $e->getMessage(); }
assert($rechazo !== null, 'sin la contraseña actual correcta no se debe poder cambiar');

$rechazo = null;
try { Auth::cambiarClave('contrasena-larga-1', 'corta'); }
catch (InvalidArgumentException $e) { $rechazo = $e->getMessage(); }
assert($rechazo !== null, 'una contraseña nueva corta debe rechazarse');

$rechazo = null;
try { Auth::cambiarClave('contrasena-larga-1', 'contrasena-larga-1'); }
catch (InvalidArgumentException $e) { $rechazo = $e->getMessage(); }
assert($rechazo !== null, 'repetir la misma contraseña debe rechazarse');

Auth::cambiarClave('contrasena-larga-1', 'contrasena-larga-2');
Auth::cerrar();
assert(Auth::entrar('admin', 'contrasena-larga-1', $ip) === false, 'la contraseña vieja ya no debe servir');
assert(Auth::entrar('admin', 'contrasena-larga-2', $ip) === true, 'la nueva debe funcionar');

$guardado = json_decode(file_get_contents($archivo), true);
assert(!str_contains(json_encode($guardado), 'contrasena-larga-2'), 'la nueva tampoco debe guardarse en claro');

// --- CSRF ---
assert(Auth::csrfValido(null) === false, 'sin token no vale');
assert(Auth::csrfValido('inventado') === false, 'un token falso no vale');
assert(Auth::csrfValido(Auth::tokenCsrf()) === true, 'el token propio sí vale');

array_map('unlink', glob($raiz . '/storage/*') ?: []);
array_map('unlink', glob($raiz . '/lib/*') ?: []);
rmdir($raiz . '/storage');
rmdir($raiz . '/lib');
rmdir($raiz);

echo "Auth: todas las comprobaciones pasaron.\n";
