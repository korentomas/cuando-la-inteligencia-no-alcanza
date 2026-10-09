# Cuando la inteligencia no alcanza

Presentación web de la charla de Tomás Korenblit en UNSAM (Ciencia de Datos) sobre seguridad de IA.
24 slides en three.js: una nube de partículas que cambia de forma en cada slide, y en la slide 4
el público responde desde el celular escaneando un QR.

Todo está incluido en el repo (three.js, tipografías, imágenes), así que funciona sin internet.
El servidor no tiene dependencias: solo hace falta Node 18 o más nuevo.

## Correrlo

```bash
node server.mjs
```

Abrí http://localhost:8770. La terminal también muestra la dirección para el público
(`http://<tu IP>:8770/responder`), que es la que codifica el QR de la slide 4.

## Respuestas por QR

- El público escanea el QR, escribe uno o dos problemas y aparecen en vivo en la slide 4.
- Las respuestas se guardan en `respuestas.jsonl` (no se sube al repo).
- Para borrarlas: tecla E en el deck y "Borrar respuestas del servidor". Solo funciona desde la
  compu que corre el servidor, o con `?admin=<ADMIN_TOKEN>` en la URL si está desplegado.
- Límites: hasta 60 caracteres por respuesta, 6 envíos por dispositivo, 600 en total.

El celular tiene que poder llegar a la compu. En redes de universidad que aíslan a los
dispositivos entre sí no va a funcionar: en ese caso compartí internet desde el celular a la
compu, o desplegá el servidor (abajo) y poné su URL en `config.js`.

Sin servidor (por ejemplo, en un hosting estático) el deck funciona igual, sin QR en vivo:
las respuestas se pegan con la tecla E.

## Desplegar

Cualquier hosting de Node sirve: el comando es `node server.mjs` y respeta la variable `PORT`.
`render.yaml` deja todo listo para Render. Después de desplegar, poné la URL pública en
`config.js` para que los QR la usen.

## Controles

| Tecla | Acción |
| --- | --- |
| → / espacio / clic / control remoto | siguiente paso |
| ← | volver |
| número + Enter | ir a una slide |
| F | pantalla completa |
| P | ventana del presentador: guion, pasos y cronómetro |
| E | respuestas del público: pegar, volver al ejemplo, borrar |
| B | pantalla negra |
| R | repetir la slide |

En la slide 15 la barra de la característica Golden Gate se puede arrastrar en vivo.

## Archivos

- `main.js`: motor (partículas, cámara, navegación). La transición entre formas corre en el shader.
- `slides.js`: las 24 slides. Cada una arma su forma de partículas y su HTML.
- `server.mjs`, `live.js`, `responder.html`: respuestas del público por QR.
- `guion.md` → `notes.js` (`npm run notes`): el texto para la ventana del presentador.
- `recursos.md` → `recursos.html` (`npm run recursos`): la página que abre el QR del final.

## Fuentes e imágenes

Los datos y figuras son de sus autores: METR (horizonte de tareas, figura del incidente de
Hugging Face, traducida), Anthropic (ejemplos de Golden Gate Claude), Mila (retrato de Yoshua Bengio),
Australian Antarctic Program (pingüinos), AI Safety Memes Wiki y KC Green (memes),
Parks and Recreation (Ron Swanson) y el paper de PowerBench (arXiv 2610.02303).
El código es MIT; las imágenes y figuras de terceros no están bajo esa licencia.
