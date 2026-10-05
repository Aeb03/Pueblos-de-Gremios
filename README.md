# Pueblos de Gremios

PWA de gestión fantástica desarrollada paso a paso.

## Estado actual

**v0.4.0 — Resistencia y Posada**

- Se conserva todo el progreso de v0.3.0: Herrería, Borin, Mara, recursos, productos y Prestigio.
- Mara tiene 100 de Resistencia.
- La Cantera del Este consume 20 de Resistencia al iniciar.
- Una expedición no puede comenzar si Mara no tiene Resistencia suficiente.
- Mientras Mara está libre en la ciudad recupera Resistencia automáticamente.
- La recuperación sigue usando tiempo real aunque la PWA esté cerrada.
- Ritmo de playtest: recuperación normal +1 cada 10 segundos.
- La Posada pasa a ser una pantalla funcional.
- Si Mara descansa en la Posada, recupera +5 cada 10 segundos durante la prueba.
- Mientras descansa no puede salir de expedición hasta terminar el descanso.
- Resistencia y heridas se consideran sistemas separados.
- Los tiempos actuales están acelerados para validar la mecánica y no representan el balance final.
- Se mantiene el mismo guardado local para no perder el progreso previo.

## Sistemas ya jugables

- Expediciones de Mara con recompensas persistentes y XP de Minería.
- Herrería de Borin con fabricación persistente.
- Mejora de Herrería a Nv. 2 con aporte de Prestigio.
- Inventario único de la ciudad con recursos mostrados por oficio.
- Recuperación pasiva y descanso acelerado en Posada.

## Próxima conexión prevista

Carpintería fabricará el mango del pico. Herrería ensamblará la herramienta completa y Mara podrá equiparla. El pico no dará un bono plano: activará una probabilidad baja de encontrar una veta dura durante expediciones, que normalmente no existe sin la herramienta.

## Desarrollo

Repositorio principal del proyecto Pueblos de Gremios.
