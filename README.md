# Gramática del español — gramatica.edisonspanish.com

Sitio estático, sin compilación en el navegador ni dependencias (HTML + CSS + JS vanilla), con la misma identidad
«Papel y ocre» y los colores por nivel de lecturas.edisonspanish.com (A1 #2F6144 / #E0E8CF, A2 #245A68 / #D8E5E7,
B1 #9A4428 / #F5DCC8, B2 #6B3A55 / #EBDEE8; portada #F3E6D0 con bloques de nivel teñidos). Analytics G-SBS528RFHE.

## Estructura
    web/
      index.html                 portada por niveles (45 temas del mapa; sin ficha = «Próximamente», sin enlace)
      <slug>/index.html          una página estática por tema (explicación, código de color, esquema, ejemplos, ejercicios)
      assets/css/gramatica.css   estilos
      assets/js/gramatica.js     renderizador genérico de ejercicios (lee el JSON incrustado en cada página)
      datos/extras.json          capa visual: color_code, example_icons, example_tags, visual, exercise_extras
      datos/fichas.json          fichas fusionadas (salida del build, referencia)
      robots.txt, sitemap.xml, 404.html
      _build/build.py            genera todo lo anterior
      _build/deploy.sh           copia lo publicable a ../deploy (repo git local)
      pruebas/prueba.js          prueba headless de todos los ejercicios (escritorio 1280 y móvil 412)
      pruebas/zonas.html         página interna de prueba del modo «objetos → lugares» (no se publica)

## Añadir un tema
1. Añadir la ficha a `/workspace/gramatica-sitio/fichas/fichas.json` (mismo formato: slug, level, title_es, title_en,
   pcic, explanation_en, examples[{es,en}], exercises[{id,type,title_en,instructions_en,items[{prompt,options,answer,feedback_en}]}]).
   El slug debe existir en `mapa-temas.json`; la portada lo enlaza sola.
2. Opcional (en la ficha o en `datos/extras.json`): `color_code`, `example_icons`, `visual`, `exercise_extras`.
3. `python3 web/_build/build.py` → `node web/pruebas/prueba.js` (con `python3 -m http.server 8797 --bind 127.0.0.1` en web/)
   → `bash web/_build/deploy.sh`.

## Tipos de ejercicio (todos con items[{prompt, options, answer, feedback_en}])
| type | cómo se juega |
|---|---|
| opcion_multiple, corregir, situaciones, transformar | elegir; corrección inmediata, se marca la correcta y se explica |
| completar | si hay «_____» y respuestas de 1–2 palabras: se escribe (o se toca una opción); tolera tildes pero avisa «Ojo con la tilde»; 2 intentos. Si no, elegir |
| verdadero_falso | Verdadero / Falso |
| clasificar | arrastrar (o tocar tarjeta + caja) a las categorías = options del primer ítem; 2.º fallo la coloca y explica |
| relacionar (emparejar) | tocar izquierda + derecha (o arrastrar); columna derecha = unión de options |
| ordenar | fichas de palabras desde «a / b / c»; 2 intentos. Si las palabras no coinciden con la respuesta, pasa a elegir |
| arrastrar (habitación) | escena SVG de cocina. Modo A: arrastrar la frase correcta a la cocina y aparece el objeto (`exercise_extras.items[{show, at}]`). Modo B: `scene.zones[{id,label,x,y,label_pos}]` + items `{object, object_label, zone, sentence}`: arrastrar el objeto a su lugar |

Puntuación: «n de N a la primera» por ejercicio; barra «n de N · completado». Sin puntos, estrellas ni botones de repetir.

## Lengua
Español de América (ver /workspace/lecturas/criterios_lengua.md). Voz del navegador: es-US → es-MX → es-419 → otra es-* de
América; **nunca es-ES** (si solo hay es-ES, los botones 🔊 se ocultan). Sin servicios de traducción.
