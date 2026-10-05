# Diseño asentado — Tiendas, stock, Sede del Gremio y encargos

Estado: **diseño aprobado / futuro desarrollo**.  
Este documento fija decisiones para no perderlas mientras seguimos construyendo el prototipo.

## 1. Estado de un objeto fabricado

Un objeto terminado **NO se pone a la venta automáticamente**.

Flujo previsto:

1. El trabajador termina de fabricar la pieza.
2. La pieza entra al **almacén del negocio** con estado `pendiente`.
3. El juego muestra un **valor sugerido/estimado**.
4. El jugador puede:
   - aceptar ese valor;
   - modificar el precio.
5. Sólo después de confirmar el precio el jugador puede mover la pieza a **Venta / Exhibición**.
6. Recién entonces los NPC pueden evaluarla y comprarla.

La pieza debe seguir conservando sus datos individuales: calidad, características, valor estimado, precio elegido y demás atributos propios.

### Estados conceptuales

- `pendiente`: recién fabricado, esperando decisión del jugador.
- `almacenado`: guardado en el negocio pero no ofrecido.
- `en_venta`: ocupa un espacio de Exhibición y puede ser evaluado por NPC.
- `reservado`: futuro estado útil para pedidos/encargos.
- `vendido`: sale del stock del negocio.

## 2. Capacidad por nivel del negocio

Cada tienda tendrá dos límites separados:

- **Capacidad de almacén**: cuántos objetos terminados puede guardar.
- **Capacidad de venta / Exhibición**: cuántos objetos puede mostrar a compradores al mismo tiempo.

Ambas capacidades aumentarán con el nivel del edificio.

No fijamos todavía los números definitivos por nivel; se balancearán con pruebas reales.

Esto obliga a tomar decisiones de gestión: qué guardar, qué vender, qué retirar de Exhibición y cuándo conviene ampliar el negocio.

## 3. Mejora de nivel de negocios

Las mejoras avanzadas no deben depender sólo de monedas y materiales genéricos.

Pueden exigir una combinación de:

- nivel del trabajador principal;
- fabricación de determinados objetos;
- monedas;
- materiales de construcción;
- componentes fabricados por otros negocios;
- **muebles/equipamiento del local**;
- logros o hitos propios del oficio.

Ejemplo conceptual para una Herrería avanzada:

- Borin en un nivel mínimo de Herrería;
- fabricar determinada cantidad o tipo de armas;
- monedas;
- piedra/madera/metal;
- banco de trabajo o mueble fabricado en Carpintería.

Esto refuerza la interdependencia entre negocios.

## 4. Inventario organizado por negocio

Los productos terminados **no deberían aparecer todos juntos en un inventario general**.

Regla prevista:

- Herrería guarda sus armas, herramientas y componentes propios.
- Carpintería guarda sus productos.
- Taberna guarda comida/bebidas/ingredientes correspondientes.
- Posada gestiona sus recursos/servicios propios.
- Otros negocios seguirán la misma lógica.

El inventario general de ciudad puede quedar para recursos realmente globales, materiales comunes, equipamiento de trabajadores u otros elementos compartidos; no será el depósito universal de mercancía de todas las tiendas.

## 5. Interfaz de cada tienda

Cada negocio deberá pasar a una vista más ordenada, con **pestañas o secciones internas**.

Para Herrería, estructura conceptual:

- **Venta / Exhibición**
- **Fabricación**
- **Almacén**
- **Libro**
- **Mejoras** (puede ser pestaña propia o sección según espacio)

Objetivo: que el jugador no tenga que recorrer una pantalla vertical enorme y que cada función tenga un lugar claro.

### Venta / Exhibición

Muestra:

- espacios disponibles;
- piezas puestas a la venta;
- precio;
- calidad/características relevantes;
- visitante actual si corresponde.

### Fabricación

Muestra recetas, requisitos, trabajador, resistencia, progreso y probabilidades de calidad.

### Almacén

Muestra productos del negocio no expuestos.

Las piezas recién fabricadas llegan aquí en estado pendiente y el jugador decide precio y destino.

### Libro

Historial de visitas, compras, no compras, pedidos y sucesos relevantes.

Mantiene la regla ya aprobada de compactación/autolimpieza para evitar acumulación infinita.

