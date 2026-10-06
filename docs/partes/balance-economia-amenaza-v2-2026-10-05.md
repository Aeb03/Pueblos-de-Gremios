# Parte automático — Economía, durabilidad y amenaza v2

Fecha: 2026-10-05  
Semilla base: `1989`  
Corridas principales: **1.000 por perfil / 5.000 ciudades simuladas**  
Prueba adicional de amenaza: **1.000 ciudades / 180 min ignorando fauna**  

> Prueba automática de balance. No equivale a prueba funcional del juego ni a validación Android.

## Cambios incorporados

Respecto del baseline anterior:

- las compras dejan de ser simples visitas aleatorias y pasan a surgir de una **necesidad derivada** por clase, estilo y equipo faltante;
- el Explorador recibe un estilo persistente inicial de **arco** o **dagas**;
- el equipo comercial tiene **Durabilidad**;
- los objetos desgastados generan necesidad de **Reparación**;
- el equipo roto deja de aportar sus bonificaciones hasta repararse;
- se separa el gasto de:
  - equipo permanente;
  - descanso/recuperación;
  - reparaciones;
  - consumibles futuros;
- el botín autónomo queda en manos del aventurero y puede venderse posteriormente a la ciudad;
- se agregan incidentes territoriales y ataques recuperables cuando la Presencia se ignora;
- el Descanso básico baja a **4 monedas** como valor de prueba para dejar margen económico a comida, consumibles y reparaciones futuras.

## Perfil Normal — resultado principal

En 1.000 ciudades:

- Ciudad Nv.2: **16,07 min** de media.
- Ciudad Nv.3: **34,57 min** de media.
- Textilería: **22,43 min**.
- Fundadores al alcanzar Ciudad Nv.3:
  - nivel medio: **1,54**;
  - **54,2 %** ya está en Nv.2 o superior.
- Nivel medio de fundadores al minuto 90: **2,39**.
- Combates resueltos: **38,2** por ciudad.
- Incapacitaciones: **1,36**.
- XP perdida: **13,7**.
- Descansos/recuperaciones: **13,81**.
- Reparaciones: **1,33**.
- Monedas finales de ciudad: **269,0**, partiendo de 240 y habiendo pagado la construcción de Textilería.

## Flujo económico

Gasto medio de los aventureros durante 90 min:

- equipo permanente: **252,3 monedas**;
- descanso/recuperación: **60,3**;
- reparaciones: **6,9**;
- gasto recurrente total actual: **67,1**.

El gasto recurrente equivale a aproximadamente **27,3 % de los ingresos generados durante la ventana**.

Esto entra en el objetivo provisional de ~20–30 % para servicios y mantenimiento recurrente.

La inversión inicial en equipo se analiza por separado porque no es un gasto recurrente.

## Necesidad real de compra

Intentos de compra del perfil Normal:

- **84,2 %** se resuelven con compra;
- **14,4 %** fallan por falta de stock;
- **1,35 %** fallan por falta de dinero del aventurero.

Lectura:

- la economía no está bloqueando sistemáticamente a los compradores;
- la principal causa de necesidad no resuelta es que la ciudad todavía no produjo el objeto;
- esto genera una señal útil para el jugador: producir mejor cubre demanda real.

## Reparaciones

Con la Durabilidad actual de prueba:

- perfil Normal: **1,33 reparaciones** por ciudad / 90 min;
- Eficiente: **3,09**;
- Conservador: **0,39**;
- Agresivo: **3,11**;
- Mala gestión: **0,12**.

La reparación aparece como servicio recurrente sin convertirse en micromanejo constante.

Este rango se acepta como **baseline EN PRUEBA**.

## Presencia con una ciudad activa

Perfil Normal al minuto 90:

- Presencia Lobo media: **4,9**;
- Presencia Jabalí media: **2,7**;
- incidentes territoriales: prácticamente **0**;
- ataques a ciudad: **0**.

Una ciudad activa controla correctamente la fauna inicial.

## Prueba especial — ignorar completamente la fauna

Se ejecutaron 1.000 ciudades durante **180 minutos** manteniendo producción y crecimiento, pero sin permitir que los aventureros respondan a Lobos/Jabalíes/Raros/Bosses.

Resultados:

- Presencia final Lobo: **100**.
- Presencia final Jabalí: **92**.
- ciudades con al menos un incidente: **100 %**.
- incidentes medios: **5,44**.
- ciudades con al menos un ataque: **65,5 %**.
- ataques medios: **1,06**.
- lesiones de trabajadores: **2,14** de media.
- pérdida equivalente de recursos/monedas: **36,9**.
- Lobo Alfa observado: **98,1 %**.
- Gran Jabalí observado: **61,7 %**.

## Lectura de amenaza

La separación deseada aparece con claridad:

**Ciudad activa**
→ controla fauna  
→ obtiene recursos/XP  
→ casi no recibe incidentes.

**Ciudad que ignora el territorio**
→ Presencia crece  
→ aparecen Raros/Bosses  
→ comienzan incidentes  
→ trabajadores sufren consecuencias  
→ existe riesgo real de ataque a la ciudad.

Los ataques siguen siendo **recuperables**: pierden monedas/recursos y pueden lesionar trabajadores, pero no borran edificios ni destruyen objetos raros de forma arbitraria.

La prueba representa **abandono activo del problema**, no castigo por estar desconectado. La protección/gracia offline se diseñará aparte.

## Estado del balance

Se aceptan como baseline EN PRUEBA:

- ritmo Ciudad Nv.1–3;
- curva XP 45 / 90 / 150;
- coste básico de Descanso: 4 monedas;
- reparación temprana como servicio recurrente;
- compra guiada por necesidad real;
- separación de gasto de capital y gasto recurrente;
- Presencia con consecuencias si se ignora.

## Siguiente bloque

1. incorporar comida/raciones al gasto recurrente;
2. definir Durabilidad y reparación de equipo fundador;
3. añadir decisión de vender botín por tipo/material real, no sólo valor abstracto;
4. hacer que la ciudad pueda aceptar/rechazar la compra de botín;
5. medir beneficios de materiales Lobo/Jabalí en productos de Textilería;
6. empezar a trasladar el núcleo validado a la versión jugable.
