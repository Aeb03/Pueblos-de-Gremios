# Diseño base — Mundo, encuentros y combate no visual de aventureros

Estado: **arquitectura conceptual aprobada / sistema todavía no implementado**.

Este documento fija la necesidad de un sistema de datos amplio y reutilizable para resolver las aventuras de NPC sin mostrar combates en pantalla.

## 1. Principio general

Los aventureros tienen vida propia y progresión persistente.

Las misiones y encargos no se resolverán como una animación de combate controlada por el jugador. Se resolverán mediante un **motor de simulación no visual** que intercambia datos entre:

- aventureros;
- grupo;
- regiones;
- rutas;
- encuentros;
- criaturas;
- jefes;
- equipamiento;
- estados;
- drops;
- recompensas;
- experiencia;
- salud y consecuencias.

El jugador verá la preparación, el riesgo estimado y el informe final, pero el combate real ocurre en el sistema.

## 2. Catálogos principales

El juego deberá trabajar con datos separados y relacionados, no con eventos escritos a mano de forma aislada.

### Regiones

Cada región puede definir:

- nivel/dificultad recomendada;
- clima o peligro ambiental;
- tipos de criaturas;
- rutas;
- recursos;
- frecuencia de encuentros;
- modificadores especiales;
- jefes disponibles;
- requisitos de acceso.

### Criaturas

Cada criatura normal puede definir:

- vida;
- poder ofensivo;
- defensa;
- velocidad/iniciativa si se usa;
- tipo de daño;
- resistencias/debilidades;
- habilidades o rasgos;
- peligrosidad;
- experiencia;
- tabla de drops;
- región/hábitat.

### Jefes

Los jefes usan la misma base que una criatura pero agregan:

- dificultad superior;
- fases o rasgos especiales;
- requisitos/recomendaciones de grupo;
- tabla de drops propia;
- objetos raros;
- probabilidad de drop;
- modificadores específicos contra ciertos roles/equipamientos.

### Drops

Cada drop debe ser un objeto de datos independiente:

- id;
- nombre;
- rareza;
- fuente;
- valor orientativo;
- usos;
- negocios/recetas que lo necesitan;
- posibilidad de venta;
- posibilidad de ser objetivo de Encargo.

## 3. Aventureros persistentes

Cada aventurero debe conservar a lo largo del tiempo:

- identidad;
- nivel;
- experiencia;
- vida máxima;
- vida actual;
- estadísticas de combate;
- rol/clase;
- personalidad;
- monedas;
- equipo;
- calidad del equipo;
- consumibles;
- inventario de drops;
- estados/heridas;
- historial de misiones;
- éxitos y fracasos;
- relación/reputación futura con ciudades;
- disponibilidad actual.

Una misión debe poder cambiar estos datos.

## 4. Poder de grupo

No se usará solamente el nivel promedio.

El poder real del grupo debe considerar factores como:

- nivel individual;
- vida actual;
- arma;
- armadura;
- calidad del equipo;
- rol;
- complementariedad entre roles;
- habilidades/rasgos;
- consumibles;
- estado físico;
- peligros específicos del enemigo;
- región;
- experiencia futura con ese tipo de objetivo.

El resultado debe producir una estimación de riesgo comprensible, pero sin convertir el juego en una fórmula totalmente transparente y explotable.

## 5. Resolución de combate

No conviene resolver todo con una única tirada de “éxito / fracaso”.

Una sola tirada no permite explicar de forma coherente:

- quién recibió daño;
- quién cayó;
- quién gastó consumibles;
- cuánto daño sufrió cada uno;
- qué experiencia recibió;
- por qué el grupo ganó o perdió.

La solución prevista es una **micro-simulación interna por fases o rondas**, sin representación visual.

Ejemplo conceptual:

1. Preparación del grupo.
2. Encuentro con enemigos.
3. Resolución de varias rondas abstractas.
4. Aplicación de daño y estados.
5. Uso de consumibles/rasgos cuando corresponda.
6. Victoria, retirada o derrota.
7. Tiradas de drops.
8. Aplicación de experiencia.
9. Consecuencias persistentes.
10. Informe para la Sede del Gremio / Libro correspondiente.

