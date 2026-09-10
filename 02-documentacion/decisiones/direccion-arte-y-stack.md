# Dirección de arte y stack técnico — Hero "Choose Your World"

## Concepto

**"La tienda es arquitectura, y cada colaboración es una sala de esa
arquitectura."** Navegar deja de ser elegir un menú y pasa a ser cruzar un
umbral.

Personalidad: monumental, disciplinada, cinematográfica, contenida,
físicamente presente. Referencia: rotonda de museo de arte contemporáneo de
noche, iluminada solo donde quiere tu atención — nunca "web de anime", nunca
estética "gamer".

## Por qué la composición es centrada/simétrica

La simetría radial (plataforma central + arco de portales) es una elección
justificada por la metáfora (un monumento/rotonda), no el default por falta
de otra idea — ver criterio de `art-direction`.

## Paleta

- Base: negro `#08080a`, hormigón `#19191c` / `#2a2a2e`, acero `#6a6c72`,
  hueso `#ededf0`, blanco puro para texto clave.
- Cada mundo tiene **un** acento de color usado solo en su portal (rim light,
  point light, "relic"): Naruto naranja quemado, Demon Slayer verde bosque,
  Attack on Titan granate, One Punch Man amarillo cadmio, Batman índigo,
  The Boys rojo sangre, YoungLA Originals plata/blanco (línea de casa).

## Tipografía (provisional — ver nota de alcance)

- Display / monumental: **Bebas Neue** (wordmark, nombres de mundo).
- UI / cuerpo: **Archivo**.
- Son una elección de marcador de posición vía Google Fonts, elegida por
  personalidad editorial condensada — el cliente puede tener una tipografía
  de marca propia que deberá sustituir esto 1:1 (son las únicas dos variables
  CSS `--font-display` / `--font-ui` en `src/style.css`).

## Por qué no hay arte de personajes con copyright

Attack on Titan, Demon Slayer, Naruto, One Punch Man, Batman, Superman, The
Boys, Yu-Gi-Oh! y Looney Tunes son propiedad de terceros. Reproducir su
likeness (silueta, diseño de personaje, arte) sin licencia confirmada del
cliente no es defendible. La solución implementada además **refuerza** el
pedido explícito del brief de "nunca parecer web de anime": cada
colaboración es una instalación abstracta — panel de vidrio oscuro + un
objeto geométrico ("relic") + luz de acento — como una vitrina de museo, no
un póster de personaje. Cuando el cliente entregue arte licenciado o modelos
3D reales, sustituyen al "relic" en `03-web/src/scene/experience.ts`
(función `initExperience`, sección "Portals").

## Stack técnico

- **Vite + TypeScript vanilla** (sin framework UI) — sitio de marketing, no
  aplicación de estado complejo; evita el overhead de React para una escena
  3D + unas pocas páginas.
- **Three.js** para la rotonda 3D (escena, cámara, portales, Reflector para
  el suelo, EffectComposer + UnrealBloomPass).
- **GSAP** (`quickTo` para el parallax de cámara con inercia, timelines para
  la secuencia de intro, hover y transición de entrada; `ScrollTrigger` en la
  versión mobile).
- El WebGL completo **solo se carga en desktop** (`min-width: 861px`,
  `import()` dinámico) — mobile recibe una versión DOM/scroll vertical
  ligera, evitando pagar el coste de Three.js en gama baja.

## Simplificaciones de alcance respecto al brief (documentadas para retomar)

1. **"Scroll avanza al siguiente nivel"**: implementado como un dolly de
   cámara sutil y acotado (no niveles narrativos múltiples) — ver
   `03-web/README.md`.
2. **Transición "atraviesa el portal"**: resuelta con dolly de cámara +
   brillo del panel + wipe de pantalla completa (radial, coloreado por el
   acento del mundo) antes de navegar a `collection.html?world=<slug>`, en
   vez de un viaje 3D continuo hacia la escena de la colección (esa escena
   de colección aún no existe — la página actual es un placeholder de
   diseño).
