// Si publicás el deck con el servidor en algún hosting, poné acá su URL
// (por ejemplo 'https://charla-unsam.onrender.com'). Los QR la usan.
// Vacío: en localhost se usa la IP de la red local; en otro host, la URL actual.
export const CONFIG = {
  publicUrl: '',
  // dónde está publicado el deck: los QR apuntan acá cuando se presenta desde localhost sin servidor
  siteUrl: 'https://korentomas.github.io/cuando-la-inteligencia-no-alcanza/',
  // sin servidor propio, las respuestas pasan por una sala de ntfy.sh (false para desactivar)
  relay: true,
};
