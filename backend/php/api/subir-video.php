<?php

declare(strict_types=1);

require __DIR__ . '/../lib/Auth.php';
require __DIR__ . '/../lib/Contenido.php';
require __DIR__ . '/../lib/Videos.php';

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
if ($_POST === [] && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    // PHP descarta el cuerpo entero si supera post_max_size y llegaría sin token:
    // se explica el motivo real en vez de un "token inválido" que despista.
    responder(413, ['ok' => false, 'error' => 'El vídeo supera el tamaño que admite el servidor.']);
}
if (!Auth::csrfValido($_POST['csrf'] ?? null)) {
    responder(403, ['ok' => false, 'error' => 'Token inválido. Recarga la página.']);
}

try {
    $video = Videos::reemplazar(
        (string) ($_POST['clave'] ?? ''),
        $_FILES['video'] ?? [],
        $_FILES['portada'] ?? null
    );
    // Se publica en el momento, como las imágenes.
    $archivos = Contenido::aplicar();
} catch (InvalidArgumentException $e) {
    responder(422, ['ok' => false, 'error' => $e->getMessage()]);
} catch (RuntimeException $e) {
    responder(500, ['ok' => false, 'error' => $e->getMessage()]);
}

responder(200, ['ok' => true, 'video' => $video, 'archivos' => $archivos]);
