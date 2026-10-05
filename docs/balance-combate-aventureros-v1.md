# Balance técnico v1 — Aventureros, combate y ritmo Nv.1–3

Estado: **BASE DE IMPLEMENTACIÓN / BALANCE EN PRUEBA**  
Fecha: 2026-10-05

Este documento traduce el diseño aprobado a números iniciales para construir el primer simulador automático.  
Ningún valor es definitivo: la regla será **simular → medir → detectar desvío → proponer ajuste → volver a simular**.

---

## 1. Objetivos de ritmo

El balance no busca únicamente “ganar combates”. Debe alimentar la economía de la ciudad.

Objetivos iniciales:

- salida fácil: ~5–12 % de desgaste de Vida;
- salida normal: ~15–25 %;
- salida difícil: ~30–45 %;
- Boss ganado por grupo apropiado: ~40–60 % de desgaste total esperado;
- una clase con Maná debería gastar aproximadamente 25–40 % de su reserva en una actividad normal donde use habilidades;
- un aventurero promedio debería poder realizar 2–3 actividades normales antes de preferir descanso/recuperación;
- un aventurero debería reinvertir aproximadamente 20–30 % de sus ingresos a medio plazo entre comida, descanso, reparaciones, servicios y mejoras;
- mejorar equipo debe notarse con claridad, pero nunca volver autosuficiente al aventurero.

El objetivo de Ciudad Nv.1–3 continúa alrededor de una hora de actividad.

---

## 2. Estadísticas base

Las estadísticas principales son:

- Vida;
- Ataque;
- Defensa;
- Iniciativa;
- Maná.

Evasión es una propiedad derivada, no una sexta estadística.

### 2.1. Valores base Nv.1

| Clase | Vida | Ataque | Defensa | Iniciativa | Maná | Evasión base |
|---|---:|---:|---:|---:|---:|---:|
| Guerrero | 120 | 10 | 7 | 4 | 18 | 2 % |
| Explorador | 90 | 14 | 3 | 8 | 32 | 14 % |
| Sanador | 80 | 9 | 5 | 5 | 58 | 3 % |
| Mago | 72 | 16 | 3 | 6 | 64 | 3 % |

El Mago no es fundador: su primera llegada está garantizada al alcanzar Ciudad Nv.2.

### 2.2. Lectura de estos valores

**Guerrero**
- sobrevive por Vida alta;
- su Defensa base es sólo moderada;
- un escudo y una armadura siguen siendo compras atractivas.

**Explorador**
- mata rápido;
- si un ataque lo alcanza, su baja Defensa importa;
- sobrevive por Iniciativa y Evasión.

**Sanador**
- no tiene gran Vida;
- puede sostener al grupo usando Maná;
- si agota Maná pierde gran parte de su valor de soporte.

**Mago**
- es el mayor daño mágico;
- muy frágil;
- depende de Maná y de que el grupo lo proteja.

---

## 3. Crecimiento temprano por nivel

No se usará un crecimiento explosivo.

Para las primeras simulaciones:

### Guerrero
Por nivel ganado:
- +6 Vida;
- +1 Ataque cada 2 niveles;
- +1 Defensa cada 3 niveles;
- +1 Maná.

### Explorador
Por nivel:
- +4 Vida;
- +1 Ataque;
- +1 Defensa cada 4 niveles;
- +2 Maná;
- +0,5 puntos porcentuales de Evasión cada 2 niveles.

### Sanador
Por nivel:
- +3 Vida;
- +1 Ataque cada 2 niveles;
- +1 Defensa cada 3 niveles;
- +4 Maná.

### Mago
Por nivel:
- +3 Vida;
- +1 Ataque;
- +1 Defensa cada 4 niveles;
- +4 Maná.

El crecimiento definitivo a Nv.100 se diseñará después de comprobar que Nv.1–3 funciona.

---

## 4. Equipo fundador

Los aventureros llegan con equipo personal rudimentario para poder actuar desde el minuto cero.

Este equipo:

