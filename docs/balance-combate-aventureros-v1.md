# Balance técnico v1 — Aventureros, combate y ritmo Nv.1–3

Estado: **BASE DE IMPLEMENTACIÓN / BALANCE EN PRUEBA**  
Fecha: 2026-10-05

Este documento traduce el diseño aprobado a números iniciales para construir el primer simulador automático.  
Ningún valor es definitivo: la regla será **simular → medir → detectar desvío → proponer ajuste → volver a simular**.

---

## 1. Objetivos de ritmo

El balance no busca únicamente “ganar combates”. Debe alimentar la economía de la ciudad.

Objetivos iniciales:

- salida fácil: ~5–12 % de desgaste de Vida;
- salida normal: ~15–25 %;
- salida difícil: ~30–45 %;
- Boss ganado por grupo apropiado: ~40–60 % de desgaste total esperado;
- una clase con Maná debería gastar aproximadamente 25–40 % de su reserva en una actividad normal donde use habilidades;
- un aventurero promedio debería poder realizar 2–3 actividades normales antes de preferir descanso/recuperación;
- un aventurero debería reinvertir aproximadamente 20–30 % de sus ingresos a medio plazo entre comida, descanso, reparaciones, servicios y mejoras;
- mejorar equipo debe notarse con claridad, pero nunca volver autosuficiente al aventurero.

El objetivo de Ciudad Nv.1–3 continúa alrededor de una hora de actividad.

---

## 2. Estadísticas base

Las estadísticas principales son:

- Vida;
- Ataque;
- Defensa;
- Iniciativa;
- Maná.

Evasión es una propiedad derivada, no una sexta estadística.

### 2.1. Valores base Nv.1

| Clase | Vida | Ataque | Defensa | Iniciativa | Maná | Evasión base |
|---|---:|---:|---:|---:|---:|---:|
| Guerrero | 120 | 10 | 7 | 4 | 18 | 2 % |
| Explorador | 90 | 14 | 3 | 8 | 32 | 14 % |
| Sanador | 80 | 9 | 5 | 5 | 58 | 3 % |
| Mago | 72 | 16 | 3 | 6 | 64 | 3 % |

El Mago no es fundador: su primera llegada está garantizada al alcanzar Ciudad Nv.2.

### 2.2. Lectura de estos valores

**Guerrero**
- sobrevive por Vida alta;
- su Defensa base es sólo moderada;
- un escudo y una armadura siguen siendo compras atractivas.

**Explorador**
- mata rápido;
- si un ataque lo alcanza, su baja Defensa importa;
- sobrevive por Iniciativa y Evasión.

**Sanador**
- no tiene gran Vida;
- puede sostener al grupo usando Maná;
- si agota Maná pierde gran parte de su valor de soporte.

**Mago**
- es el mayor daño mágico;
- muy frágil;
- depende de Maná y de que el grupo lo proteja.

---

## 3. Crecimiento temprano por nivel

No se usará un crecimiento explosivo.

Para las primeras simulaciones:

### Guerrero
Por nivel ganado:
- +6 Vida;
- +1 Ataque cada 2 niveles;
- +1 Defensa cada 3 niveles;
- +1 Maná.

### Explorador
Por nivel:
- +4 Vida;
- +1 Ataque;
- +1 Defensa cada 4 niveles;
- +2 Maná;
- +0,5 puntos porcentuales de Evasión cada 2 niveles.

### Sanador
Por nivel:
- +3 Vida;
- +1 Ataque cada 2 niveles;
- +1 Defensa cada 3 niveles;
- +4 Maná.

### Mago
Por nivel:
- +3 Vida;
- +1 Ataque;
- +1 Defensa cada 4 niveles;
- +4 Maná.

El crecimiento definitivo a Nv.100 se diseñará después de comprobar que Nv.1–3 funciona.

---

## 4. Equipo fundador

Los aventureros llegan con equipo personal rudimentario para poder actuar desde el minuto cero.

