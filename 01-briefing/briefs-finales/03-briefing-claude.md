# YOUNGLA — CHOOSE YOUR WORLD

Brief creativo recibido del cliente para reinventar la web de YoungLA como una
experiencia inmersiva de streetwear y cultura pop, centrada en sus
colaboraciones con franquicias reconocibles.

## Concepto

**CHOOSE YOUR WORLD.** YoungLA no vende solo ropa: cada colaboración
(Attack on Titan, Demon Slayer, Naruto, One Punch Man, Batman, Superman, The
Boys, Yu-Gi-Oh!, Looney Tunes, YoungLA Originals...) se convierte en un mundo
que el usuario puede explorar, no una categoría de tienda.

La navegación deja de ser `HOME → CATEGORÍA → PRODUCTO` y pasa a ser
`YOUNGLA → WORLD → CHARACTER → COLLECTION → PRODUCT`.

## Hero / Homepage

Sala oscura y minimalista de arquitectura brutalista (hormigón negro/gris,
metal, cristal, suelo reflectante, iluminación controlada). Plataforma
circular central rodeada de portales/vitrinas 3D, uno por colaboración. Sin
mostrar todas las franquicias a la vez — debe existir sensación de
descubrimiento.

**El usuario controla el mundo**: el cursor mueve ligeramente la cámara
(inercia, sin sensación de videojuego tradicional); el scroll navega al
siguiente nivel de la experiencia.

**Personajes**: cada colaboración tiene un elemento icónico tratado como
escultura/instalación arquitectónica, no como render pegado. Hover = más luz,
animación sutil, acercamiento de cámara, partículas sutiles, aparece el
nombre de la colaboración y "EXPLORE COLLECTION →". Click = transición
cinematográfica (la cámara atraviesa el portal) hacia la página de la
colección.

**Navegación**: logo YoungLA arriba-izquierda; centro MEN / WOMEN /
COLLECTIONS / COLLABS / COMMUNITY; derecha SEARCH / ACCOUNT / CART. La
interfaz nunca debe competir visualmente con el mundo 3D.

**Copy**: "MORE THAN CLOTHING." + "CHOOSE YOUR WORLD." + "Explore the worlds
behind YoungLA."

## Dirección artística

Referencia: luxury fashion campaign + arquitectura futurista + interacción de
videojuego premium + cultura streetwear. **Nunca** "web de anime". Paleta:
negro, gris carbón, acero, blanco, con acentos de color por universo.
Iluminación volumétrica, reflejos, sombras profundas, niebla ligera,
materiales realistas (metal, cristal, hormigón, superficies reflectantes).

## Tecnología e interacción

Three.js / React Three Fiber / GSAP / WebGL / shaders donde aporten valor. El
3D nunca es decorativo — cámara, personajes, portales y transiciones forman
parte de la UX.

## Performance

Lazy loading de mundos, carga progresiva de modelos, LOD, texturas
comprimidas, fallback para dispositivos menos potentes, versión mobile
adaptada, evitar cargar todas las franquicias a la vez.

## Mobile

No replica la experiencia desktop. Se convierte en scroll vertical: cada
colaboración es un "portal" que aparece al hacer scroll, con su personaje 3D
(o equivalente ligero) y "EXPLORE →".

## Producto

Dentro de una colaboración, mantener el lenguaje 3D: prendas suspendidas en
espacio oscuro, rotables, con cambio de color/talla, siempre dentro del
lenguaje visual de la campaña.

## Nota de alcance (añadida durante la implementación — ver
`02-documentacion/decisiones/dirección-arte-y-stack.md`)

El cliente aún no ha entregado arte licenciado de las franquicias ni logo /
tipografía definitivos (carpeta `04-recursos/` vacía a fecha de este brief).
La v1 implementada en `03-web/` resuelve cada colaboración con una
instalación abstracta (panel + "relic" geométrico + luz de acento) en lugar
de arte de personajes con copyright, y usa una tipografía y paleta
provisionales. Ver esa nota de decisiones para el detalle y lo que falta por
sustituir cuando llegue el material real del cliente.