- tiene estadísticas inferiores a las piezas comerciales;
- pertenece al aventurero;
- no puede transferirse a la ciudad ni venderse para explotar la fundación;
- puede desgastarse;
- genera necesidad natural de reemplazo/mejora.

Referencia:

**Guerrero**
- arma gastada: +4 Ataque;
- protección simple: +1 Defensa.

**Explorador**
- arco o dagas gastadas: +4 Ataque;
- ropa de viaje: +1 Defensa;
- +2 % Evasión derivada.

**Sanador**
- bastón de novicio: +3 Ataque mágico, +6 Maná;
- ropa simple: +1 Defensa.

**Mago**
- foco de aprendiz: +3 Ataque mágico, +6 Maná;
- túnica simple: sin bonificación defensiva relevante.

---

## 5. Primeras mejoras comerciales — referencias

Estos valores sirven para empezar a medir deseo de compra.

- **Daga de hierro:** +6 Ataque físico; compatible con Explorador y futuros perfiles.
- **Arco de caza:** +7 Ataque físico a distancia; +1 Iniciativa.
- **Bastón sencillo:** +4 Ataque mágico; +12 Maná.
- **Escudo de madera:** +3 Defensa; -1 Iniciativa.
- **Chaleco/Protección ligera de cuero:** +3 Defensa.
- **Guantes de cuero:** +1 Defensa.
- **Botas de cuero:** +1 Iniciativa.

Los materiales de especie modifican estos resultados:

- Lobo → Iniciativa/rapidez.
- Lobo Alfa → versión superior de la misma mejora.
- Jabalí → Defensa/resistencia.
- Gran Jabalí → mejora defensiva superior + posible propiedad especial.

La calidad de fabricación se aplica después del material de origen.

---

## 6. Habilidades básicas y Maná

Las habilidades no se ejecutan de manera persistente. Sus datos alimentan la resolución probabilística.

### Guerrero

**Guardia**
- coste: 4 Maná;
- reduce aproximadamente 12 % el daño/riesgo esperado del grupo durante una ventana abstracta.

**Interponerse**
- coste: 5 Maná;
- reduce aproximadamente 20 % el riesgo de incapacitación del aliado más vulnerable y desplaza parte del riesgo hacia el Guerrero.

**Golpe de escudo**
- coste: 3 Maná;
- requiere escudo;
- daño físico moderado;
- 15 % base de aplicar Aturdido.

### Explorador

**Ataque certero**
- coste: 6 Maná;
- +25 % contribución ofensiva de esa acción abstracta.

**Paso evasivo**
- coste: 5 Maná;
- +12 puntos porcentuales de Evasión durante una ventana breve.

**Marcar presa**
- coste: 6 Maná;
- +15 % daño esperado propio contra un objetivo durante el encuentro.

### Sanador

**Curación**
- coste: 10 Maná;
- recupera aproximadamente 18–22 Vida equivalente en Nv.1.

**Purificar**
- coste: 8 Maná;
- elimina o reduce un Estado negativo compatible.

**Luz sagrada**
- coste: 8 Maná;
- daño mágico moderado;
- +35 % daño esperado contra Tipo No Muerto como primera referencia.

### Mago

**Proyectil arcano**
- coste: 8 Maná;
- daño mágico alto y estable.

**Chispa ígnea**
- coste: 10 Maná;
- daño mágico moderado-alto;
- 25 % base de aplicar Quemadura.

**Descarga**
- coste: 10 Maná;
- daño mágico moderado;
- 18 % base de aplicar Parálisis.

---

## 7. Estados iniciales

Los Estados modifican el resultado esperado. No requieren almacenar rondas de combate reales.

### Afinidad potencial de Estados por clase

Los Estados **no pertenecen todos al Mago**. Cada clase tiene afinidad natural con determinados Estados, pero eso **no significa que un aventurero Nv.1 empiece con habilidades capaces de aplicarlos**.

