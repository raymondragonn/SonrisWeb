<?php

declare(strict_types=1);

require __DIR__ . '/../lib/Auth.php';

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

if (!Auth::csrfValido($peticion['csrf'] ?? null)) {
    responder(403, ['ok' => false, 'error' => 'Token inválido. Recarga la página.']);
}

try {
    Auth::cambiarClave(
        (string) ($peticion['actual'] ?? ''),
        (string) ($peticion['nueva'] ?? '')
    );
} catch (InvalidArgumentException $e) {
    responder(422, ['ok' => false, 'error' => $e->getMessage()]);
} catch (RuntimeException $e) {
    responder(500, ['ok' => false, 'error' => $e->getMessage()]);
}

// El identificador de sesión cambió; el editor necesita el token nuevo para seguir
// publicando sin recargar la página.
responder(200, ['ok' => true, 'csrf' => Auth::tokenCsrf()]);
