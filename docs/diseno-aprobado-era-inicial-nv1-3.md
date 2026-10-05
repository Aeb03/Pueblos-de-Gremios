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

### Aventureros iniciales y crecimiento de población

La ciudad comienza con **3 aventureros fundadores persistentes**:

- Guerrero
- Explorador
- Sanador

Todos llegan con equipo básico funcional para no quedar bloqueados esperando producción de la ciudad.

Estos 3 no representan la población máxima de aventureros de una ciudad. La cantidad de aventureros **crece junto con la ciudad**.

#### Regla de llegada

El disparador principal será el **Nivel de Ciudad**, no el nivel aislado de un único negocio.

Cada nivel importante de Ciudad puede habilitar uno o más **cupos de llegada**. Al activarse un cupo aparece un nuevo aventurero persistente.

Durante el comienzo de la temporada, antes de que existan viajes entre ciudades:

- los nuevos aventureros se generan como **originarios de esa misma ciudad**;
- conservan esa ciudad como lugar de origen para siempre;
- no se presentan como inmigrantes de ciudades que todavía no participan del sistema.

Cuando el mundo abra viajes y circulación entre asentamientos, una llegada podrá ser:

- nuevo aventurero originario local;
- aventurero procedente de otra ciudad;
- aventurero que cambia temporal o permanentemente de residencia.

#### Primer tramo — balance inicial

Para la primera hora se usará como referencia:

- **Ciudad Nv.1:** 3 aventureros fundadores.
- **Ciudad Nv.2:** llega 1 aventurero nuevo → total objetivo **4**.
- **Ciudad Nv.3:** llega 1 aventurero nuevo → total objetivo **5**.

Como el prototipo introduce una cuarta clase, el primer cupo de Nv.2 puede garantizar inicialmente la llegada de un **Mago**, permitiendo probar las cuatro identidades básicas sin alterar el trío fundador.

El quinto aventurero de Nv.3 puede elegirse entre las clases disponibles mediante generación controlada, evitando composiciones absurdamente repetidas.

#### Papel del Mesón

El **Nivel de Ciudad desbloquea las llegadas**.

El **Mesón regula capacidad y atractivo**, no el evento de progreso en sí.

El Mesón puede definir:

- cuántos aventureros pueden residir cómodamente en la ciudad;
- calidad de alojamiento;
- velocidad/probabilidad de futuras llegadas;
- atractivo para visitantes y migrantes.

Para no crear un bloqueo temprano, **Mesón Nv.1 tendrá capacidad suficiente para alojar al menos 5 aventureros**, cubriendo todo el tramo Ciudad Nv.1–3.

En niveles posteriores, mejorar el Mesón será necesario para sostener una población aventurera mayor.

#### Antiabuso

Los cupos de llegada por progreso son **hitos de una sola vez**.

- bajar/subir nuevamente un edificio no vuelve a generar aventureros;
- reconstruir el Mesón no repite llegadas ya consumidas;
- refundar una ciudad dentro de la misma temporada no debe permitir crear indefinidamente nuevos aventureros persistentes mediante los mismos hitos fundacionales.

El sistema debe registrar qué cupos de población de la temporada ya fueron consumidos por la cuenta/linaje de ciudad correspondiente.

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

Balance inicial cerrado para playtest:

- Carne: **90 %**, 1–2 unidades.
- Piel de Jabalí: **65 %**, 1 unidad.
- Tendón: **40 %**, 1 unidad.
- Colmillo de Jabalí: **12 %**, 1 unidad.

El Cuchillo de caza es especialmente útil para aprovechar esta presa.

### Comportamiento de combate cerrado

- **Piel gruesa:** -10 % al daño físico recibido.
- **Embestida:** ataque de ~125 % del daño básico; puede reducir Defensa durante 1 ronda.
- **Arremetida salvaje:** se habilita por debajo de 35 % de Vida y puede ejecutar un ataque de ~140 % del daño básico; enfriamiento interno para que no se repita cada ronda.
- Prioridad de IA: objetivo cercano / vulnerable; no coordina foco como los Lobos.

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

Primera tabla de prueba por chequeo ecológico (aprox. cada 5 min de actividad):

- Controlada → **2 %**.
- Creciente → **4 %**.
- Alta → **7 %**.
- Crítica → **10 %**.
- Inminente → **14 %**.

Cada chequeo fallido puede sumar una pequeña bonificación acumulativa de aparición, con tope, para evitar rachas excesivamente largas sin Raro. Tras aparecer un Alfa, esa acumulación se reinicia.

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

- todos los Lobos aliados reciben **+10 % daño**;
- los Lobos comunes siguen beneficiándose de Fuerza de la manada;
- las bonificaciones combinadas quedan limitadas para evitar escalado excesivo.

**Aullido de caza** se usa como máximo una vez cada 3 rondas y otorga durante 2 rondas una mejora temporal de Iniciativa a la manada.

