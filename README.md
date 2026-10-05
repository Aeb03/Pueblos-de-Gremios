# Pueblos de Gremios

PWA de gestión fantástica desarrollada paso a paso.

## Estado actual

**v0.7.0 — Aventureros y Libro de Herrería**

La Herrería ya tiene actividad autónoma de clientes y la primera versión de la mente de compra de los NPC.

### Aventureros

Tres aventureros recurrentes pueden visitar la Herrería durante el playtest:

- **Kael** — Guerrero prudente.
- **Lyra** — Exploradora ahorradora.
- **Darek** — Mercenario ambicioso.

Cada uno conserva monedas, arma actual, cantidad de visitas y compras. La necesidad cambia en cada visita y representa situaciones como prepararse para una expedición o necesitar reemplazar un arma gastada.

### Exhibición

Las Espadas de hierro ya no están automáticamente a la venta.

Desde Inventario el jugador puede:

- definir el precio individual;
- poner una espada en **Exhibición**;
- quitarla de Exhibición.

Sólo las piezas exhibidas pueden ser consideradas por un aventurero.

### Decisión de compra

El NPC no compra por un porcentaje aislado. Para cada pieza considera:

- necesidad actual;
- afinidad del objeto con su perfil;
- mejora frente a su arma;
- relación entre valor estimado y precio pedido;
- dinero disponible;
- prioridades de su personalidad.

Los pesos cambian según el personaje. Una misma espada puede ser atractiva para un aventurero y poco interesante para otro.

Si compra:

- la espada desaparece del inventario;
- la ciudad recibe las monedas;
- el aventurero paga con sus propias monedas;
- su arma registrada mejora.

### Visita visible

Durante una visita en vivo:

- la Herrería muestra un indicador **👤 Cliente** en el mapa;
- dentro de la Herrería aparece el aventurero actual;
- se muestran rol, personalidad, monedas, daño de su arma y necesidad;
- la visita dura 15 segundos de playtest.

Las visitas se programan cada 45–90 segundos durante esta fase de prueba.

### 📖 Libro de la Herrería

Cada visita terminada deja una anotación persistente con:

- aventurero;
- contexto;
- compra o no compra;
- motivo principal;
- pieza y precio si hubo venta.

Si el jugador estaba haciendo otra cosa o con la PWA cerrada, las visitas vencidas se recuperan al volver y quedan registradas.

El mapa muestra **📖 N nuevas** cuando hay anotaciones no leídas.

Al entrar a la Herrería las anotaciones pasan a leídas.

### Autolimpieza

El libro conserva un máximo de **20 visitas detalladas**.

Cuando se supera ese límite, las más antiguas se compactan en un resumen acumulado con:

- visitas;
- ventas;
- visitas sin compra;
- monedas ingresadas.

El botón **Limpiar leídos** permite compactar manualmente las entradas ya vistas sin perder el resumen de actividad.

## Sistemas anteriores que continúan

- Resistencia y Posada de Mara, Borin y Eldon.
- Carpintería y fabricación de Mango de pico.
- Cabeza de pico y ensamblaje de Pico de hierro.
- Pico equipado a Mara y Veta dura.
- Espada de hierro con calidad individual, daño, durabilidad y valor estimado.
- Precio de venta definido por el jugador.
- Progreso persistente usando la misma clave de guardado.

## Siguiente bloque previsto

Agregar los **pedidos raros** como una vía distinta de la venta normal en Exhibición.

## Desarrollo

Repositorio principal del proyecto Pueblos de Gremios.
