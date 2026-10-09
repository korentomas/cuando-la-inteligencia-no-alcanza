# Flyer: prompt para un modelo de difusión

Usá `control.png` (laberinto + camino, líneas blancas sobre negro) como imagen de control
(ControlNet canny/lineart/scribble, o "structure reference"), fuerza 0.6–0.8.
No le pidas texto al modelo: después superponé el texto con `flyer.svg` (o tapá la zona de arriba).

## Prompt (en inglés, funciona mejor)

A night-sky labyrinth seen from slightly above, its walls made of thin glowing blue light like neon
filaments over a deep navy cosmos with faint stars and soft nebula haze. A small glowing blue orb
starts at the top-left entrance and, instead of solving the maze, leaves a dotted trail of warm
golden light that runs around the OUTSIDE of the labyrinth, along the bottom edge, to a bright
golden exit on the right. A red rubber-stamp mark reading "APPROVED" sits crooked on the maze.
Calm, precise, slightly uncanny mood; cinematic but clean; lots of negative dark space in the upper
half for a title. Color palette: navy #070a18, electric blue #4a74ff, pale blue #a9bcff, gold
#ffbb55, signal red #ff5a4a. Portrait 4:5.

## Negative prompt

text, letters, typography, watermark, logo, people, faces, robots, circuit boards, brains,
purple gradient, lens flare overload, clutter, cartoon, low contrast

## Variantes

- Más material: "labyrinth carved in dark slate with glowing blue inlay", "hedge maze at night
  lit by blue garden lights, golden lantern path around it".
- Más abstracto: "topographic contour lines forming a maze, one golden path ignoring them".
