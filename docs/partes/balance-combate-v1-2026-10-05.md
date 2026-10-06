# Parte automático — Combat Balance v1

Fecha: 2026-10-05  
Herramienta: `tools/balance-sim.js`  
Semilla: `1989`  
Corridas: **5.000 por escenario / 40.000 resoluciones totales**  
Resultado técnico: **ejecución completa sin error de proceso**.

> Esta es una prueba automática del simulador de desarrollo. No es prueba funcional del juego ni validación Android.

## Nota de revisión

Este baseline fue generado antes de aclarar que las afinidades de Estado **no implican habilidades de Estado desbloqueadas en Nv.1**.

Por lo tanto, sus resultados se conservan como histórico técnico pero quedan **SUPERADOS para balance fino**. La siguiente corrida utilizará Nv.1 sin Estados ofensivos de clase desbloqueados y servirá como nueva referencia.

## Resultados

| Escenario | Victoria | Desgaste Vida | ≥1 incapacitado | Maná consumido |
|---|---:|---:|---:|---:|
| Guerrero Nv.1 vs Lobo | 100,0 % | 10,5 % | 0,0 % | 17,8 % |
| Explorador Nv.1 vs Lobo | 100,0 % | 7,7 % | 0,0 % | 37,7 % |
| Trío fundador vs 3 Lobos | 100,0 % | 10,9 % | 0,0 % | 19,2 % |
| Trío fundador vs 2 Jabalíes | 100,0 % | 11,5 % | 0,0 % | 21,8 % |
| Trío fundador vs Alfa + 2 Lobos | 100,0 % | 14,6 % | 0,0 % | 56,5 % |
| Trío fundador vs Gran Jabalí | 98,7 % | 56,6 % | 65,8 % | 84,2 % |
| Trío preparado vs Gran Jabalí | 100,0 % | 34,6 % | 6,2 % | 82,2 % |
| 4 clases básicas vs Gran Jabalí | 100,0 % | 27,7 % | 4,2 % | 75,2 % |

## Lectura inicial

### Comunes
Los encuentros comunes no producen incapacitación en esta primera batería.

- Un Lobo individual queda en rango de salida fácil.
- Tres Lobos contra el grupo fundador quedan todavía del lado fácil.
- Dos Jabalíes producen poco desgaste de Vida, aunque ya consumen más recursos del grupo.

No se aumenta daño inmediatamente porque el consumo de Maná también obliga a regresar a ciudad. El dato debe evaluarse junto con Mesón, tiempo de actividad y economía antes de endurecer los comunes.

### Lobo Alfa
El encuentro es seguro para el trío fundador pero exige **56,5 % del Maná total** en promedio.

Esto hace que el Raro tenga coste aunque no produzca bajas.

Primera decisión: **mantener valores hasta integrar recuperación/descanso**.

### Gran Jabalí
La diferencia entre entrar con equipo fundador y entrar preparado es muy marcada.

**Trío fundador**
- casi siempre logra vencer;
- paga un coste muy alto;
- 65,8 % de las simulaciones incluyen al menos una incapacitación.

**Trío preparado**
- 34,6 % de desgaste de Vida;
- 6,2 % con al menos una incapacitación;
- gran consumo de Maná.

Esto cumple la intención de que el Boss no exija materiales de sí mismo, pero castigue intentar enfrentarlo sin preparación.

### Grupo de cuatro
El Mago reduce bastante la duración del enfrentamiento. La composición completa es claramente más segura.

Esto confirma que antes de fijar tamaño máximo de grupos y balance definitivo debemos medir:
- tamaño de grupo permitido;
- coste/reparto de XP;
- recompensas;
- disponibilidad real de cuatro aventureros.

## Próxima capa del simulador

La siguiente versión debe dejar de probar sólo encuentros aislados y simular el **ciclo Nv.1–3**:

1. actividades;
2. regreso según Vida/Maná;
3. Mesón;
4. reparaciones;
5. compras;
6. misiones/recompensas;
7. XP y pérdidas por 0 Vida;
8. crecimiento de Ciudad;
9. llegada de Mago y quinto aventurero;
10. Presencia;
11. Raro/Boss;
12. construcción de Textilería.

Sólo con esa capa se deben hacer ajustes grandes de Vida/Defensa/Maná, porque son variables económicas además de variables de combate.

## Estado

**Combat Balance v1: funcional como herramienta inicial.**  
**Balance de juego: EN PRUEBA.**
