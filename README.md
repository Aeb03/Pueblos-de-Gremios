# Pueblos de Gremios

PWA de gestión fantástica desarrollada paso a paso.

## Estado actual

**v0.6.0 — Calidad de objetos**

- Se conserva todo el progreso anterior.
- Borin puede fabricar una **Espada de hierro** a partir de Herrería Nv. 2.
- Coste de playtest: 8 hierro, 20 Resistencia, 30 segundos y +50 XP de Herrería.
- Cada espada es una pieza individual: conserva calidad, puntuación, daño, durabilidad, valor estimado y precio de venta.
- La calidad se determina al iniciar la fabricación y queda persistida; recargar la PWA no permite volver a tirar.
- Distribución base de una receta difícil para un artesano justo al nivel:
  - 25% Mediocre
  - 55% Normal
  - 18% Buena
  - 2% Excelente
- Las mejoras existentes aportan ventajas pequeñas:
  - cada nivel de Herrería de Borin por encima de la receta suma gradualmente;
  - cada nivel del edificio Herrería por encima del inicial suma gradualmente.
- El conjunto de mejoras puede llevar la probabilidad de Excelente a una franja mucho más razonable, pero nunca vuelve automática una pieza excelente.
- Las probabilidades de todas las calidades se muestran antes de fabricar.
- La calidad modifica estadísticas reales:
  - Mediocre: daño 7, menor durabilidad;
  - Normal: daño 8;
  - Buena: daño 9;
  - Excelente: daño 10 y mayor durabilidad.
- El juego calcula un **valor estimado** según las características de la pieza.
- El jugador define su **precio de venta** de forma independiente desde Inventario.
- En esta versión todavía no hay compradores: prepara la base para Exhibición y la mente de compra de los NPC.

## Filosofía de calidad

"Poder fabricar" no significa "poder fabricar bien".

Una receta cercana al nivel del artesano debe seguir siendo desafiante. Cada mejora individual aporta poco, pero desarrollar de forma conjunta al trabajador, el edificio y —más adelante— materiales, herramientas y ejecución manual debe elevar de forma perceptible la posibilidad de obtener una pieza excelente.

## Circuito productivo existente

Mara consigue hierro → Borin fabrica componentes y objetos → Eldon aporta componentes de madera → Herrería ensambla herramientas → Mara usa el Pico de hierro → puede aparecer Veta dura.

Ahora se suma un segundo destino para el hierro:

Mara consigue hierro → Borin forja una Espada de hierro → la pieza obtiene calidad y estadísticas propias → el jugador fija su precio → futura Exhibición la ofrecerá a NPC aventureros.

## Próximo paso previsto

**Exhibición + decisión de compra del NPC.**

El aventurero evaluará la pieza concreta según utilidad, necesidad actual, mejora frente a su equipo, afinidad con su perfil, dinero disponible y precio solicitado. Los pedidos específicos quedarán como una aparición más rara.

## Desarrollo

Repositorio principal del proyecto Pueblos de Gremios.
