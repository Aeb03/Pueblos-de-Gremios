# Diseño aprobado EN PRUEBA — Era, ciudad inicial y tramo Nv.1–3

Estado: **DISEÑO APROBADO EN PRUEBA / FUTURO DESARROLLO**  
Fecha de consolidación: 2026-10-05

> Este documento congela las decisiones de diseño debatidas para no perderlas.  
> No implica que todo esté implementado. Los números marcados como balance son provisionales y deben validarse jugando.

---

## 1. Identidad actual del juego

El proyecto deja de pensarse como un simple gestor de pueblo y pasa a funcionar como un **mundo persistente por temporadas**, donde:

- el jugador desarrolla una ciudad;
- la ciudad presta servicios a aventureros persistentes;
- los aventureros progresan gracias a esos servicios;
- los aventureros generan economía, drops, historias y nuevas necesidades;
- las amenazas del entorno cambian según la actividad del mundo;
- las ciudades empiezan aisladas/locales y terminan conectadas a regiones de Reino y del Mundo.

Principio central:

**El jugador progresa la ciudad → la ciudad ayuda a progresar a los aventureros → los aventureros generan nuevas necesidades, economía e historias → el mundo cambia.**

Los aventureros no son unidades controladas directamente. Tienen estado, dinero, equipo, personalidad, necesidades, historial y decisiones propias.

---

## 2. Temporadas / Eras

El juego tendrá un ciclo de temporada con principio y final.

Objetivo actual:

- duración aproximada: **2–3 meses reales**;
- progresión grande, pensada actualmente alrededor de una escala de hasta **Nv.100**;
- durante una temporada debe ser posible recorrer la totalidad del contenido importante;
- el progreso material del mundo se reinicia al terminar la temporada;
- el reinicio no debe sentirse frustrante porque el juego debe ser entretenido desde los primeros niveles.

### 2.1. Lo que se reinicia

En principio:

- ciudad;
- niveles;
- edificios;
- recursos;
- monedas del mundo;
- inventarios;
- aventureros activos;
- amenazas y estados temporales;
- progreso territorial de esa Era.

### 2.2. Lo que permanece

Debe existir un **Legado / Registro histórico** compacto, evitando conservar cada evento detallado para siempre.

Se conservarán, entre otras cosas:

- Crónicas de temporadas anteriores;
- logros;
- títulos;
- trofeos;
- registros de ciudades;
- aventureros históricos destacados;
- objetos excepcionales;
- récords mundiales y de Reino;
- moneda persistente tipo **Diamantes**.

### 2.3. Diamantes

Los Diamantes serán una moneda persistente entre temporadas.

Usos previstos:

- obtener recursos;
- acelerar ciertas producciones;
- recompensas de temporada;
- posibles usos cosméticos / de personalización.

**Regla de balance:** no deben crear una ventaja acumulativa tan grande que un ganador de una temporada quede prácticamente condenado a ganar la siguiente. El valor debe sentirse útil sin convertir el juego competitivo en “gana quien más gastó”.

---

## 3. Registros y logros de temporada

Al finalizar una Era se genera un **Registro de la Temporada / Salón de la Fama**.

Ejemplos aprobados:

### Mundo
- Mejor Capital del Mundo.
- Primera ciudad en alcanzar determinados hitos.
- Mayor influencia/prestigio si ese sistema se adopta.

### Reinos
- Capital del Reino 1.
- Capital del Reino 2.
- etc.

### Aventureros
- **Aventurero Legendario**: todos los aventureros que hayan participado en una victoria contra el jefe final.
- Primer aventurero/grupo que derrotó cada Boss.
- Participantes de primeras conquistas.

### Bosses
- Primera derrota de cada Boss.
- Fecha.
- Grupo participante.
- Ciudades de origen.
- Equipo relevante usado en la victoria.

### Oficios / negocios
- Mejor Herrería.
- Mejor Carpintería.
- Mejor Textilería.
- Mejor Mesón.
- etc.

### Objetos
- Mejor arma fabricada.
- Mejor arco.
- Mejor bastón.
- Mejor objeto por calidad/valor/estadística, según el sistema final.

El objetivo es que una temporada cerrada quede registrada como una **Era histórica**, no como datos eliminados sin sentido.

---

## 4. Mundo, Reinos, ciudades y zonas por nivel

Habrá un límite de jugadores por Reino y por Mundo.

### 4.1. Emplazamientos fundadores

Las ciudades no aparecerán en puntos aleatorios sin control.

Cada Reino tendrá **emplazamientos de ciudad predefinidos**.

Toda ciudad nueva:

- ocupa un emplazamiento libre;
- recibe el mismo tipo de territorio fundador balanceado;
- nunca queda atrapada en una región de nivel alto sin contenido inicial viable.

### 4.2. Escala territorial aprobada EN PRUEBA