| Clase | Estados de su línea potencial |
|---|---|
| **Guerrero** | Herida, Aturdido |
| **Explorador** | Herida, Veneno, Parálisis |
| **Sanador** | Sin Estado ofensivo base; cura/limpia Estados |
| **Mago** | Quemadura, Parálisis |

El desbloqueo real se repartirá a lo largo de los niveles y dependerá de las habilidades aprendidas.

Lectura de diseño:

- **Herida** representa daño físico traumático: Guerrero y Explorador.
- **Aturdido** representa impacto/control físico fuerte: principalmente Guerrero.
- **Veneno** representa preparación, caza, sustancias y tácticas: principalmente Explorador.
- **Parálisis** puede surgir por táctica/trampa del Explorador o por Rayo del Mago.
- **Quemadura** pertenece inicialmente al daño elemental de Fuego del Mago.
- **Sanador** se especializa en remover/mitigar Estados y sostener al grupo, no en repartir Estados ofensivos.

Estas afinidades son la base de clase, no una lista de habilidades iniciales ni una prohibición eterna. Equipamiento, materiales especiales y futuras especializaciones pueden abrir otras formas de aplicar Estados cuando exista una razón de juego.

**Regla para el simulador Nv.1:** no asumir ningún Estado ofensivo de clase como desbloqueado hasta definir la progresión de habilidades por nivel.


### Herida
- +8 % de desgaste esperado mientras influye en el encuentro;
- +15 % relativo al riesgo de regresar con lesión física persistente.

### Quemadura
- añade aproximadamente 8 % de Vida máxima equivalente como daño esperado total si no se limpia;
- efecto de Fuego.

### Veneno
- añade aproximadamente 6 % de Vida máxima equivalente como daño esperado;
- -25 % eficacia de curaciones mientras esté activo.

### Parálisis
- -25 % Iniciativa efectiva durante su ventana;
- -20 % contribución ofensiva durante esa misma ventana.

### Aturdido
- representa la pérdida de una acción/ventana importante;
- aproximadamente -30 % contribución durante esa ventana;
- debe tener protección anti-encadenamiento en el simulador.

Los valores son semillas de simulación.

---

## 8. Tipos de enemigo

Propiedad distinta de Rareza.

Iniciales:

- **Animal**
- **Humanoide**
- **No Muerto**
- **No Vivo**

Primer catálogo:

- Lobo → Animal / Común
- Jabalí → Animal / Común
- Lobo Alfa → Animal / Raro
- Gran Jabalí → Animal / Boss
- Bandido → Humanoide
- Goblin → Humanoide
- Esqueleto → No Muerto
- Zombi → No Muerto
- Vampiro → No Muerto
- Golem → No Vivo
- Torreta → No Vivo
- Invocación elemental → No Vivo

---

## 9. Valores absolutos iniciales de enemigos Nv.1–3

Estos números se fijan únicamente para iniciar el simulador.

| Enemigo | Vida | Ataque | Defensa | Iniciativa |
|---|---:|---:|---:|---:|
| Lobo | 34 | 9 | 2 | 7 |
| Jabalí | 55 | 12 | 5 | 3 |
| Lobo Alfa | 95 | 15 | 5 | 8 |
| Gran Jabalí | 280 | 21 | 10 | 4 |

Se mantienen todas las habilidades, pasivas, drops y reglas territoriales documentadas en la Biblia de diseño.

---

## 10. XP y ritmo

Primera curva:

- Nv.1 → 2: 60 XP.
- Nv.2 → 3: 100 XP.
- Nv.3 → 4: 160 XP.

XP base de enemigos:

- Lobo: 10.
- Jabalí: 14.
- Lobo Alfa: 38.
- Gran Jabalí: 90 total.

La XP de un encuentro se reparte entre participantes.

### 10.1. Caer a 0

- incapacitación;
- pierde 20 % de la XP necesaria para el siguiente nivel;
- la pérdida nunca baja un nivel ya obtenido;
- queda tiempo de recuperación;
- puede generar necesidad de Mesón/curación/equipo.

---

