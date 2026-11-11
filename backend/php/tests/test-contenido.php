<?php

declare(strict_types=1);

// php backend/php/tests/test-contenido.php — sin framework: falla con el primer assert.
ini_set('zend.assertions', '1');
ini_set('assert.exception', '1');

require __DIR__ . '/../lib/Contenido.php';

$attr = static fn (array $mapa): string => htmlspecialchars(json_encode($mapa, JSON_UNESCAPED_UNICODE), ENT_QUOTES, 'UTF-8');

$ld = ['@context' => 'https://schema.org', '@graph' => [['@type' => 'Dentist', 'telephone' => '+34910459517', 'name' => 'Sonris']]];
$html = '<title data-cms-texto="' . $attr(['Sonris | ', ['k' => 'meta.x.titulo', 'v' => 'Ortodoncia']]) . '">Sonris | Ortodoncia</title>'
    . '<script type="application/ld+json" data-cms-ld="' . $attr(['/@graph/0/telephone' => [['k' => 'contacto.telefono@e164', 'v' => '+34910459517']]]) . '">'
    . json_encode($ld, JSON_UNESCAPED_SLASHES) . '</script>'
    . '<a data-cms-attr="' . $attr([
        'href' => [['k' => 'contacto.telefono@tel', 'v' => 'tel:+34910459517']],
        'aria-label' => ['Llámanos al ', ['k' => 'contacto.telefono', 'v' => '910 459 517']],
    ]) . '" href="tel:+34910459517" aria-label="Llámanos al 910 459 517"><!--cms:contacto.telefono-->910 459 517<!--/cms--></a>'
    . '<p><!--cms:pagina.intro-->Hola $1 \\1<!--/cms--></p>';

// 1. Sin nada editado, el documento queda byte a byte igual.
assert(Contenido::transformar($html, []) === $html);
assert(Contenido::transformar($html, ['otra.clave' => 'x']) === $html);

// 2. Un teléfono editado llega a todas sus formas.
$v = ['contacto.telefono' => '600 111 222'];
$r = Contenido::transformar($html, $v);
assert(str_contains($r, '<!--cms:contacto.telefono-->600 111 222<!--/cms-->'));
assert(str_contains($r, 'href="tel:+34600111222"'));
assert(str_contains($r, 'aria-label="Llámanos al 600 111 222"'));
preg_match('/<script[^>]*>(.*?)<\/script>/s', $r, $m);
$json = json_decode($m[1], true);
assert($json['@graph'][0]['telephone'] === '+34600111222', 'JSON-LD con el teléfono nuevo');
assert($json['@graph'][0]['name'] === 'Sonris', 'el resto del JSON-LD intacto');
assert(str_contains($r, '<title data-cms-texto=') && str_contains($r, '>Sonris | Ortodoncia</title>'), 'título sin tocar');

// 3. Idempotencia: aplicar dos veces da lo mismo que una.
assert(Contenido::transformar($r, $v) === $r);

// 4. Escapado: el texto nunca es código, tampoco dentro del JSON-LD ni del título.
$malo = '</script><script>alert(1)</script>"';
$r = Contenido::transformar($html, ['pagina.intro' => $malo, 'meta.x.titulo' => $malo]);
assert(!str_contains($r, '<script>alert'), 'sin HTML inyectado');
assert(str_contains($r, '&lt;/script&gt;'), 'se muestra como texto');
$ldMalo = '<script type="application/ld+json" data-cms-ld="' . $attr(['/@graph/0/name' => [['k' => 'pagina.intro', 'v' => 'x']]]) . '">'
    . json_encode($ld) . '</script>';
$r = Contenido::transformar($ldMalo, ['pagina.intro' => $malo]);
assert(substr_count($r, '</script>') === 1, 'el JSON-LD no se puede cerrar desde un valor');
preg_match('/<script[^>]*>(.*?)<\/script>/s', $r, $m);
assert(json_decode($m[1], true)['@graph'][0]['name'] === $malo, 'y el valor sigue siendo exacto');

// 5. "$1" y "\1" se guardan literales, no como referencias de la regex.
$r = Contenido::transformar($html, ['pagina.intro' => 'Cuesta $1 \\1']);
assert(str_contains($r, 'Cuesta $1 \\1'));

// 6. Segmentos: clave sin editar conserva el valor compilado.
assert(Contenido::segmentos(['a ', ['k' => 'x@tel', 'v' => 'tel:+34910459517']], []) === 'a tel:+34910459517');
assert(Contenido::segmentos([['k' => 'contacto.whatsapp@wa', 'v' => '']], ['contacto.whatsapp' => '658 746 117']) === 'https://wa.me/34658746117');

// 7. Validación de contacto.
$falla = static function (callable $f): bool {
    try {
        $f();
    } catch (InvalidArgumentException) {
        return true;
    }
    return false;
};
assert($falla(static fn () => Derivados::validar('contacto.telefono', '91045951')), '8 dígitos');
assert($falla(static fn () => Derivados::validar('contacto.telefono', '910-459-517')), 'guiones');
assert($falla(static fn () => Derivados::validar('contacto.email', 'hola@')), 'correo roto');
Derivados::validar('contacto.telefono', '910 459 517');
Derivados::validar('contacto.email', 'hola@sonris.es');
Derivados::validar('pagina.intro', 'cualquier cosa');

// 8. YouTube: cualquier forma de URL da el mismo reproductor incrustado.
foreach (['https://youtu.be/eyB4-qctl80', 'https://www.youtube.com/watch?v=eyB4-qctl80', 'https://www.youtube.com/watch?feature=x&v=eyB4-qctl80&t=3'] as $url) {
    assert(Derivados::aplicar($url, 'yt') === 'https://www.youtube-nocookie.com/embed/eyB4-qctl80?autoplay=1&rel=0', $url);
}
assert($falla(static fn () => Derivados::validar('x.youtube', 'https://vimeo.com/123')), 'no es YouTube');
assert($falla(static fn () => Derivados::validar('x.youtube', 'javascript:alert(1)')), 'esquema peligroso');
Derivados::validar('x.youtube', 'https://youtu.be/eyB4-qctl80');

echo "OK test-contenido\n";