| Tramo de zona | Alcance |
|---|---|
| **Nv.1–10** | Territorio fundador local de cada ciudad. Misma plantilla de contenido para todas las ciudades. |
| **Nv.11–20** | Primeras zonas compartidas entre varias ciudades del mismo Reino. |
| **Nv.21–40** | Regiones compartidas más amplias del Reino. |
| **Nv.41–60** | Grandes regiones avanzadas del Reino. |
| **Nv.61–80** | Regiones de élite del Reino. |
| **Nv.81–99** | **Regiones mundiales compartidas por todos los Reinos.** |
| **Nv.100** | **Contenido/zona final mundial de la temporada.** |

La progresión conceptual es:

**Ciudad → Reino → Mundo.**

### 4.3. Distancia y transporte

A niveles más altos la distancia será una necesidad real.

Se aprueba como futuro contenido un negocio tipo **Establo** con:

- venta de caballos para aventureros;
- carruajes para grupos y provisiones;
- servicio de transporte para quien no quiera o no pueda comprar caballo.

El transporte puede influir en:

- tiempo de viaje;
- capacidad de provisiones;
- cantidad de botín transportable;
- rutas largas;
- acceso a regiones avanzadas.

---

## 5. Ciudad fundadora — núcleo de Nv.1

La ciudad inicial tendrá:

- **Ayuntamiento**
- **Herrería**
- **Carpintería**
- **Mesón** = Taberna + Posada fusionadas al inicio
- **Sede del Gremio**

### Trabajadores iniciales

- **Borin** — Herrero
- **Mara** — Minera
- **Eldon** — Carpintero
- **Nara** — Mesón
- **Leñador** — nuevo trabajador inicial
- **Cazador** — nuevo trabajador inicial

El Ayuntamiento lo gestiona directamente el jugador.

La Sede del Gremio no necesita un trabajador adicional en Nv.1.

### Aventureros iniciales

Se mantienen 3 aventureros fundadores persistentes:

- Guerrero
- Explorador
- Sanador

Todos llegan con equipo básico funcional para no quedar bloqueados esperando producción de la ciudad.

---

## 6. Ayuntamiento Nv.1

Funciona como centro de gestión global de la ciudad.

Funciones aprobadas:

- resumen general;
- tesorería;
- dinero disponible y reservado;
- desarrollo de ciudad;
- requisitos de siguiente nivel;
- resumen de edificios;
- resumen de trabajadores;
- alertas;
- obras y rehabilitación;
- nombre/identidad de ciudad;
- acceso al mapa.

No se introducen todavía:

- leyes;
- impuestos complejos;
- diplomacia;
- ejército municipal;
- política avanzada.

---

## 7. Mapa local

El mapa es una pantalla propia, no una simple subsección del Ayuntamiento.

Desde Nv.1 muestra:

- ciudad;
- zonas cercanas;
- recursos;
- riesgo;
- Presencia/Amenaza;
- trabajadores compatibles;
- salidas disponibles;
- requisito de escolta;
- acceso rápido a actividades relacionadas.

El territorio fundador Nv.1–10 debe ser equivalente para todas las ciudades, aunque cada ciudad tenga su propia instancia local de amenaza y recursos.

Las zonas de mayor nivel se van habilitando con el progreso.

---

## 8. Herrería Nv.1 — Borin

### Servicios

- **Afilado básico**
- **Reparación básica de armas**
- **Reparación básica de herramientas**

### Producción

- Cabeza de pico
- Cabeza de hacha
- Lote de 6 puntas de flecha
- Lote de clavos
- Pico de hierro
- Hacha de trabajo
- Daga de hierro
- Cuchillo de caza

### Reservado para Nv.2

- **Lanza simple**

### 8.1. Afilado

No existe una segunda barra de “Filo”.

Sólo existe **Durabilidad** como desgaste permanente.

El Afilado es un buff temporal:

- dura una salida;
- en arma compatible: mejora ofensiva temporal, inicialmente **+1 daño**;
- en herramienta compatible: inicialmente **+1 al recurso principal**;
- si coincide con una zona especial compatible que contiene un recurso poco común, el Afilado puede **garantizar 1 unidad de ese recurso poco común**;
- no garantiza materiales verdaderamente raros o excepcionales.

Ejemplos futuros:

- Pico afilado en Veta dura.
- Hacha afilada en bosque especial.
- Cuchillo de caza afilado para asegurar mejor aprovechamiento de una presa compatible.

---

## 9. Carpintería Nv.1 — Eldon

Contenido aprobado:

- Reparación básica de equipo de madera
- Ajuste de arco
- Mango de herramienta
- Arco de caza
- Haz de flechas
- Bastón sencillo
- Escudo de madera

### Reservado para después

- Tablones, cuando exista una necesidad real.
- Asta de lanza, vinculada a la Lanza simple de Nv.2.

### 9.1. Arco de caza

Receta conceptual:

- madera;
- tendón animal.

No existe “cuerda de arco” como objeto intermedio en Nv.1.

El tendón se procesa como parte de la fabricación.

### 9.2. Flechas

No se fabrican flechas una por una.