## 6. Pedidos de trabajadores como misiones

En el futuro los propios trabajadores podrán generar **pedidos personales o profesionales**.

Ejemplo:

> Borin necesita un Cuerno de Minotauro para crear/mejorar una herramienta especial.

Esto transforma la progresión de los trabajadores y negocios en misiones conectadas con el mundo.

Un pedido puede requerir:

- materiales comunes;
- drops de criaturas;
- objetos de élite;
- drops de jefes;
- componentes de otros oficios.

No todos estos materiales deben conseguirse de la misma forma.

## 7. Sede del Gremio — mercado de drops de aventureros

Se propone una futura **Sede del Gremio** como punto donde la ciudad interactúa con el botín que traen los aventureros.

### Órdenes de compra del jugador

El jugador podrá publicar qué materiales desea comprar.

Ejemplo:

> Comprar: Colmillo de lobo  
> Cantidad deseada: 4  
> Precio ofrecido por unidad: 18 monedas

Los aventureros NPC llegan a la ciudad con su propio inventario de objetos obtenidos durante sus aventuras.

Al visitar la Sede del Gremio revisan las órdenes de compra y usan una **IA de venta**, equivalente conceptual a la IA de compra de las tiendas.

La IA puede considerar:

- si poseen el objeto;
- cantidad disponible;
- precio ofrecido;
- valor que el NPC atribuye al material;
- necesidad de conservarlo;
- urgencia de conseguir monedas;
- personalidad;
- rareza del objeto.

Así el NPC no es sólo comprador: también participa activamente de la economía como proveedor.

## 8. Botín de criaturas normales

Muchos materiales de criaturas normales deberían circular principalmente mediante aventureros.

Flujo conceptual:

aventurero derrota criaturas → obtiene drops → conserva un inventario → visita ciudades → detecta órdenes de compra → decide si vende.

Esto permite que el jugador obtenga recursos de combate sin controlar directamente a un héroe.

## 9. Objetos raros y drops de jefes — Encargos

Los materiales muy raros, especialmente drops de jefes, no deberían depender sólo de esperar que aparezcan casualmente en el mercado.

El jugador podrá crear un **Encargo de aventura**.

Ejemplo conceptual:

### Cuerno de Minotauro

- Fuente: Jefe Minotauro.
- Dificultad del jefe: Media.
- Chance base de obtener el cuerno: X%.
- Aventureros recomendados: 3.
- Nivel promedio recomendado: 3–5.
- Posibles requisitos adicionales: roles, equipo, curación, preparación.
- Recompensa ofrecida por el jugador: TBD.
- Tiempo estimado: TBD.

El jugador contrata/forma un grupo de NPC aventureros para intentar conseguirlo.

El resultado depende del poder real del grupo y de la dificultad del objetivo.

## 10. Poder de aventureros para resolver encargos

No debe evaluarse únicamente por nivel.

El futuro **Poder de aventura** debería considerar, como mínimo:

- nivel;
- arma/equipamiento;
- calidad del equipo;
- rol/clase;
- estado actual;
- composición del grupo;
- posible sinergia entre roles;
- dificultad específica del enemigo.

Esto permitirá que dos grupos del mismo nivel promedio tengan resultados distintos.

Para una primera implementación no es necesario simular un combate completo: se puede resolver mediante un modelo abstracto de poder, riesgo y probabilidad, manteniendo la puerta abierta a sistemas más profundos.

## 11. Dos economías complementarias de NPC

Queda fijada esta distinción:

### NPC compra en tiendas

NPC → mira Exhibición → IA de compra → compra o se retira.

La decisión depende de necesidad, utilidad, mejora de equipo, precio, dinero, personalidad y demás factores.

### NPC vende en Sede del Gremio

NPC → llega con drops → revisa órdenes de compra → IA de venta → vende o conserva.

La decisión depende de inventario, valoración propia, precio ofrecido, rareza, necesidad de dinero y personalidad.

Las dos direcciones deben usar la misma filosofía: **el NPC decide según su estado y objetivos, no por un porcentaje aislado**.

## 12. Distinción entre venta común, pedido y encargo

