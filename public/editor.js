/**
 * Modo edición de Sonris. Solo se descarga si existe la cookie sonris_edit, que pone
 * el login: un visitante normal nunca pide este archivo (ver Base.astro).
 *
 * La cookie es una pista, no una autorización: se confirma contra el servidor antes
 * de mostrar nada, y el servidor vuelve a comprobar la sesión en cada guardado.
 *
 * Qué se edita aquí:
 *  - Textos marcados en la página (<!--cms:clave-->…<!--/cms-->), en su sitio.
 *  - Imágenes marcadas (<!--cms-img:clave-->), con un botón encima.
 *  - En el panel Ajustes: título y descripción para Google, datos de contacto y la
 *    contraseña. No se ven como texto suelto en la página o viven en varios sitios.
 *
 * Una misma clave puede aparecer varias veces (el teléfono sale en el menú, en el
 * pie y en la caja final): al escribir en una, se copian las demás, y al publicar
 * PHP la actualiza también donde no se ve (enlaces tel:, JSON-LD, llms.txt).
 */
(function () {
  'use strict';

  var ALTURA = 48;
  var TOPE_TITULO = 60;
  var TOPE_DESCRIPCION = 155;

  // Mismas reglas que Derivados::validar(): mejor avisar aquí que tras publicar.
  var VALIDAR = {
    'contacto.telefono': telefono,
    'contacto.whatsapp': telefono,
    'contacto.email': function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Escribe un correo válido (ej. hola@sonris.es).';
    },
  };
  function telefono(v) {
    return /^[\d\s]+$/.test(v) && /^[6-9]\d{8}$/.test(v.replace(/\s/g, ''))
      ? null
      : 'Escribe los 9 dígitos del teléfono, con o sin espacios (ej. 910 459 517).';
  }

  var sesion = null;
  var campos = []; // { clave, elemento, original, leer, escribir, encabezado }
  var barra = null;
  var avisos = null;
  var panel = null;

  fetch('/api/sesion.php', { credentials: 'same-origin' })
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(function (s) {
      if (!s || !s.activa) {
        // Sesión caducada o cerrada en otra pestaña: se limpia la pista para no
        // volver a descargar este archivo en cada página.
        document.cookie = 'sonris_edit=; path=/; max-age=0; samesite=strict';
        return;
      }
      sesion = s;
      inyectarEstilos();
      avisos = crearContenedorAvisos();
      mostrarBloques();
      campos = prepararCampos();
      barra = construirBarra();
      prepararMedios();
      abrirDesplegables();
      bloquearNavegacion();
      vigilarNuevos();
      document.documentElement.classList.add('cms-editando');
      actualizarContador();
      campos.forEach(function (c) {
        if (c.elemento.classList.contains('cms-campo')) marcarFondo(c.elemento);
      });
      notificar(
        'exito',
        'Modo edición activo',
        campos.length + ' textos editables en esta página. Los datos de contacto y lo que ve Google están en Ajustes.'
      );
    })
    .catch(function () {
      /* Sin respuesta del servidor no se muestra nada: mejor callar que mentir. */
    });

  // ------------------------------------------------------------- notificaciones

  function crearContenedorAvisos() {
    var c = document.createElement('div');
    c.className = 'cms-avisos';
    // Se anuncian a lectores de pantalla sin robar el foco de lo que se escribe.
    c.setAttribute('aria-live', 'polite');
    document.body.appendChild(c);
    return c;
  }

  /**
   * Tarjeta blanca compacta con los colores y tipografías del sitio, sin iconos:
   * el estado se lee en el título (rojo en los errores, con borde rojo completo).
   *
   * @param {'exito'|'error'|'aviso'|'progreso'} tipo  progreso: sin cierre
   *   automático, se actualiza con .detalle() y se retira con .remove().
   */
  function notificar(tipo, titulo, detalle) {
    var a = document.createElement('div');
    a.className = 'cms-aviso cms-aviso--' + tipo;
    a.setAttribute('role', tipo === 'error' ? 'alert' : 'status');

    var cuerpo = document.createElement('div');
    cuerpo.className = 'cms-aviso-cuerpo';
    var t = document.createElement('p');
    t.className = 'cms-aviso-titulo';
    t.textContent = titulo;
    var d = document.createElement('p');
    d.className = 'cms-aviso-texto';
    d.textContent = detalle || '';
    d.hidden = !detalle;
    cuerpo.appendChild(t);
    cuerpo.appendChild(d);

    var cerrar = document.createElement('button');
    cerrar.type = 'button';
    cerrar.className = 'cms-aviso-cerrar';
    cerrar.setAttribute('aria-label', 'Cerrar el aviso');
    cerrar.textContent = '✕';
    cerrar.addEventListener('click', function () {
      a.remove();
    });

    a.appendChild(cuerpo);
    if (tipo !== 'progreso') a.appendChild(cerrar);
    avisos.appendChild(a);

    // Los errores no se van solos: si desaparecen mientras se mira a otro lado, se
    // creería que el cambio se publicó cuando no fue así.
    if (tipo === 'exito' || tipo === 'aviso') {
      var reloj = window.setTimeout(function () {
        a.remove();
      }, 6000);
      a.addEventListener('mouseenter', function () {
        window.clearTimeout(reloj);
      });
    }
    // Pocos a la vez: en un móvil cada aviso tapa contenido que se está editando.
    while (avisos.children.length > 2) avisos.firstChild.remove();

    /** Para las de progreso: "Subiendo… 45 %". */
    a.detalle = function (texto) {
      d.textContent = texto;
      d.hidden = !texto;
    };
    return a;
  }

  // ---------------------------------------------------------------- campos

  /**
   * Busca los pares <!--cms:clave--> … <!--/cms--> y envuelve lo que hay entre ellos
   * en un span editable. Los comentarios se conservan: son lo que PHP usa después.
   */
  function prepararCampos() {
    var recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
    var aperturas = [];
    var nodo;
    while ((nodo = recorrido.nextNode())) {
      var m = /^cms:([a-z0-9][a-z0-9.\-]*)$/.exec(nodo.nodeValue.trim());
      // Ya envuelto en una pasada anterior: se salta.
      var siguiente = nodo.nextSibling;
      if (siguiente && siguiente.nodeType === 1 && siguiente.classList.contains('cms-campo')) continue;
      if (m) aperturas.push({ clave: m[1], comentario: nodo });
    }

    var lista = [];
    aperturas.forEach(function (a) {
      var span = envolver(a.comentario);
      if (!span) return;

      span.className = 'cms-campo';
      span.dataset.cmsClave = a.clave;
      // plaintext-only impide que el navegador meta HTML al escribir o pegar.
      span.contentEditable = 'plaintext-only';
      if (span.contentEditable !== 'plaintext-only') span.contentEditable = 'true';
      span.spellcheck = true;
      span.title = a.clave;

      var campo = {
        clave: a.clave,
        elemento: span,
        original: limpiar(span.textContent),
        leer: function () {
          return limpiar(span.textContent);
        },
        escribir: function (v) {
          span.textContent = v;
        },
        // Vaciar un encabezado deja un hueco y daña el posicionamiento.
        encabezado: !!span.closest('h1,h2,h3'),
      };

      span.addEventListener('input', function () {
        copiarA(campo);
        actualizarContador();
      });
      span.addEventListener('paste', pegarComoTextoPlano);
      span.addEventListener('mouseenter', function () {
        marcarFondo(span);
      });
      span.addEventListener('focus', function () {
        marcarFondo(span);
      });
      span.addEventListener('blur', function () {
        if (campo.leer() === '') {
          notificar(
            'aviso',
            campo.encabezado ? 'Encabezado vacío' : 'Texto vacío',
            campo.encabezado
              ? 'Los encabezados vacíos perjudican el posicionamiento en buscadores.'
              : 'Este campo quedó sin contenido y no se podrá publicar así.'
          );
        }
      });
      span.addEventListener('keydown', function (e) {
        // Enter partiría el texto en varias líneas; Escape deshace lo escrito.
        if (e.key === 'Enter') {
          e.preventDefault();
          span.blur();
        }
        if (e.key === 'Escape') {
          campo.escribir(campo.original);
          copiarA(campo);
          span.blur();
          actualizarContador();
        }
        // Espacio y Enter dentro de un <summary> abrirían o cerrarían la pregunta.
        e.stopPropagation();
      });

      lista.push(campo);
    });

    return lista;
  }

  /**
   * Contenido que la página guarda en un <template> (inerte: ni se ve ni lo leen
   * los buscadores), como el titular alterno o la lista de testimonios. En modo
   * edición se muestra una copia en una caja con su etiqueta para poder editarlo;
   * al publicar, PHP reescribe el <template> igual que el resto del HTML.
   */
  function mostrarBloques() {
    document.querySelectorAll('template[data-cms-bloque]').forEach(function (t) {
      var caja = document.createElement('div');
      caja.className = 'cms-bloque';
      var etiqueta = document.createElement('p');
      etiqueta.className = 'cms-bloque-etiqueta';
      etiqueta.textContent = t.getAttribute('data-cms-bloque');
      caja.appendChild(etiqueta);
      caja.appendChild(t.content.cloneNode(true));
      t.parentNode.insertBefore(caja, t.nextSibling);
    });
  }

  /**
   * Marcadores que aparecen después de cargar (el menú móvil se pinta al abrirlo):
   * se hacen editables y toman el valor que ya se esté editando para esa clave.
   */
  function vigilarNuevos() {
    var espera = 0;
    new MutationObserver(function () {
      clearTimeout(espera);
      espera = setTimeout(function () {
        var nuevos = prepararCampos();
        if (!nuevos.length) return;
        nuevos.forEach(function (n) {
          var previo = campos.filter(function (c) {
            return c.clave === n.clave;
          })[0];
          if (previo) {
            n.original = previo.original;
            if (previo.leer() !== n.leer()) n.escribir(previo.leer());
          }
          campos.push(n);
          marcarFondo(n.elemento);
        });
        actualizarContador();
      }, 60);
    }).observe(document.body, { childList: true, subtree: true });
  }

  function limpiar(texto) {
    return texto.replace(/\s+/g, ' ').trim();
  }

  /** Mueve los nodos entre un marcador y su cierre a un span nuevo. */
  function envolver(apertura) {
    var span = document.createElement('span');
    var nodo = apertura.nextSibling;
    var encontrado = false;

    while (nodo) {
      var siguiente = nodo.nextSibling;
      if (nodo.nodeType === Node.COMMENT_NODE && nodo.nodeValue.trim() === '/cms') {
        encontrado = true;
        break;
      }
      span.appendChild(nodo);
      nodo = siguiente;
    }

    // Sin cierre el marcado está roto; se deshace para no dejar la página a medias.
    if (!encontrado) {
      while (span.firstChild) apertura.parentNode.insertBefore(span.firstChild, nodo);
      return null;
    }
    apertura.parentNode.insertBefore(span, nodo);
    return span;
  }

  /** Mismo dato en varios sitios: lo escrito en uno se ve en todos. */
  function copiarA(origen) {
    var valor = origen.leer();
    campos.forEach(function (c) {
      if (c !== origen && c.clave === origen.clave && c.leer() !== valor) c.escribir(valor);
    });
  }

  function pegarComoTextoPlano(e) {
    e.preventDefault();
    var texto = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, texto.replace(/\s+/g, ' '));
  }

  /** Por clave: una clave repetida cuenta como un solo cambio. */
  function pendientes() {
    var vistos = {};
    return campos.filter(function (c) {
      if (vistos[c.clave] || c.leer() === c.original) return false;
      vistos[c.clave] = true;
      return true;
    });
  }

  /** Las preguntas frecuentes viven en <details>: abiertas, para poder editarlas. */
  function abrirDesplegables() {
    document.querySelectorAll('details').forEach(function (d) {
      if (d.querySelector('.cms-campo')) {
        d.removeAttribute('name'); // si no, abrir una cerraría las demás
        d.open = true;
      }
    });
  }

  /**
   * En modo edición un clic sobre un texto lo edita en vez de navegar. Los enlaces
   * del menú y las anclas de la propia página siguen funcionando: son la forma de
   * moverse. Ctrl/⌘+clic abre cualquier enlace en otra pestaña.
   */
  function bloquearNavegacion() {
    var avisado = false;

    document.addEventListener(
      'click',
      function (e) {
        if (e.target.closest('.cms-barra, .cms-avisos, .cms-accion, .cms-modal, .cms-panel')) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

        var campo = e.target.closest('.cms-campo');
        var enlace = e.target.closest('a[href]');
        var accion = e.target.closest('button, summary, [role="button"], [data-plan]');

        // Navegación del sitio: el menú y las anclas internas no se bloquean,
        // salvo que se haga clic justo en un texto editable.
        if (!campo && enlace) {
          var href = enlace.getAttribute('href') || '';
          if (href.charAt(0) === '#' || enlace.closest('#sonris-header nav, [role="dialog"]')) return;
        }

        if (!enlace && !(accion && campo)) return;

        e.preventDefault();
        e.stopPropagation();
        if (campo) {
          campo.focus();
          return;
        }
        if (!avisado) {
          avisado = true;
          notificar(
            'aviso',
            'Navegación en pausa',
            'Estás editando. Usa el menú o ' + (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl') + '+clic para abrir un enlace.'
          );
        }
      },
      true // fase de captura: llega antes que los listeners del sitio
    );
  }

  // ---------------------------------------------------------------- medios

  var FORMATOS_IMAGEN = /^image\/(jpeg|png|webp)$/;
  var FORMATOS_VIDEO = /^video\/(mp4|webm)$/;
  var PESO_IMAGEN = 20 * 1024 * 1024;
  var PESO_VIDEO = 50 * 1024 * 1024;
  var PESO_VIDEO_AVISO = 15 * 1024 * 1024;

  /** Imágenes fijas, fondos, vídeos propios y enlaces de YouTube: un botón encima de cada uno. */
  function prepararMedios() {
    recorrerMarcas('cms-img', function (clave, nodos) {
      var img = primero(nodos, function (n) {
        return n.tagName === 'IMG';
      });
      if (img) montarBoton(img.parentElement, 'Cambiar imagen', function () {
        modalImagen({ clave: clave, tipo: 'img', img: img, minimo: leerMinimo(img) });
      });
    });

    document.querySelectorAll('[data-cms-fondo]').forEach(function (el) {
      montarBoton(el, 'Cambiar fondo', function () {
        modalImagen({ clave: el.getAttribute('data-cms-fondo'), tipo: 'fondo', elemento: el, minimo: leerMinimo(el) });
      }, 'derecha');
    });

    recorrerMarcas('cms-video', function (clave, nodos) {
      var el = primero(nodos, function (n) {
        return n.tagName === 'VIDEO' || n.hasAttribute('data-video');
      });
      if (!el) return;
      // El botón no puede ir dentro de un <button>, ni de una capa sin eventos de
      // puntero (el vídeo del hero va en una con pointer-events:none).
      var sitio = el.parentElement;
      while (sitio && sitio !== document.body && getComputedStyle(sitio).pointerEvents === 'none') sitio = sitio.parentElement;
      montarBoton(sitio, 'Cambiar vídeo', function () {
        modalVideo(clave, el);
      });
    });

    // YouTube: un enlace cuyo href es una clave "….youtube".
    document.querySelectorAll('[data-cms-attr]').forEach(function (el) {
      var ref = refDe(el, 'href');
      if (!ref || !/\.youtube$/.test(ref.k)) return;
      var tarjeta = el.closest('[data-feat]');
      // En una tarjeta, arriba a la izquierda; en una lista (testimonios), a la derecha de la fila.
      montarBoton(tarjeta || el.parentElement, 'Cambiar vídeo', function () {
        modalYoutube(ref.k, el);
      }, tarjeta ? undefined : 'derecha');
    });
  }

  function recorrerMarcas(tipo, alEncontrar) {
    var recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
    var aperturas = [];
    var n;
    var patron = new RegExp('^' + tipo + ':([a-z0-9][a-z0-9.\\-]*)$');
    while ((n = recorrido.nextNode())) {
      var m = patron.exec(n.nodeValue.trim());
      if (m) aperturas.push({ clave: m[1], nodo: n });
    }
    aperturas.forEach(function (a) {
      var nodos = [];
      var actual = a.nodo.nextSibling;
      while (actual && !(actual.nodeType === 8 && actual.nodeValue.trim() === '/' + tipo)) {
        nodos.push(actual);
        actual = actual.nextSibling;
      }
      alEncontrar(a.clave, nodos);
    });
  }

  /** Primer elemento que cumple, entre los nodos o dentro de ellos. */
  function primero(nodos, cumple) {
    for (var i = 0; i < nodos.length; i++) {
      var n = nodos[i];
      if (n.nodeType !== 1) continue;
      if (cumple(n)) return n;
      var dentro = n.querySelectorAll('*');
      for (var j = 0; j < dentro.length; j++) if (cumple(dentro[j])) return dentro[j];
    }
    return null;
  }

  function refDe(el, atributo) {
    try {
      var segs = JSON.parse(el.getAttribute('data-cms-attr'))[atributo] || [];
      for (var i = 0; i < segs.length; i++) if (typeof segs[i] === 'object') return segs[i];
    } catch (e) {
      /* marcado roto: ese elemento no se ofrece */
    }
    return null;
  }

  /** data-cms-min="880x580" → [880, 580] */
  function leerMinimo(el) {
    var m = /^(\d+)x(\d+)$/.exec((el && el.getAttribute('data-cms-min')) || '');
    return m ? [Number(m[1]), Number(m[2])] : null;
  }

  function montarBoton(contenedor, texto, alPulsar, lado) {
    if (!contenedor) return;
    if (getComputedStyle(contenedor).position === 'static') contenedor.style.position = 'relative';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cms-btn cms-accion' + (lado === 'derecha' ? ' cms-accion--derecha' : '');
    btn.textContent = texto;
    btn.dataset.texto = texto;
    // Varias imágenes en el mismo hueco (fotos que se relevan): botones apilados y
    // numerados, uno por imagen, en vez de uno encima de otro.
    var hermanos = [].filter.call(contenedor.children, function (h) {
      return h.classList.contains('cms-accion') && h.classList.contains('cms-accion--derecha') === (lado === 'derecha');
    });
    if (hermanos.length) {
      btn.style.top = 12 + hermanos.length * 42 + 'px';
      hermanos.concat(btn).forEach(function (h, i) {
        h.textContent = h.dataset.texto + ' ' + (i + 1);
      });
    }
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      alPulsar();
    });
    contenedor.appendChild(btn);
  }

  // ------------------------------------------------------------ modal común

  function formatoMedidas(min) {
    var mcd = function (a, b) {
      return b ? mcd(b, a % b) : a;
    };
    var d = mcd(min[0], min[1]);
    var prop = min[0] / d <= 32 ? min[0] / d + ':' + min[1] / d : (min[0] / min[1]).toFixed(2).replace('.', ',') + ':1';
    return min[0] + ' × ' + min[1] + ' px o más (proporción ' + prop + ')';
  }

  function mb(bytes) {
    return (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
  }

  /**
   * Caja de diálogo con cabecera, requisitos y cuerpo libre. Devuelve la caja; se
   * cierra con Escape, con la ✕ o pulsando fuera.
   */
  function abrirModal(titulo, requisitos, cuerpoHtml) {
    var caja = document.createElement('div');
    caja.className = 'cms-modal';
    caja.setAttribute('role', 'dialog');
    caja.setAttribute('aria-modal', 'true');
    caja.setAttribute('aria-label', titulo);
    caja.innerHTML =
      '<div class="cms-modal-panel">' +
      '  <div class="cms-cab"><strong></strong><button type="button" class="cms-cerrar" aria-label="Cerrar">✕</button></div>' +
      '  <ul class="cms-requisitos"></ul>' +
      cuerpoHtml +
      '</div>';
    caja.querySelector('.cms-cab strong').textContent = titulo;
    var lista = caja.querySelector('.cms-requisitos');
    requisitos.forEach(function (r) {
      var li = document.createElement('li');
      li.innerHTML = '<span></span>';
      li.firstChild.textContent = r[0] + ': ';
      li.appendChild(document.createTextNode(r[1]));
      lista.appendChild(li);
    });
    document.body.appendChild(caja);

    function cerrar() {
      caja.remove();
      document.removeEventListener('keydown', teclas);
    }
    function teclas(e) {
      if (e.key === 'Escape') cerrar();
    }
    caja.querySelector('.cms-cerrar').addEventListener('click', cerrar);
    caja.addEventListener('click', function (e) {
      if (e.target === caja) cerrar();
    });
    // Soltar un archivo fuera de la zona haría que el navegador lo abriera.
    caja.addEventListener('dragover', function (e) {
      e.preventDefault();
    });
    caja.addEventListener('drop', function (e) {
      e.preventDefault();
    });
    document.addEventListener('keydown', teclas);
    caja.cerrar = cerrar;
    return caja;
  }

  /** Zona de soltar/elegir archivo dentro de un modal. */
  function zonaArchivo(zona, acepta, alElegir) {
    var entrada = document.createElement('input');
    entrada.type = 'file';
    entrada.accept = acepta;
    entrada.hidden = true;
    zona.parentNode.appendChild(entrada);
    zona.addEventListener('click', function () {
      entrada.click();
    });
    zona.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        entrada.click();
      }
    });
    entrada.addEventListener('change', function () {
      if (entrada.files && entrada.files[0]) alElegir(entrada.files[0]);
      entrada.value = '';
    });
    ['dragenter', 'dragover'].forEach(function (ev) {
      zona.addEventListener(ev, function (e) {
        e.preventDefault();
        zona.classList.add('cms-soltar--activo');
      });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      zona.addEventListener(ev, function (e) {
        e.preventDefault();
        zona.classList.remove('cms-soltar--activo');
      });
    });
    zona.addEventListener('drop', function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) alElegir(f);
    });
  }

  /** Medidas reales de una imagen o vídeo elegido, antes de subirlo. */
  function medir(archivo) {
    return new Promise(function (resolver, rechazar) {
      var url = URL.createObjectURL(archivo);
      var esVideo = FORMATOS_VIDEO.test(archivo.type);
      var el = document.createElement(esVideo ? 'video' : 'img');
      el[esVideo ? 'onloadedmetadata' : 'onload'] = function () {
        URL.revokeObjectURL(url);
        resolver(esVideo ? [el.videoWidth, el.videoHeight] : [el.naturalWidth, el.naturalHeight]);
      };
      el.onerror = function () {
        URL.revokeObjectURL(url);
        rechazar(new Error('El navegador no pudo leer el archivo. ¿Está dañado?'));
      };
      if (esVideo) el.preload = 'metadata';
      el.src = url;
    });
  }

  /**
   * Formato, peso y resolución antes de gastar una subida. El servidor vuelve a
   * comprobar formato, peso y (en imágenes) resolución por su cuenta.
   * Resuelve true si se puede subir.
   */
  function validarArchivo(archivo, formatos, nombreFormatos, pesoMax, minimo) {
    if (!formatos.test(archivo.type)) {
      notificar('error', 'Formato no admitido', 'Elige un archivo ' + nombreFormatos + '.');
      return Promise.resolve(false);
    }
    if (archivo.size > pesoMax) {
      notificar('error', 'Archivo demasiado pesado', 'Pesa ' + mb(archivo.size) + '; el máximo es ' + mb(pesoMax) + '.');
      return Promise.resolve(false);
    }
    if (!minimo) return Promise.resolve(true);

    return medir(archivo).then(
      function (m) {
        if (m[0] < minimo[0] || m[1] < minimo[1]) {
          notificar(
            'error',
            'Resolución insuficiente',
            'Mide ' + m[0] + ' × ' + m[1] + ' px y este espacio necesita al menos ' + minimo[0] + ' × ' + minimo[1] + ' px. Se vería borrosa.'
          );
          return false;
        }
        var diferencia = Math.abs(m[0] / m[1] - minimo[0] / minimo[1]) / (minimo[0] / minimo[1]);
        if (diferencia > 0.15) {
          return window.confirm(
            'La proporción de este archivo (' + m[0] + ' × ' + m[1] + ') es distinta a la del espacio, así que se recortarán los bordes. ¿Subirlo igualmente?'
          );
        }
        return true;
      },
      function (e) {
        notificar('error', 'No se pudo leer el archivo', e.message);
        return false;
      }
    );
  }

  /** Subida con progreso (XMLHttpRequest: fetch no informa del avance de subida). */
  function subir(url, datos, alAvanzar) {
    return new Promise(function (resolver, rechazar) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.withCredentials = true;
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable && alAvanzar) alAvanzar(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = function () {
        var d = {};
        try {
          d = JSON.parse(xhr.responseText);
        } catch (e) {
          /* respuesta no JSON: se informa abajo */
        }
        if (xhr.status === 401) return rechazar(new Error('Tu sesión caducó. Entra de nuevo; no cierres esta pestaña.'));
        if (xhr.status < 200 || xhr.status >= 300 || !d.ok) return rechazar(new Error(d.error || 'El servidor no respondió como se esperaba.'));
        resolver(d);
      };
      xhr.onerror = function () {
        rechazar(new Error('Se perdió la conexión durante la subida.'));
      };
      xhr.send(datos);
    });
  }

  // ------------------------------------------------------------ imagen y fondo

  function modalImagen(o) {
    // Fondos e imágenes con alt="" (decorativas, repiten a otra) no llevan descripción.
    var esFondo = o.tipo === 'fondo';
    var sinDescripcion = esFondo || o.img.getAttribute('alt') === '';
    var actual = esFondo ? (/url\(["']?([^"')]+)/.exec(o.elemento.style.backgroundImage) || [])[1] : o.img.currentSrc || o.img.src;
    var requisitos = [['Formatos', 'JPG, PNG o WebP'], ['Peso máximo', '20 MB']];
    if (o.minimo) requisitos.unshift(['Resolución ideal', formatoMedidas(o.minimo)]);
    requisitos.push(['Se publica', 'al instante, optimizada en WebP' + (esFondo ? '' : ' y en todos sus tamaños')]);

    var caja = abrirModal(
      esFondo ? 'Cambiar imagen de fondo' : 'Cambiar imagen',
      requisitos,
      '<div class="cms-visor"><img alt=""></div>' +
        (sinDescripcion
          ? '<p class="cms-nota">Es decorativa: no necesita descripción.</p>'
          : '<label for="cms-alt">Descripción de la imagen (obligatoria)</label><input id="cms-alt" type="text" maxlength="250">' +
            '<p class="cms-nota">La leen Google y los lectores de pantalla. Describe lo que se ve.</p>') +
        '<div class="cms-soltar" tabindex="0" role="button"><strong>Arrastra una imagen aquí</strong><span>o haz clic para elegirla</span></div>'
    );
    if (actual) caja.querySelector('.cms-visor img').src = actual;
    var alt = caja.querySelector('#cms-alt');
    if (alt) {
      alt.value = o.img.alt || '';
      alt.focus();
    }
    var zona = caja.querySelector('.cms-soltar');

    zonaArchivo(zona, 'image/jpeg,image/png,image/webp', function (archivo) {
      if (alt && !alt.value.trim()) {
        notificar('error', 'Falta la descripción', 'Describe la imagen antes de reemplazarla.');
        alt.focus();
        return;
      }
      validarArchivo(archivo, FORMATOS_IMAGEN, 'JPG, PNG o WebP', PESO_IMAGEN, o.minimo).then(function (ok) {
        if (!ok) return;
        var datos = new FormData();
        datos.append('csrf', sesion.csrf);
        datos.append('clave', o.clave);
        datos.append('alt', alt ? alt.value.trim() : '');
        datos.append('imagen', archivo);
        zona.classList.add('cms-soltar--ocupado');
        var aviso = notificar('progreso', 'Subiendo imagen…', '0 %');
        subir('/api/subir-imagen.php', datos, function (p) {
          aviso.detalle(p < 100 ? p + ' %' : 'Optimizando…');
        })
          .then(function (d) {
            aviso.remove();
            if (esFondo) {
              o.elemento.style.backgroundImage = 'url(' + d.imagen.src + ')';
            } else {
              o.img.src = d.imagen.src;
              if (o.img.hasAttribute('srcset')) o.img.srcset = d.imagen.srcset;
              o.img.alt = d.imagen.alt;
              o.img.width = d.imagen.width;
              o.img.height = d.imagen.height;
            }
            notificar('exito', esFondo ? 'Fondo publicado' : 'Imagen publicada', 'Ya se ve en el sitio. No hace falta pulsar Publicar.');
            caja.cerrar();
          })
          .catch(function (e) {
            aviso.remove();
            zona.classList.remove('cms-soltar--ocupado');
            notificar('error', 'No se cambió la imagen', e.message);
          });
      });
    });
  }

  // ---------------------------------------------------------------- vídeo

  function modalVideo(clave, el) {
    var esVideo = el.tagName === 'VIDEO';
    var src = esVideo ? el.currentSrc || el.getAttribute('src') : el.getAttribute('data-video');
    var poster = esVideo ? el.getAttribute('poster') : el.getAttribute('data-poster');
    var portada = esVideo ? el : el.querySelector('img');
    var minimo = leerMinimo(el) || leerMinimo(portada);

    var requisitos = [
      ['Formatos', 'MP4 (H.264) o WebM'],
      ['Peso máximo', '50 MB · recomendado menos de 15 MB'],
    ];
    if (minimo) requisitos.push(['Resolución ideal', formatoMedidas(minimo)]);
    requisitos.push(['Portada', 'opcional; JPG, PNG o WebP con la misma resolución']);

    var caja = abrirModal(
      'Cambiar vídeo',
      requisitos,
      '<div class="cms-visor"><video controls muted playsinline preload="metadata"></video></div>' +
        '<p class="cms-nota">Un vídeo pesado ralentiza la página. Comprímelo antes de subirlo si pasa de 15 MB.</p>' +
        '<div class="cms-soltar" tabindex="0" role="button" data-que="video"><strong>Arrastra el vídeo aquí</strong><span>o haz clic para elegirlo</span></div>' +
        '<div class="cms-soltar cms-soltar--secundaria" tabindex="0" role="button" data-que="portada"><strong>Portada (opcional)</strong><span>La imagen que se ve antes de reproducirlo</span></div>' +
        '<button type="button" class="cms-btn cms-btn--primario cms-btn--ancho" disabled>Publicar vídeo</button>'
    );
    var visor = caja.querySelector('.cms-visor video');
    visor.src = src || '';
    if (poster) visor.poster = poster;

    var elegido = { video: null, portada: null };
    var boton = caja.querySelector('.cms-btn--primario');
    var zonaVideo = caja.querySelector('[data-que="video"]');
    var zonaPortada = caja.querySelector('[data-que="portada"]');

    zonaArchivo(zonaVideo, 'video/mp4,video/webm', function (archivo) {
      validarArchivo(archivo, FORMATOS_VIDEO, 'MP4 o WebM', PESO_VIDEO, minimo).then(function (ok) {
        if (!ok) return;
        if (archivo.size > PESO_VIDEO_AVISO) {
          notificar('aviso', 'Vídeo pesado', 'Pesa ' + mb(archivo.size) + '. Se puede publicar, pero cargará más despacio en móviles.');
        }
        elegido.video = archivo;
        visor.src = URL.createObjectURL(archivo);
        zonaVideo.querySelector('span').textContent = archivo.name + ' · ' + mb(archivo.size);
        boton.disabled = false;
      });
    });
    zonaArchivo(zonaPortada, 'image/jpeg,image/png,image/webp', function (archivo) {
      validarArchivo(archivo, FORMATOS_IMAGEN, 'JPG, PNG o WebP', PESO_IMAGEN, minimo).then(function (ok) {
        if (!ok) return;
        elegido.portada = archivo;
        visor.poster = URL.createObjectURL(archivo);
        zonaPortada.querySelector('span').textContent = archivo.name + ' · ' + mb(archivo.size);
      });
    });

    boton.addEventListener('click', function () {
      if (!elegido.video) return;
      var datos = new FormData();
      datos.append('csrf', sesion.csrf);
      datos.append('clave', clave);
      datos.append('video', elegido.video);
      if (elegido.portada) datos.append('portada', elegido.portada);
      boton.disabled = true;
      var aviso = notificar('progreso', 'Subiendo vídeo…', '0 %');
      subir('/api/subir-video.php', datos, function (p) {
        aviso.detalle(p < 100 ? p + ' %' : 'Publicando…');
      })
        .then(function (d) {
          aviso.remove();
          if (esVideo) {
            el.src = d.video.src;
            if (d.video.poster) el.poster = d.video.poster;
            el.play && el.play().catch(function () {});
          } else {
            el.setAttribute('data-video', d.video.src);
            if (d.video.poster) {
              el.setAttribute('data-poster', d.video.poster);
              if (portada) portada.src = d.video.poster;
            }
          }
          notificar('exito', 'Vídeo publicado', 'Ya se ve en el sitio. No hace falta pulsar Publicar.');
          caja.cerrar();
        })
        .catch(function (e) {
          aviso.remove();
          boton.disabled = false;
          notificar('error', 'No se cambió el vídeo', e.message);
        });
    });
  }

  // -------------------------------------------------------------- YouTube

  var YOUTUBE = /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#].*)?$/;

  /**
   * Un enlace de YouTube se trata como un texto más: cuenta como cambio pendiente y
   * se publica con el botón Publicar. El reproductor incrustado lo calcula PHP.
   */
  function modalYoutube(clave, enlace) {
    var campo = campos.filter(function (c) {
      return c.clave === clave;
    })[0];
    if (!campo) {
      var valor = enlace.getAttribute('href');
      campo = {
        clave: clave,
        elemento: enlace.closest('[data-feat]') || enlace,
        original: valor,
        leer: function () {
          return valor;
        },
        escribir: function (v) {
          valor = v;
          enlace.setAttribute('href', v);
          var id = YOUTUBE.exec(v);
          if (id) enlace.setAttribute('data-video', 'https://www.youtube-nocookie.com/embed/' + id[1] + '?autoplay=1&rel=0');
        },
        encabezado: false,
      };
      campos.push(campo);
    }

    var caja = abrirModal(
      'Cambiar vídeo de YouTube',
      [['Enlace', 'youtube.com/watch?v=… o youtu.be/…'], ['Se publica', 'con el botón Publicar, junto a los textos']],
      '<div class="cms-visor"><img alt=""></div>' +
        '<label for="cms-yt">Enlace del vídeo</label><input id="cms-yt" type="url" inputmode="url">' +
        '<p class="cms-nota" data-estado></p>' +
        '<button type="button" class="cms-btn cms-btn--primario cms-btn--ancho">Aplicar</button>'
    );
    var entrada = caja.querySelector('#cms-yt');
    var miniatura = caja.querySelector('.cms-visor img');
    var estado = caja.querySelector('[data-estado]');
    var refrescar = function () {
      var id = YOUTUBE.exec(entrada.value.trim());
      // Miniatura pública de YouTube: la pide solo el navegador de quien edita.
      miniatura.src = id ? 'https://i.ytimg.com/vi/' + id[1] + '/hqdefault.jpg' : '';
      estado.textContent = id ? 'Vídeo reconocido.' : 'Pega un enlace de YouTube válido.';
      estado.classList.toggle('cms-nota--error', !id);
    };
    entrada.value = campo.leer();
    entrada.addEventListener('input', refrescar);
    refrescar();
    entrada.focus();

    caja.querySelector('.cms-btn--primario').addEventListener('click', function () {
      var v = entrada.value.trim();
      if (!YOUTUBE.test(v)) {
        notificar('error', 'Enlace no válido', 'Pega la dirección de un vídeo de YouTube.');
        return;
      }
      campo.escribir(v);
      actualizarContador();
      caja.cerrar();
      if (v !== campo.original) notificar('aviso', 'Vídeo cambiado', 'Pulsa Publicar para que se vea en el sitio.');
    });
  }

  // ------------------------------------------------ contornos sobre naranja

  /**
   * Sobre un fondo naranja el contorno naranja no se ve: ahí pasa a blanco. Se mira
   * el primer fondo opaco hacia arriba, y se vuelve a mirar al pasar el ratón o al
   * enfocar, porque algunos cambian (la tarjeta del plan en foco).
   */
  function marcarFondo(el) {
    var nodo = el;
    while (nodo && nodo !== document.documentElement) {
      var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(getComputedStyle(nodo).backgroundColor);
      if (m && (m[4] === undefined || Number(m[4]) > 0.5)) {
        var r = +m[1], g = +m[2], b = +m[3];
        el.classList.toggle('cms-sobre-naranja', r > 190 && g > 70 && g < 160 && b < 90);
        return;
      }
      nodo = nodo.parentElement;
    }
    el.classList.remove('cms-sobre-naranja');
  }

  function leerRespuesta(r) {
    return r
      .json()
      .catch(function () {
        return {};
      })
      .then(function (d) {
        if (r.status === 401) throw new Error('Tu sesión caducó. Entra de nuevo; no cierres esta pestaña.');
        if (!r.ok || !d.ok) throw new Error(d.error || 'El servidor no respondió como se esperaba.');
        return d;
      });
  }

  // ---------------------------------------------------------------- barra

  function construirBarra() {
    var b = document.createElement('div');
    b.className = 'cms-barra';
    b.setAttribute('role', 'toolbar');
    b.setAttribute('aria-label', 'Modo edición');
    b.innerHTML =
      '<span class="cms-estado"><span class="cms-punto" aria-hidden="true"></span>Modo edición</span>' +
      '<span class="cms-contador"></span>' +
      '<div class="cms-acciones">' +
      '  <button type="button" class="cms-btn cms-ajustes">Ajustes</button>' +
      '  <button type="button" class="cms-btn cms-descartar">Descartar</button>' +
      '  <button type="button" class="cms-btn cms-publicar">Publicar</button>' +
      '  <button type="button" class="cms-btn cms-salir">Salir</button>' +
      '</div>';
    b.querySelector('.cms-publicar').addEventListener('click', publicar);
    b.querySelector('.cms-descartar').addEventListener('click', descartar);
    b.querySelector('.cms-salir').addEventListener('click', salir);
    b.querySelector('.cms-ajustes').addEventListener('click', alternarPanel);
    document.body.appendChild(b);

    // Cerrar la pestaña con cambios sin publicar los perdería sin aviso.
    window.addEventListener('beforeunload', function (e) {
      if (pendientes().length) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
    return b;
  }

  function actualizarContador() {
    var n = pendientes().length;
    barra.querySelector('.cms-contador').textContent =
      n === 0 ? 'Sin cambios' : n === 1 ? '1 cambio sin publicar' : n + ' cambios sin publicar';
    barra.classList.toggle('cms-hay-cambios', n > 0);
    campos.forEach(function (c) {
      c.elemento.classList.toggle('cms-modificado', c.leer() !== c.original);
    });
  }

  // ------------------------------------------------------------ panel de ajustes

  /** La clave de un segmento marcado: <title data-cms-texto>, <meta data-cms-attr>. */
  /** Solo una clave meta.* propia de la página; un texto compuesto devuelve null. */
  function clavePropia(json, atributo) {
    try {
      var d = JSON.parse(json);
      var segs = atributo ? d[atributo] : d;
      return segs.length === 1 && typeof segs[0] === 'object' && segs[0].k.indexOf('meta.') === 0 ? segs[0] : null;
    } catch (e) {
      return null;
    }
  }

  function quitarCampo(panel, id) {
    ['label[for="' + id + '"]', '#' + id, '.cms-cuenta[data-para="' + id + '"]'].forEach(function (sel) {
      var el = panel.querySelector(sel);
      if (el) el.remove();
    });
  }

  function claveDe(json, atributo) {
    try {
      var d = JSON.parse(json);
      var segs = atributo ? d[atributo] : d;
      for (var i = 0; i < segs.length; i++) if (typeof segs[i] === 'object') return segs[i];
    } catch (e) {
      /* marcado ausente o roto: ese campo simplemente no aparece */
    }
    return null;
  }

  function construirPanel() {
    var titulo = document.querySelector('title[data-cms-texto]');
    var desc = document.querySelector('meta[name="description"][data-cms-attr]');
    var refTitulo = titulo && clavePropia(titulo.getAttribute('data-cms-texto'));
    var refDesc = desc && clavePropia(desc.getAttribute('data-cms-attr'), 'content');

    var p = document.createElement('aside');
    p.className = 'cms-panel';
    p.setAttribute('aria-label', 'Ajustes');
    p.hidden = true;
    p.innerHTML =
      '<div class="cms-cab"><strong>Ajustes</strong><button type="button" class="cms-cerrar" aria-label="Cerrar ajustes">×</button></div>' +
      '<div class="cms-panel-cuerpo">' +
      '  <section><h3>Cómo aparece en Google</h3>' +
      '    <p class="cms-nota">No se ve en la página, pero es lo que lee quien te busca y lo que se muestra al compartir el enlace.</p>' +
      '    <label for="cms-meta-titulo">Título de esta página</label><input id="cms-meta-titulo" type="text">' +
      '    <span class="cms-cuenta" data-para="cms-meta-titulo"></span>' +
      '    <label for="cms-meta-desc">Descripción</label><textarea id="cms-meta-desc" rows="4"></textarea>' +
      '    <span class="cms-cuenta" data-para="cms-meta-desc"></span>' +
      '    <p class="cms-nota" data-meta-compuesto hidden></p>' +
      '  </section>' +
      '  <section><h3>Datos de la clínica</h3>' +
      '    <p class="cms-nota">Se cambian en todas las páginas a la vez: en el texto, en los enlaces de llamada y WhatsApp y en la ficha que lee Google.</p>' +
      '    <label for="cms-tel">Teléfono</label><input id="cms-tel" type="tel" inputmode="tel">' +
      '    <label for="cms-wa">WhatsApp</label><input id="cms-wa" type="tel" inputmode="tel">' +
      '    <label for="cms-email">Correo</label><input id="cms-email" type="email">' +
      '    <p class="cms-nota">La dirección y el horario no se editan aquí: van ligados a las coordenadas y al horario estructurado que usa Google. Pídelos al equipo técnico.</p>' +
      '  </section>' +
      '  <section><h3>Tu contraseña</h3>' +
      '    <label for="cms-clave-actual">Contraseña actual</label><input id="cms-clave-actual" type="password" autocomplete="current-password">' +
      '    <label for="cms-clave-nueva">Nueva (mínimo 12 caracteres)</label><input id="cms-clave-nueva" type="password" autocomplete="new-password">' +
      '    <label for="cms-clave-repetir">Repite la nueva</label><input id="cms-clave-repetir" type="password" autocomplete="new-password">' +
      '    <button type="button" class="cms-btn cms-btn--ancho cms-cambiar-clave">Cambiar contraseña</button>' +
      '  </section>' +
      '</div>';
    document.body.appendChild(p);
    p.querySelector('.cms-cerrar').addEventListener('click', alternarPanel);
    p.querySelector('.cms-cambiar-clave').addEventListener('click', cambiarClave);

    // Todo entra en el mismo circuito que los textos: cuenta como cambio pendiente
    // y se publica con el mismo botón.
    // El valor de partida es el publicado ahora (document.title, el content del
    // meta), no el del marcado: ese conserva el de la compilación.
    if (refTitulo) registrarEntrada(p.querySelector('#cms-meta-titulo'), refTitulo.k, document.title, TOPE_TITULO);
    else quitarCampo(p, 'cms-meta-titulo');
    if (refDesc) registrarEntrada(p.querySelector('#cms-meta-desc'), refDesc.k, desc.getAttribute('content') || '', TOPE_DESCRIPCION);
    else quitarCampo(p, 'cms-meta-desc');
    if (!refTitulo || !refDesc) {
      // Título o descripción formados con otros datos (el nombre del tratamiento,
      // el teléfono): cambian solos al cambiar ese dato, así nunca se desfasan.
      var nota = p.querySelector('[data-meta-compuesto]');
      nota.hidden = false;
      nota.textContent =
        (!refTitulo && !refDesc ? 'El título y la descripción' : !refTitulo ? 'El título' : 'La descripción') +
        ' de esta página se forman con sus propios datos (nombre del tratamiento, de la página o datos de contacto) y se actualizan solos al cambiarlos: ' +
        (!refTitulo && !refDesc ? 'ahora mismo son' : 'ahora mismo es') + ' «' +
        (!refTitulo ? document.title : desc.getAttribute('content')) + '».';
    }
    registrarContacto(p.querySelector('#cms-tel'), 'contacto.telefono');
    registrarContacto(p.querySelector('#cms-wa'), 'contacto.whatsapp');
    registrarContacto(p.querySelector('#cms-email'), 'contacto.email');
    return p;
  }

  function registrarEntrada(entrada, clave, valor, tope) {
    entrada.value = valor;
    var cuenta = document.querySelector('.cms-cuenta[data-para="' + entrada.id + '"]');
    var refrescar = function () {
      var n = entrada.value.trim().length;
      cuenta.textContent = n + ' / ' + tope + (n > tope ? ' · Google recortará lo que pase de aquí' : '');
      cuenta.classList.toggle('cms-cuenta--pasada', n > tope);
      actualizarContador();
    };
    entrada.addEventListener('input', refrescar);
    refrescar();
    campos.push({
      clave: clave,
      elemento: entrada,
      original: limpiar(valor),
      leer: function () {
        return limpiar(entrada.value);
      },
      escribir: function (v) {
        entrada.value = v;
        refrescar();
      },
      encabezado: false,
    });
  }

  /**
   * El valor de partida del dato de contacto sale de la propia página (el texto del
   * teléfono en el pie, por ejemplo) o, si no aparece como texto, del marcado de sus
   * atributos (el WhatsApp solo vive en un enlace).
   */
  function registrarContacto(entrada, clave) {
    var visible = campos.filter(function (c) {
      return c.clave === clave;
    })[0];
    var valor = visible ? visible.original : valorMarcado(clave);
    if (valor === null) {
      entrada.closest('section').querySelector('label[for="' + entrada.id + '"]').remove();
      entrada.remove();
      return;
    }
    entrada.value = valor;

    var campo = {
      clave: clave,
      elemento: entrada,
      original: valor,
      leer: function () {
        return limpiar(entrada.value);
      },
      escribir: function (v) {
        entrada.value = v;
      },
      encabezado: false,
    };
    entrada.addEventListener('input', function () {
      copiarA(campo);
      actualizarContador();
    });
    campos.push(campo);
  }

  /**
   * Valor publicado de una clave que solo vive en atributos. El marcado guarda el
   * valor de la compilación, así que se lee del atributo real quitándole el texto
   * fijo de alrededor: "Escríbenos por WhatsApp al " + <clave>.
   */
  function valorMarcado(clave) {
    var nodos = document.querySelectorAll('[data-cms-attr]');
    for (var i = 0; i < nodos.length; i++) {
      var mapa;
      try {
        mapa = JSON.parse(nodos[i].getAttribute('data-cms-attr'));
      } catch (e) {
        continue;
      }
      for (var a in mapa) {
        var segs = mapa[a];
        var refs = segs.filter(function (x) {
          return typeof x === 'object';
        });
        if (refs.length !== 1 || refs[0].k !== clave) continue;

        var pos = segs.indexOf(refs[0]);
        var antes = segs.slice(0, pos).join('');
        var despues = segs.slice(pos + 1).join('');
        var actual = nodos[i].getAttribute(a) || '';
        if (actual.indexOf(antes) === 0 && actual.slice(actual.length - despues.length) === despues) {
          return actual.slice(antes.length, actual.length - despues.length);
        }
      }
    }
    return null;
  }

  function alternarPanel() {
    if (!panel) panel = construirPanel();
    panel.hidden = !panel.hidden;
    barra.querySelector('.cms-ajustes').classList.toggle('cms-activo', !panel.hidden);
    // En móvil el panel ocupa la pantalla: con la página detrás desplazándose a la
    // vez no se sabe qué se está moviendo. Se bloquea el scroll de la página (CSS).
    document.documentElement.classList.toggle('cms-panel-abierto', !panel.hidden);
    if (!panel.hidden) panel.querySelector('input').focus();
  }

  function cambiarClave() {
    var actual = panel.querySelector('#cms-clave-actual');
    var nueva = panel.querySelector('#cms-clave-nueva');
    var repetir = panel.querySelector('#cms-clave-repetir');

    if (!actual.value || !nueva.value) return notificar('error', 'Faltan datos', 'Escribe tu contraseña actual y la nueva.');
    if (nueva.value !== repetir.value) return notificar('error', 'No coinciden', 'La nueva contraseña y su repetición son distintas.');
    if (nueva.value.length < 12) return notificar('error', 'Contraseña muy corta', 'Debe tener al menos 12 caracteres.');

    var boton = panel.querySelector('.cms-cambiar-clave');
    boton.disabled = true;
    fetch('/api/clave.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csrf: sesion.csrf, actual: actual.value, nueva: nueva.value }),
    })
      .then(leerRespuesta)
      .then(function (d) {
        // El servidor renueva la sesión: sin el token nuevo, el siguiente
        // Publicar fallaría.
        if (d.csrf) sesion.csrf = d.csrf;
        actual.value = nueva.value = repetir.value = '';
        notificar('exito', 'Contraseña cambiada', 'Úsala la próxima vez que entres.');
      })
      .catch(function (e) {
        notificar('error', 'No se cambió la contraseña', e.message);
      })
      .finally(function () {
        boton.disabled = false;
      });
  }

  // ---------------------------------------------------------------- acciones

  function publicar() {
    var cambiados = pendientes();
    if (!cambiados.length) return notificar('aviso', 'No hay nada que publicar', 'Edita algún texto para poder publicar.');

    for (var i = 0; i < cambiados.length; i++) {
      var c = cambiados[i];
      var error = c.leer() === '' ? 'Hay un texto vacío. Escribe algo o pulsa Descartar.' : VALIDAR[c.clave] && VALIDAR[c.clave](c.leer());
      if (error) {
        notificar('error', 'No se puede publicar', error);
        if (c.elemento.closest('.cms-panel') && panel.hidden) alternarPanel();
        c.elemento.scrollIntoView({ block: 'center', behavior: 'smooth' });
        c.elemento.focus();
        return;
      }
    }

    var cambios = {};
    cambiados.forEach(function (c) {
      cambios[c.clave] = c.leer();
    });

    var boton = barra.querySelector('.cms-publicar');
    boton.disabled = true;
    var enCurso = notificar('progreso', 'Publicando…', cambiados.length + ' cambio(s)');

    fetch('/api/guardar.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csrf: sesion.csrf, cambios: cambios }),
    })
      .then(leerRespuesta)
      .then(function (d) {
        enCurso.remove();
        campos.forEach(function (c) {
          if (c.clave in cambios) c.original = c.leer();
        });
        notificar('exito', 'Publicado', d.guardados + ' cambio(s) ya visibles en ' + d.archivos + ' archivo(s) del sitio.');
      })
      .catch(function (e) {
        // Los cambios se quedan en pantalla: darlos por guardados cuando no lo
        // están haría perder el trabajo al recargar.
        enCurso.remove();
        notificar('error', 'No se publicó', e.message + ' Tus cambios siguen en pantalla.');
      })
      .finally(function () {
        boton.disabled = false;
        actualizarContador();
      });
  }

  function descartar() {
    var cambiados = pendientes();
    if (!cambiados.length) return notificar('aviso', 'No hay cambios que descartar');
    if (!window.confirm('¿Descartar ' + cambiados.length + ' cambio(s) sin publicar?')) return;

    campos.forEach(function (c) {
      if (c.leer() !== c.original) c.escribir(c.original);
    });
    if (panel) panel.querySelectorAll('input:not([type=password]), textarea').forEach(function (el) {
      el.dispatchEvent(new Event('input'));
    });
    actualizarContador();
    notificar('exito', 'Cambios descartados', 'La página vuelve a su versión publicada.');
  }

  function salir() {
    if (pendientes().length && !window.confirm('Hay cambios sin publicar. ¿Salir igualmente?')) return;

    // POST con token: un enlace normal permitiría que otra web te sacara de la sesión.
    var form = document.createElement('form');
    form.method = 'post';
    form.action = '/api/salir.php';
    var t = document.createElement('input');
    t.type = 'hidden';
    t.name = 'csrf';
    t.value = sesion.csrf || '';
    form.appendChild(t);
    document.body.appendChild(form);
    campos = []; // sin aviso de "cambios sin guardar" al irse
    form.submit();
  }

  // ---------------------------------------------------------------- estilos

  function inyectarEstilos() {
    var tinta = '#16163F';
    var naranja = '#E76B0B';
    var css = [
      '.cms-editando body{padding-top:' + ALTURA + 'px;}',
      // El header del sitio es sticky en top:0: sin moverlo, la barra lo taparía.
      '.cms-editando #sonris-header{top:' + ALTURA + 'px !important;}',
      // La foto que se alterna con la editable se congela para que se vea cuál cambia.
      '.cms-editando [data-turno]{animation:none !important;opacity:0 !important;}',
      // Fotos del hero que se relevan: quietas en la primera (cada una tiene su botón).
      '.cms-editando [data-relevo]{animation:none !important;opacity:0 !important;}',
      '.cms-editando [data-relevo]:first-of-type{opacity:1 !important;}',
      // Contenido guardado en un <template>: visible solo en modo edición.
      '.cms-bloque{margin:16px 0;padding:14px 18px;border:2px dashed rgba(231,107,11,.55);border-radius:20px;background:rgba(255,255,255,.9);color:#1A1A1A;font-size:16px;}',
      '.cms-bloque-etiqueta{margin:0 0 8px;font:600 12px/1.3 Poppins,system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:' + naranja + ';}',
      '.cms-bloque ol{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:10px;}',
      '.cms-bloque li{position:relative;padding-right:150px;min-height:36px;}',
      '.cms-bloque li .cms-accion{top:0;right:0;}',
      '.cms-barra{position:fixed;top:0;left:0;right:0;height:' + ALTURA + 'px;z-index:1000;display:flex;align-items:center;gap:14px;',
      "  padding:0 clamp(10px,3vw,24px);background:" + tinta + ";color:#fff;font:500 14px 'DM Sans',system-ui,sans-serif;box-shadow:0 2px 12px rgba(0,0,0,.2);}",
      '.cms-estado{display:flex;align-items:center;gap:8px;font-weight:600;white-space:nowrap;}',
      '.cms-punto{width:9px;height:9px;border-radius:50%;background:' + naranja + ';}',
      '.cms-contador{color:rgba(255,255,255,.65);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.cms-hay-cambios .cms-contador{color:#fff;}',
      '.cms-acciones{margin-left:auto;display:flex;gap:8px;flex-shrink:0;}',
      '.cms-btn{height:32px;padding:0 14px;border-radius:9999px;cursor:pointer;font:inherit;font-size:13px;font-weight:600;',
      '  background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4);}',
      '.cms-btn:hover:not(:disabled){background:#fff;color:' + tinta + ';border-color:#fff;}',
      '.cms-btn:disabled{opacity:.5;cursor:default;}',
      '.cms-hay-cambios .cms-publicar{background:' + naranja + ';border-color:' + naranja + ';}',
      '.cms-ajustes.cms-activo{background:#fff;color:' + tinta + ';}',
      '.cms-campo{outline:1px dashed rgba(231,107,11,.55);outline-offset:2px;border-radius:2px;cursor:text;}',
      '.cms-campo:hover{outline-style:solid;}',
      '.cms-campo:focus{outline:2px solid ' + naranja + ';background:rgba(231,107,11,.08);}',
      '.cms-campo.cms-modificado{outline:2px solid ' + naranja + ';}',
      // Sobre fondo naranja (botones, plan en foco) el contorno pasa a blanco.
      '.cms-campo.cms-sobre-naranja{outline-color:rgba(255,255,255,.8);}',
      '.cms-campo.cms-sobre-naranja:focus{outline-color:#fff;background:rgba(255,255,255,.16);}',
      '.cms-campo.cms-sobre-naranja.cms-modificado{outline-color:#fff;}',
      '.cms-editando a{cursor:default;}',
      '.cms-editando #sonris-header nav a{cursor:pointer;}',
      '.cms-imagen{outline:2px dashed rgba(231,107,11,.7);outline-offset:-2px;}',
      // Botón sobre cada imagen, fondo o vídeo: siempre visible (en táctil no hay hover).
      '.cms-accion{position:absolute;top:12px;left:12px;z-index:20;background:' + tinta + ';border-color:' + tinta + ';box-shadow:0 4px 12px rgba(0,0,0,.2);}',
      '.cms-accion--derecha{left:auto;right:12px;}',
      // Avisos compactos, sin iconos. Por encima del botón de WhatsApp.
      '.cms-avisos{position:fixed;right:20px;bottom:100px;z-index:1002;width:min(340px,calc(100vw - 40px));display:flex;flex-direction:column;gap:8px;pointer-events:none;}',
      ".cms-aviso{pointer-events:auto;display:flex;gap:10px;align-items:flex-start;padding:12px 14px 12px 16px;border-radius:20px;background:#fff;color:#1A1A1A;font-family:'DM Sans',system-ui,sans-serif;",
      '  border:1px solid rgba(0,0,0,.08);box-shadow:0 4px 12px rgba(0,0,0,.06),0 16px 40px rgba(0,0,0,.10);}',
      '.cms-aviso--error{border:2px solid #B3261E;}',
      '.cms-aviso-cuerpo{min-width:0;flex:1;}',
      ".cms-aviso-titulo{margin:0;font-family:Poppins,system-ui,sans-serif;font-weight:600;font-size:15px;line-height:1.3;letter-spacing:-.01em;color:#000;}",
      '.cms-aviso--exito .cms-aviso-titulo,.cms-aviso--progreso .cms-aviso-titulo{color:' + naranja + ';}',
      '.cms-aviso--error .cms-aviso-titulo{color:#B3261E;}',
      '.cms-aviso-texto{margin:2px 0 0;font-size:13.5px;line-height:1.45;color:#1A1A1A;}',
      '.cms-aviso-cerrar{flex:none;width:28px;height:28px;margin:-4px -6px -4px 0;border-radius:9999px;border:0;background:transparent;color:#6B6B6B;font-size:13px;cursor:pointer;}',
      '.cms-aviso-cerrar:hover{background:#F7F7F7;color:#1A1A1A;}',
      '@media (prefers-reduced-motion:no-preference){.cms-aviso{animation:cms-entra .25s cubic-bezier(.22,1,.36,1);}}',
      '@keyframes cms-entra{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
      // Móvil: franja estrecha a lo ancho, justo encima de la barra fija inferior.
      '@media (max-width:900px){',
      '  .cms-avisos{left:12px;right:12px;bottom:92px;width:auto;gap:6px;}',
      '  .cms-aviso{padding:9px 10px 9px 14px;border-radius:16px;}',
      '  .cms-aviso-titulo{font-size:14px;}',
      '  .cms-aviso-texto{font-size:12.5px;}',
      '}',
      '.cms-modal{position:fixed;inset:0;z-index:1003;background:rgba(22,22,63,.7);display:flex;align-items:center;justify-content:center;padding:20px;}',
      ".cms-modal-panel,.cms-panel{background:#fff;color:#1A1A1A;font:14px/1.45 'DM Sans',system-ui,sans-serif;}",
      '.cms-modal-panel{width:min(560px,100%);max-height:90vh;overflow:auto;overscroll-behavior:contain;border-radius:24px;padding:0 20px 20px;}',
      '.cms-cab{display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid #eee;margin-bottom:12px;}',
      '.cms-cerrar{border:0;background:none;font-size:24px;line-height:1;cursor:pointer;color:#666;}',
      '.cms-visor{background:#F7F7F7;border-radius:14px;display:flex;justify-content:center;max-height:40vh;overflow:hidden;}',
      '.cms-visor img,.cms-visor video{max-width:100%;max-height:40vh;object-fit:contain;display:block;}',
      '.cms-requisitos{list-style:none;margin:0 0 14px;padding:14px 16px;border-radius:20px;background:#FEE1CB;display:flex;flex-direction:column;gap:4px;font-size:13.5px;color:#1A1A1A;}',
      '.cms-requisitos span{font-weight:600;}',
      '.cms-soltar--secundaria{padding:14px 16px;border-style:dashed;border-width:1px;}',
      '.cms-nota--error{color:#B3261E;}',
      '.cms-btn--primario{background:' + naranja + ';border-color:' + naranja + ';color:#fff !important;height:48px;font-size:16px;}',
      '.cms-btn--primario:hover:not(:disabled){background:#CF5F09;border-color:#CF5F09;color:#fff;box-shadow:0 12px 28px rgba(235,107,10,.3);}',
      '.cms-medidas{color:#777;font-size:12px;margin:6px 0 10px;}',
      '.cms-modal-panel label,.cms-panel label{display:block;margin:12px 0 5px;font-weight:600;font-size:13px;}',
      '.cms-modal-panel input,.cms-panel input,.cms-panel textarea{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #ccc;border-radius:10px;font:inherit;resize:vertical;}',
      '.cms-modal-panel input:focus,.cms-panel input:focus,.cms-panel textarea:focus{outline:2px solid ' + naranja + ';border-color:transparent;}',
      '.cms-nota{color:#666;font-size:12.5px;margin:6px 0 0;}',
      '.cms-soltar{margin-top:14px;padding:22px 16px;border:2px dashed #ccc;border-radius:14px;text-align:center;cursor:pointer;display:flex;flex-direction:column;gap:4px;color:#666;}',
      '.cms-soltar strong{color:#1A1A1A;}',
      '.cms-soltar:hover,.cms-soltar:focus-visible,.cms-soltar--activo{border-color:' + naranja + ';background:rgba(231,107,11,.06);outline:none;}',
      '.cms-soltar--ocupado{opacity:.5;pointer-events:none;}',
      '.cms-panel{position:fixed;top:' + ALTURA + 'px;right:0;bottom:0;z-index:999;width:min(380px,100vw);display:flex;flex-direction:column;box-shadow:-8px 0 30px rgba(0,0,0,.15);padding:0 20px;}',
      '.cms-panel[hidden]{display:none;}',
      // contain: al llegar al final del panel, el gesto no sigue desplazando la página.
      '.cms-panel-cuerpo{overflow-y:auto;overscroll-behavior:contain;padding-bottom:24px;}',
      '@media (max-width:900px){html.cms-panel-abierto,html.cms-panel-abierto body{overflow:hidden;}}',
      '.cms-panel section{padding:12px 0 18px;border-bottom:1px solid #eee;}',
      ".cms-panel h3{margin:0 0 4px;font:600 15px Poppins,system-ui,sans-serif;}",
      '.cms-cuenta{display:block;margin-top:4px;font-size:12px;color:#777;}',
      '.cms-cuenta--pasada{color:#B54708;}',
      '.cms-panel .cms-btn{color:' + tinta + ';border-color:' + tinta + ';}',
      '.cms-btn--ancho{width:100%;height:40px;margin-top:14px;}',
      '@media (max-width:700px){.cms-contador{display:none;}.cms-barra{gap:8px;}.cms-btn{padding:0 10px;}}',
      '@media (max-width:440px){.cms-estado{font-size:0;gap:0;}}',
    ].join('\n');
    var estilo = document.createElement('style');
    estilo.textContent = css;
    document.head.appendChild(estilo);
  }
})();
