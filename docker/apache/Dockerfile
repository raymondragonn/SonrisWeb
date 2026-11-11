# Entorno local de Sonris en un solo contenedor (puerto 8080):
#  - Apache + PHP, como Hostinger: sirve el sitio COMPILADO y el modo edición.
#  - Node 22: compila con Astro al arrancar y cada vez que cambia el código.
#
# El modo edición necesita el HTML compilado (PHP lo reescribe al publicar), por eso
# no se usa `astro dev`: ese genera las páginas al vuelo y no hay HTML que editar.
FROM php:8.3-apache

# GD con WebP: lo necesita la conversión de imágenes del modo edición.
RUN apt-get update && apt-get install -y --no-install-recommends \
      libwebp-dev libjpeg62-turbo-dev libpng-dev libfreetype6-dev \
 && docker-php-ext-configure gd --with-webp --with-jpeg --with-freetype \
 && docker-php-ext-install -j"$(nproc)" gd \
 && apt-get purge -y --auto-remove \
 && rm -rf /var/lib/apt/lists/*

# Node desde su imagen oficial (misma base Debian que php:apache).
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Raíz web = salida de Astro. Salida, caché y .astro/ comparten un solo volumen
# (montado en /app/.astro): Astro mueve archivos entre ellos con rename(), que falla
# entre volúmenes distintos (EXDEV).
ENV CMS_SALIDA=/app/.astro/dist \
    CMS_CACHE=/app/.astro/cache \
    CMS_STORAGE=/var/www/almacen \
    CMS_SUBIDAS=/var/www/subidas

# Sin AllowOverride el .htaccess del proyecto se ignoraría, y con él las reglas que
# bloquean storage/, lib/ y bin/: justo lo que hay que poder probar aquí.
RUN a2enmod rewrite headers \
 && sed -ri 's#/var/www/html#/app/.astro/dist#g' /etc/apache2/sites-available/000-default.conf \
 && printf '<Directory /app/.astro/dist>\n\tRequire all granted\n\tAllowOverride All\n</Directory>\n' \
      > /etc/apache2/conf-enabled/zz-sitio.conf

# /subidas vive fuera de la salida: Astro la vacía en cada compilación y se llevaría
# las imágenes subidas. En Hostinger la carpeta cuelga del sitio y este alias no existe.
RUN printf 'Alias /subidas /var/www/subidas\n<Directory /var/www/subidas>\n\tRequire all granted\n\tAllowOverride All\n\tphp_flag engine off\n</Directory>\n' \
      > /etc/apache2/conf-enabled/zz-subidas.conf

# Margen para subir fotos y vídeos (50 MB, el tope de Videos.php) desde el editor.
RUN printf 'upload_max_filesize=52M\npost_max_size=56M\n' > /usr/local/etc/php/conf.d/uploads.ini

COPY entrada.sh compilar.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrada.sh /usr/local/bin/compilar.sh

WORKDIR /app
ENTRYPOINT ["/usr/local/bin/entrada.sh"]
