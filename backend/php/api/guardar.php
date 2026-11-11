<?php

declare(strict_types=1);

require __DIR__ . '/../lib/Auth.php';
require __DIR__ . '/../lib/Contenido.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');

Auth::iniciar();

function responder(int $codigo, array $cuerpo): never
{
    http_response_code($codigo);
    echo json_encode($cuerpo, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(405, ['ok' => false, 'error' => 'Método no permitido.']);
}

if (Auth::usuarioActual() === null) {
    responder(401, ['ok' => false, 'error' => 'Sesión no iniciada.']);
}

$peticion = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($peticion)) {
    responder(400, ['ok' => false, 'error' => 'Petición malformada.']);
}

// Sin token, otra web podría hacer que tu navegador reescriba el sitio con tu sesión.
if (!Auth::csrfValido($peticion['csrf'] ?? null)) {
    responder(403, ['ok' => false, 'error' => 'Token inválido. Recarga la página.']);
}

$cambios = $peticion['cambios'] ?? null;
if (!is_array($cambios) || $cambios === []) {
    responder(400, ['ok' => false, 'error' => 'No hay cambios que guardar.']);
}

try {
    $archivos = Contenido::guardar($cambios);
} catch (InvalidArgumentException $e) {
    responder(422, ['ok' => false, 'error' => $e->getMessage()]);
} catch (RuntimeException $e) {
    // Nunca en silencio: si no se pudo escribir, el editor debe decirlo, o el
    // administrador creería que publicó y habría perdido el trabajo.
    responder(500, ['ok' => false, 'error' => $e->getMessage()]);
}

responder(200, [
    'ok' => true,
    'guardados' => count($cambios),
    'archivos' => $archivos,
]);
