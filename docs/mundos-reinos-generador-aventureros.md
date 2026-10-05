# Ley de mundo — Servidores, Reinos, ciudades y generación de aventureros

Estado: **diseño aprobado / arquitectura futura**.

Este documento fija la estructura poblacional del mundo online y la creación inicial de aventureros NPC.

## 1. Jerarquía del mundo

La estructura será:

**Mundo / Servidor → Reinos → Ciudades/Jugadores → Aventureros persistentes**

Un **Mundo/Servidor** contiene una cantidad limitada de Reinos.

Cada **Reino** tiene un límite máximo de ciudades/jugadores.

Por lo tanto, la capacidad máxima de un Mundo/Servidor está determinada por la suma de las capacidades de sus Reinos.

Ejemplo conceptual:

- Mundo 1
  - Reino A: hasta X ciudades
  - Reino B: hasta X ciudades
  - Reino C: hasta X ciudades

Cuando el mundo alcanza su capacidad total, los nuevos jugadores deberán entrar a otro Mundo/Servidor.

Los valores exactos de Reinos por Mundo y ciudades por Reino quedan para balance y capacidad técnica.

## 2. Una ciudad equivale a un jugador

Cada jugador funda una ciudad propia.

La ciudad pertenece a un Reino y ocupa un lugar dentro del límite de ese Reino.

El sistema debe impedir crear más ciudades cuando el Reino alcanzó su capacidad.

Más adelante podrán existir reglas de selección automática o elección de Reino según población y balance.

## 3. Pack de inicio de una ciudad

Cuando se crea una ciudad nueva entra al mundo con un **Pack de inicio**.

Ese pack incluye, como mínimo:

- recursos iniciales;
- edificios iniciales;
- trabajadores iniciales;
- una cantidad inicial de aventureros NPC.

La cantidad exacta de aventureros iniciales queda por definir y balancear.

Estos aventureros no son decorativos ni temporales.

Son NPC persistentes del Mundo/Servidor.

Comienzan su historia en esa ciudad, pero posteriormente pueden:

- comprar;
- vender;
- tomar misiones;
- recibir daño;
- ganar XP;
- mejorar equipo;
- migrar;
- viajar a otras ciudades del mismo mundo según las reglas futuras.

## 4. Población persistente, no clones por visita

Una vez generado, un aventurero recibe un identificador único inmutable:

`adventurer_id`

Ese ID es la identidad técnica real del personaje.

El nombre visible nunca debe usarse como identificador de base de datos.

Ejemplo:

`adv_01H...`

Puede existir:

- Darien Voss
- Darien Meral
- Darien Thorne

aunque compartan nombre.

Lo que se evita es generar el **mismo nombre completo** para dos aventureros activos dentro del mismo Mundo/Servidor.

## 5. Nombre + apellido

El generador utilizará al menos:

- nombre;
- apellido.

Esto permite reutilizar nombres de pila sin que los personajes parezcan clones.

Ejemplo:

- Kael Doran
- Kael Varen
- Lyra Doran
- Mara Voss

Regla inicial:

**el nombre completo debe ser único dentro del Mundo/Servidor.**

Si una combinación ya existe, el generador prueba otra.

En el futuro se pueden agregar:

- segundo apellido;
- apodos;
- títulos;
- procedencia;

pero no son necesarios para la primera versión.

## 6. Generador de aventureros

La creación de aventureros debe realizarse mediante un motor reutilizable y data-driven.

El generador recibe un contexto, por ejemplo:

- Mundo;
- Reino;
- ciudad de origen;
- rango de nivel permitido;
- etapa del servidor;
- tipo de creación: pack inicial, llegada futura, evento, etc.

Y produce un aventurero completo.

### Datos generados

Como mínimo:

- `adventurer_id`;
- nombre;
- apellido;
- Reino;
- ciudad de origen;
- ciudad actual;
- nivel;
- XP;
- clase/rol;
- estadísticas base;
- vida máxima;
- vida actual;
- personalidad;
- monedas;
- equipo inicial;
- inventario;
- historial vacío;
- estado/disponibilidad.

## 7. La aleatoriedad no debe producir personajes rotos

Las estadísticas no deben sortearse de forma completamente libre.

Se usará un **presupuesto de poder** según nivel.

Ejemplo conceptual:

Un aventurero Nv.1 recibe cierto total de puntos.

El generador los distribuye según su clase:

- Guerrero: más Vida/Defensa;
- Pícaro: más Velocidad/Crítico;
- Arquero: más precisión/daño a distancia;
- Sanador: más soporte/curación;

con una pequeña variación individual.

Así dos Guerreros Nv.1 pueden ser distintos sin que uno nazca con el doble de poder que otro por puro azar.

## 8. Clase / rol

La clase también se genera de forma automática.

No debe existir una distribución puramente uniforme si eso genera Reinos desequilibrados.

El generador puede usar pesos y necesidades poblacionales.

Ejemplo:

Si en un Reino casi no existen aventureros de soporte, la probabilidad de generar uno puede subir ligeramente.

Esto permite una población variada sin perder aleatoriedad.

Las clases exactas se diseñarán cuando construyamos el primer simulador.

