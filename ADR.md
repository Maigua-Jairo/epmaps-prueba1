# Registro de decisiones de arquitectura (ADR)

**Proyecto:** EPMAPS Lecturas — registro de lecturas de medidores de agua en campo
**Estudiante:** Jairo Efrain Maigua Aimacaña
**Repositorio:** <https://github.com/Maigua-Jairo/epmaps-prueba1.git>

---

## Índice

| ADR | Decisión | Requisitos | Estado |
|---|---|---|---|
| [ADR-001](#adr-001) | Usar Expo Router para la navegación y separar las rutas con y sin sesión | R1, R8 | Aceptado |
| [ADR-002](#adr-002) | Autenticar usuarios con Firebase Authentication y exigir correo verificado | R1 | Aceptado |
| [ADR-003](#adr-003) | Usar `expo-sqlite` para los datos locales del teléfono | R3, R4, R8, R9, R10 | Aceptado |
| [ADR-004](#adr-004) | Consultar la oficina con `fetch` nativo y reutilizar la caché de SQLite durante la jornada | R2, R3, R4 | Aceptado |
| [ADR-005](#adr-005) | Compartir el estado entre pantallas con React Context y un formulario único en el layout del registro | R5, R6, R8, R9 | Aceptado |
| [ADR-006](#adr-006) | Validar el formulario con Zod y el código del medidor con una expresión regular | R2, R5, R6, R7 | Aceptado |
| [ADR-007](#adr-007) | Manejar el formulario de lectura con `react-hook-form` | R5, R6, R7 | Aceptado |
| [ADR-008](#adr-008) | Capturar la foto con `expo-image-picker` y conservarla con `expo-file-system` | R7 | Aceptado |
| [ADR-009](#adr-009) | Detectar la conexión con NetInfo y enviar con una cola idempotente por clave medidor-mes | R4, R9, R10 | Aceptado |
| [ADR-010](#adr-010) | Usar UniWind para los estilos | Diseño no genérico (sanción del enunciado) | Aceptado |
| [ADR-011](#adr-011) | Mostrar fortaleza estimada de contraseña durante el registro | HU autenticación, Fase 1 | Aceptado |
| [ADR-012](#adr-012) | Permitir actualizar el nombre de perfil con Firebase Auth | HU autenticación, Fase 2 | Aceptado |

---

## Control de dependencias

Regla 2: cada dependencia de `package.json` debe estar justificada en algún ADR, salvo las que crea
Expo al generar el proyecto.

| Dependencia | ¿La trae la plantilla de Expo SDK 57? | Justificada en |
|---|---|---|
| `firebase` | No | [ADR-002](#adr-002) |
| `@react-native-async-storage/async-storage` | No | [ADR-002](#adr-002) (persistencia de Firebase Auth en React Native) |
| `expo-sqlite` | No | [ADR-003](#adr-003) |
| `@react-native-community/netinfo` | No | [ADR-009](#adr-009) |
| `expo-image-picker` | No | [ADR-008](#adr-008) |
| `expo-file-system` | No | [ADR-008](#adr-008) |
| `zod` | No | [ADR-006](#adr-006) |
| `react-hook-form` | No | [ADR-007](#adr-007) |
| `@hookform/resolvers` | No | [ADR-007](#adr-007) (conecta `react-hook-form` con Zod) |
| `uniwind` | No | [ADR-010](#adr-010) |
| `tailwindcss` (dev) | No | [ADR-010](#adr-010) |
| `babel-preset-expo` | No (viene anidado dentro de `expo`) | [ADR-010](#adr-010) (preset estándar de Expo) |
| `expo-font` | Sí | No requiere ADR |
| `react-dom` | Sí | No requiere ADR |
| `expo`, `expo-router`, `expo-constants`, `expo-linking`, `expo-splash-screen`, `expo-status-bar`, `react`, `react-native`, `react-native-reanimated`, `react-native-worklets`, `react-native-safe-area-context`, `react-native-screens`, `typescript`, `@types/react` | Sí | No requiere ADR |

---

<a id="adr-001"></a>

## ADR-001: Usar Expo Router para la navegación y separar las rutas con y sin sesión

**Estado:** Aceptado

**Fecha:** 28/10/2026

**Requisitos relacionados:** R1, el técnico solo ve las pantallas de trabajo si inició sesión; R8, el
registro de lecturas se trabaja en varias pantallas y se puede retomar.

### Contexto

La aplicación posee una pantalla de login, una de consulta de medidores y una de lecturas realizadas.
Asimismo, el registro de una lectura se divide en varias pantallas: estado del medidor, datos, foto y
confirmación. El proyecto se basa en R8, que menciona una opción para que el técnico pueda continuar
registrando una lectura en el caso de que cierre la aplicación; para eso la navegación debe poder
abrir directamente el paso donde quedó. Por R1, sin sesión el técnico solo debe ver el login, y con
sesión no debe poder volver al login con el botón de regresar.

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| Expo Router | Viene incluido en la plantilla de Expo y no requiere agregar dependencias. Organiza las carpetas siguiendo la ruta de navegación del técnico. Permite colocar componentes obligatorios, como la barra de conexión y lecturas pendientes (R9), en el layout raíz, asegurando que se muestren en todas las pantallas. Con `Stack.Protected` separa las rutas con y sin sesión (R1). | Tiene una sintaxis estricta; por ejemplo, si a los `_layout.tsx` no se les coloca el "_", las rutas se pueden romper o devolver pantallas en blanco. |
| React Navigation (configuración manual) | Control total sobre los estados de navegación y las animaciones de transición entre pantallas. Existe mucha documentación en internet para solventar errores con pestañas o botones. | Hay que escribir gran cantidad de archivos y código, definiendo los tipos de TypeScript de cada ruta a mano. Las rutas no se enlazan automáticamente con las carpetas, lo que deja una arquitectura más desorganizada. |

### Decisión

Se elige Expo Router porque ya viene incorporado con Expo, facilita el manejo de las pantallas del
registro de lectura y permite redirigir a los registros pendientes (R8). Las rutas viven en `src/app`:
el grupo `(auth)` contiene el login y el grupo `(dashboard)` las pantallas de trabajo, y cada grupo se
protege con `Stack.Protected` según exista o no una sesión (R1).

### Consecuencias

- No se agregan dependencias para la navegación.
- Los componentes que no son pantallas deben ir separados de la carpeta `src/app`, para que Expo Router
  no los tome como rutas.
- Si al abrir la aplicación se ejecuta la función de continuar con los registros pendientes antes de
  que el sistema cargue los datos, la pantalla se mostrará vacía; por eso el aviso de borrador no se
  dibuja hasta confirmar que existe un borrador.

### Verificación

- La carpeta `src/app` contiene solo layouts y pantallas.
- En el dispositivo, al hacer el gesto de regresar dentro del registro, la pantalla carga el paso
  anterior con los datos ya ingresados.
- Con la sesión abierta, el gesto de regresar no lleva al login.

### Uso de IA

Se le pidió a la IA comparar Expo Router frente a otras alternativas de navegación para una aplicación
de registro en varios pasos. La IA recomendó Expo Router, siendo la misma decisión que se tomó
anteriormente. Se aceptó la estructura planteada para separar los layouts globales, como la barra de
red requerida por los técnicos (R9).

---

<a id="adr-002"></a>

## ADR-002: Autenticar usuarios con Firebase Authentication y exigir correo verificado

**Estado:** Aceptado

**Fecha:** 28/10/2026

**Requisitos relacionados:** R1, el usuario inicia sesión con correo y contraseña, mantiene la sesión
hasta cerrarla y verifica el correo antes de acceder al registro de lecturas.

### Contexto

La autenticación debe aceptar correos de cualquier proveedor, permitir crear cuentas y recuperar la
contraseña, y evitar el acceso a la app antes de verificar el correo. La sesión debe persistir al
cerrar y volver a abrir la app. El registro local necesita un identificador estable para asociar
lecturas y borradores al usuario autenticado; Firebase UID cumple esa función sin almacenar la clave
en la aplicación.

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| Firebase Authentication (SDK JavaScript) | Resuelve registro, inicio, verificación y recuperación por correo; su persistencia para React Native permite restaurar la sesión. Funciona con Expo Go. | Requiere configurar el proyecto y proveedor en Firebase. La app móvil no puede certificar por sí sola que una cuenta pertenece a un técnico autorizado. |
| Autenticación local propia | No depende de un proveedor externo. | Exige mantener credenciales y validaciones propias y no aporta verificación de correo ni recuperación segura. |
| React Native Firebase | Ofrece integración nativa con Firebase. | Requiere una build de desarrollo y configuración nativa, innecesaria para este flujo del taller. |

### Decisión

Se elige Firebase Authentication con el SDK JavaScript. La app usa correo/contraseña; al registrarse,
guarda `displayName`, envía `sendEmailVerification` y cierra la sesión. Un usuario con
`emailVerified === false` no entra a las rutas protegidas. La recuperación usa `sendPasswordResetEmail`.
La persistencia de autenticación se configura con
`getReactNativePersistence(AsyncStorage)` de `@react-native-async-storage/async-storage`; la versión
de AsyncStorage debe coincidir con la incluida en el SDK de Expo para que Firebase pueda acceder al
almacenamiento nativo. Las lecturas/borradores locales se particionan por Firebase UID.

### Consecuencias

- La sesión persiste al reiniciar la app y se elimina al cerrar sesión.
- Firebase configura y administra la persistencia; la contraseña no se guarda en el código ni en SQLite.
- El UID se usa como identificador del usuario local para las lecturas y borradores (ver [ADR-003](#adr-003)).
- Verificar el correo habilita el acceso, pero no equivale a comprobar que la persona esté autorizada
  como técnico. Una autorización de producción debe validarse en un servidor o mediante cuentas
  provisionadas por la organización.

### Verificación

- Las pantallas de acceso, registro y recuperación están en `src/app/(auth)`, y la integración con
  Firebase está en `src/context/sesion.tsx`.
- Una cuenta no verificada permanece en las rutas de autenticación; al verificarla e iniciar sesión,
  puede entrar al dashboard.
- Al cerrar sesión y volver a abrir la app, aparece el login.

### Uso de IA

Se revisó el taller de Firebase Authentication para React Native y se adoptó el SDK JavaScript
porque permite completar el flujo de correo y verificación en Expo Go, sin servidor de autenticación
propio ni módulos nativos adicionales.

---

<a id="adr-003"></a>

## ADR-003: Usar `expo-sqlite` para los datos locales del teléfono

> Tema obligatorio: Almacenamiento local de los datos en el teléfono

**Estado:** Aceptado

**Fecha:** 28/10/2026

**Requisitos relacionados:** R3, R4, R8, R9 y R10, donde el técnico necesita consultar medidores sin
señal, registrar lecturas sin conexión, retomar un registro a medias, ver sus lecturas pendientes y no
registrar dos veces el mismo medidor en el mes.

### Contexto

La aplicación debe mantener vivos los datos (medidores consultados, lecturas, registros pendientes y
el borrador del registro en curso) luego de que la conexión se pierda o se cierre la aplicación. El
técnico debe poder consultar el estado de sus envíos. Además, la app debe impedir que se registre dos
veces el mismo medidor en el mismo mes (R10), y la estructura de los datos tiene que poder cambiar
entre versiones de la app sin perder las lecturas que aún no se envían.

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| `expo-sqlite` | Base de datos real dentro del teléfono: permite buscar lecturas por estado o por técnico y usar un índice único por medidor y mes, para que la propia base rechace un segundo registro (R10). Viene en Expo Go y es compatible con SDK 57. Las migraciones se controlan con la versión de la base (`PRAGMA user_version`). | Hay que escribir SQL a mano y mantener las migraciones; un error en una migración puede dejar la base sin columnas. |
| AsyncStorage | Fácil de usar, guarda texto con una clave. | No permite consultas: para buscar las pendientes hay que leer y recorrer todo. No tiene restricciones únicas, por lo que evitar duplicados queda solo en el código. |
| MMKV | Muy rápido y sincrónico. | Es solo clave-valor, con las mismas limitaciones de consulta que AsyncStorage, y no viene en Expo Go. |

### Decisión

Se elige `expo-sqlite` porque permite guardar y consultar los medidores, las lecturas y el borrador
sin conexión, y porque la regla de un registro por medidor al mes (R10) queda protegida por la propia
base con la clave `codigo_periodo` (por ejemplo `MED-100001_2026-10`). La estructura se crea y se
actualiza con migraciones numeradas al abrir la app.

### Consecuencias

- Los datos sobreviven al cierre de la app y al reinicio del teléfono.
- Cada cambio de estructura obliga a escribir una migración nueva; el número de versión y su bloque de
  código deben cambiarse juntos, porque una migración a medias dejó una vez la base sin la columna
  `registro_id` y hubo que agregar una migración de reparación (v6).
- Las fotos no se guardan dentro de la base, solo su ubicación (ver [ADR-008](#adr-008)).

### Verificación

- En `src/database` viven la conexión, las migraciones y los repositorios de medidores, lecturas y
  borrador.
- Con el teléfono en modo avión, al registrar una lectura y cerrar la app, la lectura sigue en
  "Mis lecturas" al volver a abrirla.
- Al intentar registrar otra vez un medidor ya registrado en el mes, la app lo rechaza.

### Uso de IA

Se le pidió a la IA comparar SQLite con AsyncStorage y MMKV para guardar lecturas sin conexión. La IA
recomendó SQLite, siendo la misma decisión que se había tomado al elegir las librerías. Se aceptó su
propuesta de usar la clave medidor-mes como índice único y de llevar la versión de la base con
migraciones.

---

<a id="adr-004"></a>

## ADR-004: Consultar la oficina con `fetch` nativo y reutilizar la caché de SQLite durante la jornada

> Tema obligatorio: Comunicación con el sistema de la oficina y manejo de la caché de consultas.

**Estado:** Aceptado

**Fecha:** 28/10/2026

**Requisitos relacionados:** R2, solo se consulta un código válido; R3, se muestran los datos del
medidor y se guardan en caché; R4, sin señal se puede seguir trabajando.

### Contexto

La app consulta los medidores y envía las lecturas a MockAPI, que simula el sistema de la oficina. En
campo la señal es débil, por lo que una petición puede quedarse colgada; la app tiene que cortarla y
seguir. También debe distinguir "no hay señal" de "el medidor no existe", porque en el primer caso el
técnico puede registrar igual (R4) y en el segundo no. MockAPI responde 404 cuando no hay resultados
y filtra por coincidencia parcial, por lo que buscar `MED-1` puede devolver varios medidores.

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| `fetch` nativo | Viene con React Native, no agrega dependencias. Con `AbortController` se corta la petición a los 10 segundos. Si no hay respuesta, `fetch` lanza un error, lo que permite saber que el problema es la conexión y no el servidor. | Hay que revisar a mano el código de respuesta (404, 500) y convertir el JSON, porque `fetch` no lanza error por esas respuestas. |
| Axios | Lanza errores por respuestas 4xx y 5xx, trae timeout configurable y convierte el JSON solo. | Es una dependencia más que hay que justificar, y lo que aporta en este proyecto se resuelve con pocas líneas sobre `fetch`. |

### Decisión

Se elige `fetch` nativo con un tiempo límite de 10 segundos. Si no hay respuesta, la app lo trata como
"sin conexión"; si MockAPI responde 404 o no hay un medidor con el código exacto, lo trata como
"el medidor no existe".

La regla de caché es: un medidor consultado hoy se muestra desde SQLite sin volver a la red, porque
sus datos no cambian durante la jornada. Si es de otro día, se vuelve a descargar. Sin conexión se
muestra la caché aunque sea de otro día, indicando la fecha en que se guardó.

### Consecuencias

- No se agrega ninguna dependencia para la red.
- Toda petición pasa por una sola función que aplica el tiempo límite y convierte la falta de
  respuesta en un error de "sin conexión".
- Si la oficina cambia un medidor durante el día, el técnico verá el dato anterior hasta el día
  siguiente.

### Verificación

- En `src/services/api.ts` viven las peticiones a MockAPI con el tiempo límite.
- Al consultar `MED-999999`, la app indica que el medidor no existe.
- En modo avión, un medidor consultado antes se muestra con la etiqueta "Guardado en el teléfono"; uno
  nunca consultado ofrece "Registrar sin datos del medidor".

### Uso de IA

Se le preguntó a la IA si se estaba utilizando `fetch` o Axios. Se discutió que Axios lanza los errores
del servidor por sí solo, mientras que con `fetch` hay que validar más casos a mano. Se decidió
mantener `fetch` para no agregar una dependencia, centralizando esas validaciones en una sola función.

---

<a id="adr-005"></a>

## ADR-005: Compartir el estado entre pantallas con React Context y un formulario único en el layout del registro

> Tema obligatorio: Estado compartido entre pantallas durante el registro de una lectura.

**Estado:** Aceptado

**Fecha:** 28/10/2026

**Requisitos relacionados:** R5, R6, R8 y R9, donde el registro avanza por varias pantallas, se puede
retomar si la app se cierra y todas las pantallas muestran la conexión y las lecturas pendientes.

### Contexto

El registro ocupa cuatro pantallas y el técnico puede avanzar y retroceder entre ellas sin perder lo
que ya escribió. Si la app se cierra a mitad del registro, los datos deben quedar guardados para
retomarlos (R8). Además, todas las pantallas necesitan saber si hay conexión, cuántas lecturas faltan
por enviar (R9) y quién es el técnico de la sesión.

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| React Context | Viene con React, no agrega dependencias. Un proveedor en el layout del registro vive mientras el técnico está en cualquiera de sus pantallas. | Si el estado cambia muy seguido, vuelve a dibujar todas las pantallas que lo usan. |
| Zustand | Estado global simple y con buen rendimiento. | Es una dependencia más; el estado quedaría vivo aunque el técnico salga del registro, y habría que limpiarlo a mano. |
| Pasar los datos por parámetros de la ruta | No necesita nada extra. | Los parámetros son texto en la URL: no sirven para la foto ni para muchos campos, y se pierden al cerrar la app. |

### Decisión

Se elige React Context. El layout del registro crea un solo formulario y lo comparte con las cuatro
pantallas. Cada cambio se copia al borrador en SQLite (con una espera de 300 ms y también al pasar la
app a segundo plano) para poder retomarlo (R8). La conexión, las lecturas pendientes y la sesión viven
en proveedores en el layout raíz, por encima de todas las pantallas.

### Consecuencias

- No se agregan dependencias para el estado.
- Al salir del registro, el formulario desaparece solo; al terminar o descartar, el borrador se borra.
- Hay que cuidar que un registro ya terminado no vuelva a escribir el borrador; por eso solo el
  registro en curso puede guardarlo.

### Verificación

- En `src/hooks/useLecturaForm.tsx` vive el proveedor del registro, y en `src/hooks/useNetworkStatus.tsx`
  y `src/hooks/useSession.tsx` los de conexión y sesión.
- Al avanzar hasta la foto y regresar al paso de datos, la lectura escrita sigue ahí.
- Al cerrar la app a mitad de un registro y volver a abrirla, aparece el aviso para continuar o
  descartar.

### Uso de IA

Se le pidió a la IA una forma de compartir los datos del registro entre varias pantallas sin agregar
librerías. La IA propuso un Context en el layout del registro con un solo formulario y el guardado del
borrador en SQLite. Se aceptó la propuesta; durante las pruebas apareció un error donde el aviso de
borrador volvía a salir después de enviar, y se corrigió permitiendo que solo el registro en curso
guarde el borrador.

---

<a id="adr-006"></a>

## ADR-006: Validar el formulario con Zod y el código del medidor con una expresión regular

> Tema obligatorio: Validación de los datos que ingresa el técnico y de los que llegan del sistema de
> la oficina.

**Estado:** Aceptado

**Fecha:** 28/10/2026

**Requisitos relacionados:** R2, formato del código `MED-` y 6 dígitos; R5, datos que se piden según el
estado del medidor; R6, consumo mayor al triple del promedio; R7, foto obligatoria.

### Contexto

Hay que validar varias reglas: el formato del código (R2), qué campos son obligatorios según el estado
normal, inaccesible o dañado (R5), la confirmación de revisión cuando el consumo es anómalo (R6) y la
foto obligatoria si el consumo es anómalo o el medidor está dañado (R7). Estas reglas se usan en varias
pantallas del registro, por lo que deben definirse en un solo lugar. Los datos que llegan de MockAPI
también deben compararse con el código exacto, porque MockAPI busca por coincidencia parcial.

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| Zod | Las reglas se escriben una sola vez en un esquema. Permite reglas que dependen de otros campos (el estado define qué se pide). Genera los tipos de TypeScript del formulario. | Es una dependencia más, y las reglas cruzadas se escriben con `superRefine`, que es menos directo. |
| Validar con `if` en cada pantalla | No agrega dependencias. | Las reglas quedan repartidas y repetidas en cada pantalla; es fácil que una pantalla se olvide de una regla. |

### Decisión

Se elige Zod para el formulario de la lectura: un solo esquema en `src/domain/medidor.schema.ts`
contiene las reglas de R5, R6 y R7. Para el código del medidor (R2) basta una expresión regular,
`^MED-\d{6}$`, junto con `useState`, porque es un solo campo; con un código inválido no se consulta
nada. Las respuestas de MockAPI se filtran por el código exacto antes de mostrarlas.

### Consecuencias

- Las reglas del negocio viven en `src/domain` y las pantallas solo las usan.
- El factor de consumo anómalo (3 veces el promedio) está en una sola constante.
- Los datos de MockAPI no se validan con un esquema de Zod; se confía en su estructura. Si la oficina
  enviara un campo con otro formato, el error aparecería al mostrar o calcular el consumo.

### Verificación

- Al escribir `MED-12` o `ABC-123456`, la app muestra el error de formato y no consulta.
- Al marcar el medidor como inaccesible y no escribir el motivo, no se puede continuar.
- Con un consumo mayor al triple del promedio, se exige confirmar la revisión y la foto.

### Uso de IA

Se le pidió a la IA escribir las reglas de R5, R6 y R7 con Zod, que ya se había elegido junto con
`react-hook-form`. La IA propuso un solo esquema con reglas cruzadas y una función aparte para saber
cuándo la foto es obligatoria. Se aceptó, y se verificaron las reglas con pruebas de los casos de cada
requisito.

---

<a id="adr-007"></a>

## ADR-007: Manejar el formulario de lectura con `react-hook-form`

> Tema obligatorio: Manejo de formularios.

**Estado:** Aceptado

**Fecha:** 28/10/2026

**Requisitos relacionados:** R5, R6 y R7, donde el formulario cambia según el estado del medidor, el
consumo y la foto.

### Contexto

El registro tiene seis campos: estado, lectura, motivo, descripción del daño, confirmación de revisión
y foto. Varios dependen de otros: el estado define si se pide lectura, motivo o descripción, y el
consumo define si se pide la confirmación y la foto. Los errores deben mostrarse junto a cada campo, y
cada pantalla debe validar solo sus propios campos antes de avanzar. El login, en cambio, tiene solo
dos campos sin reglas que dependan entre sí.

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| `react-hook-form` | Se conecta con Zod mediante `@hookform/resolvers`. Permite validar solo los campos de un paso (`trigger`) y muestra el error de cada campo. Facilita leer todos los valores para guardar el borrador. | Son dos dependencias (`react-hook-form` y `@hookform/resolvers`); su función `watch` no se lleva bien con React Compiler y en una pantalla hubo que usar `useWatch`. |
| `useState` por cada campo | No agrega dependencias. | Seis estados, sus errores y las reglas cruzadas a mano en cada pantalla; validar por pasos y guardar el borrador sería más código. |

### Decisión

Se elige `react-hook-form` con el esquema de Zod para el formulario de la lectura. Cada pantalla valida
solo sus campos antes de avanzar y el resumen valida todo antes de guardar. El login no usa
`react-hook-form`: con dos campos simples basta `useState`.

### Consecuencias

- Los errores aparecen junto al campo cuando el técnico sale de él o intenta continuar.
- El mismo formulario sirve para registrar y para corregir una lectura pendiente (R10).
- Los valores que se muestran fuera de un campo deben leerse con `useWatch`; con `watch` la pantalla
  puede no actualizarse, como pasó con el botón "Continuar sin foto".

### Verificación

- En `src/hooks/useLecturaForm.tsx` se crea el formulario con el esquema de Zod.
- Al dejar vacía la lectura con estado normal, aparece el error debajo del campo y no se avanza.
- Al tomar la foto, el botón cambia de "Continuar sin foto" a "Continuar".

### Uso de IA

Se le pidió a la IA implementar el formulario con `react-hook-form` y Zod, librerías ya elegidas para
R5 y R6. La IA propuso validar por pasos con `trigger` y mantener el login con `useState`. Se aceptó.
Durante las pruebas el botón de la foto no se actualizaba; la IA lo corrigió usando `useWatch`.

---

<a id="adr-008"></a>

## ADR-008: Capturar la foto con `expo-image-picker` y conservarla con `expo-file-system`

> Tema obligatorio: Captura y conservación de la foto del medidor.

**Estado:** Aceptado

**Fecha:** 28/10/2026

**Requisitos relacionados:** R7, la foto es obligatoria si el consumo es anómalo o el medidor está
dañado, debe conservarse y la app debe manejar el permiso denegado.

### Contexto

La cámara deja la foto en la carpeta de caché de la app, que Android puede borrar cuando necesita
espacio. Como una lectura puede quedar varios días sin enviarse, eso no basta para R7. Si el técnico
niega el permiso de la cámara, la app debe explicarle para qué se usa y cómo activarlo. Si toma otra
foto o descarta el registro, la foto anterior no debe quedar ocupando espacio.

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| `expo-image-picker` + `expo-file-system` | `expo-image-picker` abre la cámara del sistema y gestiona el permiso, sin construir una pantalla de cámara. `expo-file-system` mueve la foto a la carpeta de documentos, que solo se borra al desinstalar la app. | Son dos dependencias; la cámara del sistema se ve distinta según el teléfono. |
| `expo-camera` | Cámara dentro de la propia pantalla, con control del diseño. | Hay que construir la pantalla de cámara completa, y aun así la foto queda en caché, por lo que igual se necesitaría `expo-file-system`. |

### Decisión

Se elige `expo-image-picker` para tomar la foto y gestionar el permiso, y `expo-file-system` para
moverla a la carpeta `fotos-lecturas` dentro de los documentos de la app. En SQLite se guarda solo la
ubicación de la foto. Se eliminó `expo-camera`, porque `expo-image-picker` ya cubre la cámara y el
permiso.

### Consecuencias

- La foto sobrevive al cierre de la app y al reinicio del teléfono hasta que la lectura se envía.
- Al tomar otra foto o descartar el registro, la foto anterior se borra; en una corrección, la foto
  original se conserva hasta guardar el cambio.
- Si el permiso queda bloqueado, el técnico solo puede activarlo desde Ajustes; la app le ofrece
  abrirlos.

### Verificación

- En `src/services/imageStorage.ts` vive el traslado y borrado de las fotos, y en
  `src/components/CameraCapture.tsx` la captura y el manejo del permiso.
- Al negar el permiso, aparece la explicación y, con foto obligatoria, no se puede continuar.
- Al tomar una foto, cerrar la app y retomar el borrador, la foto sigue ahí.

### Uso de IA

Se le pidió a la IA usar `expo-image-picker` para la cámara y `expo-camera` para los permisos. La IA
indicó que `expo-image-picker` ya gestiona su propio permiso, por lo que se decidió eliminar
`expo-camera`. Se aceptó su propuesta de mover la foto a la carpeta de documentos, porque la caché no
garantiza que la foto siga ahí.

---

<a id="adr-009"></a>

## ADR-009: Detectar la conexión con NetInfo y enviar con una cola idempotente por clave medidor-mes

> Tema obligatorio: Detección de la conexión y envío de las lecturas pendientes.

**Estado:** Aceptado

**Fecha:** 28/10/2026

**Requisitos relacionados:** R4, R9 y R10, donde el técnico registra sin señal, necesita ver el estado
de su conexión y lecturas pendientes en todas las pantallas, y las lecturas se envían solas sin
duplicarse.

### Contexto

Las lecturas se guardan primero en el teléfono y deben enviarse solas cuando haya conexión. El técnico
debe ver en todas las pantallas si tiene conexión y cuántas lecturas faltan por enviar. Con señal
débil, un envío puede llegar a la oficina pero la respuesta perderse; al reintentar, la lectura no
debe quedar duplicada. Tampoco se debe aceptar una segunda lectura del mismo medidor en el mes (R10).

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| NetInfo + cola idempotente | NetInfo se conecta directamente con el sistema operativo, de modo que se puede detectar en cuestión de segundos si la señal ha caído o ha vuelto, y también indica el tipo de red (wifi o datos). La cola revisa en la oficina la clave medidor-mes antes de enviar, por lo que reintentar no duplica. | En ocasiones el sistema operativo puede generar falsos positivos (dice que hay red pero no llega nada); sin un tiempo límite, las peticiones a MockAPI pueden quedar colgadas. |
| Hacer ping HTTP | Confirma la disponibilidad directa con el servidor. | Genera tráfico de red innecesario y gasta batería si se consulta muy seguido. |
| Enviar con un POST directo sin revisar | Es más simple. | Si la respuesta se pierde y se reintenta, la lectura queda duplicada en la oficina. |

### Decisión

Se elige NetInfo porque es una librería optimizada a nivel de sistema operativo, sin consumir batería
innecesariamente. El envío se hace con una cola: para cada lectura pendiente se busca en la oficina su
clave medidor-mes; si no existe se crea, si existe con el mismo identificador de registro se actualiza,
y si existe con otro identificador se marca como rechazada. La cola se ejecuta al abrir la app, al
recuperar la conexión, después de registrar y cada 30 segundos, y nunca corre dos veces a la vez.

### Consecuencias

- La barra de conexión y pendientes está en el layout raíz y se ve en todas las pantallas.
- Los falsos positivos de NetInfo se cubren con el tiempo límite de 10 segundos de cada petición
  (ver [ADR-004](#adr-004)) y con el reintento cada 30 segundos.
- Cada lectura necesita un identificador de registro propio y un contador de cambios, para no marcar
  como enviada una versión que el técnico corrigió mientras se enviaba.

### Verificación

- En `src/services/networkService.ts` y `src/services/syncQueue.ts` viven la detección de conexión y la
  cola de envío.
- El técnico visualiza su estado de conexión y lecturas pendientes en todas las pantallas.
- Al registrar en modo avión y desactivarlo, la lectura se envía sola y en MockAPI aparece una sola
  vez.

### Uso de IA

Se le preguntó a la IA una comparación entre utilizar NetInfo o realizar una petición HTTP directa para
revisar el estado de conexión. La IA indicó que NetInfo es la opción más optimizada para revisar el
estado de conexión, y propuso además enviar con la clave medidor-mes para evitar duplicados. Se
aceptaron ambas propuestas.

---

<a id="adr-010"></a>

## ADR-010: Usar UniWind para los estilos

**Estado:** Aceptado

**Fecha:** 02/11/2026

**Requisitos relacionados:** Ninguno en particular; el enunciado sanciona con 5 puntos un diseño
genérico.

### Contexto

El diseño importa en esta prueba porque un diseño genérico tiene sanción. La app se usa en campo, bajo
el sol, por lo que necesita alto contraste, botones grandes y estados que se entiendan con texto y no
solo con color. El diseño debe mantenerse igual en todas las pantallas, siguiendo la guía de identidad
de EPMAPS (`Skills/epmaps_design_system.md`): azul institucional, colores de estado y estilo de vidrio
("liquid glass").

### Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| UniWind | Conserva las clases `className` en todas las pantallas, permite transparencias (`bg-white/75`) y define la paleta con `@theme` en CSS. | Requiere Tailwind CSS 4 y su configuración Metro específica. |
| NativeWind | Ya estaba integrado y tiene el mismo modelo de utilidades. | Requiere su preset Babel y configuración Metro propios. |
| `StyleSheet` de React Native | Viene incluido y no agrega dependencias. | Los colores y espaciados se repiten en cada archivo o hay que armar un sistema de temas propio. |

### Decisión

Se migra a UniWind con Tailwind CSS 4 y se conserva la API `className` en las pantallas y piezas
comunes (`src/components/ui`). La paleta EPMAPS se declara en `src/global.css` mediante `@theme`;
Metro procesa ese CSS con UniWind. Los estilos dinámicos de React Native y las animaciones Reanimated
se mantienen como `style`/shared values, sin convertir sus valores de ejecución en clases generadas.
El efecto de vidrio se logra con tarjetas blancas translúcidas sobre un fondo con manchas de agua,
sin librerías de desenfoque, porque el vidrio real de Expo solo funciona en iOS.

### Consecuencias

- Cambiar un color de la guía se hace en `src/global.css`.
- Tailwind CSS 4 y UniWind reemplazan NativeWind; ya no se usa un `tailwind.config.js` ni el preset
  Babel de NativeWind.
- Se usa la tipografía del sistema: una prueba con fuentes personalizadas y librería de íconos dejó la
  app congelada en la pantalla de carga y se revirtió.
- Se ajustaron dos colores de la guía por su regla de contraste: la barra de conexión usa texto azul
  oscuro sobre verde y ámbar, y los mensajes de error usan un rojo más oscuro.

### Verificación

- En `src/global.css` están los colores `epmaps` y `status` de la guía.
- Todas las pantallas usan el mismo fondo, cabecera azul oscuro y tarjetas de vidrio.
- Los botones miden al menos 44 px de alto y cada estado tiene su texto ("Sin conexión", "Consumo
  anómalo", "Dañado").

### Uso de IA

Se le pidió a la IA migrar la guía de diseño de EPMAPS desde NativeWind a UniWind sin alterar la
paleta, los estilos dinámicos ni las animaciones. Se mantuvo la API de clases y se trasladó la
configuración de colores a CSS.

---

<a id="adr-012"></a>

## ADR-012: Permitir actualizar el nombre de perfil con Firebase Auth

**Estado:** Aceptado

**Fecha:** 02/11/2026

**Requisitos relacionados:** HU de autenticación, Fase 2: permitir al usuario conectado modificar su
`displayName`.

### Contexto

El nombre introducido al crear la cuenta debe poder actualizarse posteriormente desde una pantalla
protegida para usuarios autenticados. El cambio debe mantenerse en el perfil remoto de Firebase y
reflejarse inmediatamente en la interfaz.

### Decisión

La pantalla `src/app/(dashboard)/perfil.tsx` ofrece la edición del nombre y el contexto de sesión
ejecuta `updateProfile` mediante `actualizarNombre`. Tras la operación exitosa, el contexto actualiza
el estado del nombre para que las pantallas reflejen el nuevo valor sin reiniciar la sesión.

### Consecuencias

- El cambio de nombre requiere conexión con Firebase y una sesión activa.
- El correo y otros datos del perfil no se modifican.
- Un nombre vacío no se envía a Firebase.

### Verificación

- Desde el dashboard se puede abrir Mi perfil, cambiar el nombre y guardar.
- Tras guardar, el nombre nuevo aparece inmediatamente en la cabecera del dashboard.
- Si Firebase devuelve un error, se muestra un mensaje en español y no se presenta el cambio como exitoso.

---

<a id="adr-011"></a>

## ADR-011: Mostrar fortaleza estimada de contraseña durante el registro

**Estado:** Aceptado

**Fecha:** 02/11/2026

**Requisitos relacionados:** HU de autenticación, Fase 1: informar si la contraseña es débil, media o fuerte mientras se escribe.

### Contexto

La persona necesita retroalimentación inmediata para elegir una contraseña más robusta. El indicador
debe funcionar mientras escribe, sin enviar la contraseña a un servicio externo ni agregar otra
dependencia.

### Decisión

Se calcula una estimación local en `src/domain/passwordStrength.ts` a partir de longitud y variedad
de caracteres. Se muestra como débil, media o fuerte debajo del campo de contraseña en el registro.
El indicador es orientativo: Firebase sigue siendo responsable de aceptar o rechazar la contraseña.

### Consecuencias

- La contraseña permanece en el dispositivo durante la evaluación y no se transmite para calcular la
  fortaleza.
- Una contraseña de al menos 8 caracteres con dos grupos de caracteres se considera media; para ser
  fuerte requiere al menos 12 caracteres y tres grupos. Los grupos son minúsculas, mayúsculas,
  números y símbolos.
- El indicador no sustituye las políticas de contraseña configuradas en Firebase.

### Verificación

- Al escribir, el estado cambia de débil a medio y fuerte cuando se cumplen los criterios descritos.
- Al borrar el campo, el indicador desaparece.
