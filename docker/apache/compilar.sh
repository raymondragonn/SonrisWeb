#!/bin/sh
# Compila el sitio, pasa las comprobaciones y vuelve a aplicar lo editado desde el
# modo edición (la compilación trae los textos del código fuente).
set -e
cd /app

inicio=$(date +%s)
echo "▶ Compilando…"
npm run build --silent
npm run comprobar --silent

# Apache (www-data) tiene que poder reescribir el HTML al publicar.
chown -R www-data:www-data "$CMS_SALIDA"
runuser -u www-data -- php -r 'require getenv("CMS_SALIDA") . "/lib/Contenido.php"; $n = Contenido::aplicar(); echo "  Contenido editado reaplicado en {$n} archivo(s).\n";'

echo "✓ Sitio listo en http://localhost:8080 ($(( $(date +%s) - inicio )) s)"