## 9. Personalidad

La personalidad debe alimentar decisiones reales del motor.

No será sólo una etiqueta estética.

Puede influir en:

- aceptar Encargos;
- tolerancia al riesgo;
- valoración de recompensas;
- compra de equipo;
- venta de drops;
- ahorro/gasto;
- migración;
- preferencia de ciudades;
- formación de grupo.

Conviene generarla mediante varios rasgos o ejes en vez de una sola palabra.

Ejemplo conceptual:

- valentía: 72
- avaricia: 40
- prudencia: 55
- ambición: 80
- lealtad: 35

Luego la interfaz puede resumirlos con una etiqueta como **Ambicioso**.

## 10. Aventureros del Pack inicial — garantía obligatoria

**Una ciudad nueva nunca puede existir sin su grupo inicial de aventureros.**

Estos NPC no son un premio opcional ni una generación que pueda cancelarse por falta de población. Son parte estructural del Pack de Fundación porque la ciudad necesita aventureros del rango correcto para:

- aceptar las primeras misiones;
- comprar los primeros productos;
- vender drops básicos;
- alimentar la economía inicial;
- permitir que los trabajadores y negocios progresen;
- iniciar el flujo natural de vida de la ciudad.

La creación de la ciudad y la creación de su grupo inicial deben tratarse como **una única operación**.

> Si el servidor no puede garantizar el Pack completo de aventureros, no debe permitir crear esa ciudad todavía.

Nunca se crea primero la ciudad para después intentar encontrarle aventureros.

### Composición del Pack

Los aventureros del Pack inicial deben estar pensados para que una ciudad nueva pueda funcionar desde sus primeros pasos.

Por eso no conviene que todos sus datos sean azar absoluto.

El pack debe garantizar:

- nivel/rango compatible con las misiones iniciales;
- variedad mínima de roles;
- poder suficiente para el contenido de inicio;
- personalidades diferentes;
- equipo inicial básico;
- ningún aventurero extraordinariamente fuerte.

La identidad individual sí será aleatoria mediante el generador.

La cantidad exacta del Pack queda para balance de playtest, pero será un **mínimo garantizado**, no una probabilidad.

### Prioridad frente a otros tipos de generación

Si el Mundo/Reino se acerca a un límite poblacional, el orden de prioridad será:

1. **Pack inicial de una ciudad autorizada: siempre garantizado.**
2. Generación asociada a hitos de crecimiento de ciudades.
3. Generación ambiental/eventos futuros.

Las generaciones opcionales pueden suspenderse si falta capacidad.

El Pack inicial no.

### Reserva de capacidad

La arquitectura del Mundo debe reservar capacidad suficiente para que cada espacio de ciudad disponible pueda recibir también su Pack inicial.

Por lo tanto, un “espacio libre de ciudad” sólo se considera realmente disponible si el servidor puede crear también sus aventureros iniciales.

Esto evita el caso inválido:

> Reino acepta una ciudad nueva → ciudad aparece → no quedan NPC adecuados → la ciudad no puede progresar.

Ese estado no debe existir.

## 11. Crecimiento de población

Crear una ciudad nueva agrega obligatoriamente su Pack inicial de aventureros al Mundo/Servidor.

Después de creados, esos NPC pasan a formar parte de la población global persistente.

No deben regenerarse cada vez que visitan una ciudad.

Los viajes son cambios de ubicación de la misma entidad.

Esto permite que la población tenga memoria e historia.

## 12. Migración entre ciudades

Un aventurero generado con una ciudad de origen no queda atado a ella.

Debe distinguirse:

- `origin_city_id`: ciudad donde comenzó su historia;
- `current_city_id`: ciudad donde se encuentra ahora.

Puede abandonar su ciudad de origen si no puede:

- progresar;
- recuperarse;
- vender;
- comprar equipo;
- encontrar misiones adecuadas;
- obtener suficientes ingresos.

Su identidad, XP, equipo, monedas e historial viajan con él.

## 13. Límite del Mundo y necesidad de nuevos servidores

El límite de jugadores no es sólo una restricción técnica.

También define la escala del ecosistema.

Cuando un Mundo/Servidor está lleno:

- no se crean nuevas ciudades allí;
- no se crean Packs iniciales nuevos allí;
- la población existente sigue evolucionando;
- nuevos jugadores entran en un nuevo Mundo/Servidor.

Cada Mundo desarrolla así su propia historia económica y poblacional.

Dos servidores pueden terminar con Reinos muy diferentes aunque comiencen con las mismas reglas.

## 14. Autoridad de servidor

Todo lo que afecte a la población compartida deberá ser autoritativo en servidor.

Como mínimo:

- creación única de aventureros;
- `adventurer_id`;
- nombre completo único;
- ubicación actual;
- Reino;
- inventario;
- monedas;
- XP/nivel;
- salud;
- viajes;
- compras/ventas;
- Encargos;
- recompensas.

El cliente no puede crear un aventurero compartido por sí solo y después “subirlo”.

El servidor ejecuta o valida la generación y guarda el resultado.

## 15. Regla de unicidad

