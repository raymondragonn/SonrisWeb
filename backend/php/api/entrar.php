<?php

declare(strict_types=1);

require __DIR__ . '/../lib/Auth.php';

Auth::iniciar();

$error = null;
$ip = Auth::ip();

// Ya dentro: no tiene sentido volver a pedir credenciales.
if (Auth::usuarioActual() !== null) {
    header('Location: /');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $espera = Auth::esperaRestante($ip);

    if (!Auth::csrfValido($_POST['csrf'] ?? null)) {
        $error = 'La sesión expiró. Vuelve a intentarlo.';
    } elseif ($espera > 0) {
        $error = "Demasiados intentos. Espera {$espera} segundos.";
    } elseif (!Auth::entrar((string) ($_POST['usuario'] ?? ''), (string) ($_POST['clave'] ?? ''), $ip)) {
        // Mismo mensaje para usuario inexistente y contraseña incorrecta: decir cuál
        // de los dos falló regala la mitad del trabajo a quien prueba credenciales.
        $error = 'Usuario o contraseña incorrectos.';
    } else {
        header('Location: /');
        exit;
    }
}

$token = Auth::tokenCsrf();

// Nonce para el único script de la página (mostrar/ocultar contraseña). Así el
// script-src sigue siendo estricto en vez de abrirse con 'unsafe-inline'.
$nonce = base64_encode(random_bytes(16));

header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header(
    "Content-Security-Policy: default-src 'self';"
    . " style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
    . " font-src https://fonts.gstatic.com;"
    . " script-src 'nonce-{$nonce}'"
);
?>
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Acceso · Sonris</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/acceso/acceso.css">
</head>
<body>
  <main class="caja">
    <a class="marca" href="/"><img src="/acceso/logo-sonris.png" width="56" height="56" alt="Sonris"></a>
    <h1>Acceso</h1>

<?php if ($error !== null): ?>
    <p class="aviso" role="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p>
<?php endif; ?>

    <form method="post" autocomplete="on">
      <input type="hidden" name="csrf" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>">

      <label for="usuario">Usuario</label>
      <input id="usuario" name="usuario" type="text" required autofocus autocapitalize="none"
             spellcheck="false" autocomplete="username">

      <label for="clave">Contraseña</label>
      <div class="campo-clave">
        <input id="clave" name="clave" type="password" required autocomplete="current-password">
        <button type="button" id="ver-clave" class="ver-clave" aria-pressed="false"
                aria-controls="clave" aria-label="Mostrar contraseña" title="Mostrar contraseña">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M1.5 12S5.2 5 12 5s10.5 7 10.5 7-3.7 7-10.5 7S1.5 12 1.5 12Z"/>
            <circle cx="12" cy="12" r="3.2"/>
            <line class="tachado" x1="3" y1="21" x2="21" y2="3"/>
          </svg>
        </button>
      </div>

      <button type="submit" class="primario">Entrar <span aria-hidden="true">→</span></button>
    </form>

    <a class="volver" href="/">← Volver al sitio</a>
  </main>

<script nonce="<?= htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') ?>">
  (function () {
    var campo = document.getElementById('clave');
    var boton = document.getElementById('ver-clave');

    boton.addEventListener('click', function () {
      var visible = campo.type === 'text';
      campo.type = visible ? 'password' : 'text';
      boton.setAttribute('aria-pressed', String(!visible));
      var etiqueta = visible ? 'Mostrar contraseña' : 'Ocultar contraseña';
      boton.setAttribute('aria-label', etiqueta);
      boton.title = etiqueta;
      campo.focus();
    });

    // Nunca dejarla a la vista al enviar: el navegador puede conservar la página
    // en caché al volver atrás, y quedaría legible en pantalla.
    campo.form.addEventListener('submit', function () {
      campo.type = 'password';
    });
  })();
</script>
</body>
</html>
