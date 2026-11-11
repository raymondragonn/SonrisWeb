#!/bin/sh
set -e

# Datos del modo edición, fuera de la salida de Astro (que se vacía al compilar).
# Los volúmenes nacen como root y Apache (www-data) tiene que poder escribir.
for d in "$CMS_STORAGE" "$CMS_SUBIDAS"; do
  mkdir -p "$d"
  chown -R www-data:www-data "$d"
done

# subidas/ es pública: sin esta regla, una imagen manipulada sería código ejecutable.
# Es el mismo archivo que viaja a Hostinger (backend/php/subidas-htaccess).
cp /app/backend/php/subidas-htaccess "$CMS_SUBIDAS/.htaccess"
chown www-data:www-data "$CMS_SUBIDAS/.htaccess"

cd /app
# node_modules propio del contenedor (volumen): sus binarios nativos son de Linux y
# pisarían los de macOS.
[ -d node_modules/astro ] || npm ci

mkdir -p "$CMS_SALIDA"
compilar.sh || echo "✗ La compilación falló: corrige el error y guarda; se reintenta sola."

# Vigilante: recompila cuando cambia el código. Por sondeo y no con eventos: los
# eventos de archivo no cruzan de forma fiable el montaje de macOS.
(
  marca=/tmp/ultima-compilacion
  touch "$marca"
  while true; do
    sleep 2
    if [ -n "$(find src public backend scripts deploy astro.config.mjs package.json -newer "$marca" -type f 2>/dev/null | head -n 1)" ]; then
      sleep 1 # que termine de guardarse lo que se esté guardando
      touch "$marca"
      compilar.sh || echo "✗ La compilación falló: corrige el error y guarda; se reintenta sola."
    fi
  done
) &

exec docker-php-entrypoint apache2-foreground
