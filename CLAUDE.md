# {{NEGOCIO}}

Proyecto de desarrollo web para **{{NEGOCIO}}**.

- Repositorio: {{REPO_URL}} (privado, organización AgenciaEHT)
- Slug: `{{SLUG}}`
- Creado: {{FECHA}}

## Estructura de la carpeta

| Carpeta | Contenido |
|---|---|
| `01-briefing/` | Ficha de prospección, investigación del negocio y **03 - Briefing Claude** |
| `02-documentacion/` | Sitemap, arquitectura de contenidos, decisiones, notas de trabajo |
| `03-web/` | **Código de la web. Todo el desarrollo va aquí.** |
| `04-recursos/` | Logos, imágenes, tipografías y material bruto entregado por el cliente |
| `05-entregables/` | Exports y entregables finales para el cliente (PDF, ZIP, etc.) |

## Indicaciones para Claude Code

- Desarrolla la web **dentro de `03-web/`**. No crees el sitio en la raíz del proyecto.
- Antes de empezar, **lee el briefing** en `01-briefing/`.
- Usa `04-recursos/` como origen de imágenes, logos y tipografías del cliente.
- Rama principal: `main`. Haz commits pequeños y con mensajes descriptivos.
- No modifiques `01-briefing/` ni `05-entregables/` salvo que se te pida explícitamente.
- Por defecto, `04-recursos/` y `05-entregables/` no se suben al repositorio (ver `.gitignore`).
