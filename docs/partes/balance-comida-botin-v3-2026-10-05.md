# Parte automático — Comida y botín real v3

Fecha: 2026-10-05  
Semilla base: `1989`  
Corridas principales: **1.000 por perfil / 5.000 ciudades simuladas**  
Prueba adicional de amenaza: **1.000 ciudades / 180 min ignorando fauna**

> Prueba automática del simulador de desarrollo. No equivale a prueba funcional del juego ni a validación Android.

## Cambios de esta versión

- Plato sencillo y Ración de viaje entran al ciclo económico.
- No existe Hambre obligatoria.
- El Plato se usa como recuperación ligera.
- La Ración prepara una salida y reduce parte del desgaste.
- Los enemigos entregan materiales concretos en lugar de “valor abstracto de botín”.
- Los drops siguen perteneciendo al aventurero.
- La ciudad compra botín sólo si:
  - tiene demanda;
  - no supera el stock objetivo;
  - conserva una reserva mínima de tesorería.
- El aventurero conserva lo no vendido.
- Las ofertas rechazadas tienen memoria/cooldown para evitar reofertas constantes.
- Se separa botín generado, vendido y retenido.

## Perfil Normal — 1.000 ciclos

### Ritmo

- Ciudad Nv.2: **15,98 min**.
- Ciudad Nv.3: **34,56 min**.
- Textilería: **22,70 min**.
- Fundadores Nv.2+ al llegar a Ciudad Nv.3: **54,6 %**.
- Nivel medio de los fundadores al minuto 90: **2,43**.

El ritmo del tramo prácticamente no se altera respecto del baseline anterior.

### Combate y recuperación

- Combates resueltos: **38,86** por ciudad.
- Incapacitaciones: **1,40**.
- XP perdida: **13,93**.
- Descansos/recuperaciones: **12,41**.
- Reparaciones: **1,48**.
- Platos sencillos: **8,97**.
- Raciones de viaje: **5,82**.

### Economía recurrente

Gasto medio:

- equipo permanente: **254,1 monedas**;
- Descanso: **54,8**;
- Reparación: **7,7**;
- comida/raciones: **35,4**.

Gasto recurrente total:

- **97,8 monedas**;
- equivalente a **30,0 %** de los ingresos generados.

Esto queda en el borde superior del objetivo provisional 20–30 %, por lo que se acepta EN PRUEBA sin aumentar precios de comida.

Monedas finales de la ciudad:

- **220,4** de media, partiendo de 240 y habiendo pagado también construcción, recompensas y compras de botín.

No aparece quiebra sistemática.

## Compra de equipo por necesidad

- demanda satisfecha: **84,3 %**;
- falta de stock: **14,2 %**;
- falta de dinero del aventurero: **1,5 %**.

El principal problema sigue siendo producir el objeto correcto, no que los aventureros sean permanentemente pobres.

## Botín real

Botín generado por ciudad en 90 min:

- **92,4 unidades** de media.

Proporción vendida a la ciudad:

- **32,1 %**.

Botín retenido por los aventureros al final:

- **62,7 unidades** de media.

Valor pagado por la ciudad por materiales:

- **175,9 monedas** de media.

La ciudad no necesita absorber todo lo que aparece.

La retención elevada es intencional:

- evita que la ciudad sea un comprador infinito;
- mantiene valor en el inventario de los aventureros;
- deja espacio futuro a mercados, otras ciudades, misiones de entrega y comercio de Reino.

## Materiales simulados

Se generan por separado:

- Carne;
- Tendón;
- Piel de Lobo;
- Piel de Jabalí;
- Colmillo de Lobo;
- Colmillo de Jabalí;
- Piel de Lobo Alfa;
- Colmillo Alfa;
- Piel de Gran Jabalí;
- Tendón de Gran Jabalí;
- Colmillo de Gran Jabalí.

La identidad del material se conserva en inventario y stock.

Para la única decisión simplificada de “¿hay suficiente piel para fabricar?” el simulador suma temporalmente pieles compatibles. Esto es una abstracción interna: la versión jugable no debe convertir materiales de especie en cuero genérico sin identidad.

## Plato sencillo

Baseline:

- precio: **2 monedas**;
- recuperación ligera: ~8 % Vida + ~10 % Maná;
- sólo se considera cuando existe desgaste moderado y todavía no corresponde un Descanso completo.

No crea Hambre ni obliga a comer.

## Ración de viaje

Baseline:

- precio: **3 monedas**;
- preparación de una salida;
- ~8 % menos desgaste de Vida;
- ~5 % menos consumo de Maná.

Se consume después de la actividad.

Los Raros/Bosses aumentan mucho la probabilidad de que el grupo quiera llevar una Ración.

## Mercado de botín

El simulador mantiene una política automática para poder hacer miles de corridas sin intervención:

1. aventurero ofrece material propio;
2. ciudad calcula stock objetivo según nivel;
3. si no necesita más, rechaza/posterga;
4. si necesita, comprueba tesorería;
5. conserva al menos **55 monedas** de reserva;
6. compra sólo las unidades necesarias;
7. el resto queda con el aventurero.

Esto no reemplaza el control del jugador en la versión final. Es una representación del comportamiento que luego puede implementarse mediante aceptación manual, órdenes de compra o políticas configurables.

## Presencia / Amenaza

La prueba especial de 1.000 ciudades ignorando fauna durante 180 min continúa estable:

- Presencia Lobo: **100**;
- Presencia Jabalí: **92**;
- 100 % con incidentes;
- 65,5 % con al menos un ataque;
- 2,14 lesiones de trabajadores de media;
- ~36,9 de pérdida equivalente.

La capa de comida/botín no rompe el sistema de Amenaza.

## Conclusión

El nuevo circuito ya conecta:

**combate → drops concretos → inventario del aventurero → oferta → demanda de ciudad → compra/rechazo → producción/servicios → gasto del aventurero → nueva salida.**

El flujo funciona sin obligar a la ciudad a comprar todo y sin introducir Hambre.

## Próximo bloque recomendado

1. equipo fundador con Durabilidad real;
2. producción de cuero manteniendo origen de especie;
3. aplicar modificadores Lobo/Jabalí al producto terminado;
4. probar valor económico de material Raro/Boss;
5. después trasladar el núcleo validado a la primera versión jugable.