**Mordisco Alfa** tiene una probabilidad inicial de **25 %** de aplicar Herida.

**Salto del Alfa** prioriza un objetivo ya atacado por otro Lobo y reduce su Defensa durante 1 ronda.

### Dificultad conceptual

- 1 aventurero vs Alfa solo → elevada.
- 1 aventurero vs Alfa + 2 Lobos → muy peligrosa.
- 3 aventureros vs Alfa + 2 Lobos → normal.
- 3 aventureros vs Alfa + 3 Lobos → normal-alta.

### XP

Balance inicial cerrado para playtest:

- **38 XP**.

### Drops

Conserva la familia de materiales Lobo:

- Carne;
- **Piel de Lobo Alfa**;
- **Colmillo de Lobo Alfa**.

La Carne no necesita una variante Alfa si no aporta una diferencia real.

Piel y Colmillo sí conservan el origen.

Balance inicial de drops:

- Carne: **100 %**, 1–2 unidades.
- **Piel de Lobo Alfa: 100 %**, 1 unidad.
- **Colmillo de Lobo Alfa: 30 %**, 1 unidad.

La Piel Alfa garantizada asegura que encontrar y derrotar al primer Raro siempre produzca al menos un material especial útil.

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

Balance inicial cerrado:

- Lobo Alfa derrotado → **-12 Presencia**;
- Lobos comunes del encuentro reducen su valor normal.

Después de derrotarlo se aplica **Manada desorganizada** durante 10 minutos de actividad:

- el crecimiento de Presencia de Lobos se reduce aproximadamente a la mitad;
- no impide que aparezcan Lobos comunes.

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

### Primer Boss — Gran Jabalí — aprobado EN PRUEBA

**Tipo:** Boss  
**Nivel mínimo de aparición:** **Nv.3**.  
**Rango de referencia del primer tramo:** Nv.3.  
**Rol:** Resistente / embestidor / amenaza territorial mayor.

#### Aparición

El Gran Jabalí **no puede aparecer en Nv.1 ni Nv.2**.

Desde Nv.3, su posibilidad de aparición existe siempre mientras la rama Jabalí siga formando parte del ecosistema local. No requiere alcanzar un umbral fijo de Presencia.

La probabilidad base será baja y aumentará dinámicamente según factores como:

- Presencia actual de Jabalíes;
- nivel de Amenaza;
- actividad y tamaño de la población de Jabalíes;
- tiempo transcurrido desde la última aparición de Boss;
- tiempo transcurrido desde que la ciudad alcanzó Nv.3;
- futuros modificadores ecológicos o de temporada.

Primera tabla de prueba por chequeo ecológico (aprox. cada 5 min de actividad):

- Controlada → **0,5 %**.
- Creciente → **1 %**.
- Alta → **2 %**.
- Crítica → **4 %**.
- Inminente → **7 %**.

Cada chequeo fallido puede sumar una pequeña bonificación acumulativa, con tope. Tras aparecer un Boss, esa acumulación se reinicia. La chance del Boss siempre permanece sensiblemente por debajo de la de un Raro.

Principio:

**Nv.1–2 = imposible. Desde Nv.3 = posibilidad siempre existente, cuya probabilidad aumenta o disminuye según el estado del mundo.**

La intención es que el Boss pueda surgir naturalmente sin una condición rígida de “llegar a X Presencia”, pero que el sistema de probabilidad acumulativa haga cada vez más probable su aparición si el ecosistema favorece su crecimiento.

#### Encuentro

Referencia inicial:

- 1 Gran Jabalí;
- normalmente combate solo;
- pensado para un grupo inicial preparado.

#### Identidad de combate

El Gran Jabalí es la culminación de la identidad de su especie:

- Vida muy alta para el tramo;
- Defensa alta;
- Iniciativa baja-media;
- daño alto por impacto;
- poco control táctico, pero enorme capacidad de castigo individual y grupal.

#### Habilidades

**Cornada brutal**
- ataque físico fuerte;
- puede provocar Herida.

**Embestida arrolladora**
- ataque de gran impacto;
- puede afectar al objetivo principal y generar una consecuencia secundaria sobre el grupo;
- puede reducir temporalmente Defensa.

**Pisotón**
- daño moderado a varios integrantes del grupo;
- representa el peligro de permanecer demasiado tiempo frente al Boss.

#### Pasiva — Piel monumental

- reducción moderada de daño físico;
- hace que el grupo necesite sostener el combate y no dependa de una sola ráfaga de daño.

#### Fase final — Furia acorralada

Al bajar de **30 % de Vida**:

- +20 % daño;
- mejora su prioridad de uso de Embestida/Cornada;
- no recupera Vida gratuitamente.

La intención es que el final del combate sea más peligroso y memorable.

#### Valores relativos de habilidades

