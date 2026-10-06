# Parte automático — Ciclo Nv.1–3 v1

Fecha: 2026-10-05  
Semilla base: `1989`  
Corridas: **1.000 por perfil / 5.000 ciudades simuladas**  
Horizonte observado: **90 minutos de actividad simulada**  

> Prueba automática de balance. No equivale a prueba funcional del juego ni a validación Android.

## Ajustes hechos antes de esta corrida

La primera iteración mostró dos desvíos importantes:

1. Ciudad Nv.3 llegaba demasiado rápido.
2. Los aventureros gastaban y recibían recompensas como si cada encuentro fuese una misión pagada.

Se corrigió el modelo para que:

- sólo una parte de las actividades sean Misiones comunes pagadas;
- otras actividades sean iniciativa propia del aventurero;
- una salida común pueda incluir varios Lobos/Jabalíes;
- las recompensas por eliminación respeten aproximadamente el valor por objetivo;
- las compras no ocurran en cada ventana disponible;
- el crecimiento de Ciudad vuelva al objetivo temporal;
- la curva XP inicial pase de **60/100/160** a **45/90/150**.

## Resultado principal — perfil Normal

- Ciudad Nv.2: **16,1 min** de media.
- Ciudad Nv.3: **34,6 min** de media.
- Textilería construida: **22,6 min** de media.
- Al alcanzar Ciudad Nv.3:
  - nivel medio de fundadores: **1,54**;
  - **53,8 %** de los fundadores ya llegó a Nv.2 o superior.
- Al minuto 90:
  - nivel medio de fundadores: **2,39**.
- Incapacitaciones medias: **1,35** por ciudad.
- XP perdida por incapacitación: **13,3** de media.
- Descansos/recuperaciones: **13,17** por ciudad.
- Lobo Alfa visto al menos una vez: **39,4 %**.
- Gran Jabalí visto al menos una vez: **11,5 %**.
- Gran Jabalí derrotado: **11,5 %**.
- Presencia final media:
  - Lobos: **5,0**;
  - Jabalíes: **2,8**.
- Monedas de ciudad al minuto 90: **379,8** de media, partiendo de 240.

## Comparación por perfil

| Perfil | Nv.2 | Nv.3 | Fundadores Nv.2+ al llegar a Nv.3 | Alfa visto | Boss visto |
|---|---:|---:|---:|---:|---:|
| Eficiente | 15,0 min | 30,1 min | 56,6 % | 39,2 % | 12,3 % |
| Normal | 16,1 min | 34,6 min | 53,8 % | 39,4 % | 11,5 % |
| Conservador | 17,8 min | 38,5 min | 46,1 % | 38,7 % | 10,2 % |
| Agresivo | 15,6 min | 33,1 min | 74,6 % | 39,9 % | 10,8 % |
| Mala gestión | 23,3 min | 50,8 min | 56,6 % | 37,4 % | 5,5 % |

## Lectura

### Ritmo de Ciudad

El perfil Normal queda muy cerca del objetivo del primer tramo:

- ~15 min para salir de Nv.1;
- ~20 min adicionales para llegar a Nv.3.

Se acepta como **baseline EN PRUEBA**.

### XP de aventureros

La curva 45 / 90 / 150 acompaña mejor a la ciudad.

No todos los fundadores llegan a Nv.2 al mismo tiempo. Esto es deseable: actividad, riesgo e incapacitación generan diferencias individuales.

### Rare y Boss

El Raro aparece con frecuencia suficiente para sentirse posible pero no garantizado.

El Boss sigue siendo poco frecuente durante este tramo, como corresponde a una aparición que recién se habilita en Nv.3.

No se fuerza su aparición mediante un umbral fijo.

### Presencia

Una ciudad activa controla con facilidad la fauna inicial.

Esto no se considera todavía un problema: la prueba siguiente debe incluir un caso explícito de **abandono/negación de control** para comprobar que Presencia y Amenaza sí pueden escalar cuando nadie interviene.

### Economía — alerta abierta

La economía temprana todavía es demasiado simplificada.

En el perfil Normal, el gasto total de los aventureros representa aproximadamente **56,7 % de sus fondos disponibles acumulados** durante la ventana observada.

Una parte importante corresponde a compra inicial de equipo, por lo que no debe compararse directamente con el gasto recurrente objetivo.

Antes de tocar precios se necesita separar:

- inversión en equipo permanente;
- Mesón/recuperación;
- reparaciones;
- consumibles;
- servicios;
- recompensas;
- venta de drops.

**No se ajustan precios todavía.**

## Próximas pruebas

1. separar gasto de capital y gasto recurrente;
2. agregar desgaste/reparación de equipamiento;
3. prueba especial de Presencia sin control;
4. modelar necesidades reales de compra por aventurero;
5. comprobar composición de grupos;
6. incorporar la progresión de habilidades por nivel;
7. después integrar estos datos en la primera versión jugable.

## Estado

**Ciclo Nv.1–3 v1: baseline utilizable para continuar implementación.**  
**Balance económico fino: todavía EN PRUEBA.**