3. **7 mundos visibles** en el arco (no los 10 mencionados en el brief) para
   mantener la densidad de composición de la referencia. El array
   `WORLDS` en `03-web/src/worlds.ts` es la única fuente de verdad — añadir
   un mundo es añadir una entrada ahí.
4. Producto/talla/color dentro de una colección: no implementado (no hay
   datos de producto del cliente todavía).

---

## v2 — El personaje central y el sistema de vitrinas

Evolución pedida por el cliente: introducir un personaje central (el
usuario, de espaldas, hoodie YoungLA oversized) como punto de referencia fijo
de la composición, y convertir cada colaboración en una vitrina física con
"ocupante" + prenda, en vez de un panel plano.

### Composición

- **Cámara**: ya no está de pie en la plataforma mirando un muro de frente;
  ahora está detrás/sobre el hombro del personaje central (fijo en primer
  plano-centro), mirando hacia el arco de vitrinas más adelante. El control
  de ratón pasa a estar dominado por el **eje horizontal** (yaw amplio),
  pitch casi nulo — "caminar/girar", nunca free-look.
- **Personaje central**: geometría procedural (torso ahusado tipo hoodie
  oversize, capucha, brazos, cabeza) — no es un modelo importado, es el
  mismo enfoque low-poly/abstracto que el resto de la escena, pero más
  trabajado porque es el protagonista fijo. Tiene una animación idle sutil
  (balanceo) y gira ligeramente el torso hacia el mundo en foco al hacer
  hover.
- **Vitrinas**: cada mundo es ahora `marco (edges box) + peana + ocupante +
  prenda suspendida + crest geométrico + luz de acento`, no un panel con una
  gema. El "crest" reutiliza el sistema de formas por mundo (icosaedro,
  octaedro, tetraedro...) de la v1.

### Por qué el "ocupante" sigue siendo abstracto (no personajes reales)

El cliente pidió explícitamente poder prototipar con los personajes reales
de las franquicias. Se mantiene la misma restricción que en v1: no se
reproduce likeness con copyright (Naruto, Eren, Batman...) ni siquiera como
placeholder temporal — reproducir un personaje con copyright sigue siendo
reproducirlo. En su lugar:

- El **"ocupante"** es una silueta humanoide genérica sin rasgos (misma
  familia visual que el personaje central, más pequeña/estática) —
  comunica "aquí vive un personaje" sin dibujar uno.
- La **prenda suspendida** es 100% segura y además es lo que más vende
  "esto es una tienda" — se prioriza sobre el "ocupante" en jerarquía visual.
- El **asset system es data-driven**: `World` en `worlds.ts` es la única
  fuente de verdad; sustituir el ocupante/prenda por un GLTF licenciado o una
  imagen oficial del cliente es un cambio de datos en esa función factory,
  no un cambio de arquitectura de escena.

### Estampado de la espalda del personaje (outfit-swap)

El personaje central lleva un plano con `CanvasTexture` en la espalda (el
lado que mira a cámara). Estado base = marca YOUNGLA ORIGINALS. Al hacer
hover sobre un mundo, hace crossfade (gsap, opacity, ~0.5s) hacia una segunda
textura generada por canvas con el acento y una marca corta de ese mundo —
resuelve "el outfit del chico cambia" sin necesitar texturas de producto
reales todavía.

### Click → colección

El dolly de cámara ahora pasa *junto al/atravesando al* personaje central
hacia la vitrina (en vez de solo acercarse a un panel), y la prenda escala
hacia primer plano antes del wipe — refuerza "la ropa pasa a primer plano"
del brief.

---

## v3 — Pasada de dirección de arte, materialidad y composición

Pedido explícito del cliente: mantener la arquitectura/interacción de v2 sin
cambios, y subir el nivel visual a "pieza de portfolio de EHT Labs" en vez de
"demo técnica de Three.js". Sin funcionalidad nueva.