Se cierran como referencia independiente de las estadísticas absolutas de los aventureros:

- **Piel monumental:** -15 % daño físico recibido.
- **Cornada brutal:** ~130 % del daño básico y 25 % de aplicar Herida.
- **Embestida arrolladora:** ~150 % al objetivo principal y ~50 % de daño secundario al resto del grupo.
- **Pisotón:** ~60 % del daño básico a todos los integrantes; no se usa más de una vez cada 3 rondas.

#### Dificultad conceptual

- 1 aventurero → extremadamente peligrosa / no recomendable.
- 2 aventureros → muy alta.
- 3 aventureros iniciales bien preparados → desafío normal-alto.
- grupo mejor equipado o con buena sinergia → normal.

Debe poder derrotarse con contenido disponible **antes** de cualquier recompensa o material que dependa del propio Boss.

#### XP

Balance inicial cerrado para playtest:

- **90 XP totales** de encuentro, distribuidos por participación según el sistema final.

#### Monedas

- no suelta dinero.

#### Drops

Conserva la familia de materiales Jabalí:

- Carne;
- **Piel de Gran Jabalí**;
- **Tendón de Gran Jabalí** si se considera útil;
- **Colmillo de Gran Jabalí**.

Piel y Colmillo conservan siempre su origen Boss.

Balance inicial de drops:

- Carne: **100 %**, 3–5 unidades.
- **Piel de Gran Jabalí: 100 %**, 1 unidad.
- Tendón de Gran Jabalí: **50 %**, 1 unidad.
- **Colmillo de Gran Jabalí: 40 %**, 1 unidad.

La Piel de Gran Jabalí es el material Boss garantizado del encuentro. El Colmillo funciona como segundo premio especial menos frecuente.

#### Identidad material de la rama Jabalí

Dirección provisional:

- Defensa;
- Resistencia;
- robustez.

Ejemplo:

- Cuero de Jabalí → mejora defensiva base.
- Cuero de Gran Jabalí → mejora defensiva superior y puede añadir una propiedad especial.

La propiedad especial se definirá al diseñar la receta concreta; no se crea una receta nueva sólo por usar material Boss.

#### Efecto territorial

Mientras exista un Gran Jabalí activo:

- aumenta la peligrosidad de Caza y caminos silvestres;
- puede aumentar el riesgo de incidentes durante salidas;
- ciertas salidas pueden pasar a recomendar o exigir escolta antes de lo habitual;
- la población de Jabalíes puede ejercer mayor presión territorial.

Derrotarlo produce una reducción fuerte de Presencia/Amenaza de la rama Jabalí.

Balance inicial cerrado:

- Gran Jabalí derrotado → **-25 Presencia** de la rama Jabalí.
- durante 10 minutos de actividad posteriores, el crecimiento de Jabalíes se reduce aproximadamente a la mitad (**Territorio calmado**).

#### Misiones

Cuando aparece, la Sede del Gremio puede mostrar una misión/objetivo especial de Boss:

**Abatir al Gran Jabalí**

- recompensa elegida por la ciudad;
- requiere grupo adecuado;
- los aventureros evalúan el riesgo y la recompensa;
- la victoria y los drops son eventos separados.

#### Ataque a ciudad

Si el Gran Jabalí sigue activo cuando la rama Jabalí alcanza nivel de ataque:

- aumenta el daño a instalaciones exteriores;
- aumenta el riesgo de trabajadores heridos;
- puede provocar mayor pérdida de alimentos o recursos expuestos;
- sigue sin comportarse como un enemigo inteligente que roba dinero.

#### Regla de aparición de Raros y Bosses del ecosistema

Para enemigos ligados a una especie común:

- **Raro:** tiene un nivel mínimo; desde ese nivel la posibilidad existe siempre y aumenta con factores del ecosistema.
- **Boss:** usa el mismo motor, con un nivel mínimo superior y una probabilidad base menor.

En este primer tramo:

- Lobo Alfa → mínimo Nv.2.
- Gran Jabalí → mínimo Nv.3.

### Estado del bloque de enemigos Nv.1–3

Con estas decisiones quedan **CERRADOS EN PRUEBA**:

- Lobo común.
- Jabalí común.
- Lobo Alfa.
- Gran Jabalí.

Los valores absolutos de Vida, Daño y Defensa se fijarán al cerrar las estadísticas de los aventureros iniciales, manteniendo las relaciones de dificultad definidas en estas fichas. El resto de comportamiento, drops, aparición, amenaza y roles queda asentado como base de implementación.



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

## 30. Límites de precios y recompensas — antiabuso

Objetivo: impedir que un jugador funda una ciudad, transfiera de forma artificial recursos/equipo barato a aventureros persistentes, abandone o borre la ciudad y repita el proceso para mejorar su inicio.

### 30.1. Precios editables

Cuando el jugador modifica manualmente un precio de venta o una recompensa en monedas:

- el juego calcula un **Valor de referencia**;
- el jugador puede editar únicamente dentro de un rango de **-30 % / +30 %**;
- no puede poner precio 0 ni regalar directamente un objeto.

Ejemplo:

- Valor estimado de una Daga: 100 monedas.
- Precio manual permitido: **70–130**.

La Venta automática continúa usando exactamente el **Valor estimado**, sin modificación manual.

### 30.2. Recompensas con objetos — Presupuesto de recompensa

Los objetos añadidos a una misión no funcionan como regalos libres.

Cada misión tiene un **Valor recomendado total de recompensa** calculado por:

- dificultad;
- riesgo;
- duración;
- objetivo;
- nivel;
- tamaño esperado del grupo.

El jugador puede distribuir ese valor entre:

- monedas;
- objetos;
- combinación de ambos.

El **valor total efectivo del paquete** debe permanecer dentro de aproximadamente **70–130 %** del valor recomendado.

Ejemplo:

> Misión recomendada: 100 monedas por aventurero.

Opciones válidas:

- 100 monedas.
- 70 monedas + objeto valorado en 30.
- objeto valorado en 100.
- 30 monedas + objeto valorado en 70.

No sería válido entregar gratuitamente una espada de 300 monedas en una misión cuyo presupuesto máximo es 130.

### 30.3. Valor de los objetos en recompensas

Para calcular el presupuesto se utiliza:

- valor estimado real del objeto;
- calidad;
- materiales especiales;
- propiedades de Raro/Boss;
- estado/durabilidad;
- nivel del objeto.

Por tanto, una pieza Excelente o fabricada con material Boss consume más presupuesto que una pieza Normal.

### 30.4. Límites adicionales

La Sede del Gremio podrá limitar por nivel:

- cantidad de objetos añadidos a una recompensa;
- rareza/calidad máxima admitida;
- nivel de equipo apropiado para la misión.

Esto evita usar una misión de Nv.1 como vehículo para transferir equipo de final de juego.

### 30.5. Protección de fundación

El límite de precios/recompensas ayuda, pero por sí solo no evita reciclar infinitamente el Pack fundador.

En una temporada competitiva debe existir además una regla de cuenta/servidor:

- **un Pack fundador completo por jugador por temporada**;
- abandonar/reiniciar una ciudad no vuelve a generar indefinidamente recursos fundacionales transferibles;
- cualquier mecanismo legítimo de refundación deberá reutilizar o descontar el valor ya otorgado.

La herramienta actual **Reiniciar Reino de prueba** es sólo de desarrollo y no representa esta regla del juego final.

Principio general:

**el jugador puede negociar y administrar precios, pero no puede usar ciudades descartables como mecanismo de transferencia gratuita hacia aventureros persistentes.**

---

## 31. Ritmo objetivo del primer tramo

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

## 32. Aventureros — principio de necesidades

### Estadísticas base — aprobado EN PRUEBA

Se mantiene un conjunto compacto de estadísticas principales:

- **Vida**
- **Ataque**
- **Defensa**
- **Iniciativa**
- **Maná**

**Agilidad no será una estadística independiente** por ahora. Cuando un material/equipo represente rapidez, reflejos o movilidad, esa identidad se traduce inicialmente a Iniciativa o a una propiedad concreta.

Principio: **no se crea una estadística nueva hasta que exista una mecánica propia que la justifique.**

### Clases fundadoras — identidad aprobada EN PRUEBA

Las tres clases fundadoras se diferencian por función, consumo de recursos y forma de aportar al cálculo probabilístico de combate. Una cuarta clase, **Mago**, se incorpora como primera llegada garantizada al alcanzar Ciudad Nv.2 para ampliar el espectro de daño mágico y elemental.

#### Guerrero — Protector

Perfil:

- **Vida: alta**.
- **Ataque: moderado**, principalmente físico cuerpo a cuerpo.
- **Defensa: moderada**.
- **Iniciativa: media-baja**.
- **Maná: bajo**.

Rol principal:

- proteger al grupo;
- absorber parte del riesgo;
- reducir la probabilidad de que aliados más frágiles terminen heridos o incapacitados;
- sostener enfrentamientos largos.

Sus habilidades deben girar principalmente alrededor de:

- protección;
- interposición;
- reducción de daño/riesgo;
- control de la atención del enemigo;
- resistencia temporal.

El Guerrero no debe tener Defensa base tan alta que vuelva irrelevantes escudos, armaduras, guantes u otras mejoras defensivas. Su gran reserva de Vida le da margen, pero sigue necesitando equipamiento, reparaciones, descanso y servicios de ciudad.

#### Explorador — Daño físico / Evasión

Perfil:

- **Vida: moderada**.
- **Ataque: alto**, físico.
- **Defensa: baja**.
- **Iniciativa: alta**.
- **Maná: moderado**.