- **Venta común**: frecuente. El NPC decide si compra algo ya exhibido.
- **Pedido de NPC**: raro. Un aventurero solicita algo concreto a la ciudad.
- **Orden de compra del jugador**: el jugador anuncia materiales que desea adquirir de aventureros.
- **Encargo de aventura**: el jugador contrata aventureros para buscar un recurso difícil o enfrentarse a un objetivo concreto.
- **Pedido de trabajador**: misión interna originada por Borin, Mara, Eldon, Nara u otros trabajadores.

Estos sistemas deben complementarse, no mezclarse en una sola mecánica.

## 13. Orden sugerido de implementación

Sin comprometer todavía versión exacta:

1. Reorganizar Herrería con pestañas.
2. Mover productos de Herrería a stock propio del negocio.
3. Crear estado pendiente → almacenar → poner en venta.
4. Añadir capacidad de Almacén y Exhibición por nivel.
5. Adaptar la compra NPC al nuevo stock.
6. Extender el mismo patrón a otros negocios.
7. Crear Sede del Gremio.
8. Inventario persistente de aventureros + IA de venta.
9. Órdenes de compra del jugador.
10. Pedidos raros.
11. Pedidos de trabajadores.
12. Encargos contra criaturas/jefes y cálculo de poder de grupo.



## 14. Encargos de aventura — formación automática y recompensa por aventurero

Este apartado reemplaza la propuesta anterior de confirmación manual del grupo.

### Principio

El Encargo **no debe bloquear el juego esperando que el jugador acepte postulantes**.

El jugador publica el Encargo y continúa jugando normalmente.

Los aventureros evalúan el Encargo por IA y, cuando existe una combinación de aventureros que:

- acepta voluntariamente la misión;
- cumple el tamaño permitido del grupo;
- supera el umbral mínimo de éxito;
- dispone de una recompensa válida para todos los participantes;

el sistema forma el grupo y lo envía **automáticamente**.

El jugador no necesita confirmar la salida.

### Por qué se adopta el envío automático

Para el jugador el Encargo no tiene coste final si no se cumple el objetivo.

La recompensa queda reservada mientras la misión está comprometida, pero:

- si el grupo falla;
- si derrota al objetivo pero no obtiene el objeto pedido;
- o si el Encargo no puede completarse;

la recompensa no se entrega y vuelve a estar disponible.

Por eso no se considera necesario frenar el flujo de juego con una confirmación manual.

Los aventureros, en cambio, sí evalúan su propio riesgo antes de aceptar.

## 15. IA de aceptación y formación del grupo

Cada aventurero analiza:

- recompensa ofrecida;
- utilidad personal de los objetos;
- dinero ofrecido;
- dificultad;
- riesgo estimado;
- nivel;
- equipamiento;
- calidad de su equipo;
- rol;
- estado actual;
- personalidad;
- compatibilidad con otros aventureros disponibles.

Si el NPC considera atractivo el Encargo, queda disponible para formar grupo.

El sistema busca combinaciones válidas entre aventureros interesados y calcula una probabilidad estimada de éxito.

Cuando una combinación entra en el **rango de éxito aceptable**, el grupo parte automáticamente.

El umbral exacto no queda fijado todavía; se balanceará con pruebas.

El Encargo puede permanecer publicado en segundo plano todo el tiempo necesario sin bloquear otras actividades de la ciudad.

## 16. Recompensa — siempre expresada por aventurero

La recompensa indicada en un Encargo se interpreta **por participante**, no como un premio total a repartir.

Ejemplo:

> Recompensa: 200 monedas + 1 Espada de hierro Buena

Si participan 3 aventureros, el coste real de una misión cumplida es:

- 600 monedas;
- 3 Espadas de hierro Buenas.

Si el grupo finalmente se forma con 2 aventureros, cada uno recibe:

- 200 monedas;
- 1 Espada de hierro Buena.

El coste final será:

- 400 monedas;
- 2 Espadas de hierro Buenas.

### Reserva de recompensa

Al publicar un Encargo debe existir capacidad real para pagar a todos los posibles participantes.

Si el Encargo admite hasta 3 aventureros y promete:

> 200 monedas + 1 Espada Buena por aventurero

deben reservarse inicialmente:

- 600 monedas;
- 3 Espadas Buenas.

