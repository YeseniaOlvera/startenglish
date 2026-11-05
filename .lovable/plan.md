# English Start — Plan de desarrollo (Etapa 1)

**Tu mundo. Tu ritmo. Tu inglés.** Aprende inglés viviéndolo, no memorizándolo.

## 1. Concepto
Un mundo ilustrado explorable ("Real Life World"). El estudiante elige un compañero (Fox, Pip, Mia, Leo), entra al mapa, visita lugares y completa misiones cortas (5–10 min, máx. 5–8 palabras nuevas). Primero escucha, luego relaciona palabra-imagen, comprende, repite y construye frases. Los errores no castigan: se ofrecen pistas y reintentos.

## 2. Arquitectura
- Frontend: TanStack Start + React + Tailwind v4, componentes modulares y reutilizables.
- Backend: Lovable Cloud (autenticación email/contraseña + Google, base de datos con seguridad por usuario). El progreso se guarda en la nube, nunca se pierde al navegar.
- Contenido educativo (lugares, misiones, vocabulario) en módulos de datos tipados en código para esta etapa; preparado para migrarse a la base de datos.
- Audio: pronunciación con la voz del navegador (Web Speech — síntesis, inglés americano), etiquetada honestamente. Más adelante: voces de IA en el servidor.
- IA y reconocimiento de voz: NO se simulan. Se muestran como "Próximamente" con estado claro y quedan documentados en AGENTS.md / docs de integraciones pendientes. Las claves irán siempre en el servidor.

## 3. Pantallas y navegación
```text
/                Landing (hero del mundo, propuesta de valor, CTA)
/auth            Registro / inicio de sesión
/welcome         Bienvenida (primer ingreso, 3 pasos)
/companion       Selección de personaje (cambiable después)
/dashboard       Panel: compañero, racha, palabras aprendidas, misión sugerida
/world           Mapa interactivo (8 lugares; 2 abiertos, 6 "próximamente")
/world/home      My Home: escena con objetos interactivos (tocar = palabra + audio)
/world/coffee-shop  The Coffee Shop: escena + personaje barista
/mission/$id     Misión: escuchar → relacionar → elegir → ordenar frase → resumen
/profile         Perfil, cambiar compañero, cerrar sesión
```
Rutas tras login protegidas; primer ingreso redirige a bienvenida → compañero.

## 4. Componentes clave
AppShell (barra inferior en móvil / lateral en escritorio), CompanionAvatar + burbuja de diálogo, WorldMap con LocationPin, SceneView con Hotspot, WordCard (imagen + palabra + botón de audio), actividades reutilizables (ListenAndChoose, MatchPicture, BuildSentence con validación flexible), ProgressRing, MissionSummary, ComingSoonBadge.

## 5. Modelo de datos (Lovable Cloud)
- profiles: id, display_name, companion (fox|pip|mia|leo), level, onboarded, created_at
- mission_progress: user_id, mission_id, status, score, completed_at
- learned_words: user_id, word_id, times_seen, last_seen
- activity_log (racha): user_id, date
Cada usuario solo puede leer y modificar sus propios datos.

## 6. Diseño visual
Paleta: Azul #2878C8 (principal), Verde #55B8A7, Amarillo #FFD166, Coral #F39A83, Fondo #F5F7FA. Tipografía Nunito. Estética moderna 3D suave tipo "diorama" (no infantil), esquinas redondeadas, sombras suaves, animaciones sutiles. Imágenes generadas: mapa isométrico del mundo, escenas My Home y Coffee Shop, los 4 compañeros, más fotos reales de objetos cuando ayuden.

## 7. Etapas
1. Sistema de diseño, landing, imágenes y personajes.
2. Lovable Cloud: autenticación, perfiles, bienvenida, selección de compañero.
3. Dashboard, mapa del mundo, My Home y Coffee Shop con objetos interactivos.
4. Misiones (2 por lugar) con actividades de vocabulario y guardado de progreso.
5. Verificación completa y documentación de integraciones pendientes (IA conversacional, reconocimiento de voz, nivel adaptativo).