Puede combatir de dos formas desde la misma clase:

- **cuerpo a cuerpo con dagas**;
- **a distancia con arco**.

Rol principal:

- infligir daño físico elevado;
- terminar encuentros con rapidez;
- evitar parte del daño mediante Evasión;
- adaptarse a distancia o cuerpo a cuerpo según equipo y situación.

**Evasión no se incorpora como sexta estadística principal.** Se trata como una **propiedad derivada de combate** expresada como probabilidad/modificador y alimentada por clase, habilidades, equipo y futuras especializaciones.

Esto permite que un Explorador sea frágil si recibe el golpe, pero sobreviva gracias a su capacidad de evitar parte del riesgo. Si su Evasión falla, su baja Defensa sigue siendo relevante.

Más adelante pueden aparecer **especializaciones de clase**, por ejemplo orientadas a arco, dagas, exploración, caza u otros estilos, sin necesidad de dividir la clase fundadora desde el inicio.

#### Sanador — Soporte sagrado

Perfil:

- **Vida: baja**.
- **Ataque: moderado**, de naturaleza mágica.
- **Defensa: moderada**.
- **Iniciativa: media**.
- **Maná: alto** respecto de las otras clases fundadoras.

Rol principal:

- curar Vida;
- curar o aliviar Estados;
- reducir riesgo de incapacitación;
- sostener al grupo;
- aportar daño mágico cuando no necesita curar.

Sus habilidades ofensivas pertenecen principalmente a **Magia Sagrada**.

La Magia Sagrada tiene **efectividad superior contra enemigos de Tipo No Muerto**. El modificador exacto se fijará junto con los números definitivos de combate.

El Sanador es un rol de soporte puro en prioridad de comportamiento: si el grupo necesita curación o limpieza de estados, eso debe pesar más en su resolución que buscar daño adicional.

#### Mago — Daño arcano / elemental

El Mago es la cuarta clase básica de prueba y aparece por primera vez como llegada garantizada al alcanzar **Ciudad Nv.2**.

Perfil:

- **Vida: baja**.
- **Ataque: alto**, de naturaleza mágica.
- **Defensa: baja**.
- **Iniciativa: media-alta**.
- **Maná: alto**.

Rol principal:

- aportar daño mágico elevado;
- cubrir daño **Arcano** y **Elemental**;
- aplicar Estados ofensivos;
- castigar enemigos cuya defensa física sea fuerte;
- aportar control puntual mediante efectos elementales.

La magia **Arcana** será la rama mágica neutral y fiable.

La magia **Elemental** añade propiedades secundarias. En la primera versión:

- Fuego → puede aplicar **Quemadura**.
- Rayo → puede aplicar **Parálisis**.

Otros elementos y resistencias se incorporarán sólo cuando exista contenido que los justifique.

El Mago no debe reemplazar al Sanador: ambos usan Maná, pero el Mago lo convierte principalmente en daño/control y el Sanador en supervivencia/soporte.

#### Habilidades básicas de clase — primera batería EN PRUEBA

Estas habilidades sirven como datos para el motor probabilístico. No implican animar o ejecutar cada acción de manera persistente.

**Guerrero**
- **Guardia:** reduce daño/riesgo esperado del grupo.
- **Interponerse:** prioriza proteger al aliado con mayor riesgo de incapacitación.
- **Golpe de escudo:** daño físico moderado y pequeña posibilidad de Aturdimiento si lleva escudo compatible.

**Explorador**
- **Ataque certero:** aumenta daño esperado con arco o dagas.
- **Paso evasivo:** aumenta temporalmente su Evasión derivada.
- **Marcar presa:** aumenta la eficacia del Explorador contra un objetivo durante el encuentro.

**Sanador**
- **Curación:** recupera Vida esperada de un aliado.
- **Purificar:** reduce o elimina Estados negativos compatibles.
- **Luz sagrada:** daño mágico moderado; obtiene bonificación contra Tipo No Muerto.

**Mago**
- **Proyectil arcano:** daño mágico estable sin Estado adicional.
- **Chispa ígnea:** daño mágico y posibilidad de Quemadura.
- **Descarga:** daño mágico y posibilidad de Parálisis.

Los costes exactos de Maná y probabilidades se fijan en la hoja de balance técnico y se ajustan por simulación.

#### Estados iniciales — aprobados EN PRUEBA

Los Estados son modificadores del cálculo probabilístico del encuentro. No requieren una ejecución turno por turno persistente.

**Distribución natural por clase:**

- **Guerrero:** Herida + Aturdido.
- **Explorador:** Herida + Veneno + Parálisis.
- **Sanador:** no necesita Estado ofensivo base; su especialidad es curar/limpiar Estados.
- **Mago:** Quemadura + Parálisis.

Esto evita convertir al Mago en “la clase de todos los Estados”. Cada Estado refuerza una identidad distinta.