Este equipo:

- tiene estadísticas inferiores a las piezas comerciales;
- pertenece al aventurero;
- no puede transferirse a la ciudad ni venderse para explotar la fundación;
- puede desgastarse;
- genera necesidad natural de reemplazo/mejora.

Referencia:

**Guerrero**
- arma gastada: +4 Ataque;
- protección simple: +1 Defensa.

**Explorador**
- arco o dagas gastadas: +4 Ataque;
- ropa de viaje: +1 Defensa;
- +2 % Evasión derivada.

**Sanador**
- bastón de novicio: +3 Ataque mágico, +6 Maná;
- ropa simple: +1 Defensa.

**Mago**
- foco de aprendiz: +3 Ataque mágico, +6 Maná;
- túnica simple: sin bonificación defensiva relevante.

---

## 5. Primeras mejoras comerciales — referencias

Estos valores sirven para empezar a medir deseo de compra.

- **Daga de hierro:** +6 Ataque físico; compatible con Explorador y futuros perfiles.
- **Arco de caza:** +7 Ataque físico a distancia; +1 Iniciativa.
- **Bastón sencillo:** +4 Ataque mágico; +12 Maná.
- **Escudo de madera:** +3 Defensa; -1 Iniciativa.
- **Chaleco/Protección ligera de cuero:** +3 Defensa.
- **Guantes de cuero:** +1 Defensa.
- **Botas de cuero:** +1 Iniciativa.

Los materiales de especie modifican estos resultados:

- Lobo → Iniciativa/rapidez.
- Lobo Alfa → versión superior de la misma mejora.
- Jabalí → Defensa/resistencia.
- Gran Jabalí → mejora defensiva superior + posible propiedad especial.

La calidad de fabricación se aplica después del material de origen.

### 5.1. Durabilidad comercial — baseline EN PRUEBA

Para validar que Reparación exista como servicio recurrente sin transformarse en micromanejo constante:

| Objeto | Durabilidad de prueba |
|---|---:|
| Daga de hierro | 9 |
| Arco de caza | 9 |
| Bastón sencillo | 9 |
| Escudo de madera | 10 |
| Protección ligera de cuero | 12 |
| Guantes de cuero | 8 |
| Botas de cuero | 8 |

Reglas de simulación:

- una salida de combate puede consumir Durabilidad;
- Raro/Boss generan más desgaste;
- al llegar a **40 % o menos**, el aventurero empieza a considerar Reparación;
- un objeto con Durabilidad 0 deja de aportar su bonificación hasta repararse;
- coste de reparación inicial: aproximadamente **22 % del valor del objeto**.

El equipo fundador también tiene Durabilidad real:

- arma/foco fundador: aproximadamente **8**;
- ropa/protección fundadora: aproximadamente **10**;
- es personal, no transferible y no vendible;
- puede repararse;
- puede ser reemplazado por equipo comercial;
- si llega a 0, el aventurero pierde temporalmente la parte funcional de ese equipo hasta repararlo o sustituirlo.

En el simulador, las estadísticas Nv.1 visibles ya representan al aventurero con su paquete fundador funcional. Por eso el equipo fundador intacto no “suma dos veces”; al romperse aplica una penalización equivalente a perder ese apoyo.

Resultado perfil Normal tras 1.000 ciclos de 90 min:

- **3,16 reparaciones totales por ciudad**;
- de ellas, **1,88** corresponden al equipo fundador;
- roturas efectivas de equipo fundador: **0,056 por ciudad**;
- gasto medio total en reparaciones: **10,5 monedas**.

La mayoría de reparaciones ocurre antes de llegar a 0. Esto se acepta como baseline EN PRUEBA.

### 5.2. Compra guiada por necesidad

El aventurero no visita el mercado al azar para comprar cualquier cosa.

La demanda inicial se deriva de:

- clase;
- estilo de combate;
- slot/equipo faltante;
- desgaste/fragilidad;
- historial de incapacitación;
- disponibilidad y precio.

