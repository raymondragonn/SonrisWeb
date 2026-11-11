// Postbuild: deja el modo edición dentro de dist/, listo para subir por FTP.
// Se ejecuta solo tras `npm run build` (npm corre "postbuild" automáticamente).
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const raiz = new URL('../', import.meta.url).pathname;
const backend = `${raiz}backend/php/`;
const dist = process.env.CMS_SALIDA ? `${process.env.CMS_SALIDA.replace(/\/$/, '')}/` : `${raiz}dist/`;

if (!existsSync(dist)) {
  console.error('dist/ no existe todavía: corre "astro build" primero.');
  process.exit(1);
}

// bin/ viaja al hosting a propósito: es la única forma de recuperar el acceso si se
// pierde la contraseña del administrador. El .htaccess lo bloquea por web.
for (const carpeta of ['api', 'lib', 'bin']) {
  cpSync(`${backend}${carpeta}`, `${dist}${carpeta}`, { recursive: true });
}

// La tabla de redirecciones y las reglas del backend, en un solo .htaccess.
cpSync(`${raiz}deploy/.htaccess`, `${dist}.htaccess`);

// storage/ viaja vacía salvo su regla: es la segunda barrera sobre admin.json y lo
// editado, por si la de la raíz no llegara a aplicarse. Los datos NUNCA se suben.
mkdirSync(`${dist}storage`, { recursive: true });
cpSync(`${backend}storage/.htaccess`, `${dist}storage/.htaccess`);

// subidas/ es pública (las imágenes del administrador) y necesita su propia regla:
// sin ella, una imagen manipulada sería código ejecutable.
mkdirSync(`${dist}subidas`, { recursive: true });
writeFileSync(`${dist}subidas/.htaccess`, readFileSync(`${backend}subidas-htaccess`, 'utf8'));

console.log('✓ Modo edición copiado a dist/ (api, lib, bin, .htaccess, storage/, subidas/).');
console.log('  Al subir por FTP: NO borres storage/ ni subidas/ del servidor, ahí vive lo editado.');