La distribución no es una restricción absoluta para todo el juego: futuras especializaciones, materiales o equipamiento pueden permitir combinaciones nuevas.


**Herida**
- aumenta el daño/desgaste esperado;
- eleva la probabilidad de terminar el encuentro con una lesión persistente;
- puede requerir curación o recuperación posterior.

**Quemadura**
- añade daño esperado durante el encuentro;
- representa daño elemental de Fuego;
- puede ser mitigada/limpiada por habilidades o servicios futuros.

**Veneno**
- añade daño esperado progresivo;
- reduce parcialmente la eficacia de curaciones mientras está activo;
- abre futuro contenido de antídotos/herboristería.

**Parálisis**
- reduce temporalmente Iniciativa y contribución ofensiva;
- aumenta el riesgo de no poder responder adecuadamente durante una parte del enfrentamiento.

**Aturdido**
- efecto corto y fuerte;
- reduce de manera importante la contribución de una unidad durante una ventana breve;
- no debe encadenarse indefinidamente.

Los Estados tendrán resistencia/probabilidad de aplicación según objetivo, Tipo, equipo y futuras resistencias. Su severidad y duración se expresarán internamente como modificadores, no como una obligación de almacenar cada ronda.

#### Daño y afinidades

Tipos de daño iniciales:

- **Físico**
- **Mágico sagrado**
- **Mágico arcano**
- **Elemental de Fuego**
- **Elemental de Rayo**

No todos los enemigos necesitan una tabla compleja de resistencias desde el inicio.

Primera excepción relevante:

- Tipo **No Muerto** recibe una bonificación de daño de Magia Sagrada.

Las demás afinidades/resistencias se incorporarán cuando aparezcan enemigos cuyo diseño las necesite.

### Futuro: escuelas de especialización y cooperación de Reino

Las **habilidades básicas de clase** pueden aprenderse y desarrollarse mediante la **Sede del Gremio**.

La **especialización avanzada** requiere una infraestructura distinta: una **Escuela de Especialización** correspondiente a la rama elegida.

Ejemplos futuros:

- Escuela de Druidas;
- Academia Arcana;
- Escuela de Arquería avanzada;
- Orden de Guardianes;
- otras ramas que se definan al ampliar las clases.

#### Principio de especialización de ciudades

Las Escuelas están pensadas para ser inversiones grandes de ciudad.

Dirección de diseño:

- construir **1 Escuela** debe ser alcanzable para una ciudad que decida especializarse;
- mantener/desarrollar **2 Escuelas** debe exigir una inversión importante;
- **3 Escuelas** debe ser muy difícil;
- sostener **4 o más** debe ser poco probable y requerir una ciudad excepcionalmente desarrollada.

Los costes exactos, mantenimiento, requisitos de nivel y capacidad se definirán más adelante.

El objetivo no es prohibir explícitamente tener muchas Escuelas, sino conseguir mediante economía y progresión que las ciudades tiendan naturalmente a **especializarse en ramas distintas**.

#### Aventureros viajeros

Un aventurero puede aprender sus habilidades básicas en su ciudad, pero si desea una especialización que su ciudad no ofrece deberá:

1. identificar una Escuela compatible dentro del Reino;
2. viajar hasta la ciudad que la posee;
3. cumplir los requisitos de la especialización;
4. pagar/consumir los recursos o tiempo correspondientes;
5. completar su especialización;
6. continuar allí o regresar a otra ciudad según su comportamiento.

Esto convierte a las Escuelas en servicios de Reino y crea flujo real de aventureros entre ciudades.

Una ciudad especializada puede recibir:

- visitantes;
- consumo en Mesón;
- reparaciones;
- compras de equipamiento;
- pagos por formación;
- prestigio;
- demanda adicional de materiales y servicios.

Por tanto, una Escuela no beneficia únicamente a los aventureros originarios de la ciudad que la construyó.

#### Estado de necesidades del Reino

El Reino tendrá un sistema de **Necesidades / Cobertura de Especializaciones** calculado a partir del estado real de sus ciudades y aventureros.

Ejemplo:

> **Escuela de Druidas — cobertura nula**  
> No existe ninguna Escuela de Druidas activa en el Reino.

O:

> **Escuela de Druidas — cobertura escasa**  
> Existe una Escuela, pero su capacidad o ubicación no cubre la demanda actual.

Una ciudad recién fundada podrá consultar este estado antes de decidir hacia dónde orientar su desarrollo.

La interfaz puede resaltar oportunidades como:

- Escuela inexistente;
- cobertura escasa;
- demanda alta;
- capacidad suficiente;
- oferta saturada.

#### Principio cooperativo

La necesidad no será un mensaje artificial prefijado.

Se calcula usando datos reales como:

- cantidad de Escuelas activas;
- capacidad disponible;
- ubicación/distancia;
- cantidad de aventureros que podrían especializarse;
- cantidad de aventureros esperando esa especialización;
- nivel/calidad de las Escuelas.