Ejemplo:

- Explorador de arco busca Arco, no Daga por azar;
- Guerrero prioriza Escudo;
- Sanador/Mago priorizan Bastón;
- una pieza defensiva gana interés si el aventurero está sufriendo demasiado daño.

En 1.000 ciclos Normal:

- **84,2 %** de las necesidades de compra se resolvieron;
- **14,4 %** fallaron por falta de stock;
- **1,35 %** por falta de dinero.

Esto deja al stock/productor como principal cuello de botella, no a la pobreza permanente del aventurero.

### 5.3. Plato sencillo y Ración de viaje — BALANCE EN PRUEBA

No existe Hambre obligatoria.

**Plato sencillo**
- precio de prueba: **2 monedas**;
- consume aproximadamente 0,75 Carne + 0,15 Leña en la abstracción del simulador;
- se compra sólo cuando el aventurero tiene desgaste moderado, pero todavía no necesita un Descanso completo;
- recupera aproximadamente **8 % de Vida máxima + 10 % de Maná máximo**;
- funciona como servicio de recuperación ligera, no como obligación.

**Ración de viaje**
- precio de prueba: **3 monedas**;
- consume aproximadamente 0,75 Carne + 0,10 Leña;
- es una preparación para la siguiente actividad;
- reduce aproximadamente **8 % del desgaste de Vida** y **5 % del consumo de Maná** en esa salida;
- después de usarse desaparece.

En el perfil Normal / 90 min:

- ~**9,0 Platos** consumidos por ciudad;
- ~**5,8 Raciones**;
- gasto alimentario: ~**35,4 monedas**;
- gasto recurrente total (Descanso + Reparación + comida): **~30,0 % de los ingresos generados**.

Esto queda dentro del corredor objetivo inicial y se acepta como baseline EN PRUEBA.

### 5.4. Drops reales y mercado de materiales — BALANCE EN PRUEBA

Los enemigos ya no generan un simple “valor de botín” en el simulador. Generan materiales concretos.

**Lobo**
- Carne ~70 % ×1;
- Piel de Lobo ~55 % ×1;
- Colmillo de Lobo ~15 % ×1.

**Jabalí**
- Carne ~90 % ×1–2;
- Piel de Jabalí ~65 % ×1;
- Tendón ~40 % ×1;
- Colmillo de Jabalí ~12 % ×1.

**Lobo Alfa**
- Carne 100 % ×1–2;
- Piel de Lobo Alfa 100 % ×1;
- Colmillo Alfa ~30 % ×1;
- además se resuelve el botín de los Lobos comunes acompañantes.

**Gran Jabalí**
- Carne 100 % ×3–5;
- Piel de Gran Jabalí 100 % ×1;
- Tendón de Gran Jabalí ~50 % ×1;
- Colmillo de Gran Jabalí ~40 % ×1.

Valores de referencia usados sólo para simulación temprana:

- Carne 2;
- Tendón 4;
- Piel de Lobo 5;
- Piel de Jabalí 6;
- Colmillo de Lobo 7;
- Colmillo de Jabalí 8;
- Piel de Lobo Alfa 16;
- Colmillo Alfa 18;
- Piel de Gran Jabalí 25;
- Tendón de Gran Jabalí 14;
- Colmillo de Gran Jabalí 20.

#### Decisión de compra de la ciudad

La ciudad no compra automáticamente todo lo que un aventurero ofrece.

El simulador usa una política automática equivalente a una gestión racional:

1. comprueba si existe **demanda real** del material;
2. mantiene un objetivo de stock según nivel de Ciudad;
3. conserva una **reserva mínima de tesorería de 55 monedas**;
4. acepta sólo la cantidad que necesita y puede pagar;
5. rechaza o posterga el excedente;
6. el aventurero conserva lo no vendido.

Esto no sustituye la decisión del jugador en la versión final. Puede traducirse a:

