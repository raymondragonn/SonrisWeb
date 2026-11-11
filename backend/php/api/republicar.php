<?php

declare(strict_types=1);

require __DIR__ . '/../lib/Auth.php';
require __DIR__ . '/../lib/Contenido.php';

Auth::iniciar();

// Reaplica lo editado sobre el HTML recién subido por FTP, que llega con los textos
// del código fuente. Idempotente: correrlo dos veces da el mismo resultado que una.
if (Auth::usuarioActual() === null) {
    header('Location: /entrar');
    exit;
}

$error = null;
$archivos = 0;
try {
    $archivos = Contenido::aplicar();
} catch (Throwable $e) {
    // Sin esto, un fallo de permisos sale como página blanca de error de PHP.
    $error = $e->getMessage();
}
$claves = count(Contenido::todo());

header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
?>
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Republicar contenido · Sonris</title>
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
<?php if ($error !== null): ?>
    <h1>No se pudo republicar</h1>
    <p class="aviso" role="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p>
    <p class="entrada">Nada se ha perdido: lo editado sigue guardado. Corrige los permisos y vuelve a intentarlo.</p>
<?php else: ?>
    <h1>Contenido republicado</h1>
    <p class="entrada">
      Se reaplicaron <span class="dato"><?= $claves ?></span> texto(s) editado(s) sobre
      <span class="dato"><?= $archivos ?></span> archivo(s) del sitio.
    </p>
<?php endif; ?>
    <p class="aviso aviso--nota">Hay que ejecutar esto una vez después de cada subida por FTP.</p>
    <a class="primario" href="/">Volver al sitio <span aria-hidden="true">→</span></a>
  </main>
</body>
</html>