**Borin:**
- 1 fabricación = **lote de 6 puntas**.

**Eldon:**
- 1 fabricación = **Haz de 12 flechas**.
- requiere 2 lotes de puntas (= 12 puntas) + madera.

Regla general:

**Los consumibles naturalmente numerosos se administran por lotes, no por unidad individual.**

### 9.3. Bastón sencillo

No es un arma pensada principalmente para daño.

Concepto aprobado:

- aumenta **Maná máximo**;
- sirve a aventureros compatibles con magia/apoyo;
- no queda restringido rígidamente a “Sanador” si otro perfil compatible puede usarlo.

### 9.4. Escudo de madera

Puede equiparlo **cualquier aventurero compatible**, no una clase fija obligatoria.

Regla general:

**los objetos se restringen por compatibilidad, no por etiqueta rígida de clase salvo que realmente tenga sentido.**

---

## 10. Mesón Nv.1 — Nara

El Mesón combina inicialmente Taberna + Posada.

Contenido aprobado:

- **Plato sencillo**
- **Ración de viaje**
- **Descanso**
- **Alojamiento**

La **Comida abundante** queda para niveles posteriores.

### Reglas

- No habrá una barra de Hambre obligatoria que genere micromanejo.
- Comer debe ser una ventaja/preparación, no una obligación tediosa.
- Los efectos exactos de Plato, Ración, Descanso y Alojamiento se definirán al detallar objetos/servicios.

### 10.1. Función social

El Mesón será un termómetro social de la ciudad.

Los comentarios deben surgir de hechos reales.

Ejemplos:

- un aventurero fue a Herrería buscando una daga y no compró;
- considera las dagas demasiado caras;
- considera que están muy baratas;
- elogia la calidad;
- no encontró stock;
- volvió herido;
- comenta una amenaza;
- habla de una salida/misión real.

El Libro del negocio guarda el detalle y el Mesón selecciona comentarios relevantes para evitar spam.

---

## 11. Sede del Gremio Nv.1

Es el puente entre ciudad y aventureros.

Funciones aprobadas:

- Tablón de Misiones comunes.
- Activar/desactivar misiones.
- Recompensa configurable por el jugador.
- Valor recomendado.
- Seguimiento de aceptación/progreso.
- Reserva de recompensa.
- Entrega y cobro.
- Ofertas espontáneas de aventureros.
- Registro básico de aventureros.

### Tipos de Misiones comunes iniciales

- **Caza / eliminación**
- **Abastecimiento / entrega**
- **Escolta**

Quedan fuera por ahora:

- exploración de zonas;
- pequeños encargos narrativos.

### 11.1. Recompensa configurable

La ciudad elige cuánto paga.

El juego muestra:

- valor recomendado;
- recompensa ofrecida;
- interés aproximado.

Los aventureros deciden si aceptan según:

- riesgo;
- nivel;
- equipo;
- personalidad;
- ánimo;
- dinero;
- otras oportunidades;
- utilidad esperada.

Cuando un aventurero acepta, el dinero se **reserva**.

### 11.2. Diferencia entre eliminar y entregar

**Eliminar 5 Lobos**
- se paga por cumplir el objetivo;
- los drops conseguidos siguen perteneciendo al aventurero.

**Entregar 5 Pieles**
- sólo se paga cuando entrega exactamente lo pedido;
- el material pasa a ciudad/negocio.

Un aventurero puede cobrar una misión de control y luego ofrecer sus pieles por separado.

### 11.3. Ofertas espontáneas

Un aventurero puede ofrecer materiales aunque no exista misión activa.

Ejemplo:

> Aventurero X ofrece 4 Pieles de Lobo por Y monedas.

El jugador decide si compra.

---

## 12. Misiones y economía de aventureros

Circuito aprobado:

**Ciudad paga misiones → aventureros ganan dinero → aventureros gastan en servicios/equipo → parte del dinero vuelve a los negocios → ciudad progresa.**

La ciudad no controla directamente a los aventureros.

La ciudad:

- crea oportunidades;
- fija recompensas;
- ofrece productos/servicios;
- mantiene o descuida el entorno.

Los aventureros deciden.

---

## 13. Cola de fabricación y política por calidad

Cada taller podrá tener una **cola de producción limitada**.

Ejemplo:

> Daga de hierro ×5

Cada pieza se genera individualmente y puede tener una calidad diferente.

### Política automática por calidad

Por calidad se podrá configurar:

- **Guardar**
- **Venta automática**
- **Reciclar**

Ejemplo:

- Baja → Reciclar
- Normal → Venta automática
- Buena → Guardar
- Excelente → Guardar

### Venta automática

Regla aprobada:

**si un producto se pone en Venta automáticamente, usa SIEMPRE su valor estimado.**

El precio personalizado sólo se puede elegir mediante gestión manual.

### Reciclaje

Una pieza descartada:

- devuelve una fracción pequeña de materiales comunes;
- nunca debe devolver íntegramente el coste;
- materiales raros/especiales necesitan reglas más conservadoras.