- aceptación manual;
- órdenes de compra;
- límites de stock;
- políticas automáticas configurables.

En 1.000 ciclos del perfil Normal:

- botín generado: ~**92,4 unidades** por ciudad;
- vendido a la ciudad: **32,1 %** del botín generado;
- retenido por aventureros al final: ~**62,7 unidades**;
- valor pagado por la ciudad en compra de botín: ~**175,9 monedas**.

La gran cantidad retenida no se considera un error: prepara la futura circulación entre ciudades, mercados y necesidades de Reino.

### 5.5. Curtido y origen del material — BALANCE EN PRUEBA

La simplificación de “piel compatible” queda reemplazada por una cadena explícita:

**Piel de especie → Cuero curtido de esa especie → objeto terminado con ese origen.**

El simulador mantiene por separado:

- Piel común → Cuero curtido común;
- Piel de Lobo → Cuero curtido de Lobo;
- Piel de Jabalí → Cuero curtido de Jabalí;
- Piel de Lobo Alfa → Cuero curtido de Lobo Alfa;
- Piel de Gran Jabalí → Cuero curtido de Gran Jabalí.

El curtido es **1:1** en la primera referencia y no elimina la identidad del material.

Las piezas terminadas usan cuero curtido de un mismo origen para definir su rama.

Modificadores iniciales:

- **Común:** sin modificador.
- **Lobo:** +1 Iniciativa.
- **Jabalí:** +1 Defensa.
- **Lobo Alfa:** +2 Iniciativa.
- **Gran Jabalí:** +2 Defensa + aproximadamente 5 % de reducción adicional del daño esperado.

Multiplicadores de valor de prueba:

- Lobo: ×1,10;
- Jabalí: ×1,12;
- Lobo Alfa: ×1,35;
- Gran Jabalí: ×1,55.

Esto se aplica sobre la receta base; no crea recetas duplicadas.

En el perfil Normal / 90 min se producen de media:

**Cuero curtido**
- común: ~2,7;
- Lobo: ~11,6;
- Jabalí: ~8,4;
- Lobo Alfa: ~0,35;
- Gran Jabalí: ~0,09.

**Piezas textiles terminadas**
- comunes: ~0,68;
- Lobo: ~5,09;
- Jabalí: ~4,36;
- Lobo Alfa: ~0,20;
- Gran Jabalí: ~0,05.

La baja frecuencia de material Raro/Boss es intencional.

### 5.6. Comparación controlada Lobo vs Jabalí

Se ejecutaron **20.000 resoluciones por clase y origen** contra 2 Jabalíes para aislar el efecto del material.

Ejemplo Explorador:

- sin origen especial → ~90,7 % victoria / ~21,4 % desgaste Vida;
- Lobo → ~91,6 % victoria / ~21,0 % desgaste / ~1,4 % menos consumo de Maná;
- Jabalí → ~91,3 % victoria / ~20,0 % desgaste;
- Lobo Alfa → ~92,1 % victoria / ~20,6 % desgaste / ~2,8 % menos Maná;
- Gran Jabalí → ~91,4 % victoria / ~17,2 % desgaste.

Lectura:

- **Lobo** mejora ritmo/éxito y reduce ligeramente el coste de recursos;
- **Jabalí** reduce mejor el desgaste físico;
- la rama Raro mantiene la identidad de su especie;
- el Boss es superior y añade robustez extra.

No aparece una opción común universalmente mejor: la elección depende del rol y de lo que quiera optimizar el aventurero.

---

## 6. Habilidades básicas y Maná

Las habilidades no se ejecutan de manera persistente. Sus datos alimentan la resolución probabilística.

### Guerrero

**Guardia**
- coste: 4 Maná;
- reduce aproximadamente 12 % el daño/riesgo esperado del grupo durante una ventana abstracta.

**Interponerse**
- coste: 5 Maná;
- reduce aproximadamente 20 % el riesgo de incapacitación del aliado más vulnerable y desplaza parte del riesgo hacia el Guerrero.