Así una ciudad nueva puede detectar una carencia real del Reino y decidir:

> “No existe una Escuela de Druidas. Voy a orientar mi ciudad para cubrir esa necesidad.”

Esto crea una capa cooperativa donde las ciudades compiten por crecer, pero al mismo tiempo **dependen de una red de especializaciones que ninguna ciudad debería cubrir fácilmente por sí sola**.

#### Relación con la temporada

Las Escuelas forman parte del progreso material de la Era y se reinician con la temporada.

Los registros históricos sí pueden conservar:

- primera Escuela de una rama;
- mejor Escuela;
- ciudad referente de una especialización;
- aventureros destacados formados allí.

### Tipo de enemigo — nueva propiedad de combate

Además de **Rareza** y **Nivel**, cada enemigo tiene una propiedad separada llamada **Tipo**.

El Tipo representa su naturaleza y permite que habilidades, equipo, materiales y futuras especializaciones tengan ventajas o desventajas coherentes sin depender de la Rareza.

Tipos iniciales aprobados:

- **Animal** → Lobo, Jabalí, Lobo Alfa, Gran Jabalí.
- **Humanoide** → Bandido, Goblin y otros seres humanoides.
- **No Muerto** → Esqueleto, Zombi, Vampiro.
- **No Vivo** → Golem, Torreta, Invocación elemental y otras entidades sin biología viva convencional.

Ejemplo de interacción:

- Magia Sagrada del Sanador → mayor efectividad contra **No Muertos**.

El catálogo de Tipos es extensible si más adelante una familia de enemigos necesita una interacción propia, pero no se crearán Tipos nuevos sin una función real de juego.

**Rareza y Tipo nunca son lo mismo.**

Ejemplo:

> Lobo Alfa = Tipo Animal / Rareza Raro.  
> Gran Jabalí = Tipo Animal / Rareza Boss.  
> Zombi común = Tipo No Muerto / Rareza Común.

### Progresión de nivel y XP — marco de balance EN PRUEBA

La experiencia de los aventureros debe avanzar en relación con el ritmo de crecimiento de la ciudad. No se balanceará como un sistema aislado.

Objetivo temprano:

- Ciudad Nv.1 → aventureros fundadores Nv.1.
- Durante Ciudad Nv.2 → empiezan a aparecer los primeros Nv.2.
- Al llegar a Ciudad Nv.3 → la mayoría de los fundadores debería rondar Nv.2; un aventurero especialmente activo puede acercarse o alcanzar Nv.3.
- El Gran Jabalí debe poder derrotarse con un grupo bien equipado del rango disponible, sin exigir haber conseguido previamente materiales del propio Boss.

Primera curva para simulación:

- Nv.1 → 2: **60 XP**.
- Nv.2 → 3: **100 XP**.
- Nv.3 → 4: **160 XP**.

Estos valores son de balance inicial y se ajustarán mediante simulación/playtest antes de extender la curva hasta el final de temporada.

### Reparto de XP

Los enemigos aportan una **bolsa de XP de encuentro**.

- la XP se reparte entre los aventureros participantes;
- no existe XP por “último golpe”;
- formar grupo aumenta seguridad pero reparte la experiencia;
- una misión de eliminación no debe duplicar automáticamente la XP de los enemigos: la recompensa principal de la misión es económica/material salvo que una actividad específica tenga XP propia.

Esto permite una elección natural entre progresar más rápido con mayor riesgo o progresar de forma más segura en grupo.

### Caer a 0 Vida — pérdida de XP

Llegar a **0 Vida** implica incapacitación y pérdida de progreso de experiencia.

Regla inicial:

- pierde **20 % de la XP necesaria para alcanzar el siguiente nivel**;
- la pérdida se limita a la XP acumulada dentro del nivel actual;
- **nunca pierde un nivel ya conseguido**;
- si tiene menos XP acumulada que la penalización, queda en 0 XP de progreso dentro de ese nivel.

Ejemplo:

Un aventurero Nv.2 necesita 100 XP para Nv.3. Si cae a 0 Vida, la penalización máxima inicial es 20 XP. Si sólo llevaba 12 XP acumulada, pierde 12 y permanece Nv.2 con 0/100.

La incapacitación además puede generar tiempo de recuperación y nuevas necesidades de ciudad, pero no debe crear una espiral de castigo imposible de remontar.

### Relación ciudad ↔ aventureros

La progresión debe mantenerse en un corredor flexible, no mediante un bloqueo artificial.

Si los aventureros avanzan demasiado rápido:

- dejan de necesitar equipo básico;
- reducen demanda del mercado inicial;
- buscan contenido que la ciudad todavía no puede sostener.

Si avanzan demasiado lento:

- la ciudad desbloquea productos y servicios sin compradores adecuados;
- el nuevo contenido pierde utilidad.

Por eso Vida, Defensa, daño, equipo, recompensas, XP, recuperación y tiempos de actividad se balancearán como **un único sistema económico y temporal**.

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

## 33. Personalidad, ánimo y memoria

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

## 34. Combate — simulación probabilística, no combate persistente

Decisión arquitectónica aprobada:

**Los combates NO se ejecutan continuamente en primer plano ni en segundo plano.**

El juego no debe mantener cientos o miles de peleas resolviéndose ronda por ronda de forma persistente, porque eso generaría un flujo innecesario de cálculos, eventos y datos.

Las estadísticas de enemigos, aventureros, equipo, habilidades, estados y composición del grupo existen para alimentar un **motor de resolución probabilística de combate**.

### Principio

Cuando una misión/salida necesita resolver un enfrentamiento, el motor toma una instantánea de los datos relevantes:

- nivel;
- Vida;
- Maná;
- Ataque;
- Defensa;
- Iniciativa;
- habilidades;
- estados;
- equipo y calidad;
- composición del grupo;
- sinergias;
- enemigo(s);
- cantidad;
- rareza;
- tipo de enemigo;
- terreno/amenaza;
- preparación, comida, afilado, provisiones, etc.

Con esos datos calcula:

- probabilidad de victoria;
- riesgo de heridas;
- consumo esperado de recursos/provisiones;
- posibilidad de incapacitación;
- duración estimada;
- calidad del resultado;
- drops posibles;
- XP;
- demás consecuencias.

Luego **resuelve el resultado**, sin mantener un combate activo corriendo en tiempo real.

### Simulación interna

Puede existir una micro-simulación breve en memoria para obtener un resultado más creíble —por ejemplo, unas pocas iteraciones o rondas abstractas—, pero:

- se ejecuta sólo al momento de resolver;
- no permanece activa durante todo el tiempo de misión;
- no genera tráfico continuo;
- no requiere sincronizar cada golpe;
- no almacena cada acción individual salvo que sea necesario para depuración.

### Devolución al jugador

No se genera un informe de combate detallado por defecto.

Si el enfrentamiento no afecta directamente una decisión o interés del jugador, el resultado puede quedar resuelto sin mostrar una narración específica.

La información relevante puede aparecer de forma contextual en sistemas que ya existen:

- **Sede del Gremio:** devolución de una misión, escolta o encargo;
- **Mesón:** rumores, comentarios y relatos de aventureros;
- **Libro / historial:** sólo hechos importantes cuando corresponda;
- **Estado del aventurero:** heridas, consumo de recursos, equipo dañado, XP o botín.

Ejemplo de devolución en Sede:

> Misión completada.  
> Objetivo cumplido.  
> 1 aventurero regresó herido.  
> Recompensa entregada.

Ejemplo de rumor en Mesón:

> “Los lobos nos rodearon en el bosque. Por poco no volvemos.”

Principio:

**El combate se resuelve para producir consecuencias, no para generar un registro detallado de cada enfrentamiento.**

Esto reduce ruido de interfaz, almacenamiento y datos, y mantiene la narración sólo cuando aporta algo al jugador.

### Estados como Herida

Herida y otros estados siguen siendo útiles como variables del modelo.

Por ejemplo, Herida puede aumentar:

- daño esperado durante el enfrentamiento;
- riesgo de terminar herido;
- consumo de curación;
- probabilidad de incapacitación.

No es obligatorio simular literalmente cada turno para que el estado tenga efecto.

### Objetivo técnico

**Muchos aventureros pueden estar realizando actividades simultáneamente sin que cada actividad sea un proceso de combate activo.**

El sistema conserva sólo:

- estado inicial relevante;
- hora de inicio/fin;
- semilla/resultado cuando corresponda;
- resultado final;
- cambios persistentes importantes.

Esto permite escalar el Mundo y sus Reinos sin convertir la simulación en una corriente permanente de datos.

---

## 35. Lo que queda pendiente antes de programar el bloque completo

### Enemigos
- Bloque Nv.1–3 cerrado EN PRUEBA: Lobo, Jabalí, Lobo Alfa y Gran Jabalí.
- Pendiente posterior: Bandidos/Goblins del tramo Nv.3–6.

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

## 36. Regla de implementación

Mientras este documento esté marcado como **DISEÑO APROBADO EN PRUEBA**:

- conservar estas decisiones como base;
- no reinterpretarlas como definitivas si una prueba real demuestra que no funcionan;
- distinguir siempre entre diseño, implementación automática y validación real en Android;
- evitar programar nuevas capas grandes hasta que el bloque correspondiente haya sido debatido y autorizado.

El objetivo inmediato sigue siendo:

**construir una primera hora de juego Nv.1–3 que ya sea divertida, conectada y capaz de generar pequeñas historias emergentes.**