El jugador no controla estas rondas; sólo recibe el resultado y sus consecuencias.

## 6. Probabilidad estimada de éxito

Antes de salir, el sistema puede mostrar una estimación global como:

- Muy baja;
- Baja;
- Aceptable;
- Buena;
- Muy buena;

o un porcentaje aproximado si más adelante se decide mostrarlo.

Ese valor se deriva de la simulación/poder calculado, pero el resultado final puede variar.

El umbral usado por los Encargos automáticos deberá basarse en esta evaluación.

## 7. Separar combate y drop

Para un Encargo de objeto raro existen dos problemas distintos:

1. superar el combate;
2. obtener el drop solicitado.

Ejemplo conceptual:

- posibilidad de derrotar al Minotauro: 78%;
- posibilidad de Cuerno tras derrotarlo: 35%.

El Encargo sólo se completa si el grupo vuelve con el objeto solicitado.

## 8. Consecuencias de la aventura

Una misión debe poder modificar:

- experiencia;
- nivel;
- vida actual;
- heridas;
- tiempo de recuperación;
- consumibles;
- estado del equipo si se incorpora desgaste;
- inventario de drops;
- monedas;
- historial;
- disponibilidad;
- reputación futura.

Esto evita que los aventureros sean “fichas” que se resetean entre visitas.

## 9. Vida en 0 — regla base aprobada

**Los aventureros no mueren de forma permanente al llegar a 0 PV.**

La razón de diseño es que cada NPC acumula una historia persistente: nivel, equipo, compras, misiones, relaciones, éxitos y fracasos. Perder definitivamente ese personaje por una resolución aleatoria destruiría demasiado progreso narrativo y sistémico.

### 0 PV = incapacitado

Cuando un aventurero llega a 0 PV durante una simulación:

- queda **incapacitado** para el resto de ese combate;
- su caída queda registrada en el informe;
- no recupera inmediatamente toda su vida al finalizar;
- recibe una consecuencia persistente;
- puede quedar indisponible durante un periodo de recuperación;
- sufre una **pérdida visible de experiencia**.

La gravedad posterior puede depender de:

- dificultad del enemigo;
- cuánto daño excedió 0;
- si el grupo ganó o tuvo que retirarse;
- presencia de un sanador;
- consumibles;
- región/distancia;
- posibles rescates.

### Pérdida de experiencia

La derrota debe dejar una pérdida clara sin borrar la identidad construida del NPC.

Regla base recomendada:

- se pierde una parte del **progreso de XP dentro del nivel actual**;
- el aventurero **no baja de nivel**;
- la XP nunca cae por debajo del mínimo correspondiente a su nivel actual;
- la cantidad perdida puede escalar según la gravedad de la incapacitación.

Los porcentajes exactos quedan para balance de playtest.

Ejemplo conceptual:

> Kael · Nv. 5  
> Progreso antes de caer: 68/100 XP hacia Nv. 6  
> Penalización por incapacitación: -18 XP  
> Progreso posterior: 50/100 XP

Así la derrota importa y queda visible, pero no borra niveles completos ni años de historia del personaje.

### Otras consecuencias posibles

Además de la pérdida de XP, una incapacitación puede generar:

- herida leve;
- herida seria;
- estado crítico;
- recuperación en Posada/servicio médico futuro;
- tiempo de indisponibilidad;
- penalizaciones temporales.

Estas consecuencias pueden acumularse según la severidad, pero **la muerte permanente queda descartada como regla del sistema base**.

## 10. Informes de misión

Cada misión debería generar un informe compacto y persistente, por ejemplo:

> Grupo de Kael regresó de las Ruinas del Norte.  
> Resultado: victoria.  
> Kael: -34 PV, +28 XP.  
> Lyra: -12 PV, +25 XP.  
> Darek: incapacitado, herida seria, recuperación estimada 2 h.  
> Botín: 3 Colmillos, 1 Piel curtible.  
> Objetivo del Encargo: Cuerno de Minotauro — no obtenido.

Esto permitirá comprender el mundo sin ver el combate.

## 11. Arquitectura de datos

La implementación futura debe ser **data-driven**.

