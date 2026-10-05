# Pueblos de Gremios

PWA de gestión fantástica desarrollada paso a paso.

## Estado actual

**v0.8.0 — Fundación de ciudad — 📌 ESTABLE EN ANDROID**

Esta versión reinicia deliberadamente el ciclo local de prueba para validar desde cero el nacimiento de una ciudad y la población inicial de aventureros.

✅ Validación real en Android completada: fundación, persistencia general y **Reiniciar Reino de prueba** funcionan correctamente.

### Fundación

En el primer arranque de v0.8.0:

- el jugador nombra la ciudad;
- se crea el asentamiento como **Pueblo**;
- se entrega el Pack inicial de recursos;
- continúan los cuatro trabajadores base: Borin, Mara, Eldon y Nara;
- se generan **3 aventureros Nv. 1**;
- los aventureros quedan persistidos y pasan a formar parte del Reino de prueba.

La clave de guardado cambia a `pueblos-gremios-save-v0.8.0`, por lo que esta línea comienza con un estado local limpio.

### Primer generador de aventureros

`game-data.js` contiene los catálogos reutilizables de:

- nombres y apellidos;
- roles;
- personalidades;
- tiendas;
- objetos;
- recetas.

El Pack inicial garantiza tres roles distintos en esta primera prueba:

- Guerrero;
- Explorador;
- Sanador.

Cada aventurero obtiene:

- ID persistente;
- nombre + apellido;
- ciudad y categoría de origen;
- rol;
- personalidad;
- rasgos internos;
- estadísticas;
- PV;
- monedas;
- equipo inicial;
- perfil de compra.

El nombre completo no se repite dentro del estado generado.

### Aleatoriedad controlada

Los stats parten de una base por rol y reciben variaciones pequeñas que redistribuyen puntos, evitando personajes absurdamente fuertes o débiles por puro azar.

Las personalidades conservan rasgos internos y pesos de decisión reutilizables por la IA.

### Herrería

La lógica de visitantes de Herrería ya dejó de depender de Kael/Lyra/Darek fijos.

Los visitantes salen del grupo de aventureros realmente generado para la ciudad y su IA de compra utiliza el perfil del NPC persistente.

También se corrigió la ubicación visual de **Visitante actual** y **Exhibición** para que pertenezcan a Herrería y no a Carpintería.

### Catálogo inicial

Tiendas definidas:

- Ayuntamiento;
- Taberna;
- Herrería;
- Carpintería;
- Posada;
- Sede del Gremio (preparada, todavía no implementada en UI).

Recetas actuales en catálogo:

- Cabeza de pico de hierro;
- Mango de pico;
- Pico de hierro;
- Espada de hierro;
- Banco de trabajo simple (futuro).

Los costes/tiempos principales de las recetas ya comienzan a leerse desde el catálogo en vez de estar definidos sólo como números aislados.

### Reino de prueba

La pantalla Reino muestra:

- ciudad fundada;
- categoría;
- cantidad de aventureros activos;
- identidad;
- rol;
- personalidad;
- PV;
- stats básicos;
- ciudad de origen.

### Herramienta de prueba

Menú incluye **Reiniciar Reino de prueba** para volver a ejecutar el proceso de fundación y probar el generador desde cero.

## Próximos pasos

La intención es avanzar en bloques pequeños:

1. validar fundación y generador en Android;
2. reorganizar Herrería por pestañas;
3. separar stock por negocio y estado pendiente/venta;
4. definir primera región, mobs y drops;
5. crear primer motor mínimo de misión/combat no visual;
6. conectar salud, XP y recuperación de los aventureros.

## Desarrollo

Repositorio principal del proyecto Pueblos de Gremios.
