<?php

declare(strict_types=1);

require __DIR__ . '/../lib/Auth.php';

Auth::iniciar();

// Cerrar sesión solo por POST con token. Con un GET simple, cualquier web ajena
// podría sacarte de tu sesión con un <img src="https://…/salir">.
if ($_SERVER['REQUEST_METHOD'] === 'POST' && Auth::csrfValido($_POST['csrf'] ?? null)) {
    Auth::cerrar();
    header('Location: /');
    exit;
}

// Sin sesión no hay nada que cerrar.
if (Auth::usuarioActual() === null) {
    header('Location: /');
    exit;
}

// Respaldo por GET (o token inválido): se pide confirmación. También cubre el caso
// de que el JavaScript de la barra no haya cargado.
$token = Auth::tokenCsrf();

header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header("Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com");
?>
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Cerrar sesión · Sonris</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/acceso/acceso.css">
</head>
<body>
  <main class="caja">
    <a class="marca" href="/"><img src="/acceso/logo-sonris.png" width="56" height="56" alt="Sonris"></a>
    <span class="etiqueta">Modo edición</span>
    <h1>¿Cerrar sesión?</h1>
    <p class="entrada">Saldrás del modo edición. Todo lo que ya publicaste se conserva.</p>

    <form method="post">
      <input type="hidden" name="csrf" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>">
      <button type="submit" class="primario">Sí, cerrar sesión</button>
    </form>
    <a class="secundario" href="/">Seguir editando</a>
  </main>
</body>
</html>
