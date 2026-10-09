# Versión corta (propuesta)

De 24 a 20 slides y de ~2.220 a ~1.760 palabras habladas: unos 12–13 minutos de habla,
~18–20 minutos con la actividad, el laberinto y el Golden Gate. La versión de 24 sigue intacta en `main`.

## Qué cambia en el deck

- **PowerBench (17 + 18):** una sola slide. La historia (hackathon, fondos de BlueDot, arXiv, tu parte) queda como línea al pie y la contás en voz alta.
- **Recursos (21 y 22):** afuera. La slide final ya tiene los stickers con los mismos links y el QR.
- **Por qué elegí esto (23):** pasa a ser el comienzo del cierre, en el guion.

## Qué cambia en el guion (`guion.md` de esta rama)

Casi todo es recorte de oraciones tuyas. Cambios de contenido, para que los revises:

- Slide 7: "persona experta" y "la mitad de las veces" (así lo define METR).
- Slide 9: "buscaban entender cómo funcionaba el evaluador para engañarlo" (antes: "información para engañar o modificar el evaluador que suponían que existía"; el evaluador sí existía, lo que creían era que revisaba sus registros). "Muchos reconocían" en vez de "algunos" (METR dice "many").
- Slide 12: "detener todas sus copias".
- Slide 14: la propuesta de Bengio como él la formula: no entrenar ni desplegar sin evidencia de seguridad que convenza a expertos independientes.
- Slide 17: "conseguimos fondos de BlueDot" (los agradecimientos del paper dicen que BlueDot Impact financió la investigación).
- Slide 20: cierre con la frase de la slide 23, una línea con los recursos y el "No, flaco".

## Cómo verla

```bash
git checkout version-corta
node server.mjs
```