Se definen dos niveles de identidad:

### Identidad técnica

Siempre única:

`adventurer_id`

### Identidad visible

`nombre + apellido`

Debe ser única dentro del Mundo/Servidor mientras el NPC exista.

Los nombres de pila y apellidos individualmente sí pueden repetirse.

## 16. Generación determinista y auditable

Para evitar duplicaciones o rerolls abusivos, la generación debería producirse una sola vez y persistirse.

Idealmente el servidor guarda:

- contexto de generación;
- versión del generador;
- semilla o identificador de creación;
- resultado final.

No es necesario mostrar estos datos al jugador, pero ayudan a reproducir errores y mantener consistencia.

## 17. Primera versión recomendada del generador

Antes de construir cientos de combinaciones:

1. 20–30 nombres;
2. 20–30 apellidos;
3. 3 clases;
4. 3–5 perfiles de personalidad base;
5. un presupuesto de estadísticas para Nv.1;
6. equipo inicial básico por clase;
7. 3–5 aventureros por ciudad de prueba;
8. comprobación de nombre completo único;
9. persistencia por ID;
10. migración simulada entre dos ciudades.

Después podremos ampliar listas y complejidad sin cambiar el motor.

## 18. Ley central de población

**Cada nueva ciudad nace junto con un grupo inicial garantizado de aventureros; después esos aventureros pertenecen al Mundo, no al jugador.**

El jugador puede beneficiarse de ellos mientras decidan quedarse, pero no los posee.

Esta regla conecta:

- límite de jugadores;
- capacidad del Reino;
- población NPC;
- economía;
- migración;
- progresión;
- historia emergente.


## 19. Regla atómica de fundación

La operación de fundar una ciudad futura debe validar en servidor, en una sola transacción lógica:

- espacio disponible en el Reino;
- ciudad válida para el jugador;
- recursos/estado inicial de la ciudad;
- trabajadores iniciales;
- capacidad reservada para el Pack de aventureros;
- generación exitosa de todos los aventureros del Pack;
- nombres completos únicos;
- IDs persistentes.

Sólo cuando todo está listo se confirma la fundación.

Si cualquier parte falla, no se crea una ciudad incompleta.

Esta regla es especialmente importante porque los aventureros iniciales son parte del **motor económico de arranque**, no contenido decorativo.


## 20. Jubilación de aventureros

La **jubilación** será la salida natural de un NPC del sistema de aventureros activos.

Un aventurero jubilado:

- no muere;
- no se borra;
- conserva su `adventurer_id`;
- conserva nombre, origen, historial, nivel alcanzado, equipo histórico y relaciones;
- deja de aceptar misiones y Encargos como aventurero activo;
- libera un lugar dentro de la población activa de aventureros del Mundo/Reino.

La jubilación permite controlar el crecimiento poblacional sin destruir personajes que ya acumularon historia.

### Motivos de jubilación

No debe depender únicamente de una edad cronológica.

Puede surgir de una combinación de:

- carrera muy prolongada;
- nivel alto;
- cantidad de misiones completadas;
- riqueza acumulada;
- lesiones graves repetidas;
- personalidad;
- cumplimiento de objetivos personales;
- etapa del Mundo/Servidor.

Los valores exactos quedan para balance posterior.

La jubilación no debe sentirse como una tirada aleatoria repentina. Debe tener señales previas y ser coherente con la historia del NPC.

### Después de jubilarse

Un aventurero jubilado puede quedar registrado simplemente como personaje histórico o, en casos relevantes, adquirir una función futura.

Posibles destinos:

- residente de una ciudad;
- cliente;
- instructor/mentor;
- miembro de la Sede del Gremio;
- comerciante o contacto;
- personaje de eventos;
- figura histórica consultable.

No todos los jubilados necesitan convertirse en NPC activos de ciudad; eso evitará trasladar el problema de población a otro sistema.

### Historia visible

La ficha histórica debe poder mostrar algo como:

> Kael Doran  
> Originario de Villa del Roble  
> Aventurero retirado · Nv. 14  
> 126 misiones · 9 Encargos mayores  
> Actualmente residente en Brumaria

La ciudad de origen permanece aunque esa ciudad crezca, cambie de categoría o desaparezca.

### Población activa vs. población histórica

El Mundo debe distinguir:

- **aventureros activos**: cuentan contra la capacidad operativa y pueden viajar, comerciar y tomar misiones;
- **aventureros jubilados/históricos**: permanecen en la base de datos pero no consumen un cupo de aventurero activo.

Esto permite que un servidor acumule historia durante años sin que su ecosistema activo crezca indefinidamente.

### Reposición natural futura

La jubilación puede abrir espacio para que el motor poblacional genere nuevos aventureros cuando el Mundo/Reino necesite recuperar población activa.

Esa reposición no debe ser inmediata ni automática en todos los casos.

Debe respetar:

- capacidad del Reino;
- demanda de aventureros;
- ciudades capaces de sostener nuevos NPC;
- hitos poblacionales;
- prioridad absoluta de los Packs iniciales de ciudades nuevas.

Así pueden convivir generaciones de aventureros sin romper los límites del Mundo.
