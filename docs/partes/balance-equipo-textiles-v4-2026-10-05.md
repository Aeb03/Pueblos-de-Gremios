# Parte automático — Equipo fundador y ramas textiles v4

Fecha: 2026-10-05  
Semilla base: `1989`  
Corridas principales: **1.000 por perfil / 5.000 ciudades simuladas**  
Comparación controlada de materiales: **20.000 resoluciones por clase y origen / 400.000 resoluciones**  
Prueba adicional de amenaza: **1.000 ciudades / 180 min ignorando fauna**

> Prueba automática del simulador de desarrollo. No equivale a prueba funcional del juego ni a validación Android.

## Cambios incorporados

- cada aventurero comienza con equipo fundador real y persistente;
- el equipo fundador tiene Durabilidad;
- puede repararse;
- no puede venderse ni transferirse;
- el equipo comercial reemplaza al fundador por slot;
- Piel y Cuero curtido pasan a ser recursos distintos;
- el curtido conserva el origen de especie;
- las recetas textiles consumen cuero curtido de un mismo origen;
- Lobo y Jabalí aplican modificadores distintos al producto final;
- Lobo Alfa y Gran Jabalí mantienen la misma identidad en versión superior;
- Gran Jabalí incorpora Robustez;
- la producción textil se separa de la capacidad de Herrería/Carpintería;
- la producción puede priorizar necesidades detectadas del mercado.

## Equipo fundador

Durabilidad de referencia:

- arma/foco fundador: **8**;
- ropa/protección fundadora: **10**.

La estadística base visible Nv.1 ya representa al aventurero con ese equipo funcional.

Por tanto:

- equipo fundador intacto → no duplica estadísticas;
- equipo fundador roto → el simulador aplica una pérdida funcional;
- equipo comercial → reemplaza la pieza fundadora y aporta la mejora correspondiente.

### Perfil Normal / 90 min

- reparaciones totales: **3,16 por ciudad**;
- reparaciones de equipo fundador: **1,88**;
- roturas completas del fundador: **0,056 por ciudad**;
- roturas de cualquier equipo: **0,086 por ciudad**;
- gasto en reparación: **10,46 monedas**.

Lectura:

el fundador genera demanda de reparación desde el comienzo, pero casi nunca obliga al aventurero a quedarse inutilizado por una rotura total.

## Cadena textil real

La cadena queda:

**Piel → Cuero curtido del mismo origen → producto terminado del mismo origen.**

Orígenes simulados:

- Común;
- Lobo;
- Jabalí;
- Lobo Alfa;
- Gran Jabalí.

Curtido inicial:

**1 Piel = 1 Cuero curtido de esa especie.**

Recetas de prueba:

- Protección ligera: 3 Cuero curtido + 1 Tendón.
- Guantes: 1 Cuero curtido.
- Botas: 1 Cuero curtido.

Esto permite usar una sola piel Raro/Boss en una pieza pequeña.

## Modificadores EN PRUEBA

- **Común:** sin modificador.
- **Lobo:** +1 Iniciativa.
- **Jabalí:** +1 Defensa.
- **Lobo Alfa:** +2 Iniciativa.
- **Gran Jabalí:** +2 Defensa + ~5 % reducción adicional del daño esperado.

Multiplicador de valor inicial:

- Lobo ×1,10;
- Jabalí ×1,12;
- Lobo Alfa ×1,35;
- Gran Jabalí ×1,55.

## Perfil Normal — producción en 90 min

### Cuero curtido

- Común: **2,73**.
- Lobo: **11,63**.
- Jabalí: **8,36**.
- Lobo Alfa: **0,35**.
- Gran Jabalí: **0,09**.

### Piezas textiles terminadas

- Común: **0,68**.
- Lobo: **5,09**.
- Jabalí: **4,36**.
- Lobo Alfa: **0,20**.
- Gran Jabalí: **0,05**.

### Piezas vendidas

- Común: **0,47**.
- Lobo: **3,40**.
- Jabalí: **3,02**.
- Lobo Alfa: **0,12**.
- Gran Jabalí: **0,03**.

