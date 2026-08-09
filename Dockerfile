# Sitio estático: se compila en Node y se sirve con nginx.
# La imagen final no lleva Node ni node_modules, solo dist/ y la config.

FROM node:22-alpine AS build
WORKDIR /app

# Las dependencias van en su propia capa: solo se reinstalan si cambia el lockfile.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run redirecciones && npm run build && npm run comprobar

FROM nginx:alpine AS runtime
# La tabla de redirecciones se genera desde src/data/redirecciones.js en la
# etapa anterior: no hay una segunda copia que se pueda desincronizar.
COPY --from=build /app/deploy/nginx-docker.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1