**Golpe de escudo**
- coste: 3 Maná;
- requiere escudo;
- daño físico moderado;
- 15 % base de aplicar Aturdido.

### Explorador

**Ataque certero**
- coste: 6 Maná;
- +25 % contribución ofensiva de esa acción abstracta.

**Paso evasivo**
- coste: 5 Maná;
- +12 puntos porcentuales de Evasión durante una ventana breve.

**Marcar presa**
- coste: 6 Maná;
- +15 % daño esperado propio contra un objetivo durante el encuentro.

### Sanador

**Curación**
- coste: 10 Maná;
- recupera aproximadamente 18–22 Vida equivalente en Nv.1.

**Purificar**
- coste: 8 Maná;
- elimina o reduce un Estado negativo compatible.

**Luz sagrada**
- coste: 8 Maná;
- daño mágico moderado;
- +35 % daño esperado contra Tipo No Muerto como primera referencia.

### Mago

**Proyectil arcano**
- coste: 8 Maná;
- daño mágico alto y estable.

**Chispa ígnea**
- coste: 10 Maná;
- daño mágico moderado-alto;
- 25 % base de aplicar Quemadura.

**Descarga**
- coste: 10 Maná;
- daño mágico moderado;
- 18 % base de aplicar Parálisis.

---

## 7. Estados iniciales

Los Estados modifican el resultado esperado. No requieren almacenar rondas de combate reales.

### Afinidad potencial de Estados por clase

Los Estados **no pertenecen todos al Mago**. Cada clase tiene afinidad natural con determinados Estados, pero eso **no significa que un aventurero Nv.1 empiece con habilidades capaces de aplicarlos**.

| Clase | Estados de su línea potencial |
|---|---|
| **Guerrero** | Herida, Aturdido |
| **Explorador** | Herida, Veneno, Parálisis |
| **Sanador** | Sin Estado ofensivo base; cura/limpia Estados |
| **Mago** | Quemadura, Parálisis |

El desbloqueo real se repartirá a lo largo de los niveles y dependerá de las habilidades aprendidas.

Lectura de diseño:

- **Herida** representa daño físico traumático: Guerrero y Explorador.
- **Aturdido** representa impacto/control físico fuerte: principalmente Guerrero.
- **Veneno** representa preparación, caza, sustancias y tácticas: principalmente Explorador.
- **Parálisis** puede surgir por táctica/trampa del Explorador o por Rayo del Mago.
- **Quemadura** pertenece inicialmente al daño elemental de Fuego del Mago.
- **Sanador** se especializa en remover/mitigar Estados y sostener al grupo, no en repartir Estados ofensivos.

Estas afinidades son la base de clase, no una lista de habilidades iniciales ni una prohibición eterna. Equipamiento, materiales especiales y futuras especializaciones pueden abrir otras formas de aplicar Estados cuando exista una razón de juego.

**Regla para el simulador Nv.1:** no asumir ningún Estado ofensivo de clase como desbloqueado hasta definir la progresión de habilidades por nivel.


### Herida
- +8 % de desgaste esperado mientras influye en el encuentro;
- +15 % relativo al riesgo de regresar con lesión física persistente.

### Quemadura
- añade aproximadamente 8 % de Vida máxima equivalente como daño esperado total si no se limpia;
- efecto de Fuego.

### Veneno
- añade aproximadamente 6 % de Vida máxima equivalente como daño esperado;
- -25 % eficacia de curaciones mientras esté activo.

### Parálisis
- -25 % Iniciativa efectiva durante su ventana;
- -20 % contribución ofensiva durante esa misma ventana.

### Aturdido
- representa la pérdida de una acción/ventana importante;
- aproximadamente -30 % contribución durante esa ventana;
- debe tener protección anti-encadenamiento en el simulador.

Los valores son semillas de simulación.

---

## 8. Tipos de enemigo

Propiedad distinta de Rareza.

Iniciales:

- **Animal**
- **Humanoide**
- **No Muerto**
- **No Vivo**

Primer catálogo:

- Lobo → Animal / Común
- Jabalí → Animal / Común
- Lobo Alfa → Animal / Raro
- Gran Jabalí → Animal / Boss
- Bandido → Humanoide
- Goblin → Humanoide
- Esqueleto → No Muerto
- Zombi → No Muerto
- Vampiro → No Muerto
- Golem → No Vivo
- Torreta → No Vivo
- Invocación elemental → No Vivo

---

## 9. Valores absolutos iniciales de enemigos Nv.1–3

Estos números se fijan únicamente para iniciar el simulador.

| Enemigo | Vida | Ataque | Defensa | Iniciativa |
|---|---:|---:|---:|---:|
| Lobo | 34 | 9 | 2 | 7 |
| Jabalí | 55 | 12 | 5 | 3 |
| Lobo Alfa | 95 | 15 | 5 | 8 |
| Gran Jabalí | 280 | 21 | 10 | 4 |

Se mantienen todas las habilidades, pasivas, drops y reglas territoriales documentadas en la Biblia de diseño.

---

## 10. XP y ritmo

Primera curva:

- Nv.1 → 2: **45 XP**.
- Nv.2 → 3: **90 XP**.
- Nv.3 → 4: **150 XP**.

XP base de enemigos:

- Lobo: 10.
- Jabalí: 14.
- Lobo Alfa: 38.
- Gran Jabalí: 90 total.

La XP de un encuentro se reparte entre participantes.

### Ajuste de XP tras simulación de ciclo v1

La primera curva 60 / 100 / 160 dejó a los aventureros demasiado retrasados respecto del crecimiento de la ciudad.

Con la curva **45 / 90 / 150** y el perfil Normal:

- Ciudad Nv.2: ~16 min.
- Ciudad Nv.3: ~35 min.
- al alcanzar Ciudad Nv.3, aproximadamente **54 % de los fundadores ya está en Nv.2 o superior**;
- nivel medio de los fundadores en ese punto: ~1,54.

Este valor se acepta como **baseline EN PRUEBA**, porque mantiene diferencias naturales entre aventureros sin permitir que todos superen demasiado pronto a la ciudad.

### 10.1. Caer a 0

- incapacitación;
- pierde 20 % de la XP necesaria para el siguiente nivel;
- la pérdida nunca baja un nivel ya obtenido;
- queda tiempo de recuperación;
- puede generar necesidad de Mesón/curación/equipo.

---

## 11. Crecimiento de población de aventureros

Para el primer tramo:

- Ciudad Nv.1 → 3 fundadores: Guerrero, Explorador, Sanador.
- Ciudad Nv.2 → llega Mago → 4.
- Ciudad Nv.3 → llega un quinto aventurero generado de forma controlada.

Mesón Nv.1 soporta al menos 5 residentes.

El progreso de ciudad desbloquea cupos; el Mesón controla capacidad/atractivo.

---

## 12. Reglas del motor de resolución

El juego final no ejecuta peleas persistentes.

Cuando una actividad necesita resultado:

1. toma una instantánea del grupo y enemigos;
2. calcula capacidad ofensiva, supervivencia, Maná, estados, equipo, Tipo y sinergias;
3. realiza una resolución probabilística breve;
4. genera consecuencias persistentes;
5. descarta el detalle intermedio.

Persisten únicamente datos relevantes:

- victoria/fracaso;
- Vida resultante;
- Maná consumido si corresponde;
- heridas/estados persistentes;
- XP;
- drops;
- duración/retorno;
- daño de equipo;
- otros cambios útiles.

No se almacena un log golpe por golpe.

---

## 13. Simulador automático — métricas obligatorias

Cada lote de simulación debe informar:

### Progresión
- tiempo medio/mediana a Ciudad Nv.2 y Nv.3;
- nivel medio de aventureros al alcanzar cada nivel de ciudad;
- distribución de XP;
- cantidad de pérdidas de XP por 0 Vida.