### Capacidad inicial de cola

Balance provisional:

- cola de hasta **5 unidades pendientes** por taller en el primer tramo.

---

## 14. Herramientas e insumos de taller

Los negocios también dependen de herramientas e insumos.

### Herrería

Equipamiento base:

- martillo;
- tenazas;
- yunque/fragua básica.

Insumo importante:

- **Leña** para alimentar la fragua.

### Carpintería

Equipamiento:

- martillo;
- herramientas de corte.

Insumos/componentes:

- clavos;
- madera.

### Textilería

Equipamiento:

- **Tijeras**
- herramientas básicas de curtido/costura.

Materiales:

- pieles;
- cuero curtido;
- tendones.

### Mesón

Equipamiento:

- utensilios básicos.

Insumos:

- carne;
- leña;
- futuros alimentos.

### Regla de arranque

Los edificios fundadores llegan con **herramientas rudimentarias funcionales** para no crear bloqueos circulares.

Las herramientas mejores serán fabricables y tendrán Durabilidad.

---

## 15. Trabajadores y herramientas

Todos los trabajadores fundadores comienzan con equipo rudimentario suficiente para sus tareas iniciales.

Las primeras herramientas fabricadas son mejoras que **abren contenido**, no simples porcentajes.

### Mara

Inicial:
- Pico rudimentario.
- Obtiene Hierro + Piedra.

Primera mejora:
- **Pico de hierro**.

Desbloquea:
- **Veta dura**;
- más recursos;
- posibilidad de recurso poco común.

### Leñador

Inicial:
- Hacha rudimentaria.
- Obtiene Madera + Leña.

Primera mejora:
- **Hacha de trabajo**.

Desbloquea:
- árboles/zonas más duras;
- mayor rendimiento;
- posibilidad de **Madera dura** u otros recursos poco comunes.

### Cazador

Inicial:
- arco rudimentario;
- cuchillo rudimentario.

Obtiene:
- Carne;
- Piel;
- Tendón.

Mejoras:
- **Arco de caza**: permite enfrentar mejores presas.
- **Cuchillo de caza**: mejora el aprovechamiento de la presa.

La idea es separar:

**Arco = abatir la presa.**  
**Cuchillo = aprovechar los materiales.**

---

## 16. Durabilidad

Las herramientas y equipo utilizan una sola variable de desgaste: **Durabilidad**.

Para trabajadores:

- el desgaste se consume por salida;
- no por golpe individual;
- salida básica consume menos;
- salida avanzada consume más;
- llegar a 0 exige reparación;
- no se destruye automáticamente el objeto.

Balance provisional:

- herramienta rudimentaria: alrededor de **8 Durabilidad**;
- primera herramienta mejorada: alrededor de **14 Durabilidad**;
- salida básica: -1;
- salida avanzada: -2.

---

## 17. Uso de la Piedra

La Piedra es principalmente un recurso **estructural**.

Usos previstos:

- construcción de edificios;
- mejora de edificios;
- rehabilitación después de ataques;
- caminos;
- puentes;
- muros;
- puestos avanzados;
- infraestructura;
- edificios nuevos;
- desarrollo urbano avanzado.

No necesita tener consumo artificial constante desde el minuto 1.

Principio:

**Hierro alimenta producción; Piedra alimenta crecimiento y reconstrucción.**

---

## 18. Salidas iniciales — balance provisional

Objetivo: una salida debe sentirse productiva.

| Salida | Tiempo | Resistencia | Resultado provisional |
|---|---:|---:|---|
| Veta superficial | 90 s | 10 | 5–7 Hierro + 3–4 Piedra |
| Veta dura | 150 s | 14 | 8–11 Hierro + 5–7 Piedra + poco común posible |
| Bosque cercano | 75 s | 9 | 6–8 Madera + 3–4 Leña |
| Árboles duros | 135 s | 13 | 9–12 Madera + 5–7 Leña + Madera dura posible |
| Caza básica | 105 s | 12 | 4–6 Carne + 2–3 Pieles + 1–2 Tendones |
| Caza avanzada | 150 s | 15 | 6–9 Carne + 3–5 Pieles + 2–3 Tendones + poco común posible |

Regla de balance:

**1–3 salidas deben permitir fabricar algo significativo.**

No se busca alargar el juego repitiendo veinte veces la misma salida.

---

## 19. Amenaza / Presencia de mobs

Los mobs no existen sólo para dar XP y drops.

Cada población tiene una **Presencia** que puede crecer si no se controla.

La Presencia genera **Amenaza**.

### Escala provisional

| Presencia | Estado |
|---:|---|
| 0–39 | Controlada |
| 40–59 | Creciente |
| 60–79 | Alta |
| 80–94 | Crítica |
| 95–100 | Inminente |

### Consecuencias

A medida que aumenta:

- aumentan incidentes;
- aumentan encuentros;
- las salidas pierden seguridad;
- puede recomendarse escolta;
- después puede exigirse escolta;
- algunas actividades pueden bloquearse temporalmente;
- en extremo puede ocurrir un ataque a la ciudad.

### Ataques a la ciudad

Un ataque puede producir:

- trabajadores heridos;
- pérdida parcial de recursos;
- edificios temporalmente inutilizados;
- gastos de reparación/rehabilitación;
- pérdida de tiempo productivo.

No debe destruir brutalmente el progreso ni borrar objetos raros por azar.

### Offline

Regla aprobada:

**el jugador no debe volver después de unos días y encontrar la ciudad devastada sólo por no haber entrado.**

La Amenaza puede avanzar hasta un estado serio/inminente, pero el sistema debe dar margen razonable antes de aplicar consecuencias graves.

---

## 20. Amenaza y escoltas

La Amenaza modifica directamente las salidas.

Ejemplo conceptual:

- Controlada → trabajador puede salir solo.
- Creciente → riesgo algo mayor.
- Alta → escolta recomendable.
- Crítica → determinadas salidas exigen escolta.
- Desbordada → algunas actividades pueden bloquearse.

La escolta se publica/gestiona desde la Sede del Gremio.

Salida conjunta:

**Trabajador + aventurero(s) → zona.**

Puede producir:

- recursos del trabajador;
- XP de aventureros;
- reducción de Amenaza;
- drops para aventureros;
- recompensa de escolta pagada por la ciudad.

---

## 21. Primer bloque de enemigos

Escala aprobada:

- **Nv.1–3:** Lobos + Jabalíes.
- **Nv.3–6:** Bandidos + Goblins.

Nv.3 es transición: los enemigos antiguos no desaparecen de golpe.

---

## 22. Lobo común — aprobado EN PRUEBA

**Tipo:** Común  
**Nivel:** 1–2  
**Identidad:** Lobo salvaje que caza en manada.  
**Rol:** Ofensivo cooperativo.  
**Cantidad habitual:** 3.  
**Velocidad/Iniciativa:** Alta.  
**Vida:** Baja-media para su nivel.  
**Defensa:** Baja.  
**Daño:** Moderado individualmente, peligroso en grupo.

### Comportamiento

- ataca;
- concentra ataques;
- acecha en manada;
- prioriza objetivos debilitados o vulnerables.

### Habilidades

**Mordisco**
- daño físico;
- posibilidad de aplicar Herida.

**Salto de caza**
- daño;
- reducción temporal de Defensa.

### Pasiva — Fuerza de la manada

Balance provisional:

- +5 % daño por Lobo aliado vivo;
- máximo +15 %.

El Lobo Alfa contará como aliado para esta pasiva.

### Dificultad

- 1 aventurero vs 1 Lobo → leve.
- 1 vs 3 → elevada.
- 3 aventureros vs 3 Lobos → leve.
- 3 vs 5 → normal.

### XP

Balance provisional:

- **10 XP por Lobo**.

### Monedas

- no suelta dinero.

### Drops

- **Carne** — común.
- **Piel de Lobo** — común.
- **Colmillo de Lobo** — poco común.

Balance provisional inicial:

- Carne: ~70 % de obtener 1.
- Piel: ~55 % de obtener 1.
- Colmillo: ~15 % de obtener 1.

El Cuchillo de caza mejora el aprovechamiento.

### Usos

- Carne → Mesón.
- Piel → Textilería.
- Colmillo → futuras recetas especiales de Herrería/Textilería.

### Amenaza

Balance provisional:

- cada Lobo derrotado: -3 Presencia;
- crecimiento de población inicial: aproximadamente +3 cada 5 minutos de actividad si nadie la controla.

Afecta especialmente:

- Cazador;
- Leñador;
- caminos cercanos.

Puede provocar necesidad de escolta.

### Ataque a ciudad

La identidad del ataque de Lobos debe ser lógica:

- trabajadores heridos;
- pérdida de alimentos;
- interrupción temporal de actividades exteriores.

No deberían destruir absurdamente edificios pesados ni robar monedas.

### Relación con Raro

Los Lobos comunes pueden acompañar al **Lobo Alfa**.

Alta Presencia puede favorecer la aparición del Alfa.

### Fin de relevancia

Al avanzar suficientemente la ciudad, aproximadamente alrededor de Nv.4 como primera referencia, los Lobos comunes dejan de ser una amenaza capaz de provocar crisis seria, aunque sigan existiendo como fauna, drops y contenido para aventureros jóvenes.

---

## 23. Jabalí común — aprobado EN PRUEBA

**Tipo:** Común  
**Nivel:** 1–3  
**Rol:** Resistente / embestidor.  
**Encuentro habitual:** 1–2.  
**Vida:** Alta para el tramo.  
**Daño:** Medio-alto.  
**Defensa:** Media-alta.  
**Iniciativa:** Baja-media.

### Identidad

A diferencia del Lobo:

- poca cooperación;
- mucha resistencia;
- fuerte impacto individual.

