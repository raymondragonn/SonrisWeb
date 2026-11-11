<?php

declare(strict_types=1);

require __DIR__ . '/../lib/Auth.php';

$usuario = Auth::usuarioActual();

header('Content-Type: application/json; charset=utf-8');
// La respuesta depende de la sesión: si se cachea, un visitante podría recibir
// la de otro y ver la barra de administración.
header('Cache-Control: no-store, private');

echo json_encode([
    'activa' => $usuario !== null,
    'usuario' => $usuario,
    // Solo con sesión: el token sirve para cerrar sesión y, más adelante, para guardar.
    'csrf' => $usuario !== null ? Auth::tokenCsrf() : null,
], JSON_UNESCAPED_UNICODE);