El motor no debería contener lógica especial para “Minotauro”, “Lobo” o una región concreta.

Debe leer definiciones de catálogos, por ejemplo:

- `regions`
- `encounters`
- `mobs`
- `bosses`
- `drops`
- `adventurers`
- `equipment`
- `statuses`
- `missionTemplates`

Así podremos añadir contenido sin reescribir el motor de combate.

## 12. Orden recomendado de desarrollo

Antes de crear cientos de criaturas o regiones:

1. diseñar el esquema de datos;
2. crear 1 región de prueba;
3. crear 2–3 criaturas normales;
4. crear 1 jefe;
5. crear 3 aventureros persistentes;
6. crear un simulador mínimo;
7. validar daño, experiencia y consecuencias;
8. balancear penalización de XP, heridas y recuperación al llegar a 0 PV;
9. conectar drops con Sede del Gremio;
10. conectar Encargos;
11. recién después ampliar el catálogo.

La prioridad es demostrar que el motor produce historias y consecuencias coherentes antes de cargar una base de datos grande.


## 13. Derrota total del grupo

Si **todos los integrantes del grupo quedan fuera de combate**, la misión termina inmediatamente en **retirada**.

No hay muerte permanente.

Consecuencias base:

- el objetivo de la misión no se completa;
- no se paga la recompensa del Encargo;
- los aventureros regresan incapacitados o heridos;
- todos quedan fuera de actividad hasta recuperarse;
- cada uno puede sufrir pérdida de progreso de XP según gravedad;
- pueden perder consumibles usados durante la misión;
- el botín comprometido con el objetivo no se entrega a la ciudad;
- cualquier botín adicional conservado dependerá de las reglas de retirada que se definan más adelante.

La derrota total debe sentirse seria, pero su función principal es generar consecuencias y nuevas decisiones, no borrar personajes.

## 14. La ciudad como ecosistema para aventureros

Los aventureros no pertenecen permanentemente a una ciudad.

Cada ciudad debe poder sostenerlos mediante su infraestructura y oportunidades.

Un aventurero evalúa si le conviene permanecer según factores como:

- posibilidad de recuperarse;
- calidad de Posada y servicios de curación;
- disponibilidad de comida y alojamiento;
- acceso a equipo adecuado;
- precios;
- trabajos y Encargos disponibles;
- dificultad de las misiones locales;
- posibilidad real de progresar;
- seguridad;
- dinero disponible;
- relación futura con la ciudad;
- otros servicios que se agreguen.

Una ciudad mal desarrollada puede dejar de ser atractiva incluso si tiene mucho Prestigio.

## 15. Necesidades persistentes del aventurero

Para producir un flujo natural, el aventurero debe tener necesidades y estados persistentes.

Como mínimo podrán existir:

- salud;
- recuperación/heridas;
- dinero;
- equipo;
- necesidad de mejorar equipo;
- nivel;
- experiencia;
- disponibilidad;
- necesidad de trabajo;
- inventario;
- ciudad actual;
- destino de viaje;
- satisfacción o conveniencia percibida de permanecer.

No es necesario simular hambre o sueño de forma excesivamente detallada al inicio. La prioridad es que las necesidades relevantes para la economía y progresión produzcan decisiones visibles.

## 16. Adecuación entre nivel del aventurero y ciudad

Una ciudad debe tener un **rango de oportunidades**.

Si la mayoría de sus misiones, enemigos y Encargos están muy por encima del poder de un aventurero de bajo nivel, ese NPC tendrá pocas posibilidades de progresar y aumentará su intención de marcharse.

Ejemplo conceptual:

> Aventurero Nv. 2  
> Ciudad A: misiones predominantes Nv. 6–8 → baja adecuación  
> Ciudad B: misiones predominantes Nv. 1–3 → alta adecuación

El aventurero tenderá a viajar hacia Ciudad B.

Del mismo modo, un aventurero avanzado puede abandonar una ciudad que sólo ofrece trabajos demasiado fáciles, poco rentables o equipo muy inferior a lo que necesita.

Por lo tanto no existe una única “mejor ciudad” para todos los NPC.

## 17. Migración automática entre ciudades