### Habilidades

**Cornada**
- daño físico directo.

**Embestida**
- golpe fuerte;
- puede reducir temporalmente Defensa.

**Arremetida salvaje**
- al bajar de cierto porcentaje de Vida puede realizar un ataque más peligroso.

### Pasiva — Piel gruesa

- pequeña reducción de daño físico.

### Dificultad conceptual

- 1 aventurero vs 1 Jabalí → normal.
- 1 vs 2 → elevada.
- 3 aventureros vs 2 → relativamente cómodo si están preparados.

### XP

Balance provisional:

- **14 XP por Jabalí**.

### Monedas

- no suelta dinero.

### Drops

Principalmente:

- Carne;
- Piel;
- Tendón;
- Colmillo de Jabalí poco común.

El Jabalí da más Carne que el Lobo.

El Cuchillo de caza es especialmente útil para aprovechar esta presa.

### Amenaza

- cada Jabalí derrotado: aproximadamente -4 Presencia;
- afecta especialmente Caza y caminos;
- a Amenaza alta aumenta riesgo de encuentros/heridas;
- a Amenaza crítica determinadas salidas del Cazador requieren escolta.

### Ataque a ciudad

Los Jabalíes:

- embisten;
- dañan instalaciones ligeras/exteriores;
- pueden herir trabajadores;
- pueden causar pérdidas de comida.

No roban dinero ni actúan de forma estratégica.

### Fin de relevancia

Referencia inicial:

- alrededor de Ciudad Nv.4–5 dejan de ser una amenaza seria para una ciudad desarrollada, aunque permanezcan como fauna y fuente de recursos.

---

## 24. Primer Raro — Lobo Alfa — aprobado EN PRUEBA

**Tipo:** Raro  
**Nivel mínimo de aparición:** **Nv.2**.  
**Rango de referencia del primer tramo:** Nv.2–3.  
**Rol:** Líder ofensivo / potenciador de manada.

### Aparición

El Lobo Alfa **no puede aparecer en Nv.1**.

A partir de Nv.2, su posibilidad de aparición existe siempre mientras los Lobos formen parte del ecosistema local. No requiere superar un umbral fijo de Presencia.

La probabilidad base será baja y aumentará dinámicamente según factores como:

- Presencia actual de Lobos;
- nivel de Amenaza;
- tamaño/actividad de las manadas;
- tiempo transcurrido desde la última aparición;
- futuros modificadores ecológicos.

Principio:

**Nv.1 = imposible. Desde Nv.2 = posibilidad siempre existente, cuya probabilidad aumenta o disminuye según el estado del mundo.**

Así evitamos que un Raro aparezca demasiado pronto, pero también evitamos una regla rígida de “recién aparece cuando Presencia llega a X”.

### Encuentro

Referencia inicial:

- 1 Lobo Alfa;
- normalmente acompañado por 2 Lobos comunes;
- con Presencia alta puede estar acompañado por 3.

### Identidad de combate

- Vida media-alta;
- Defensa media;
- Iniciativa alta;
- daño superior al Lobo común;
- peligro principal: sinergia con la manada.

### Habilidades

**Mordisco Alfa**
- daño físico;
- mayor posibilidad de aplicar Herida.

**Aullido de caza**
- potencia temporalmente a los Lobos aliados.

**Salto del Alfa**
- daño;
- puede reducir Defensa;
- favorece la concentración de ataques sobre un mismo objetivo.

### Pasiva — Líder de la manada

Mientras el Alfa esté vivo:

- los Lobos aliados reciben una bonificación moderada;
- los Lobos comunes siguen beneficiándose de Fuerza de la manada;
- las bonificaciones tendrán un límite para evitar escalado excesivo.

### Dificultad conceptual

- 1 aventurero vs Alfa solo → elevada.
- 1 aventurero vs Alfa + 2 Lobos → muy peligrosa.
- 3 aventureros vs Alfa + 2 Lobos → normal.
- 3 aventureros vs Alfa + 3 Lobos → normal-alta.

### XP

Balance provisional:

- aproximadamente 35–40 XP.

### Drops

Conserva la familia de materiales Lobo:

- Carne;
- **Piel de Lobo Alfa**;
- **Colmillo de Lobo Alfa**.

La Carne no necesita una variante Alfa si no aporta una diferencia real.

Piel y Colmillo sí conservan el origen.

### Identidad material de la rama Lobo

Dirección provisional:

- Agilidad;
- Iniciativa;
- movilidad.

Ejemplo:

- Cuero de Lobo → pequeña mejora asociada a esa identidad.
- Cuero de Lobo Alfa → mejora superior de la misma identidad.

No se crea una receta nueva: cambia el material usado en la receta base.

### Efecto territorial

Mientras exista un Alfa activo:

- las manadas pueden estar mejor organizadas;
- aumenta ligeramente la presión de Lobos;
- puede aumentar la frecuencia o peligrosidad de encuentros.

