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

## 9. Vida en 0 — decisión todavía pendiente

Debe definirse explícitamente qué ocurre cuando un aventurero llega a **0 de vida** durante una simulación.

Requisito ya asentado:

- 0 de vida debe tener una consecuencia persistente y coherente;
- no puede simplemente recuperar toda la vida al terminar;
- debe afectar su disponibilidad y/o estado posterior;
- el sistema debe distinguir caer durante el combate de completar la misión sano.

### Propuesta para debatir

Opción recomendada para la base del juego:

**0 PV = incapacitado, no muerte automática.**

Después de la misión se determina gravedad según:

- dificultad del enemigo;
- cuánto daño excedió 0;
- si el grupo ganó o tuvo que retirarse;
- presencia de un sanador;
- consumibles;
- región/distancia;
- posibles rescates.

Posibles consecuencias:

- herida leve;
- herida seria;
- estado crítico;
- recuperación en Posada/servicio médico futuro;
- varios minutos/horas/días de indisponibilidad según balance;
- penalizaciones temporales.

La muerte permanente queda **sin aprobar**. Si algún día se incorpora debería ser una decisión de diseño explícita y no un efecto común de una tirada aleatoria.

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
8. definir definitivamente 0 PV;
9. conectar drops con Sede del Gremio;
10. conectar Encargos;
11. recién después ampliar el catálogo.

La prioridad es demostrar que el motor produce historias y consecuencias coherentes antes de cargar una base de datos grande.
