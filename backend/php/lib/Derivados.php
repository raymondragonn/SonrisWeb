<?php

declare(strict_types=1);

/**
 * Formas derivadas de un dato de contacto.
 *
 * El administrador escribe el teléfono una vez, como se lee ("910 459 517"), y de
 * ahí salen el enlace tel:, el formato internacional del JSON-LD y el de WhatsApp.
 * Así no puede quedar un enlace apuntando al número viejo mientras el texto
 * visible muestra el nuevo.
 *
 * Una referencia es "clave" o "clave@derivado": contacto.telefono@tel.
 *
 * Los enlaces de YouTube siguen la misma idea: se guarda la URL tal cual la pega el
 * administrador (clave terminada en ".youtube") y de ahí sale la del reproductor
 * incrustado (@yt), así el enlace y el vídeo que se abre nunca apuntan a sitios
 * distintos.
 */
final class Derivados
{
    /** Claves que son teléfonos españoles de 9 dígitos. */
    private const TELEFONOS = ['contacto.telefono', 'contacto.whatsapp'];

    private const EMAILS = ['contacto.email'];

    /** @return array{0: string, 1: string} [clave, derivado] */
    public static function separar(string $referencia): array
    {
        $partes = explode('@', $referencia, 2);

        return [$partes[0], $partes[1] ?? ''];
    }

    public static function aplicar(string $valor, string $derivado): string
    {
        $digitos = preg_replace('/\D/', '', $valor) ?? '';

        return match ($derivado) {
            '' => $valor,
            'e164' => '+34' . $digitos,
            'tel' => 'tel:+34' . $digitos,
            'wa' => 'https://wa.me/34' . $digitos,
            'mailto' => 'mailto:' . $valor,
            // Mismo resultado que incrustar() en la página: sin cookies de YouTube
            // hasta que se reproduce, y sin vídeos relacionados de otros canales.
            'yt' => 'https://www.youtube-nocookie.com/embed/' . self::idYoutube($valor) . '?autoplay=1&rel=0',
            default => throw new InvalidArgumentException("Derivado desconocido: {$derivado}"),
        };
    }

    /**
     * Rechaza un dato de contacto mal escrito antes de publicarlo: un teléfono con
     * una cifra de menos rompería a la vez el texto, el enlace y la ficha de Google.
     *
     * @throws InvalidArgumentException
     */
    public static function validar(string $clave, string $valor): void
    {
        if (in_array($clave, self::TELEFONOS, true)) {
            $digitos = preg_replace('/\D/', '', $valor) ?? '';
            if (!preg_match('/^[6-9]\d{8}$/', $digitos) || !preg_match('/^[\d\s]+$/', $valor)) {
                throw new InvalidArgumentException(
                    "Teléfono no válido en {$clave}: escribe los 9 dígitos, con o sin espacios (910 459 517)."
                );
            }
        }

        if (in_array($clave, self::EMAILS, true) && filter_var($valor, FILTER_VALIDATE_EMAIL) === false) {
            throw new InvalidArgumentException("Correo no válido en {$clave}.");
        }

        // Cifras animadas (+25 años): el contador necesita un entero.
        if (str_ends_with($clave, '.numero') && !preg_match('/^\d{1,6}$/', $valor)) {
            throw new InvalidArgumentException("En {$clave} solo caben números enteros, sin puntos ni símbolos.");
        }

        if (str_ends_with($clave, '.youtube') && self::idYoutube($valor) === '') {
            throw new InvalidArgumentException(
                "Enlace de YouTube no válido en {$clave}: pega la dirección del vídeo (youtube.com/watch?v=… o youtu.be/…)."
            );
        }
    }

    /** El identificador de 11 caracteres de cualquier forma de URL de YouTube; '' si no lo es. */
    public static function idYoutube(string $url): string
    {
        $patron = '#^https://(?:www\.|m\.)?(?:youtube\.com/(?:watch\?(?:.*&)?v=|embed/|shorts/)|youtu\.be/)([A-Za-z0-9_-]{11})(?:[?&\#].*)?$#';

        return preg_match($patron, trim($url), $m) ? $m[1] : '';
    }
}