Cuando el grupo queda formado con menos miembros, el excedente se libera inmediatamente.

Ejemplo: si parten 2, se liberan:

- 200 monedas;
- 1 Espada Buena.

La recompensa correspondiente al grupo que partió permanece bloqueada hasta resolver el Encargo.

## 17. Recompensas con distintos objetos

Una lista como:

> Espada Buena + Daga Buena + Martillo de batalla

es ambigua si no definimos qué recibe cada aventurero.

Para evitarlo, el sistema distinguirá dos tipos de recompensa de objetos.

### A. Objeto fijo por aventurero

Todos reciben el mismo objeto.

Ejemplo:

> 200 monedas + 1 Espada Buena por aventurero

Requiere una espada por cada integrante.

### B. Elección de 1 objeto de un conjunto de recompensa

El jugador ofrece un **conjunto de opciones**.

Ejemplo:

> 200 monedas + elegir 1 de:
> - Espada de hierro Buena
> - Daga Buena
> - Martillo de batalla Bueno

Cada aventurero analiza cuál de esos objetos le resulta más útil.

Antes de formar el grupo, el sistema comprueba que puede asignarse **un objeto aceptable a cada integrante sin duplicar una pieza inexistente**.

Ejemplo:

- Guerrero → Espada
- Pícaro → Daga
- Bárbaro → Martillo

Si dos aventureros desean la misma espada y sólo hay una, uno puede elegir su segunda mejor opción si sigue considerando atractiva la recompensa.

Si no existe una asignación válida para todos, ese grupo no se forma.

### Paquetes múltiples

Más adelante podrá existir un paquete explícito del tipo:

> 200 monedas + Espada + Poción

En ese caso queda claro que **cada aventurero recibe todos los elementos indicados**.

No se interpretará una simple lista de armas distintas como que cada aventurero recibe todas.

## 18. Condición de pago del Encargo

La recompensa se entrega **únicamente si se cumple el objetivo exacto publicado**.

Ejemplo:

> Objetivo: entregar 1 Cuerno de Minotauro

No alcanza con matar al Minotauro.

Si el grupo derrota al jefe pero el Cuerno no aparece:

- el Encargo se considera no cumplido;
- los aventureros no reciben la recompensa del Encargo;
- la recompensa reservada vuelve a la ciudad.

Por lo tanto se separan claramente:

1. **Probabilidad de derrotar al objetivo.**
2. **Probabilidad de conseguir el objeto pedido.**

Ejemplo:

> Éxito de combate estimado: 78%  
> Drop de Cuerno al derrotarlo: 35%

La probabilidad real de completar el Encargo depende de ambas.

## 19. Intercambio al completar

Si el grupo obtiene el objeto solicitado:

1. los aventureros regresan con el botín;
2. el objeto comprometido se transfiere a la ciudad;
3. la recompensa reservada se transfiere a cada aventurero;
4. cada NPC recibe su dinero y el objeto de recompensa que le corresponde;
5. el Encargo queda completado;
6. el resultado queda registrado en la Sede del Gremio.

El intercambio debe resolverse como una operación única: no puede entregarse el objeto a la ciudad sin pagar a los aventureros ni pagar la recompensa sin recibir el objetivo.

## 20. Botín adicional

El Encargo obliga a entregar únicamente el objeto solicitado.

Otros drops conseguidos durante la aventura pertenecen inicialmente a los aventureros.

Esos objetos pueden:

- quedarse en su inventario;
- aparecer posteriormente en la Sede del Gremio;
- ser vendidos mediante su IA de venta;
- utilizarse por el propio NPC.

Esto conecta Encargos y economía sin regalar automáticamente todo el botín al jugador.

## 21. Quién aporta la recompensa

Cuando el Encargo nace de un trabajador, el origen narrativo puede ser ese trabajador.

Ejemplo:

> Borin necesita un Cuerno de Minotauro.  
> Recompensa por aventurero: 200 monedas + 1 Espada de hierro Buena.

Mientras los trabajadores no tengan patrimonio propio completo, la recompensa se reserva desde:

- fondos de la ciudad;
- stock del negocio correspondiente;
- objetos elegidos por el jugador.

Más adelante un trabajador podrá aportar bienes propios si el sistema económico lo permite.
