<?php

declare(strict_types=1);

require __DIR__ . '/../lib/Auth.php';

Auth::iniciar();

// Se cierra sola en cuanto existe un administrador: a partir de ahí no hay nada que
// dar de alta y dejarla abierta solo añadiría superficie de ataque.
if (Auth::hayAdministrador()) {
    header('Location: /entrar');
    exit;
}

$error = null;
$ip = Auth::ip();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $espera = Auth::esperaRestante($ip);
    $usuario = trim((string) ($_POST['usuario'] ?? ''));
    $clave = (string) ($_POST['clave'] ?? '');
    $repetir = (string) ($_POST['repetir'] ?? '');

    if (!Auth::csrfValido($_POST['csrf'] ?? null)) {
        $error = 'La sesión expiró. Vuelve a intentarlo.';
    } elseif ($espera > 0) {
        $error = "Demasiados intentos. Espera {$espera} segundos.";
    } elseif ($clave !== $repetir) {
        $error = 'Las contraseñas no coinciden.';
    } else {
        try {
            Auth::crearPrimero($usuario, $clave);
            // Se entra en el momento: así queda claro que el alta funcionó y quien la
            // hizo comprueba de inmediato que la cuenta es suya.
            Auth::entrar($usuario, $clave, $ip);
            header('Location: /');
            exit;
        } catch (InvalidArgumentException | RuntimeException $e) {
            $error = $e->getMessage();
        }
    }
}

$token = Auth::tokenCsrf();
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
<title>Alta de administrador · Sonris</title>
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
    <h1>Crea la cuenta de administrador</h1>
    <p class="entrada">
      Todavía no hay ninguna cuenta. Crea la tuya para poder editar el sitio. Esta
      pantalla se cierra sola en cuanto exista un administrador.
    </p>

<?php if ($error !== null): ?>
    <p class="aviso" role="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p>
<?php endif; ?>

    <p class="aviso aviso--nota">
      Hazlo ahora: mientras esta página siga abierta, cualquiera que la encuentre
      podría crear la cuenta antes que tú.
    </p>

    <form method="post" autocomplete="on">
      <input type="hidden" name="csrf" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>">

      <label for="usuario">Usuario</label>
      <input id="usuario" name="usuario" type="text" required autofocus autocapitalize="none"
             spellcheck="false" autocomplete="username" maxlength="32"
             pattern="[A-Za-z0-9._\-]{3,32}" title="3 a 32 caracteres: letras, números, punto, guion o guion bajo">

      <label for="clave">Contraseña</label>
      <div class="campo-clave">
        <input id="clave" name="clave" type="password" required autocomplete="new-password" minlength="12">
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
      <p class="pista" id="pista">Mínimo 12 caracteres.</p>

      <label for="repetir">Repite la contraseña</label>
      <input id="repetir" name="repetir" type="password" required autocomplete="new-password" minlength="12">

      <button type="submit" class="primario">Crear administrador <span aria-hidden="true">→</span></button>
    </form>
  </main>

<script nonce="<?= htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') ?>">
  (function () {
    var campo = document.getElementById('clave');
    var repetir = document.getElementById('repetir');
    var boton = document.getElementById('ver-clave');
    var pista = document.getElementById('pista');

    boton.addEventListener('click', function () {
      var visible = campo.type === 'text';
      campo.type = repetir.type = visible ? 'password' : 'text';
      boton.setAttribute('aria-pressed', String(!visible));
      var etiqueta = visible ? 'Mostrar contraseña' : 'Ocultar contraseña';
      boton.setAttribute('aria-label', etiqueta);
      boton.title = etiqueta;
      campo.focus();
    });

    campo.addEventListener('input', function () {
      var n = campo.value.length;
      pista.textContent = n === 0 ? 'Mínimo 12 caracteres.' : n + ' de 12 caracteres mínimos.';
      pista.classList.toggle('pista--corta', n > 0 && n < 12);
    });

    // Nunca visibles al enviar: el navegador puede conservar la página en caché.
    campo.form.addEventListener('submit', function () {
      campo.type = repetir.type = 'password';
    });
  })();
</script>
</body>
</html>
