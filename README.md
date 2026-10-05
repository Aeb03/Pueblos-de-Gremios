# Pueblos de Gremios

PWA de gestión fantástica desarrollada paso a paso.

## Estado actual

**v0.8.0 — Fundación de ciudad — 📌 ESTABLE EN ANDROID**

Checkpoint estable previo. Fundación y reinicio validados en dispositivo real.

## En prueba

**v0.8.1 — Herrería compacta y stock por negocio**

La nueva línea reorganiza Herrería para que funcione como negocio real sin perder la base estable de v0.8.0.

### Herrería v0.8.1

La pantalla ahora se divide en cinco secciones:

- **Fabricar**;
- **Almacén**;
- **Venta**;
- **Libro**;
- **Mejoras**.

Las recetas se muestran en una lista compacta. Cada fila conserva coste, tiempo, Resistencia y XP, mientras la descripción y detalles secundarios quedan desplegables.

El objetivo es poder ver varias recetas por pantalla sin convertir cada objeto en una tarjeta enorme.

### Almacén propio

Los productos de Herrería ya no se guardan en el Inventario general.

La estructura pasa a:

- Cabezas de pico → Almacén de Herrería;
- Picos de hierro terminados → Almacén de Herrería;
- Espadas de hierro individuales → Almacén de Herrería;
- Mangos → Almacén de Carpintería.

El inventario general queda para monedas, materiales compartidos y equipamiento ya asignado.

Almacén de Herrería tiene por ahora una capacidad de prueba de **20 unidades** y Exhibición una capacidad de **3 piezas**.

Las Espadas fabricadas entran primero al Almacén. Desde ahí se revisan calidad/precio y se decide si pasan a Exhibición.

### Compatibilidad

La clave de guardado sigue siendo `pueblos-gremios-save-v0.8.0`.

Al cargar un save de v0.8.0, el juego migra los productos antiguos del inventario general a los almacenes de negocio.

---

### Fundación v0.8.0

Esta versión reinició deliberadamente el ciclo local de prueba para validar desde cero el nacimiento de una ciudad y la población inicial de aventureros.

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

## Diseño consolidado en prueba

La discusión de diseño más reciente quedó consolidada en:

- [Diseño aprobado EN PRUEBA — Era, ciudad inicial y tramo Nv.1–3](docs/diseno-aprobado-era-inicial-nv1-3.md)
- [Balance técnico v1 — Aventureros, combate y ritmo Nv.1–3](docs/balance-combate-aventureros-v1.md)

Este documento reúne temporadas/Eras, estructura territorial, ciudad fundadora, negocios, trabajadores, recursos, amenaza/escoltas, misiones comunes, Textilería Nv.2, balance inicial y enemigos comunes aprobados para el primer tramo. No implica implementación inmediata: sirve como contrato de diseño para los próximos desarrollos y playtests.

## Próximos pasos

1. validar v0.8.1 en Android;
2. pulir capacidad/estado pendiente de mercancías si hace falta;
3. usar la estructura de Herrería como patrón para los demás negocios;
4. definir primera región: 2 mobs comunes, 1 raro y 1 boss;
5. conectar drops con recetas/planos;
6. crear primer motor mínimo de misión/combate no visual.

## Desarrollo

Repositorio principal del proyecto Pueblos de Gremios.
