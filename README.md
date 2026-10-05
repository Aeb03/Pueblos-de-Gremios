# Pueblos de Gremios

PWA de gestión fantástica desarrollada paso a paso.

## Estado actual

**v0.5.0 — Cadena del Pico**

- Se conserva el progreso previo: niveles, Herrería, recursos, productos, Resistencia y Prestigio.
- Carpintería pasa a ser jugable.
- Eldon tiene nivel de Carpintería, XP y Resistencia.
- Eldon fabrica un **Mango de pico** por 3 madera, 15 Resistencia y 20 segundos de playtest.
- Borin mantiene la fabricación de la **Cabeza de pico de hierro**.
- Herrería incorpora el ensamblaje: 1 cabeza + 1 mango → 1 **Pico de hierro**.
- El ensamblaje cuesta 10 de Resistencia, tarda 15 segundos y da +20 XP de Herrería.
- Los componentes se descuentan al comenzar la tarea para evitar duplicaciones al cerrar/reabrir.
- Mara puede equipar un Pico de hierro desde la pantalla de Expedición.
- Sin pico equipado, la **Veta dura** no puede aparecer.
- Con Pico de hierro equipado, cada expedición tiene **15%** de probabilidad de activar una Veta dura.
- La tirada de Veta dura queda fijada al iniciar la expedición.
- Si aparece, entrega **+5 a +8 hierro adicional** al finalizar.
- Eldon también puede descansar en la Posada y usa la misma recuperación persistente que Mara y Borin.
- Al llegar a 100/100 de Resistencia, cualquier trabajador en descanso sale automáticamente de la Posada.
- Los tiempos y costes siguen siendo valores de playtest.

## Primer circuito entre oficios

Mara consigue hierro → Borin fabrica la cabeza → Eldon fabrica el mango → Borin ensambla el Pico de hierro → Mara lo equipa → se habilita la probabilidad de Veta dura.

Este circuito establece la regla general: el negocio dueño del objeto final lo ensambla, mientras otros oficios pueden proveer componentes.

## Desarrollo

Repositorio principal del proyecto Pueblos de Gremios.