### Combate
- tasa de victoria por encuentro;
- desgaste medio de Vida;
- consumo de Maná;
- incapacitación;
- heridas;
- efecto real de equipo;
- valor de cada clase en grupos.

### Economía
- ingreso medio por aventurero;
- gasto medio;
- porcentaje reinvertido en ciudad;
- compras por categoría;
- uso de Mesón;
- reparaciones;
- acumulación excesiva de monedas;
- falta crónica de dinero.

### Ciudad
- producción realizada;
- materiales faltantes;
- tiempo ocioso de trabajadores;
- construcción de Textilería;
- uso de Herrería/Carpintería/Mesón/Sede;
- misión publicada/aceptada/completada.

### Mundo
- Presencia media de Lobos/Jabalíes;
- frecuencia de Lobo Alfa;
- frecuencia de Gran Jabalí;
- uso de escoltas;
- ataques/estados críticos.

---

## 14. Perfiles de simulación

No balancear sólo para un jugador perfecto.

Ejecutar como mínimo:

- **Eficiente:** gestiona bien recursos y recompensas.
- **Normal:** decisiones razonables con pequeñas ineficiencias.
- **Conservador:** prioriza seguridad y ahorra.
- **Agresivo:** toma más riesgos y gasta más en progreso.
- **Mala gestión:** prueba de resistencia del sistema, sin buscar optimización.

---

## 15. Criterios de alerta

Ejemplos de problemas a detectar automáticamente:

- aventureros llegan a Nv.3 demasiado antes que la ciudad;
- nadie compra escudos;
- Sanador casi nunca necesita descansar;
- Mago agota Maná después de cada actividad;
- Explorador cae a 0 con demasiada frecuencia;
- Boss requiere material que sólo entrega el propio Boss;
- ciudad queda sin dinero de forma sistemática;
- aventureros acumulan fortunas sin consumir servicios;
- Textilería se construye demasiado tarde;
- Lobo Alfa/Boss aparecen demasiado poco o demasiado seguido;
- una clase domina todas las composiciones.

Cada alerta debe producir:

1. dato observado;
2. causa probable;
3. propuesta de ajuste;
4. nueva corrida comparativa.

---

## 16. Regla de validación

Los informes deben distinguir:

- **Prueba automática:** simulador.
- **Prueba funcional:** código ejecutado en navegador/entorno de desarrollo.
- **Prueba real Android:** validación manual de Adrián.

Nunca presentar una prueba automática como si fuera validación real de dispositivo.


## 17. Economía recurrente — baseline v2

Con Descanso básico a **4 monedas**:

Perfil Normal / 90 min:

- equipo permanente: ~252,3 monedas;
- descanso/recuperación: ~60,3;
- reparación: ~6,9;
- gasto recurrente total actual: ~67,1;
- gasto recurrente / ingresos generados: **~27,3 %**.

Este valor queda dentro del objetivo provisional del 20–30 %.

La inversión en equipo se mide aparte porque es gasto de capital y no debe confundirse con mantenimiento recurrente.

El coste de Descanso de 4 monedas deja margen para sumar después:

- comida;
- raciones;
- consumibles;
- tratamientos;
- otros servicios.

---

## 18. Amenaza ignorada — baseline v2

Prueba automática especial:

- 1.000 ciudades;
- 180 min;
- producción y crecimiento activos;
- **sin respuesta de aventureros a la fauna**.

Resultado medio:

- Presencia Lobo: **100**;
- Presencia Jabalí: **92**;
- 100 % tuvo incidentes;
- 65,5 % sufrió al menos un ataque;
- 2,14 lesiones de trabajadores;
- ~36,9 de pérdida equivalente en recursos/monedas.

Esto valida la dirección:

**controlar territorio evita presión; ignorarlo genera consecuencias recuperables.**

Esta prueba representa abandono activo del problema, no castigo por desconexión. La gracia offline se diseñará aparte.
