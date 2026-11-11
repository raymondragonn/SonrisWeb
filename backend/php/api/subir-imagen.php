<?php

declare(strict_types=1);

require __DIR__ . '/../lib/Auth.php';
require __DIR__ . '/../lib/Contenido.php';
require __DIR__ . '/../lib/Imagenes.php';

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
if (!Auth::csrfValido($_POST['csrf'] ?? null)) {
    responder(403, ['ok' => false, 'error' => 'Token inválido. Recarga la página.']);
}

try {
    $imagen = Imagenes::reemplazar(
        (string) ($_POST['clave'] ?? ''),
        $_FILES['imagen'] ?? [],
        (string) ($_POST['alt'] ?? '')
    );
    // Se publica en el momento: una imagen no espera al botón Publicar.
    $archivos = Contenido::aplicar();
} catch (InvalidArgumentException $e) {
    responder(422, ['ok' => false, 'error' => $e->getMessage()]);
} catch (RuntimeException $e) {
    responder(500, ['ok' => false, 'error' => $e->getMessage()]);
}

responder(200, ['ok' => true, 'imagen' => $imagen, 'archivos' => $archivos]);