Derrotarlo reduce de forma importante la Presencia.

Referencia provisional:

- Lobo Alfa derrotado → aproximadamente -12 Presencia;
- Lobos comunes del encuentro reducen su valor normal.

Puede existir un estado temporal tipo **Manada desorganizada** que reduzca durante un tiempo el crecimiento de Lobos.

### Misiones

Cuando aparece puede habilitarse una misión especial:

**Cazar al Lobo Alfa**

- recompensa elegida por la ciudad;
- los aventureros deciden si aceptan;
- también pueden perseguirlo por iniciativa propia.

### Ataque a ciudad

Si un Alfa está activo durante un ataque de Lobos:

- la manada actúa de forma más coordinada;
- aumenta la posibilidad de trabajadores heridos;
- puede aumentar la pérdida de alimentos o daños a instalaciones exteriores.

No roba monedas ni destruye de forma absurda estructuras pesadas.

### Primer Boss

El Boss del tramo sigue pendiente de definición.

Candidato actual:

- **Gran Jabalí** u otra variante equivalente.


---

## 25. Regla universal: material de origen modifica la receta

Decisión aprobada muy importante.

No se crearán recetas duplicadas para cada variante de criatura.

Regla:

**Receta base + material elegido + calidad de fabricación = objeto final.**

Ejemplo:

**Chaleco de cuero** sigue siendo una sola receta.

Según el material:

- Cuero de Lobo → estadísticas de rama Lobo.
- Cuero de Lobo Alfa → mejora superior de esa identidad.
- Cuero de Jabalí → estadísticas más resistentes.
- Cuero de Gran Jabalí → mejora importante y posible propiedad adicional.

### Jerarquía conceptual

- material de enemigo común → modificación base de especie;
- material de Raro → mejora la característica de esa especie;
- material de Boss → mejora fuerte y puede agregar propiedad especial.

### Persistencia del origen

Al procesar:

**Piel de Lobo Alfa → Cuero curtido de Lobo Alfa**

No debe perderse la identidad del material.

Esta lógica podrá extenderse a:

- pieles;
- colmillos;
- huesos;
- minerales;
- maderas;
- cristales;
- tendones;
- metales especiales.

---

## 26. Textilería — aparece en Ciudad Nv.2

La Textilería es el primer negocio nuevo que se construye durante la partida.

Su función inicial es dar uso real a las pieles.

### Materias primas

- Pieles
- Tendones
- Cuero curtido

Las telas se incorporarán más adelante cuando exista una fuente lógica:

- lana;
- lino;
- algodón;
- fibras especiales;
- etc.

### Recetas/servicios iniciales

- **Cuero curtido**
- **Protección ligera / Chaleco de cuero**
- **Guantes de cuero**
- **Botas de cuero**
- **Correas de cuero**
- **Reparación básica de equipo de cuero**

Las recetas concretas podrán usar combinaciones de:

- piel;
- cuero curtido;
- tendones.

### Herramienta

- **Tijeras básicas**, fabricables por Borin.

### Construcción — balance provisional

Referencia inicial:

- 10 Madera
- 8 Piedra
- 1 lote de clavos
- 40 monedas
- Tijeras básicas
- ~60 s de obra

Ajustable por playtest.

### Trabajador

Debe existir un trabajador especializado para Textilería, pero **todavía no está definido cómo llega o se contrata**.

---

## 27. Producción inicial — balance provisional

### Herrería

- Lote de 8 clavos: 1 Hierro + 1 Leña — ~10 s
- Lote de 6 puntas: 2 Hierro + 1 Leña — ~12 s
- Cabeza de pico/hacha: 4 Hierro + 1 Leña — ~18 s
- Pico/Hacha final: cabeza + mango — ~10 s
- Daga: 3 Hierro + 1 Leña — ~20 s
- Cuchillo de caza: 2 Hierro + 1 Leña — ~16 s
- Afilado: ~8 s

### Carpintería

- Mango: 2 Madera — ~10 s
- Arco de caza: 4 Madera + 2 Tendones — ~25 s
- Haz de 12 flechas: 2 lotes de puntas + 2 Madera — ~18 s
- Bastón: 3 Madera — ~18 s
- Escudo de madera: 4 Madera + 1 lote de clavos — ~22 s
- Ajuste de arco: ~8 s

### Mesón

Referencia:

- Plato sencillo: producción corta ~10–15 s.
- Ración de viaje: producción corta ~10–15 s.

Los efectos exactos quedan pendientes.

---

## 28. Fundación — balance económico provisional

Referencia inicial para probar:

- **240 monedas**
- 8 Hierro
- 6 Piedra
- 10 Madera
- 6 Leña
- 4 Carne
- 1 Piel
- 1 Tendón

Trabajadores:

- 100 Resistencia cada uno.

Aventureros fundadores:

- aproximadamente 55–75 monedas cada uno;
- equipo básico funcional.

Objetivo:

- pueden pagar servicios básicos;
- no pueden comprar todo inmediatamente;
- necesitan actividad económica para progresar.