## 11. Crecimiento de población de aventureros

Para el primer tramo:

- Ciudad Nv.1 → 3 fundadores: Guerrero, Explorador, Sanador.
- Ciudad Nv.2 → llega Mago → 4.
- Ciudad Nv.3 → llega un quinto aventurero generado de forma controlada.

Mesón Nv.1 soporta al menos 5 residentes.

El progreso de ciudad desbloquea cupos; el Mesón controla capacidad/atractivo.

---

## 12. Reglas del motor de resolución

El juego final no ejecuta peleas persistentes.

Cuando una actividad necesita resultado:

1. toma una instantánea del grupo y enemigos;
2. calcula capacidad ofensiva, supervivencia, Maná, estados, equipo, Tipo y sinergias;
3. realiza una resolución probabilística breve;
4. genera consecuencias persistentes;
5. descarta el detalle intermedio.

Persisten únicamente datos relevantes:

- victoria/fracaso;
- Vida resultante;
- Maná consumido si corresponde;
- heridas/estados persistentes;
- XP;
- drops;
- duración/retorno;
- daño de equipo;
- otros cambios útiles.

No se almacena un log golpe por golpe.

---

## 13. Simulador automático — métricas obligatorias

Cada lote de simulación debe informar:

### Progresión
- tiempo medio/mediana a Ciudad Nv.2 y Nv.3;
- nivel medio de aventureros al alcanzar cada nivel de ciudad;
- distribución de XP;
- cantidad de pérdidas de XP por 0 Vida.

### Combate
- tasa de victoria por encuentro;
- desgaste medio de Vida;
- consumo de Maná;
- incapacitación;
- heridas;
- efecto real de equipo;
- valor de cada clase en grupos.

### Economía
- ingreso medio por aventurero;
- gasto medio;
- porcentaje reinvertido en ciudad;
- compras por categoría;
- uso de Mesón;
- reparaciones;
- acumulación excesiva de monedas;
- falta crónica de dinero.

### Ciudad
- producción realizada;
- materiales faltantes;
- tiempo ocioso de trabajadores;
- construcción de Textilería;
- uso de Herrería/Carpintería/Mesón/Sede;
- misión publicada/aceptada/completada.

### Mundo
- Presencia media de Lobos/Jabalíes;
- frecuencia de Lobo Alfa;
- frecuencia de Gran Jabalí;
- uso de escoltas;
- ataques/estados críticos.

---

## 14. Perfiles de simulación

No balancear sólo para un jugador perfecto.

Ejecutar como mínimo:

- **Eficiente:** gestiona bien recursos y recompensas.
- **Normal:** decisiones razonables con pequeñas ineficiencias.
- **Conservador:** prioriza seguridad y ahorra.
- **Agresivo:** toma más riesgos y gasta más en progreso.
- **Mala gestión:** prueba de resistencia del sistema, sin buscar optimización.

---

## 15. Criterios de alerta

Ejemplos de problemas a detectar automáticamente:

- aventureros llegan a Nv.3 demasiado antes que la ciudad;
- nadie compra escudos;
- Sanador casi nunca necesita descansar;
- Mago agota Maná después de cada actividad;
- Explorador cae a 0 con demasiada frecuencia;
- Boss requiere material que sólo entrega el propio Boss;
- ciudad queda sin dinero de forma sistemática;
- aventureros acumulan fortunas sin consumir servicios;
- Textilería se construye demasiado tarde;
- Lobo Alfa/Boss aparecen demasiado poco o demasiado seguido;
- una clase domina todas las composiciones.

Cada alerta debe producir:

1. dato observado;
2. causa probable;
3. propuesta de ajuste;
4. nueva corrida comparativa.

---

## 16. Regla de validación

Los informes deben distinguir:

- **Prueba automática:** simulador.
- **Prueba funcional:** código ejecutado en navegador/entorno de desarrollo.
- **Prueba real Android:** validación manual de Adrián.

Nunca presentar una prueba automática como si fuera validación real de dispositivo.

