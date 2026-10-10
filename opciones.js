// Opciones del desplegable del celular (responder.html). El deck solo cuenta respuestas en vivo que estén acá.
export const OPCIONES = [
  'Bienestar animal', 'Biodiversidad', 'Cambio climático', 'Corrupción', 'Desigualdad', 'Educación', 'Energía', 'Guerras y conflictos',
  'Hambre', 'Inseguridad', 'Inteligencia artificial', 'Pandemias', 'Pobreza', 'Salud', 'Salud mental', 'Vivienda',
];
const key = s => s.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '');
const BY_KEY = new Map(OPCIONES.map(o => [key(o), o]));
// devuelve la opción canónica o null
export const opcion = s => BY_KEY.get(key(String(s))) ?? null;