---

## 29. Misiones comunes — referencias económicas provisionales

Valores recomendados aproximados:

- Eliminar 3 Lobos → ~18 monedas
- Eliminar 5 Lobos → ~28 monedas
- Eliminar 3 Jabalíes → ~24 monedas
- Entregar 5 Pieles → ~32 monedas
- Escolta básica → ~14–20 monedas según riesgo

**El jugador sigue eligiendo el valor final.**

---

## 30. Ritmo objetivo del primer tramo

Objetivo:

**Ciudad Nv.1–3 ≈ 1 hora de juego activo.**

Referencia:

- **Nv.1 → 2:** ~15 min
- **Nv.2 → 3:** ~20 min adicionales
- **Nv.3 / cierre del bloque:** ~25 min adicionales

Total central:

- ~60 min.

Rango aceptable:

- jugador rápido: ~45–50 min;
- jugador que lee/gestiona con calma: ~75–90 min.

No se quiere conseguir duración mediante esperas artificiales.

Durante esa hora deberían ocurrir varias cosas en paralelo:

- salidas;
- producción;
- compras/ventas;
- comentarios;
- misiones;
- amenaza;
- herramientas mejores;
- construcción de Textilería;
- aparición del primer Raro;
- preparación/aparición del primer Boss.

---

## 31. Aventureros — principio de necesidades

Cambio conceptual importante respecto del prototipo actual:

Los aventureros **no deben visitar un negocio al azar buscando algo que la ciudad todavía no puede ofrecer**.

Flujo deseado:

**necesidad real → identifica servicio/negocio útil → visita → compra/servicio/no resolución → recuerda resultado → continúa su vida.**

Ejemplos:

- arma dañada → Herrería;
- cansancio → Mesón;
- necesita equipo → negocio correspondiente;
- necesita dinero → evalúa misión;
- tiene botín → puede ofrecerlo.

Los aventureros deben recordar:

- qué buscaron;
- qué compraron;
- qué no pudieron comprar;
- precio percibido;
- calidad;
- servicios recibidos;
- misiones;
- heridas;
- historia.

---

## 32. Personalidad, ánimo y memoria

Diseño aprobado como dirección:

### Personalidad
Persistente.

Ejemplos actuales:

- Prudente
- Ambicioso
- Ahorrador
- Audaz
- Leal

### Ánimo
Temporal.

Puede cambiar por:

- victorias;
- derrotas;
- heridas;
- compras;
- falta de dinero;
- no conseguir equipo;
- recuperación;
- progreso;
- malas experiencias.

El ánimo debe influir ligeramente en decisiones, no volver irracional al NPC.

### Memoria de negocio

Puede registrar:

- última visita;
- resultado;
- última compra;
- necesidad no resuelta;
- satisfacción;
- opinión de precio/calidad.

El Mesón usa esa información para generar comentarios contextuales.

---

## 33. Combate — orientación mínima actual

Todavía no está cerrado el motor final.

Dirección aceptada:

- combate no visual;
- micro-simulación por rondas/fases;
- Iniciativa;
- Vida;
- daño;
- Defensa;
- habilidades;
- estados;
- comportamiento por IA.

Para Herida, como primera referencia de este nuevo sistema:

- daño periódico al final de rondas durante una duración limitada.

Debe diseñarse junto con las estadísticas definitivas de los aventureros.

---

## 34. Lo que queda pendiente antes de programar el bloque completo

### Enemigos
- Lobo Alfa.
- Primer Boss.
- Después Bandidos/Goblins.

### Aventureros
- estadísticas iniciales definitivas;
- Maná;
- habilidades;
- equipo fundador;
- IA mínima de combate;
- formación de grupos.

### Objetos y servicios
- efectos concretos de Daga, Arco, Bastón, Escudo, equipo de cuero;
- Plato;
- Ración;
- Descanso;
- Alojamiento;
- valores definitivos de Durabilidad.

### Textilería
- identidad y llegada del trabajador.
- costes finos de recetas.

### Amenaza
- resolución exacta de un ataque a ciudad;
- costes de recuperación;
- defensa de la ciudad.

### Progresión
- requisitos exactos Ciudad Nv.1→2→3;
- requisitos de nivel de cada negocio/trabajador.

### Balance
- validar toda cifra provisional con playtest real;
- ajustar ritmos según Android.

---

## 35. Regla de implementación

Mientras este documento esté marcado como **DISEÑO APROBADO EN PRUEBA**:

- conservar estas decisiones como base;
- no reinterpretarlas como definitivas si una prueba real demuestra que no funcionan;
- distinguir siempre entre diseño, implementación automática y validación real en Android;
- evitar programar nuevas capas grandes hasta que el bloque correspondiente haya sido debatido y autorizado.

El objetivo inmediato sigue siendo:

**construir una primera hora de juego Nv.1–3 que ya sea divertida, conectada y capaz de generar pequeñas historias emergentes.**
