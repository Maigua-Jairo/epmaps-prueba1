# Registro de decisiones de arquitectura (ADR)

**Proyecto:** EPMAPS Lecturas — registro de lecturas de medidores de agua en campo
**Estudiante:** Jairo Efrain Maigua Aimacaña
**Repositorio:** (https://github.com/Maigua-Jairo/epmaps-prueba1.git)

> Los textos entre corchetes son espacios para completar. Las preguntas en *cursiva* son guías para
> pensar la decisión; bórralas cuando escribas tu respuesta.

---

## Índice

| ADR | Decisión | Requisitos | Estado |
|---|---|---|---|
| [ADR-001](#adr-001) | Usar Expo Router para la navegación y separar las rutas con y sin sesión | R1, R8 | Aceptado |
| [ADR-002](#adr-002) | Guardar la sesión del técnico con `expo-secure-store` | R1 | Aceptado |
| [ADR-003](#adr-003) | Usar `expo-sqlite` para los datos locales del teléfono | R3, R4, R8, R9, R10 | Aceptado |
| [ADR-004](#adr-004) | Consultar la oficina con `fetch` nativo y reutilizar la caché de SQLite durante la jornada | R2, R3, R4 | Aceptado |
| [ADR-005](#adr-005) | Compartir el estado entre pantallas con React Context y un formulario único en el layout del registro | R5, R6, R8, R9 | Aceptado |
| [ADR-006](#adr-006) | Validar el formulario con Zod y el código del medidor con una expresión regular | R2, R5, R6, R7 | Aceptado |
| [ADR-007](#adr-007) | Manejar el formulario de lectura con `react-hook-form` | R5, R6, R7 | Aceptado |
| [ADR-008](#adr-008) | Capturar la foto con `expo-image-picker` y conservarla con `expo-file-system` | R7 | Aceptado |
| [ADR-009](#adr-009) | Detectar la conexión con NetInfo y enviar con una cola idempotente por clave medidor-mes | R4, R9, R10 | Aceptado |
| [ADR-010](#adr-010) | Usar NativeWind para los estilos | Diseño no genérico (sanción del enunciado) | Aceptado |

---

## Control de dependencias

Regla 2: cada dependencia de `package.json` debe estar justificada en algún ADR, salvo las que crea
Expo al generar el proyecto. Marca en qué ADR justificas cada una.

| Dependencia | ¿La trae la plantilla de Expo SDK 57? | Justificada en |
|---|---|---|
| `expo-secure-store` | No | [ADR-002](#adr-002) |
| `expo-sqlite` | No | [ADR-003](#adr-003) |
| `@react-native-community/netinfo` | No | [ADR-009](#adr-009) |
| `expo-image-picker` | No | [ADR-008](#adr-008) |
| `expo-file-system` | No | [ADR-008](#adr-008) |
| `zod` | No | [ADR-006](#adr-006) |
| `react-hook-form` | No | [ADR-007](#adr-007) |
| `@hookform/resolvers` | No | [ADR-007](#adr-007) (conecta `react-hook-form` con Zod) |
| `nativewind` | No | [ADR-010](#adr-010) |
| `tailwindcss` (dev) | No | [ADR-010](#adr-010) |
| `babel-preset-expo` | No (viene anidado dentro de `expo`) | [ADR-010](#adr-010) (NativeWind exige declararlo en `babel.config.js`) |
| `expo-font` | Sí | No requiere ADR |
| `react-dom` | Sí | No requiere ADR |
| `expo`, `expo-router`, `expo-constants`, `expo-linking`, `expo-splash-screen`, `expo-status-bar`, `react`, `react-native`, `react-native-reanimated`, `react-native-worklets`, `react-native-safe-area-context`, `react-native-screens`, `typescript`, `@types/react` | Sí | No requiere ADR |

---

<a id="adr-001"></a>

## ADR-001: Usar Expo-Router para la navegacion

**Estado:** Aceptado

**Fecha:** 28/10/2026

**Requisitos relacionados:** R8, indica que el registro de lecturas puede trabajar en varias pantallas

### Contexto

La aplicacion posee una pantalla de login, registro de lecturas realizadas, consulta de medidores. Asimismo, se tiene diversas pantallas para los registros de lectura.El proyecto, se basa en R8, que mencion una opcion para que el trabajador pueda continuar registrando una lectura en el caso de que cierre la aplicacion. La navegacion le permite conservar sus datos registrados sin necesidad de volver a ingresarlos


### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| Expo-Router | Viene incluido en la plantilla de Expo y no requiere agregar dependencias. Organiza las  | [Completar] |
| [Opción B] | [Completar] | [Completar] |
| [Opción C, opcional] | [Completar] | [Completar] |

### Decisión

[Completar]

### Consecuencias

- [Ganancia]
- [Desventaja o riesgo — obligatorio al menos uno]
- [Obligación que crea para el código]

### Verificación

- [Qué archivo revisar, qué prueba ejecutar o qué comportamiento observar en el teléfono]

### Uso de IA

[Qué le consultaste a la IA, qué propuso, qué aceptaste o descartaste y por qué]

---

<a id="adr-002"></a>

## ADR-002: [La decisión sobre dónde guardar la sesión del técnico, escrita como afirmación]

**Estado:** [Completar]

**Fecha:** [Completar]

**Requisitos relacionados:** [Completar]

### Contexto

[Completar]

*¿Qué datos de la sesión deben sobrevivir al cierre de la app? ¿Son datos sensibles? ¿Se guarda la
clave o no? ¿Qué pasa al cerrar sesión?*

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| [Opción A] | [Completar] | [Completar] |
| [Opción B] | [Completar] | [Completar] |

### Decisión

[Completar]

### Consecuencias

- [Completar]
- [Desventaja o riesgo]

### Verificación

- [Completar]

### Uso de IA

[Completar]

---

<a id="adr-003"></a>

## ADR-003: [La decisión sobre el almacenamiento local de los datos en el teléfono, escrita como afirmación]

> Tema obligatorio: *Almacenamiento local de los datos en el teléfono.*

**Estado:** [Completar]

**Fecha:** [Completar]

**Requisitos relacionados:** [Completar]

### Contexto

[Completar]

*¿Qué datos deben sobrevivir sin señal y al cierre de la app (medidores consultados, lecturas
pendientes, registro a medias)? ¿Qué consultas necesitas hacer sobre ellos (pendientes de envío,
mismo medidor en el mismo mes)? ¿Cómo se cambia la estructura de los datos entre versiones de la app?*

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| [Opción A] | [Completar] | [Completar] |
| [Opción B] | [Completar] | [Completar] |
| [Opción C, opcional] | [Completar] | [Completar] |

### Decisión

[Completar]

### Consecuencias

- [Completar]
- [Desventaja o riesgo]
- [Obligación que crea para el código]

### Verificación

- [Completar]

### Uso de IA

[Completar]

---

<a id="adr-004"></a>

## ADR-004: [La decisión sobre la comunicación con la oficina y la caché de consultas, escrita como afirmación]

> Tema obligatorio: *Comunicación con el sistema de la oficina y manejo de la caché de consultas.*

**Estado:** [Completar]

**Fecha:** [Completar]

**Requisitos relacionados:** [Completar]

### Contexto

[Completar]

*¿Qué hace la app si la petición se queda colgada por señal débil? ¿Cómo distingue "no hay señal" de
"el medidor no existe"? ¿Cuánto tiempo vale un dato en caché? ¿Qué devuelve MockAPI cuando no hay
resultados?*

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| [Opción A] | [Completar] | [Completar] |
| [Opción B] | [Completar] | [Completar] |

### Decisión

[Completar — incluye la regla de caché que elegiste]

### Consecuencias

- [Completar]
- [Desventaja o riesgo]

### Verificación

- [Completar]

### Uso de IA

[Completar]

---

<a id="adr-005"></a>

## ADR-005: [La decisión sobre el estado compartido entre pantallas del registro, escrita como afirmación]

> Tema obligatorio: *Estado compartido entre pantallas durante el registro de una lectura.*

**Estado:** [Completar]

**Fecha:** [Completar]

**Requisitos relacionados:** [Completar]

### Contexto

[Completar]

*El registro ocupa varias pantallas: ¿dónde viven los datos mientras el técnico avanza y retrocede?
¿Qué pasa si la app se cierra a mitad del registro (R8)? ¿Qué estado necesitan todas las pantallas
(conexión, pendientes, sesión)?*

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| [Opción A] | [Completar] | [Completar] |
| [Opción B] | [Completar] | [Completar] |
| [Opción C, opcional] | [Completar] | [Completar] |

### Decisión

[Completar]

### Consecuencias

- [Completar]
- [Desventaja o riesgo]

### Verificación

- [Completar]

### Uso de IA

[Completar]

---

<a id="adr-006"></a>

## ADR-006: [La decisión sobre la validación de datos, escrita como afirmación]

> Tema obligatorio: *Validación de los datos que ingresa el técnico y de los que llegan del sistema de
> la oficina.*

**Estado:** [Completar]

**Fecha:** [Completar]

**Requisitos relacionados:** [Completar]

### Contexto

[Completar]

*¿Qué reglas hay que validar (formato del código en R2, matriz de estados en R5, consumo anómalo en
R6, foto obligatoria en R7)? ¿Dónde se definen para no repetirlas en cada pantalla? ¿Qué se hace con
los datos que llegan de MockAPI?*

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| [Opción A] | [Completar] | [Completar] |
| [Opción B] | [Completar] | [Completar] |

### Decisión

[Completar]

### Consecuencias

- [Completar]
- [Desventaja o riesgo]

### Verificación

- [Completar]

### Uso de IA

[Completar]

---

<a id="adr-007"></a>

## ADR-007: [La decisión sobre el manejo de formularios, escrita como afirmación]

> Tema obligatorio: *Manejo de formularios.*

**Estado:** [Completar]

**Fecha:** [Completar]

**Requisitos relacionados:** [Completar]

### Contexto

[Completar]

*¿Cuántos campos tiene el registro y cuáles dependen de otros (el estado define qué se pide)? ¿Cómo
se muestran los errores por campo? ¿Cómo se validan solo los campos de cada paso? ¿El login usa la
misma solución o no, y por qué?*

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| [Opción A] | [Completar] | [Completar] |
| [Opción B] | [Completar] | [Completar] |

### Decisión

[Completar]

### Consecuencias

- [Completar]
- [Desventaja o riesgo]

### Verificación

- [Completar]

### Uso de IA

[Completar]

---

<a id="adr-008"></a>

## ADR-008: [La decisión sobre la captura y conservación de la foto, escrita como afirmación]

> Tema obligatorio: *Captura y conservación de la foto del medidor.*

**Estado:** [Completar]

**Fecha:** [Completar]

**Requisitos relacionados:** [Completar]

### Contexto

[Completar]

*¿Dónde deja la foto la cámara y por qué eso no basta para R7? ¿Qué pasa si el técnico niega el
permiso? ¿Qué pasa con la foto si se toma otra o se descarta el registro?*

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| [Opción A] | [Completar] | [Completar] |
| [Opción B] | [Completar] | [Completar] |

### Decisión

[Completar]

### Consecuencias

- [Completar]
- [Desventaja o riesgo]

### Verificación

- [Completar]

### Uso de IA

[Completar]

---

<a id="adr-009"></a>

## ADR-009: [La decisión sobre la detección de conexión y el envío de pendientes, escrita como afirmación]

> Tema obligatorio: *Detección de la conexión y envío de las lecturas pendientes.*

**Estado:** [Completar]

**Fecha:** [Completar]

**Requisitos relacionados:** [Completar]

### Contexto

[Completar]

*¿Cómo sabe la app que volvió la señal? ¿Qué pasa si la señal se corta después de que el envío llegó
a la oficina pero antes de recibir la respuesta? ¿Cómo se evita que dos envíos corran a la vez? ¿Cómo
se evita registrar dos veces el mismo medidor en el mes (R10)?*

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| [Opción A] | [Completar] | [Completar] |
| [Opción B] | [Completar] | [Completar] |

### Decisión

[Completar — incluye la regla que evita duplicados]

### Consecuencias

- [Completar]
- [Desventaja o riesgo]

### Verificación

- [Completar]

### Uso de IA

[Completar]

---

<a id="adr-010"></a>

## ADR-010: [La decisión sobre los estilos y el diseño visual, escrita como afirmación]

**Estado:** [Completar]

**Fecha:** [Completar]

**Requisitos relacionados:** [Completar — el diseño no corresponde a un R, pero el enunciado sanciona un
diseño genérico]

### Contexto

[Completar]

*¿Por qué el diseño importa en esta prueba? ¿Cómo se mantiene consistente entre pantallas (colores,
tipografía, espaciados)? ¿Qué dependencias extra exige la opción elegida?*

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| [Opción A] | [Completar] | [Completar] |
| [Opción B] | [Completar] | [Completar] |

### Decisión

[Completar]

### Consecuencias

- [Completar]
- [Desventaja o riesgo]

### Verificación

- [Completar]

### Uso de IA

[Completar]
