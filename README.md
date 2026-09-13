# Gol a la diabetes

Landing page educativa sobre conteo de carbohidratos (CHO), dirigida a niños y adolescentes con diabetes tipo 1. Presenta el contenido como si fuera un partido de fútbol: charla táctica, entrada en calor, entrenamiento con retos interactivos y una calculadora de alimentos.

## Estructura del proyecto

Sitio estático, sin build ni dependencias — solo 3 archivos principales:

```
index.html          Estructura y contenido de toda la página
css/style.css        Todos los estilos (paleta, layout, responsive)
js/script.js          Toda la lógica: navegación, calculadora, retos, marcador
img/
  nutricionista.jpeg  Foto de la nutricionista (sección "Tu nutricionista")
  reto-final-cho.jpg  Ilustración de la escena del penalti (Reto final)
conteo-carbohidratos.pdf  PDF descargable con las tarjetas de alimentos (semáforo verde/amarillo/rojo)
```

## Cómo ejecutar el proyecto localmente

No requiere instalación. Basta con servir la carpeta con cualquier servidor estático, por ejemplo:

```bash
python -m http.server 8000
```

y abrir `http://localhost:8000/index.html`. También funciona con la extensión "Live Server" de VS Code.

## Recorrido por las secciones

1. **Inicio** — Hero con foto de fondo (bota + balón), título "¡Gol a la diabetes!" y botón para empezar.
2. **Charla táctica — Conoce el juego** (`#primer-tiempo`) — Explica los 3 macronutrientes (carbohidratos, proteínas, grasas), por qué el sitio se enfoca solo en CHO, qué pasa cuando se comen carbohidratos (glucosa → insulina) y el rol del nutricionista en el plan de carbohidratos.
3. **Entrada en calor — Reglas de juego** (`#segundo-tiempo`) — Dos reglas: identificar alimentos con CHO (con las tarjetas semáforo verde/amarillo/rojo y el botón de descarga del PDF) y cómo leer una etiqueta nutricional (ejemplo paso a paso).
4. **Inicio del partido — Aprende a contar CHO** (`#tercer-tiempo`) — Los 4 pasos del método: Identifica, Revisa, Calcula, Aplica.
5. **Entrenamiento — ¡A practicar!** (`#entrenamiento`) — Marcador de puntos/retos completados (persistido en `localStorage`) y 4 retos:
   - **Reto 1** — ¿Dónde están los CHO? Selección de alimentos con/sin carbohidratos.
   - **Reto 2** — ¿Cuántos CHO tiene? Lectura de una etiqueta nutricional (3 rondas).
   - **Reto 3 — Arma tu comida** — La calculadora principal: buscador de ~80 alimentos organizados en 6 categorías (Cereales y Tubérculos, Frutas, Verduras, Lácteos, Proteínas, Grasas), con cantidad en gramos y un "plato" que suma el total de CHO y lo colorea en verde/amarillo/rojo según el nivel.
   - **Reto final — ¡Penalti de CHO!** — 3 casos prácticos; según el cálculo, el balón anima hacia el gol o se va fuera.
6. **Corrección del juego** (`#correccion`) — Calculadora de dosis de insulina (corrección por glucemia + carbohidratos), con las constantes clínicas fijas y no editables, siguiendo el mismo ejercicio del cuadernillo de referencia. Incluye aviso de que los valores son un ejemplo educativo y deben ser confirmados con el equipo de salud.
7. **Tu nutricionista** (`#nutricionista`) — Perfil con foto real, nombre, rol e institución.
8. **¡Lo lograste!** (`#final`) — Resumen de lo aprendido y marcador final, con botón para reiniciar.

El pie de página incluye el disclaimer general y un bloque plegable con las referencias bibliográficas (guías clínicas de diabetes tipo 1 citadas para sustentar el contenido).

## Funcionalidades técnicas

- **Marcador persistente**: puntos y retos completados se guardan en `localStorage` (clave `choFcScore`) y se reflejan tanto en "Entrenamiento" como en la sección final. El botón "Reiniciar marcador" lo borra todo.
- **Calculadora de alimentos**: base de datos en `FOOD_DB` (dentro de `js/script.js`), filtrable por categoría y por texto de búsqueda.
- **Nivel de CHO del plato**: el total de carbohidratos del "plato" arma se colorea en verde/amarillo/rojo según los umbrales de `MEAL_LEVEL_THRESHOLDS`.
- **Corrección del juego**: cálculo en vivo (sin recargar) a partir de dos campos (glucemia actual y carbohidratos), usando las constantes de `CORRECTION_CONSTANTS`.
- **Responsive**: diseñado mobile-first, con ajustes específicos de tamaño y layout para pantallas de celular (menú hamburguesa, tarjetas y calculadora compactadas).
- **Sin librerías externas**: todos los íconos son SVG propios (sin emojis), y solo se usa Google Fonts (Baloo 2 + Nunito) como recurso externo.

## Cómo personalizar / mantener

| Qué quieres cambiar | Dónde |
|---|---|
| Foto o datos de la nutricionista | `index.html`, sección `#nutricionista` (imagen en `img/nutricionista.jpeg`) |
| PDF de tarjetas de alimentos | Reemplazar `conteo-carbohidratos.pdf` en la raíz (el botón en `#segundo-tiempo` ya apunta a ese nombre) |
| Umbrales de color del plato (bajo/medio/alto) | `js/script.js` → constante `MEAL_LEVEL_THRESHOLDS` |
| Alimentos de la calculadora (agregar/editar/quitar) | `js/script.js` → arreglo `FOOD_DB` |
| Categorías e íconos de la calculadora | `js/script.js` → `CATEGORIES`, `TAB_ICONS`, `ICONS` |
| Casos del Reto final (penalti) | `js/script.js` → arreglo `PENALTY_CASES` |
| Constantes de la calculadora de insulina | `js/script.js` → constante `CORRECTION_CONSTANTS` (ver aviso abajo) |
| Colores, tipografía, espaciados | `css/style.css` (variables en `:root` al inicio del archivo) |

### ⚠️ Aviso importante sobre "Corrección del juego"

Las constantes de esa calculadora (glucemia objetivo, factor de sensibilidad, relación carbohidratos) son un **ejemplo educativo**, tomado del cuadernillo de referencia. Si se van a usar en un contexto real:

- Deben ser **definidas y validadas por el equipo clínico** que atiende a cada paciente — no son universales.
- El material intencionalmente **no permite que el usuario las edite** desde la página, para evitar que un niño modifique por su cuenta un valor que afecta el cálculo de una dosis de insulina.
- La página ya incluye un aviso visible junto al resultado recordando que no reemplaza la indicación médica.

## Referencias

El contenido educativo se apoya en las guías y estudios citados en el pie de página del sitio (AACE 2022, Sperling & Laffel 2022, Maguolo et al. 2024, Reinauer et al. 2025).