Cuando un aventurero considera que su ciudad actual ya no satisface sus necesidades, puede decidir viajar a otra.

La decisión puede comparar un **valor de conveniencia** entre ciudades conocidas.

Factores posibles:

- adecuación de dificultad;
- posibilidades de recuperación;
- calidad de servicios;
- oferta de misiones;
- oferta comercial;
- capacidad para vender drops;
- recompensa esperable;
- coste de vida;
- distancia/tiempo de viaje;
- relación previa con la ciudad.

La migración debe ser automática.

El jugador no ordena directamente:

> “Kael, andá a Ciudad B.”

Kael decide según su estado y las oportunidades.

Esto es fundamental para que el mundo parezca vivo.

## 18. Recuperación y desplazamiento después de una derrota

Después de una retirada, los aventureros intentan recuperarse en la ciudad a la que regresan.

Si esa ciudad posee servicios suficientes:

- entran en recuperación;
- quedan temporalmente indisponibles;
- después vuelven a buscar misiones.

Si la ciudad **no puede satisfacer su recuperación** o el tiempo/coste resulta demasiado desfavorable, el NPC puede buscar otra ciudad con mejores servicios.

Ejemplo:

> Darek regresa herido de gravedad.  
> La ciudad actual no tiene servicio capaz de tratarlo.  
> Detecta una ciudad cercana con Posada y atención superior.  
> Cuando su estado permite viajar, decide trasladarse allí para recuperarse.

Así una derrota también puede modificar el flujo de población entre ciudades.

## 19. Flujo natural de vida

La combinación de todos los sistemas debe producir este ciclo emergente:

1. aventureros llegan buscando oportunidades;
2. toman misiones adecuadas a su nivel;
3. consiguen XP, dinero y drops;
4. compran mejores objetos;
5. venden botín;
6. pueden resultar heridos;
7. usan los servicios de la ciudad;
8. suben de nivel;
9. las oportunidades locales pueden dejar de ser adecuadas;
10. deciden permanecer o viajar a otra ciudad.

La ciudad, por su parte:

1. recibe aventureros;
2. vende bienes y servicios;
3. compra drops;
4. publica Encargos;
5. desarrolla negocios;
6. atrae perfiles distintos;
7. puede perder población aventurera si deja de satisfacer sus necesidades.

El objetivo es que la ciudad parezca moverse aunque el jugador no esté observando cada acción.

## 20. Consecuencia de diseño: especialización de ciudades

Este sistema permite que las ciudades desarrollen identidades distintas de forma natural.

Ejemplos conceptuales:

- ciudad inicial: muchos aventureros Nv. 1–3, trabajos sencillos y servicios baratos;
- ciudad minera: buena demanda de escoltas y compra de minerales/drops de cuevas;
- ciudad fronteriza: misiones peligrosas y aventureros veteranos;
- ciudad comercial: gran mercado para comprar/vender equipo;
- ciudad con servicios médicos fuertes: atrae aventureros heridos o grupos de alto riesgo.

No todas las ciudades deben competir únicamente por ser “más altas de nivel”.

Pueden competir también por ser mejores para determinados perfiles de aventurero.

## 21. Requisito técnico futuro para la capa online

Cuando varias ciudades de jugadores formen parte del mismo Reino, este flujo tendrá impacto compartido.

Los estados importantes del aventurero, sus viajes y transacciones deberán ser autoritativos en servidor para evitar que un mismo NPC exista simultáneamente en dos ciudades o duplique botín/dinero.

La ciudad puede seguir siendo principalmente offline para su gestión local, pero:

- ubicación compartida de aventureros;
- inventario económico compartido;
- viajes entre ciudades;
- intercambios;
- Encargos;

deberán resolverse de forma consistente cuando entren en la capa online.

## 22. Regla de diseño central

**El jugador no administra directamente a los aventureros. Administra una ciudad que debe resultarles útil.**

Los aventureros:

- eligen;
- compran;
- venden;
- aceptan riesgos;
- progresan;
- se recuperan;
- migran.

El jugador modifica su comportamiento **indirectamente** construyendo mejores servicios, ofreciendo mejores oportunidades, precios y recompensas.

Esta regla debe conservarse al diseñar futuros sistemas.