La frecuencia Raro/Boss sigue siendo baja y no invade el mercado temprano.

## Comparación controlada — 2 Jabalíes

Se aislaron las cinco variantes de Protección ligera con **20.000 resoluciones por clase y origen**.

### Explorador

| Origen | Victoria | Desgaste Vida | Consumo Maná |
|---|---:|---:|---:|
| Común | 90,72 % | 21,41 % | 22,00 % |
| Lobo | 91,57 % | 21,02 % | 21,70 % |
| Jabalí | 91,26 % | 20,02 % | 22,00 % |
| Lobo Alfa | 92,14 % | 20,56 % | 21,40 % |
| Gran Jabalí | 91,43 % | 17,16 % | 22,00 % |

### Guerrero

| Origen | Victoria | Desgaste Vida | Consumo Maná |
|---|---:|---:|---:|
| Común | 91,35 % | 24,97 % | 10,00 % |
| Lobo | 91,99 % | 24,39 % | 9,86 % |
| Jabalí | 91,62 % | 23,24 % | 10,00 % |
| Lobo Alfa | 92,37 % | 23,85 % | 9,73 % |
| Gran Jabalí | 92,50 % | 19,91 % | 10,00 % |

## Lectura del material

La diferencia ya es funcional, no cosmética:

**Rama Lobo**
- sube Iniciativa;
- mejora ligeramente probabilidad de éxito;
- reduce algo el coste de Maná/ritmo de la pelea.

**Rama Jabalí**
- reduce mejor el desgaste de Vida;
- protege especialmente a clases que reciben golpes directos.

**Lobo Alfa**
- profundiza rapidez/ritmo.

**Gran Jabalí**
- profundiza resistencia y añade Robustez.

No hay una variante común que gane en todo.

## Efecto sobre el ciclo general

Perfil Normal:

- Ciudad Nv.2: **16,11 min**.
- Ciudad Nv.3: **34,61 min**.
- Textilería: **22,73 min**.
- fundadores Nv.2+ al llegar a Nv.3: **55,4 %**.
- nivel medio fundador al minuto 90: **2,43**.
- gasto recurrente / ingresos: **28,7 %**.
- monedas finales de ciudad: **205,9**.
- botín vendido a ciudad: **37,3 %**.

La introducción de curtido y origen aumenta la demanda real de pieles sin romper el ritmo temporal.

## Alerta abierta — falta de stock

En el perfil Normal, aproximadamente **30,4 % de los intentos de compra registrados** encuentran falta de stock.

Este porcentaje incluye intentos repetidos del mismo aventurero mientras espera un producto, por lo que no equivale a “30 % de aventureros frustrados”.

No se ajusta todavía de forma agresiva.

Antes de tocar rendimientos se medirá en la versión jugable:

- cuánto tarda realmente una necesidad en resolverse;
- si el aviso de demanda es claro;
- si el jugador siente que puede reaccionar a tiempo.

La producción ya prioriza necesidades detectadas.

## Amenaza

La prueba de abandono territorial continúa funcionando:

- Lobo: Presencia **100**.
- Jabalí: **92**.
- 99,8 % con incidentes.
- 65,0 % con al menos un ataque.
- ~2,08 lesiones de trabajadores.
- ~36,1 de pérdidas equivalentes.

El nuevo sistema textil no rompe Amenaza.

## Estado

**Equipo fundador: baseline EN PRUEBA aceptado.**  
**Curtido por especie: baseline EN PRUEBA aceptado.**  
**Rama Lobo vs Jabalí: diferenciación funcional validada por simulación.**  
**Raro/Boss: suficientemente escasos en el primer tramo.**

## Próximo paso

Con este bloque, el núcleo de simulación Nv.1–3 ya cubre:

- progresión;
- XP;
- combate abstracto;
- equipo;
- reparación;
- comida;
- botín;
- mercado;
- curtido;
- materiales por especie;
- Textilería;
- Presencia/Amenaza.

El siguiente paso recomendado es **comenzar a trasladar este núcleo validado a la versión jugable**, manteniendo el simulador como banco de pruebas permanente.
