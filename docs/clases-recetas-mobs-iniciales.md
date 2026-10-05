# Diseño base — Clases, habilidades, recetas y primer pack de enemigos

Estado: **dirección aprobada / contenido todavía por definir y balancear**.

Este documento fija cómo se conectarán las clases de aventureros, la progresión por nivel, las recetas y las fuentes de materiales con el primer contenido de combate no visual.

## 1. Clases de aventureros

Las clases no deben ser sólo una etiqueta o un reparto inicial de estadísticas.

Cada clase tendrá más adelante un sistema propio de progresión que incluya:

- estadísticas base;
- crecimiento por nivel;
- habilidades que se desbloquean por nivel;
- rasgos pasivos;
- afinidades con tipos de equipo;
- utilidad dentro de un grupo;
- comportamiento esperado dentro del motor de combate;
- posible afinidad con ciertos tipos de misiones o enemigos.

Ejemplos conceptuales de primeras familias:

- Guerrero;
- Explorador;
- Sanador.

Estas tres sirven hoy sólo como roles base del generador v0.8.0. Sus árboles y habilidades reales todavía no están diseñados.

## 2. Habilidades por nivel

Cada clase deberá tener una tabla de desbloqueos.

Ejemplo conceptual:

> Guerrero  
> Nv. 1 — Ataque básico / Guardia  
> Nv. 3 — Golpe fuerte  
> Nv. 5 — Proteger aliado  
> Nv. 8 — Contraataque  
> Nv. 10 — habilidad avanzada

No se fijan todavía nombres ni niveles definitivos.

El objetivo es que el nivel del NPC cambie realmente lo que puede aportar en la simulación y no sea solamente un multiplicador numérico.

## 3. Motor de combate reutilizable

Las habilidades se integrarán al motor no visual mediante datos.

Una habilidad deberá poder declarar, por ejemplo:

- tipo;
- potencia;
- objetivo;
- condición de uso;
- prioridad;
- coste si corresponde;
- efecto;
- probabilidad;
- duración;
- sinergias;
- restricciones.

El motor interpreta esos datos sin contener lógica exclusiva para una clase concreta.

## 4. Recetas con origen de materiales

Toda receta debe indicar no sólo qué necesita, sino también **de dónde puede provenir cada ingrediente**.

Un material puede obtenerse mediante:

- trabajador recolector;
- zona de recursos;
- mob normal;
- élite;
- boss;
- compra a aventureros en Sede del Gremio;
- Encargo;
- otro negocio;
- evento futuro.

Ejemplo conceptual:

> Espada de hierro  
> Hierro → Mina / Mara  
> Mango → Carpintería  
> Material especial futuro → drop de criatura o compra a aventureros

Así una receta queda conectada con el mundo y no es sólo una lista de costes.

## 5. Cada objeto necesita trazabilidad

Los objetos y materiales deberían poder declarar:

- id;
- nombre;
- rareza;
- categoría;
- negocio propietario;
- fuentes de obtención;
- usos;
- recetas que lo consumen;
- valor orientativo;
- si puede comprarse/venderse;
- si puede ser objetivo de Encargo.

Esto permitirá responder preguntas del juego como:

> “¿Dónde consigo Cuerno de Minotauro?”

sin tener reglas escritas a mano en la interfaz.

## 6. Primer pack de contenido de combate

Antes de ampliar el mundo necesitamos un **pack inicial pequeño y cerrado**.

Debe contener:

- 1 región inicial;
- 2 o 3 mobs normales;
- 1 boss inicial;
- tablas de drops;
- dificultad;
- XP;
- relaciones con recetas;
- al menos un material que sólo provenga de criaturas;
- al menos un material raro de boss.

Este pack será el banco de pruebas del motor lógico.

## 7. Reglas del primer pack

El contenido inicial debe cubrir casos distintos.

Necesitamos como mínimo:

### Mob común A

- dificultad baja;
- drop frecuente;
- pensado para aventureros recién generados.

### Mob común B

- perfil diferente de combate;
- otro tipo de drop;
- obliga a que composición/equipo tengan algún efecto.

### Mob común C opcional

- algo más peligroso;
- sirve como transición hacia el boss.

### Boss inicial

- requiere grupo;
- tiene una dificultad claramente superior;
- posee al menos un drop raro;
- su drop raro puede convertirse en objetivo de Encargo;
- derrotarlo y obtener su drop son eventos separados.

## 8. Primeras cadenas económicas

El primer pack de mobs debe alimentar recetas concretas.

La prueba no debe crear drops sin función.

Cada drop debería tener al menos uno de estos destinos:

- fabricación;
- mejora de edificio;
- pedido de trabajador;
- venta/compra en Sede;
- Encargo;
- equipamiento futuro.

Así validamos desde el comienzo el ciclo:

**mob → drop → aventurero → ciudad → tienda/trabajador → objeto/servicio → aventurero**

## 9. Orden de trabajo recomendado

Para evitar diseñar cientos de elementos antes de validar el motor:

1. cerrar la estructura de tiendas y almacenes;
2. fijar esquema de clases y habilidades;
3. crear la primera región;
4. crear 2 mobs normales;
5. crear 1 boss;
6. definir sus drops;
7. conectar esos drops con 2–3 recetas;
8. crear primera misión no visual;
9. simular combate;
10. aplicar XP, salud, botín y recuperación;
11. recién después ampliar contenido.

## 10. Regla central

**Ningún sistema debe diseñarse aislado.**

Las clases deben servir al combate.  
El combate debe generar consecuencias.  
Los mobs deben generar drops útiles.  
Los drops deben alimentar recetas.  
Las recetas deben alimentar tiendas y progreso.  
Las tiendas deben sostener aventureros.  
Los aventureros deben sostener la vida de la ciudad.

El objetivo es construir un motor lógico único que podamos reutilizar en cientos de casos futuros.
