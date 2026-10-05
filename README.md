# Pueblos de Gremios

PWA de gestión fantástica desarrollada paso a paso.

## Estado actual

**v0.4.2 — Descanso automático**

- Se conserva el progreso previo: niveles, Herrería, recursos, productos y Prestigio.
- Mara y Borin tienen Resistencia y gastan al trabajar.
- Mara gasta 20 por expedición.
- Borin gasta 15 por Cabeza de pico.
- Mientras trabajan no recuperan Resistencia.
- Recuperación normal de playtest: +1 cada 10 segundos estando libres.
- Posada: +5 cada 10 segundos mientras descansan.
- Si un trabajador llega a 100/100 mientras descansa, sale automáticamente de la Posada.
- El botón "Terminar descanso" sigue disponible para sacarlo antes de llegar a 100/100.
- La recuperación y la salida automática usan tiempo real, incluso si la PWA estuvo cerrada.
- Los ritmos actuales son de prueba y se balancearán más adelante.
- Se corrigió también el versionado de los assets del Service Worker para que todos apunten a v0.4.2.

## Sistemas ya jugables

- Expediciones persistentes de Mara con XP de Minería y coste de Resistencia.
- Herrería persistente de Borin con XP, coste de hierro y coste de Resistencia.
- Mejora de Herrería a Nv. 2 con aporte de Prestigio.
- Inventario único de la ciudad.
- Recuperación pasiva y descanso acelerado en Posada.
- Salida automática de la Posada al completar la Resistencia.

## Próxima conexión prevista

Carpintería fabricará el mango del pico. Herrería ensamblará la herramienta completa y Mara podrá equiparla. El pico activará una probabilidad baja de encontrar una veta dura durante expediciones.

## Desarrollo

Repositorio principal del proyecto Pueblos de Gremios.