### Escala monumental

`ROOM_RADIUS` 11→14, `VITRINE_DISTANCE` 7.4→8.8, `VITRINE_H` 3.75→5.6 (ratio
vitrina/personaje pasa de ~1.6x a ~2.2x su altura), personaje `CHARACTER_SCALE`
1→1.15. Se añadieron 10 columnas de hormigón alrededor de la sala
(`COLUMN_COUNT`) — el lever más barato y con más impacto para que la sala
lea como flagship y no como escenario de demo.

### Cámara y presencia del personaje

Cámara reposicionada más cerca del personaje (antes ~5.3 unidades detrás, con
un `lookAt` que dejaba sus pies fuera del frustum verticalmente — bug real
corregido — ahora ~4.8 unidades, con altura/`lookAt` recalculados para que
quepa de pies a cabeza). El personaje ahora se desvanece IN al principio del
intro (antes aparecía instantáneo) y tiene: dobladillo (hem), puños de
tobillo, sneakers, postura de tres cuartos por defecto (`rotation.y = 0.05`
en reposo, nunca perfectamente de frente), y un `bumpMap` de ruido genérico
para que la sudadera no lea como plástico liso.

### Sistema de vitrinas: FRAME + GLASS + LIGHTING + CHARACTER + GARMENT

Cada vitrina ganó: un panel de "vidrio" real (`MeshPhysicalMaterial`,
opacidad baja, duplica como hit-plane de raycasting), una tira de luz
arquitectónica vertical que se tiñe del acento solo en hover, una peana que
alterna hormigón/metal por índice, y el ocupante ("standIn") ahora tiene una
pose distinta por vitrina y un material más "escultórico" (roughness/
metalness de bronce patinado + rim emissive tenue) en vez de "maniquí negro
plano". La prenda varía por tipo (`hoodie` / `jacket` / `tee`, cíclico por
índice) con su propio hardware de suspensión (línea fina vs. percha
metálica) — cumple "no hacen falta 7 escenas distintas, pero sí pequeñas
diferencias" sin siete implementaciones a medida.

### Disciplina de color — el bug real que sí encontramos

El cliente pidió explícitamente que el color viniera del personaje/prendas/
logos, nunca de la sala. Placas verificado con lectura de píxeles reales
(no solo captura de pantalla — las capturas de este entorno comprimen/
oscurecen de forma que un rojo muy oscuro puede *parecer* un rojo sólido
saturado; los valores RGB reales medidos fueron ~9/255 en reposo, correctos
para "casi todo oscuro"). Dicho eso, sí apareció un problema real durante
esta pasada: la luz dedicada de cada vitrina estaba casi pegada al panel de
vidrio (misma coordenada Z), y su `clearcoat` en el material del vidrio
generaba un reflejo especular que sí lavaba el vidrio con el acento a plena
saturación — arreglado (i) quitando `clearcoat`, (ii) alejando la luz del
vidrio, (iii) acortando el alcance (`distance`) de la luz para que no
alcance el fondo. Además, el color del fondo (backdrop) ahora usa un
`wallTint` — el acento del mundo mezclado 72% hacia gris — nunca el acento
puro, reservado para prenda/crest/luz/estampado del personaje.

### Secuencia de los primeros 5 segundos

Reescrita para seguir el beat plan del cliente: 0.3s el personaje empieza a
aparecer, 0.5s su rim light sube, 0.9s se enciende el estampado de su
espalda, 1.5s la primera vitrina despierta, hasta ~3.5s se revelan las
demás en cascada. El wordmark/tagline del DOM (controlado en `main.ts`,
timeline independiente) se retrasó de 0.3s a 2.6s para aterrizar cerca del
beat de "3s aparece YOUNGLA / CHOOSE YOUR WORLD" sin acoplar ambos
timelines.
