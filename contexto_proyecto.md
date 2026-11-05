# Contexto Completo del Proyecto CV-CREATOR-APP


================================================
ðŸ“„ ARCHIVO: .claude\settings.json
================================================

{
  "enabledPlugins": {
    "expo@claude-plugins-official": true
  }
}


================================================
ðŸ“„ ARCHIVO: .env.example
================================================

# URL base de MockAPI 
EXPO_PUBLIC_API_URL=https://<id>.mockapi.io
# El prefijo EXPO_PUBLIC_ es obligatorio para que Expo inyecte la variable en la app.
EXPO_PUBLIC_FIREBASE_API_KEY=tu-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
EXPO_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:0000000000000000000000


================================================
ðŸ“„ ARCHIVO: .github\copilot-instructions.md
================================================



================================================
ðŸ“„ ARCHIVO: .gitignore
================================================

# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
.kotlin/
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo

example

# generated native folders
/ios
/android

# env
.env


================================================
ðŸ“„ ARCHIVO: ADR.md
================================================

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
| [ADR-010](#adr-010) | Usar UniWind para los estilos | Diseño no genérico | Aceptado |
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


================================================
ðŸ“„ ARCHIVO: AGENTS.md
================================================

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md


================================================
ðŸ“„ ARCHIVO: app.json
================================================

{
  "expo": {
    "name": "EPMAPS Lecturas",
    "slug": "emaps-lecturas-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "emapslecturasapp",
    "userInterfaceStyle": "light",
    "ios": {
      "icon": "./assets/images/icon.png"
    },
    "android": {
      "package": "com.epmaps.lecturas",
      "adaptiveIcon": {
        "backgroundColor": "#064799",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png"
      },
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "bundler": "metro",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#FFFFFF",
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200
        }
      ],
      "expo-sqlite",
      [
        "expo-image-picker",
        {
          "cameraPermission": "EPMAPS Lecturas usa la cámara para fotografiar el medidor como respaldo de la lectura.",
          "microphonePermission": false
        }
      ],
      "expo-font"
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "a6dd8457-5c18-4bfd-83c8-a252ff4c23c8"
      }
    },
    "owner": "jairo_maigua"
  }
}


================================================
ðŸ“„ ARCHIVO: babel.config.js
================================================

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};


================================================
ðŸ“„ ARCHIVO: contexto.js
================================================

const fs = require('fs');
const path = require('path');

// Nombre del archivo final que contendrÃ¡ todo tu cÃ³digo
const OUTPUT_FILE = 'contexto_proyecto.md';
const ROOT_DIR = __dirname;

// Carpetas que ignoramos porque son pesadas o no contienen cÃ³digo fuente Ãºtil
const IGNORE_DIRS = ['node_modules', '.expo', '.vscode', '.opencode', '.git', 'assets', '__tests__', '.tamagui'];

// Archivos especÃ­ficos que no queremos incluir
const IGNORE_FILES = ['package-lock.json', 'yarn.lock', OUTPUT_FILE, 'export_context.js'];

// Extensiones permitidas
const ALLOWED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md'];

function buildContext(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(item)) {
                buildContext(itemPath);
            }
        } else {
            const ext = path.extname(item);
            const isAllowedExtension = ALLOWED_EXTENSIONS.includes(ext);
            
            // Permitimos archivos de configuraciÃ³n que empiezan con punto (ej. .gitignore, eslint.config.js)
            const isConfigFile = item.startsWith('.') || item.includes('config'); 

            if (!IGNORE_FILES.includes(item) && (isAllowedExtension || isConfigFile)) {
                try {
                    const content = fs.readFileSync(itemPath, 'utf8');
                    const relativePath = path.relative(ROOT_DIR, itemPath);
                    
                    // Separador visual claro para que la IA distinga entre archivos
                    const separator = `\n\n================================================\n`;
                    const fileHeader = `ðŸ“„ ARCHIVO: ${relativePath}\n================================================\n\n`;
                    
                    fs.appendFileSync(path.join(ROOT_DIR, OUTPUT_FILE), separator + fileHeader + content);
                } catch (error) {
                    console.error(`Error leyendo ${itemPath}:`, error.message);
                }
            }
        }
    }
}

// 1. Inicializar/Limpiar el archivo de salida
fs.writeFileSync(path.join(ROOT_DIR, OUTPUT_FILE), '# Contexto Completo del Proyecto CV-CREATOR-APP\n');
console.log('â³ Recopilando cÃ³digo...');

// 2. Ejecutar la lectura
buildContext(ROOT_DIR);

console.log(`âœ… Â¡Listo! Todo tu cÃ³digo se ha consolidado en el archivo: ${OUTPUT_FILE}`);

================================================
ðŸ“„ ARCHIVO: docs\constitucion.md
================================================



================================================
ðŸ“„ ARCHIVO: eas.json
================================================

{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://6add3d79fa5e73d4ab2dea96.mockapi.io"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}


================================================
ðŸ“„ ARCHIVO: eslint.config.js
================================================

// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  }
]);


================================================
ðŸ“„ ARCHIVO: metro.config.js
================================================

const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
});


================================================
ðŸ“„ ARCHIVO: package.json
================================================

{
  "name": "emaps-lecturas-app",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "dependencies": {
    "@expo-google-fonts/space-grotesk": "^0.4.1",
    "@hookform/resolvers": "^5.9.2",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-native-community/netinfo": "12.0.1",
    "babel-preset-expo": "~57.0.0",
    "expo": "~57.0.31",
    "expo-constants": "~57.0.22",
    "expo-file-system": "~57.0.7",
    "expo-font": "~57.0.4",
    "expo-image-picker": "~57.0.20",
    "expo-linking": "~57.0.13",
    "expo-router": "~57.0.29",
    "expo-splash-screen": "~57.0.10",
    "expo-sqlite": "~57.0.4",
    "expo-status-bar": "~57.0.1",
    "firebase": "^13.1.0",
    "react": "19.2.3",
    "react-dom": "^19.2.3",
    "react-hook-form": "^7.91.0",
    "react-native": "0.86.3",
    "react-native-gesture-handler": "~2.32.0",
    "react-native-reanimated": "4.5.1",
    "react-native-safe-area-context": "~5.7.0",
    "react-native-screens": "~4.26.0",
    "react-native-svg": "^15.16.0",
    "react-native-worklets": "0.10.1",
    "uniwind": "^1.13.1",
    "zod": "^4.6.7"
  },
  "devDependencies": {
    "@types/react": "~19.2.2",
    "eslint": "^9.0.0",
    "eslint-config-expo": "~57.0.2",
    "tailwindcss": "^4.3.4",
    "typescript": "~6.0.3"
  },
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "lint": "expo lint",
    "typecheck": "tsc --noEmit"
  },
  "private": true
}


================================================
ðŸ“„ ARCHIVO: README.md
================================================

# EPMAPS Lecturas

Aplicación móvil para registrar lecturas de medidores de agua en campo. Está construida con Expo,
React Native, TypeScript y Expo Router; SQLite permite consultar y registrar lecturas sin conexión.

## Inicio rápido

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` como `.env` y configura los valores de Firebase y MockAPI. Las variables
   `EXPO_PUBLIC_FIREBASE_*` se obtienen al registrar una aplicación web en Firebase Console. No
   compartas ni confirmes el archivo `.env`.
3. En Firebase Console, habilita el proveedor de autenticación **Correo electrónico/contraseña**.
   La app envía un correo de verificación al crear una cuenta y solo permite iniciar sesión después
   de verificarlo.
4. Inicia Expo:

   ```bash
   npx expo start
   ```

Desde la terminal de Expo puedes abrir la aplicación en un dispositivo o emulador Android/iOS.

## Funcionalidades

- Registro con correo y contraseña, verificación de correo y recuperación de contraseña.
- Edición del nombre de perfil asociado a la cuenta Firebase.
- Indicador de seguridad de contraseña durante el registro.
- Consulta de medidores, registro de lecturas, captura de fotos y borradores locales.
- Cola de sincronización para lecturas pendientes cuando vuelve la conexión.

## Comprobaciones

```bash
npm run typecheck
npm run lint
```

La navegación se define bajo `src/app`. Los componentes, la autenticación, el dominio y los servicios
se mantienen fuera de esa carpeta para que Expo Router no los interprete como pantallas.


================================================
ðŸ“„ ARCHIVO: Skills\epmaps_design_system.md
================================================

# Guía de Diseño Visual e Identidad EPMAPS-Lecturas

Este documento define la guía de diseño visual, paleta de colores, tipografía, marcas de identidad y extensiones de estilo para la aplicación **epmaps-lecturas-app**, desarrollada en React Native y UniWind (Tailwind CSS 4).

---

## 1. Paleta de Colores Institucional

La paleta se compone de tonos azulados e hídricos adecuados para el contexto operativo de EPMAPS (Agua Potable y Alcantarillado), garantizando alto contraste para lectura bajo luz solar directa en trabajos de campo.

| Muestra | Nombre / Rol | Código Hexadecimal | RGB | Uso Principal / Semántica |
| :--- | :--- | :--- | :--- | :--- |
| ![#023373](https://via.placeholder.com/15/023373/023373.png) | **Azul Institucional Oscuro** | `#023373` | `rgb(2, 51, 115)` | Cabeceras (`Header`), barras de estado, texto principal en fondo claro, contenedores secundarios. |
| ![#0455BF](https://via.placeholder.com/15/0455BF/0455BF.png) | **Azul Primario EPMAPS** | `#0455BF` | `rgb(4, 85, 191)` | Botones primarios, elementos activos de la UI, bordes de enfoque (`focus`), acentos principales. |
| ![#0A6ABF](https://via.placeholder.com/15/0A6ABF/0A6ABF.png) | **Azul Intermedio / Secundario** | `#0A6ABF` | `rgb(10, 106, 191)` | Botones secundarios, tarjetas activas, íconos de navegación, insignias de estado normal. |
| ![#22B7F2](https://via.placeholder.com/15/22B7F2/22B7F2.png) | **Azul Cyan Accent** | `#22B7F2` | `rgb(34, 183, 242)` | Indicadores de progreso, elementos flotantes, bordes de selección, íconos interactivos destacados. |
| ![#F2F2F2](https://via.placeholder.com/15/F2F2F2/F2F2F2.png) | **Gris Claro de Fondo** | `#F2F2F2` | `rgb(242, 242, 242)` | Fondo general de las pantallas (`Canvas`), fondos de tarjetas deshabilitadas, divisores. |

---

## 2. Configuración para UniWind (`src/global.css`)

Declara la paleta en el bloque `@theme` del archivo CSS de entrada para usar las clases utilitarias directamente en la interfaz:

```css
@import 'tailwindcss';
@import 'uniwind';

@theme {
  --color-epmaps-dark: #023373;      /* bg-epmaps-dark, text-epmaps-dark */
  --color-epmaps-primary: #0455BF;   /* bg-epmaps-primary, border-epmaps-primary */
  --color-epmaps-secondary: #0A6ABF; /* bg-epmaps-secondary */
  --color-epmaps-accent: #22B7F2;    /* text-epmaps-accent, border-epmaps-accent */
  --color-epmaps-bg: #F2F2F2;        /* bg-epmaps-bg */

  --color-status-online: #10B981;
  --color-status-offline: #F59E0B;
  --color-status-danger: #EF4444;
}
```

---

## 3. Guía de Componentes y Clases Utilidades

### A. Pantalla Principal y Layout (Fondo y Header)
```tsx
// Contenedor principal con fondo gris claro
<View className="flex-1 bg-epmaps-bg">
  {/* Header Institucional */}
  <View className="bg-epmaps-dark p-4 pt-12 flex-row justify-between items-center shadow-md">
    <Text className="text-white text-xl font-bold">EPMAPS - Lecturas</Text>
  </View>
</View>
```

### B. Barra Global de Conexión y Estado Offline (Requisito R9)
```tsx
{/* Banner con estado de red en la parte superior */}
<View className={`px-4 py-2 flex-row items-center justify-between ${isOnline ? 'bg-status-online' : 'bg-status-offline'}`}>
  <Text className="text-white text-xs font-semibold">
    {isOnline ? 'Conectado a Red' : 'Modo Offline (Sin Señal)'}
  </Text>
  <View className="bg-white/20 px-2 py-0.5 rounded-full">
    <Text className="text-white text-xs font-bold">{pendingCount} pendientes</Text>
  </View>
</View>
```

### C. Tarjeta de Datos del Medidor (Requisito R3)
```tsx
<View className="bg-white m-4 p-4 rounded-xl border border-gray-200 shadow-sm">
  <View className="flex-row justify-between items-center mb-2">
    <Text className="text-epmaps-dark font-bold text-lg">MED-123456</Text>
    <View className="bg-epmaps-accent/20 px-3 py-1 rounded-full">
      <Text className="text-epmaps-dark text-xs font-bold">Normal</Text>
    </View>
  </View>
  <Text className="text-gray-600 text-sm">Cuenta: 987654321</Text>
  <Text className="text-gray-600 text-sm">Dirección: Av. Amazonas y Eloy Alfaro</Text>
  <View className="mt-3 pt-3 border-t border-gray-100 flex-row justify-between">
    <Text className="text-xs text-gray-500">Promedio: 25.4 m³</Text>
    <Text className="text-xs text-epmaps-primary font-semibold">Última: 24.0 m³</Text>
  </View>
</View>
```

### D. Botones Institucionales (Primario, Secundario y Captura)
```tsx
{/* Botón Primario */}
<TouchableOpacity className="bg-epmaps-primary py-3.5 px-6 rounded-lg items-center active:opacity-90 shadow-sm">
  <Text className="text-white font-bold text-base">Guardar Lectura</Text>
</TouchableOpacity>

{/* Botón Secundario */}
<TouchableOpacity className="bg-epmaps-secondary py-3 px-6 rounded-lg items-center active:opacity-90">
  <Text className="text-white font-semibold text-sm">Consultar Medidor</Text>
</TouchableOpacity>

{/* Botón de Captura de Foto (Requisito R7) */}
<TouchableOpacity className="border-2 border-epmaps-accent border-dashed p-4 rounded-lg items-center bg-epmaps-accent/5">
  <Text className="text-epmaps-primary font-semibold text-sm">Tomar Fotografía del Medidor</Text>
</TouchableOpacity>
```

---

## 4. Reglas de Accesibilidad y Visibilidad en Campo

1. **Lectura Bajo Luz Solar Directa:** 
   - Mantener siempre contraste alto utilizando texto blanco (`#FFFFFF`) sobre fondos oscuros (`#023373` o `#0455BF`), y texto azul oscuro (`#023373`) o negro sobre fondo gris claro (`#F2F2F2`) o blanco (`#FFFFFF`).
2. **Tamaños Táctiles Mínimos:**
   - Todos los botones e insumos interactivos deben tener un área de toque (*touch target*) de al menos `44px` de alto (`py-3.5` o mayor).
3. **Indicadores Duales (Texto + Color):**
   - No depender únicamente de colores para indicar estados. Los mensajes deben incluir etiquetas textuales explícitas (e.g., "Sin Conexión", "Lectura Anómala", "Medidor Dañado").

   Aplica: Liquid Glass

================================================
ðŸ“„ ARCHIVO: Skills\prompts_animaciones.md
================================================

# Especificaciones de Animaciones para Aplicación de Medidores (EPMAPS)

Este documento contiene los prompts estructurados en formato de párrafo técnico para que una Inteligencia Artificial implemente directamente componentes animados utilizando **React Native Reanimated**, integrados con **Expo SDK**, **NativeWind**, **SQLite**, y **react-hook-form**.

---

### 1. Indicador de Pulso de Sincronización Offline
Implementa un componente animado llamado `IndicadorSincronizacion` utilizando **React Native Reanimated**. Este componente debe escuchar el estado de red de `@react-native-community/netinfo` para cambiar dinámicamente su comportamiento. Debe colocarse en el layout raíz de Expo Router (`src/app/_layout.tsx`) para que sea visible globalmente en toda la aplicación. Cuando la app esté offline, debe mostrar un icono de nube o círculo en color ámbar estático (`#F59E0B`). Cuando detecte que recupera la conexión a internet, el color debe cambiar a verde (`#10B981`) y debe activar un bucle infinito utilizando `withRepeat` y `withSequence`. En este bucle, se deben animar dos anillos concéntricos absolutos de fondo mediante `useAnimatedStyle`, modificando su escala de `1` a `2.5` (`scale`) y su opacidad de `0.6` a `0` (`opacity`) de forma simultánea con `withTiming`, creando un efecto visual de radar o pulso expansivo continuo mientras se vacía la cola de envíos locales.

### 2. Transición de Pasos en Pantallas del Formulario
Implementa un contenedor de navegación animado llamado `ContenedorPasos` utilizando **React Native Reanimated** para gestionar el flujo del formulario único de registro (Paso 1 al Paso 4). Este componente debe implementarse en el layout del grupo de pantallas de registro (`src/app/(dashboard)/registro/_layout.tsx`) y debe reaccionar al cambio del índice de la pantalla activa provisto por el React Context global. El contenedor debe usar `useAnimatedStyle` para controlar la propiedad `transform: [{ translateX }]` de las vistas de cada paso. Cuando el técnico presione "Siguiente", la pantalla actual debe deslizarse fluidamente hacia la izquierda saliendo del eje visual (`translateX: -anchoPantalla`) mientras la nueva pantalla ingresa desde la derecha (`translateX: 0`) usando `withTiming` con una curva de interpolación suave de desaceleración (*ease-out*). Si el usuario presiona "Atrás", la animación debe invertirse exactamente en la dirección contraria para mantener la coherencia espacial del flujo de trabajo.

### 3. Alerta Vibrante de Medidor No Coincidente
Implementa una microinteracción de error llamada `CampoValidacionVibrante` utilizando **React Native Reanimated**. Debe envolver o aplicarse directamente al componente `TextInput` controlado por `react-hook-form` en la pantalla de ingreso de datos del medidor (`src/app/(dashboard)/registro/datos.tsx`). Esta animación debe dispararse reactivamente únicamente cuando el validador de **Zod** falle o la expresión regular de validación del código del medidor no coincida al perder el foco (`onBlur`) o presionar continuar. Utiliza `useSharedValue` para manejar el desplazamiento en X y crea una secuencia rápida con `withSequence` y `withTiming` que desplace el campo horizontalmente (`translateX`) de `0` a `-10`, luego a `10`, repitiendo esto 3 o 4 veces seguidas a alta velocidad (duración de 50ms por tramo) para imitar un efecto físico de sacudida (*shake*), mientras cambia simultáneamente el color del borde del campo a rojo (`#EF4444`) usando NativeWind de forma condicional.

### 4. Miniatura Expandible de la Foto Evidencial
Implementa un componente visual interactivo llamado `FotoEvidenciaExpandible` utilizando **React Native Reanimated**. Debe implementarse en la pantalla de confirmación final del registro (`src/app/(dashboard)/registro/confirmacion.tsx`), envolviendo la imagen del medidor que previamente se capturó y guardó en el `FileSystem`. Por defecto, la imagen debe mostrarse como una miniatura pequeña con esquinas redondeadas. Al hacer *tap* sobre ella, debe utilizar las transiciones nativas de elementos compartidos (*Shared Element Transitions*) o interpolar mediante un estado animado sus propiedades de tamaño (`width`, `height`), posición absoluta y `borderRadius` para expandirse de manera fluida hasta ocupar el centro de la pantalla sobre un fondo oscuro translúcido (`rgba(0,0,0,0.7)`). Asimismo, debe incorporar un gesto vertical usando `react-native-gesture-handler` de modo que si el técnico desliza la foto expandida hacia abajo, esta se encoja proporcionalmente en base al desplazamiento del dedo y regrese elásticamente con `withSpring` a su tamaño de miniatura original.

### 5. Mensaje de Alerta Flotante (Toast Notification)
Implementa un componente de notificación global llamado `AlertaFlotanteToast` utilizando **React Native Reanimated**. Este componente debe renderizarse de forma absoluta en el layout principal de la aplicación (`src/app/_layout.tsx`) por encima de cualquier pantalla de la interfaz de Expo Router para alertar al técnico sobre cambios del sistema, como *"Modo Offline Activado"* o *"Lectura guardada en SQLite"*. Utiliza un valor compartido inicializado en un desfase vertical fuera de la pantalla (`translateY: -150`). Cuando el sistema emita una notificación, el componente debe deslizarse hacia abajo fluidamente usando `withTiming` hasta una posición visible en la parte superior (`translateY: 20`), mantenerse estático ahí durante un tiempo de espera de 3.5 segundos mediante `withDelay`, y automáticamente ejecutar otra animación que lo deslice de regreso hacia arriba ocultándolo por completo de la vista del usuario.

### 6. Checkmark Animado de Envío Exitoso
Implementa un botón interactivo y animado llamado `BotonEnviarLectura` utilizando **React Native Reanimated**. Este componente debe implementarse en la pantalla de confirmación o cierre del formulario (`src/app/(dashboard)/registro/confirmacion.tsx`). Al ser presionado y procesar la lectura en la cola de envíos, el botón debe usar `useAnimatedStyle` para colapsar su ancho de forma fluida (`width`) hasta transformarse de una barra horizontal a un círculo perfecto en el centro. Una vez completado el guardado, debe ocultar el texto de carga y hacer aparecer en su interior un icono de check (`✓`) diseñado con un trazado SVG nativo (`react-native-svg`), animando la propiedad `strokeDashoffset` con Reanimated para que el check se dibuje línea por línea desde el centro hacia afuera, finalizando con una pequeña onda circular elástica (`scale` de un borde externo con `withSpring`) que confirme visualmente al técnico de EPMAPS que la lectura del mes quedó cerrada con éxito.

================================================
ðŸ“„ ARCHIVO: src\app\(auth)\login.tsx
================================================

import { useState } from 'react';
import { Link } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Fondo, Input, ReflejosCabecera } from '@/components/ui';
import { useSession } from '@/hooks/useSession';
import { mensajeDeError } from '@/lib/errores-firebase';

/** Acceso a la jornada con una cuenta Firebase verificada. */
export default function LoginScreen() {
  const { top } = useSafeAreaInsets();
  const { iniciarSesion } = useSession();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const shake = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const completo = correo.trim() !== '' && clave !== '';

  const dispararShake = () => {
    // Reanimated exige mutar el shared value desde la lógica del gesto.
    // eslint-disable-next-line react-hooks/immutability
    shake.value = withSequence(
      withTiming(-10, { duration: 40 }),
      withTiming(10, { duration: 40 }),
      withTiming(-8, { duration: 40 }),
      withTiming(8, { duration: 40 }),
      withTiming(0, { duration: 40 })
    );
  };

  const ingresar = async () => {
    setError(null);
    setEnviando(true);
    try {
      await iniciarSesion(correo, clave);
    } catch (errorInicio) {
      setError(mensajeDeError(errorInicio));
      dispararShake();
      setEnviando(false);
    }
  };

  return (
    <Fondo>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
          <View
            style={{ paddingTop: top + 40 }}
            className="items-center overflow-hidden rounded-b-[40px] bg-epmaps-dark px-6 pb-16">
            <ReflejosCabecera />
            <Image
              source={require('@/assets/images/icon.png')}
              accessibilityLabel="Logo de EPMAPS"
              className="mb-5 h-24 w-24 rounded-3xl border-2 border-white/30"
            />
            <Text className="text-3xl font-extrabold tracking-tight text-white">EPMAPS Lecturas</Text>
            <Text className="mt-1 text-base text-white/80">Registro de medidores en campo</Text>
          </View>

          <Animated.View style={animatedStyle}>
            <Card className="-mt-8 mx-4 mb-10 gap-5 p-6">
              <View>
                <Text className="text-2xl font-bold text-epmaps-dark">Inicia tu jornada</Text>
                <Text className="mt-1 text-sm text-slate-600">
                  Ingresa con el correo asociado a tu cuenta. Debes verificarlo antes de continuar.
                </Text>
              </View>

              <Input
                etiqueta="Correo electrónico"
                placeholder="nombre@dominio.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                value={correo}
                onChangeText={setCorreo}
                returnKeyType="next"
              />
              <Input
                etiqueta="Clave"
                placeholder="••••••••"
                secureTextEntry={!mostrarClave}
                value={clave}
                onChangeText={setClave}
                returnKeyType="go"
                onSubmitEditing={() => completo && ingresar()}
                trailing={
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    onPress={() => setMostrarClave((visible) => !visible)}
                    hitSlop={8}>
                    <Text className="text-xs font-bold text-epmaps-primary">
                      {mostrarClave ? 'Ocultar' : 'Mostrar'}
                    </Text>
                  </Pressable>
                }
              />

              {error ? (
                <View className="rounded-2xl bg-status-danger/10 px-4 py-3">
                  <Text className="text-sm font-semibold text-red-700">{error}</Text>
                </View>
              ) : null}
                <View className="flex-row items-right gap-1">
                <Text className="text-xs text-slate-600">¿Olvidaste tu contraseña?</Text>
                <Link href="/recuperar" asChild>
                  <Pressable accessibilityRole="link" hitSlop={8}>
                    <Text className="text-xs font-semibold text-epmaps-primary" >Recuperar Contraseña</Text>
                  </Pressable>
                </Link>
                </View>


              <Button titulo="Ingresar" disabled={!completo} cargando={enviando} onPress={ingresar} />

              <View className="items-center gap-3">
                <View className="flex-row items-center gap-1">
                  <Text className="text-sm text-slate-600">¿No tienes cuenta?</Text>
                  <Link href="/registro" asChild>
                    <Pressable accessibilityRole="link" hitSlop={8}>
                      <Text className="font-bold text-epmaps-primary">Crear cuenta</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            </Card>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Fondo>
  );
}


================================================
ðŸ“„ ARCHIVO: src\app\(auth)\recuperar.tsx
================================================

import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Fondo, Input, ReflejosCabecera } from '@/components/ui';
import { useSesion } from '@/context/sesion';
import { mensajeDeError } from '@/lib/errores-firebase';

export default function RecuperarScreen() {
  const { top } = useSafeAreaInsets();
  const { enviarCorreoRecuperacion } = useSesion();
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const enviarEnlace = async () => {
    setError(null);
    setEnviando(true);
    try {
      await enviarCorreoRecuperacion(correo);
      setEnviado(true);
    } catch (errorEnvio) {
      setError(mensajeDeError(errorEnvio));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Fondo>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
          <View
            style={{ paddingTop: top + 32 }}
            className="overflow-hidden rounded-b-[32px] bg-epmaps-dark px-6 pb-12">
            <ReflejosCabecera />
            <Text className="text-3xl font-extrabold text-white">Actualizar contraseña</Text>
            <Text className="mt-2 text-base text-white/80">Te enviaremos un enlace al correo de tu cuenta.</Text>
          </View>

          <Card className="-mt-6 mx-4 mb-10 gap-5 p-6">
            {enviado ? (
              <View className="gap-4">
                <View className="rounded-2xl bg-green-50 px-4 py-4">
                  <Text className="text-sm leading-5 text-green-800">
                    Si existe una cuenta asociada a {correo.trim()}, recibirás un correo con los pasos para
                    actualizar la contraseña.
                  </Text>
                </View>
                <Link href="/login" asChild>
                  <Pressable accessibilityRole="link" className="items-center py-3">
                    <Text className="font-bold text-epmaps-primary">Volver a iniciar sesión</Text>
                  </Pressable>
                </Link>
              </View>
            ) : (
              <>
                <Input
                  etiqueta="Correo electrónico"
                  placeholder="nombre@dominio.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  value={correo}
                  onChangeText={setCorreo}
                  returnKeyType="send"
                  onSubmitEditing={() => correo.trim() && enviarEnlace()}
                />
                {error ? (
                  <View accessibilityLiveRegion="polite" className="rounded-2xl bg-status-danger/10 px-4 py-3">
                    <Text className="text-sm font-semibold text-red-700">{error}</Text>
                  </View>
                ) : null}
                <Button
                  titulo="Enviar enlace"
                  disabled={!correo.trim()}
                  cargando={enviando}
                  onPress={enviarEnlace}
                />
                <Link href="/login" asChild>
                  <Pressable accessibilityRole="link" className="items-center py-2">
                    <Text className="font-semibold text-epmaps-primary">Volver al inicio de sesión</Text>
                  </Pressable>
                </Link>
              </>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Fondo>
  );
}


================================================
ðŸ“„ ARCHIVO: src\app\(auth)\registro.tsx
================================================

import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Fondo, Input, ReflejosCabecera } from '@/components/ui';
import { getPasswordStrength } from '@/domain/passwordStrength';
import { useSesion } from '@/context/sesion';
import { mensajeDeError } from '@/lib/errores-firebase';

export default function RegistroScreen() {
  const { top } = useSafeAreaInsets();
  const { registrarse } = useSesion();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrando, setRegistrando] = useState(false);
  const [registroEnviado, setRegistroEnviado] = useState(false);
  const fortaleza = getPasswordStrength(clave);

  const crearCuenta = async () => {
    setError(null);
    setRegistrando(true);
    try {
      await registrarse(nombre, correo, clave);
      setRegistroEnviado(true);
    } catch (errorRegistro) {
      setError(mensajeDeError(errorRegistro));
    } finally {
      setRegistrando(false);
    }
  };

  const colorFortaleza =
    fortaleza === 'fuerte' ? 'text-green-700' : fortaleza === 'media' ? 'text-amber-700' : 'text-red-700';
  const colorBarra =
    fortaleza === 'fuerte'
      ? 'bg-green-600'
      : fortaleza === 'media'
        ? 'bg-amber-500'
        : 'bg-red-600';

  return (
    <Fondo>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
          <View
            style={{ paddingTop: top + 32 }}
            className="overflow-hidden rounded-b-[32px] bg-epmaps-dark px-6 pb-12">
            <ReflejosCabecera />
            <Text className="text-3xl font-extrabold text-white">Crear cuenta</Text>
            <Text className="mt-2 text-base text-white/80">Registra tu correo para acceder a EPMAPS Lecturas.</Text>
          </View>

          <Card className="-mt-6 mx-4 mb-10 gap-5 p-6">
            {registroEnviado ? (
              <View className="gap-4">
                <View className="rounded-2xl bg-green-50 px-4 py-4">
                  <Text className="font-bold text-green-800">Cuenta creada</Text>
                  <Text className="mt-1 text-sm leading-5 text-green-800">
                    Enviamos un enlace de verificación a {correo.trim()}. Confirma tu correo y luego inicia sesión.
                  </Text>
                </View>
                <Link href="/login" asChild>
                  <Pressable accessibilityRole="link" className="items-center py-3">
                    <Text className="font-bold text-epmaps-primary">Volver a iniciar sesión</Text>
                  </Pressable>
                </Link>
              </View>
            ) : (
              <>
                <Input
                  etiqueta="Nombre"
                  placeholder="Nombre y apellido"
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="name"
                  value={nombre}
                  onChangeText={setNombre}
                  returnKeyType="next"
                />
                <Input
                  etiqueta="Correo electrónico"
                  placeholder="nombre@dominio.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  value={correo}
                  onChangeText={setCorreo}
                  returnKeyType="next"
                />
                <View className="gap-2">
                  <Input
                    etiqueta="Contraseña"
                    placeholder="Crea una contraseña"
                    secureTextEntry={!mostrarClave}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    value={clave}
                    onChangeText={setClave}
                    returnKeyType="done"
                    trailing={
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        onPress={() => setMostrarClave((visible) => !visible)}
                        hitSlop={8}>
                        <Text className="text-xs font-bold text-epmaps-primary">
                          {mostrarClave ? 'Ocultar' : 'Mostrar'}
                        </Text>
                      </Pressable>
                    }
                  />
                  {fortaleza ? (
                    <View accessibilityLiveRegion="polite" className="gap-1">
                      <View className="flex-row gap-1">
                        {[0, 1, 2].map((segmento) => (
                          <View
                            key={segmento}
                            className={`h-1.5 flex-1 rounded-full ${segmento === 0 || (segmento === 1 && fortaleza !== 'débil') || (segmento === 2 && fortaleza === 'fuerte') ? colorBarra : 'bg-slate-200'}`}
                          />
                        ))}
                      </View>
                      <Text className={`text-xs font-semibold ${colorFortaleza}`}>
                        Seguridad de la contraseña: {fortaleza}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {error ? (
                  <View accessibilityLiveRegion="polite" className="rounded-2xl bg-status-danger/10 px-4 py-3">
                    <Text className="text-sm font-semibold text-red-700">{error}</Text>
                  </View>
                ) : null}

                <Button
                  titulo="Crear cuenta"
                  disabled={!nombre.trim() || !correo.trim() || !clave}
                  cargando={registrando}
                  onPress={crearCuenta}
                />
                <View className="flex-row items-center justify-center gap-1">
                  <Text className="text-sm text-slate-600">¿Ya tienes cuenta?</Text>
                  <Link href="/login" asChild>
                    <Pressable accessibilityRole="link" hitSlop={8}>
                      <Text className="font-bold text-epmaps-primary">Inicia sesión</Text>
                    </Pressable>
                  </Link>
                </View>
              </>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Fondo>
  );
}


================================================
ðŸ“„ ARCHIVO: src\app\(auth)\_layout.tsx
================================================

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}


================================================
ðŸ“„ ARCHIVO: src\app\(dashboard)\borrador-modal.tsx
================================================

import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui';
import type { Borrador, PasoRegistro } from '@/database/repositories/borradorRepository';
import { useSession } from '@/hooks/useSession';
import { borradorDe, descartarBorrador } from '@/services/borradores';
import { volver } from '@/utils/navegacion';

const ETIQUETA_PASO: Record<PasoRegistro, string> = {
  estado: 'Estado del medidor',
  datos: 'Datos de la lectura',
  foto: 'Foto de respaldo',
  resumen: 'Confirmación',
};

const ETIQUETA_ESTADO = { NORMAL: 'Normal', INACCESIBLE: 'Inaccesible', DANADO: 'Dañado' } as const;

/** R8: la app se cerró a mitad de un registro; se ofrece continuarlo o descartarlo. */
export default function BorradorModal() {
  const db = useSQLiteContext();
  const { sesion } = useSession();
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [descartando, setDescartando] = useState(false);

  // Sin borrador que retomar (p. ej. recarga en desarrollo) el aviso se cierra solo.
  useEffect(() => {
    if (!sesion) return;
    borradorDe(db, sesion.tecnico.codigo).then((b) => {
      if (b) setBorrador(b);
      else volver();
    });
  }, [db, sesion]);

  const continuar = () => {
    if (!borrador) return;
    router.replace({
      pathname: '/lectura/[codigo]',
      params: {
        codigo: borrador.codigoMedidor,
        reanudar: '1',
        ...(borrador.lecturaId !== null ? { id: String(borrador.lecturaId) } : {}),
      },
    });
  };

  const descartar = async () => {
    setDescartando(true);
    await descartarBorrador(db);
    volver();
  };

  const actualizado = borrador
    ? new Date(borrador.actualizadoEn).toLocaleString('es-EC', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // No se dibuja hasta confirmar el borrador, así no parpadea al cerrarse solo.
  if (!borrador) return null;

  return (
    <View className="flex-1 justify-center bg-epmaps-dark/70 p-6">
      <View className="gap-5 rounded-[28px] border border-white bg-white/95 p-6">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-status-offline/20">
          <Text className="text-2xl">📝</Text>
        </View>
        <View className="gap-1">
          <Text className="text-2xl font-extrabold text-epmaps-dark">Registro sin terminar</Text>
          <Text className="text-sm text-slate-500">
            La aplicación se cerró mientras registrabas una lectura. ¿Quieres continuar donde lo
            dejaste o descartarlo?
          </Text>
        </View>

        {borrador ? (
          <View className="gap-2 rounded-2xl bg-epmaps-accent/10 p-4">
            <Text className="text-lg font-bold text-epmaps-dark">{borrador.codigoMedidor}</Text>
            <Text className="text-sm text-slate-600">
              {borrador.lecturaId !== null ? 'Corrección de una lectura' : 'Lectura nueva'} · quedó en{' '}
              <Text className="font-semibold">{ETIQUETA_PASO[borrador.paso]}</Text>
            </Text>
            {borrador.datos.estado ? (
              <Text className="text-sm text-slate-600">
                Estado: {ETIQUETA_ESTADO[borrador.datos.estado]}
                {borrador.datos.lectura ? ` · lectura ${borrador.datos.lectura} m³` : ''}
                {borrador.datos.fotoUri ? ' · con foto' : ''}
              </Text>
            ) : null}
            <Text className="text-xs text-slate-500">Último cambio: {actualizado}</Text>
          </View>
        ) : null}

        <View className="gap-3">
          <Button titulo="Continuar registro" disabled={!borrador} onPress={continuar} />
          <Button titulo="Descartar" variante="peligro" cargando={descartando} onPress={descartar} />
        </View>
      </View>
    </View>
  );
}


================================================
ðŸ“„ ARCHIVO: src\app\(dashboard)\index.tsx
================================================

import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MedidorCard } from '@/components/MedidorCard';
import { Button, Card, Fondo, Input, ReflejosCabecera } from '@/components/ui';
import { esCodigoMedidorValido, LONGITUD_CODIGO_MEDIDOR } from '@/domain/medidor.rules';
import { useMedidorSearch } from '@/hooks/useMedidorSearch';
import { useSession } from '@/hooks/useSession';
import { borradorDe } from '@/services/borradores';
import { buscarDuplicado } from '@/services/duplicados';

/** El aviso de borrador pendiente se muestra una vez por apertura de la app (R8). */
let borradorOfrecido = false;

/** Identificación y consulta del medidor (R2, R3). */
export default function InicioScreen() {
  const { top } = useSafeAreaInsets();
  const { sesion, correo, cerrarSesion } = useSession();
  const { medidor, origen, cargando, error, sinConexion, buscar, limpiar } = useMedidorSearch();
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null);
  const [comprobando, setComprobando] = useState(false);
  const db = useSQLiteContext();

  const cambiarCodigo = (texto: string) => {
    setCodigo(texto.toUpperCase());
    setErrorCodigo(null);
    limpiar();
  };

  // R2: un código mal formado no consulta nada.
  const consultar = () => {
    const limpio = codigo.trim();
    if (!esCodigoMedidorValido(limpio)) {
      limpiar();
      setErrorCodigo('El código debe ser MED- seguido de 6 dígitos. Ejemplo: MED-100001');
      return;
    }
    buscar(limpio);
  };

  useEffect(() => {
    if (borradorOfrecido || !sesion) return;
    borradorOfrecido = true;
    borradorDe(db, sesion.tecnico.codigo).then((b) => {
      if (b) router.push('/borrador-modal');
    });
  }, [db, sesion]);

  const registrar = async () => {
    const limpio = codigo.trim();
    setComprobando(true);
    // R8: un registro a la vez; primero se decide qué hacer con el borrador.
    if (sesion && (await borradorDe(db, sesion.tecnico.codigo))) {
      setComprobando(false);
      router.push('/borrador-modal');
      return;
    }
    // R10: se rechaza un segundo registro del mismo medidor en el mes.
    const duplicado = await buscarDuplicado(db, limpio, medidor);
    setComprobando(false);

    if (!duplicado) {
      router.push({ pathname: '/lectura/[codigo]', params: { codigo: limpio } });
      return;
    }
    const corregible = duplicado.lecturaLocal?.estadoEnvio === 'PENDIENTE';
    Alert.alert('Lectura ya registrada este mes', duplicado.motivo, [
      { text: 'Entendido', style: 'cancel' },
      ...(corregible
        ? [
            {
              text: 'Corregir',
              onPress: () =>
                router.push({
                  pathname: '/lectura/[codigo]',
                  params: { codigo: limpio, id: String(duplicado.lecturaLocal!.id) },
                }),
            },
          ]
        : []),
    ]);
  };

  const confirmarCierre = () => {
    Alert.alert('Cerrar sesión', 'Deberás ingresar tu código y clave nuevamente.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: cerrarSesion },
    ]);
  };

  return (
    <Fondo>
      <View
        style={{ paddingTop: top + 16 }}
        className="overflow-hidden rounded-b-[32px] bg-epmaps-dark px-6 pb-14">
        <ReflejosCabecera />
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-widest text-epmaps-accent">Cuenta en jornada</Text>
            <Text className="text-2xl font-bold text-white">{sesion?.tecnico.nombre}</Text>
            <Text className="text-sm font-medium text-white/70">{correo}</Text>
          </View>
          <View className="gap-2">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/perfil')}
              className="items-center rounded-full bg-white px-4 py-3 active:opacity-90">
              <Text className="text-sm font-bold text-epmaps-primary">Mi perfil</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/lecturas')}
              className="rounded-full bg-white px-4 py-3 active:opacity-90">
              <Text className="text-sm font-bold text-epmaps-primary">Mis lecturas</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={confirmarCierre}
              className="items-center rounded-full border border-white/25 bg-white/15 px-4 py-3 active:bg-white/25">
              <Text className="text-sm font-semibold text-white">Salir</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        className="-mt-8 flex-1"
        contentContainerClassName="gap-4 px-4 pb-10"
        keyboardShouldPersistTaps="handled">
        <Card className="gap-4">
          <View>
            <Text className="text-lg font-bold text-epmaps-dark">Consultar medidor</Text>
            <Text className="text-sm text-slate-500">Escribe el código de la etiqueta del medidor.</Text>
          </View>
          <Input
            etiqueta="Código del medidor"
            placeholder="MED-000000"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={LONGITUD_CODIGO_MEDIDOR}
            returnKeyType="search"
            value={codigo}
            onChangeText={cambiarCodigo}
            onSubmitEditing={consultar}
            error={errorCodigo}
          />
          <Button titulo="Consultar" cargando={cargando} onPress={consultar} />
        </Card>

        {cargando ? (
          <View className="items-center py-6">
            <ActivityIndicator size="large" color="#0455BF" />
          </View>
        ) : null}

        {error ? (
          <Card className="gap-3 border-l-4 border-status-danger">
            <View>
              <Text className="font-semibold text-epmaps-dark">No se pudo mostrar el medidor</Text>
              <Text className="mt-1 text-sm text-slate-600">{error}</Text>
            </View>
            {/* R4: sin señal se puede registrar de todos modos. */}
            {sinConexion ? (
              <Button
                titulo="Registrar sin datos del medidor"
                variante="secundario"
                cargando={comprobando}
                onPress={registrar}
              />
            ) : null}
          </Card>
        ) : null}

        {medidor && origen ? (
          <>
            <MedidorCard medidor={medidor} origen={origen} />
            <Button titulo="Registrar lectura" cargando={comprobando} onPress={registrar} />
          </>
        ) : null}
      </ScrollView>
    </Fondo>
  );
}


================================================
ðŸ“„ ARCHIVO: src\app\(dashboard)\lectura\exito.tsx
================================================

import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Card, Fondo } from '@/components/ui';
import { obtenerLectura } from '@/database/repositories/lecturaRepository';
import type { Lectura } from '@/domain/types';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/** Confirmación: la lectura quedó guardada en el teléfono y pendiente de envío. */
export default function ExitoScreen() {
  const db = useSQLiteContext();
  const { bottom } = useSafeAreaInsets();
  const { id, corregida } = useLocalSearchParams<{ id: string; corregida?: string }>();
  const { ultimaSincronizacion } = useNetworkStatus();
  const [lectura, setLectura] = useState<Lectura | null>(null);

  // Se recarga al terminar cada sincronización para mostrar si ya se envió.
  useEffect(() => {
    obtenerLectura(db, Number(id)).then(setLectura);
  }, [db, id, ultimaSincronizacion]);

  return (
    <Fondo style={{ paddingBottom: bottom + 16 }} className="justify-between px-6">
      <View className="flex-1 items-center justify-center gap-4">
        <View className="h-24 w-24 items-center justify-center rounded-full border border-white bg-status-online/20">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-status-online">
            <Text className="text-3xl font-bold text-white">✓</Text>
          </View>
        </View>
        <Text className="text-3xl font-extrabold text-epmaps-dark">
          {corregida === '1' ? 'Lectura corregida' : 'Lectura registrada'}
        </Text>
        <Text className="text-center text-base font-semibold text-epmaps-secondary">{lectura?.codigoMedidor}</Text>

        {lectura ? (
          <Card className="mt-2 w-full gap-3">
            {lectura.consumo !== null ? (
              <Text className="text-center text-sm text-slate-500">
                Consumo del mes:{' '}
                <Text className="font-bold text-epmaps-dark">{lectura.consumo} m³</Text>
              </Text>
            ) : null}
            <View className="flex-row flex-wrap justify-center gap-2">
              {lectura.estadoEnvio === 'ENVIADA' ? (
                <Badge tono="exito" texto="Enviada a la oficina" />
              ) : lectura.estadoEnvio === 'RECHAZADA' ? (
                <Badge tono="peligro" texto="Rechazada: ya existía la lectura del mes" />
              ) : (
                <Badge tono="advertencia" texto="Pendiente de envío" />
              )}
              {lectura.verificacion === 'PENDIENTE_VERIFICAR' ? (
                <Badge tono="info" texto="Pendiente de verificar" />
              ) : lectura.verificacion === 'REQUIERE_REVISION' ? (
                <Badge tono="peligro" texto="Requiere revisión" />
              ) : (
                <Badge tono="exito" texto="Verificada con la lectura anterior" />
              )}
              {lectura.esAnomalo ? <Badge tono="peligro" texto="Consumo anómalo" /> : null}
            </View>
          </Card>
        ) : null}
      </View>

      <Button titulo="Registrar otro medidor" onPress={() => router.dismissTo('/')} />
    </Fondo>
  );
}


================================================
ðŸ“„ ARCHIVO: src\app\(dashboard)\lectura\[codigo]\datos.tsx
================================================

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Controller } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { CampoValidacionVibrante } from '@/components/CampoValidacionVibrante';
import { PasoAnimado } from '@/components/PasoAnimado';
import { RegistroHeader } from '@/components/RegistroHeader';
import { Button, Card, Checkbox, Fondo, Input } from '@/components/ui';
import { FACTOR_ANOMALIA } from '@/domain/medidor.rules';
import { useRegistro } from '@/hooks/useLecturaForm';

/** Paso 2: lectura, motivo o descripción según el estado (R5) y control de consumo (R6). */
export default function DatosScreen() {
  const { codigo, medidor, form, calculo, marcarPaso } = useRegistro();
  const [intentoValidacion, setIntentoValidacion] = useState(0);
  useFocusEffect(useCallback(() => marcarPaso('datos'), [marcarPaso]));
  const estado = form.watch('estado');
  const pideLectura = estado !== 'INACCESIBLE';

  const continuar = async () => {
    // Solo los campos de este paso.
    if (await form.trigger(['lectura', 'motivo', 'descripcion', 'revisionConfirmada'])) {
      router.push({ pathname: '/lectura/[codigo]/foto', params: { codigo } });
    } else {
      setIntentoValidacion((intento) => intento + 1);
    }
  };

  return (
    <Fondo>
      <PasoAnimado>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <RegistroHeader paso={2} titulo="Datos de la lectura" />
        <ScrollView contentContainerClassName="gap-4 p-4 pb-10" keyboardShouldPersistTaps="handled">
          {!medidor ? (
            <Card className="border-l-4 border-status-offline">
              <Text className="font-bold text-epmaps-dark">Sin datos del medidor</Text>
              <Text className="mt-1 text-sm text-slate-600">
                No hay señal y este medidor no se consultó antes. La lectura se guardará como pendiente
                de verificar y el consumo se calculará al recuperar la conexión.
              </Text>
            </Card>
          ) : null}

          <Card className="gap-4">
            {pideLectura ? (
              <>
                {medidor ? (
                  <View className="flex-row justify-between rounded-2xl bg-epmaps-dark/5 px-4 py-3">
                    <Text className="text-sm text-slate-500">Lectura anterior</Text>
                    <Text className="text-sm font-bold text-epmaps-dark">{medidor.ultimaLectura} m³</Text>
                  </View>
                ) : null}
                <Controller
                  control={form.control}
                  name="lectura"
                  render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                    <CampoValidacionVibrante error={error?.message} trigger={intentoValidacion}>
                      <Input
                        etiqueta={estado === 'DANADO' ? 'Lectura actual (opcional)' : 'Lectura actual (m³)'}
                        placeholder="0"
                        keyboardType="number-pad"
                        value={value}
                        onChangeText={(t) => {
                          onChange(t.replace(/\D/g, ''));
                          // Una lectura distinta exige volver a confirmar la revisión (R6).
                          form.setValue('revisionConfirmada', false);
                        }}
                        onBlur={onBlur}
                        error={error?.message}
                      />
                    </CampoValidacionVibrante>
                  )}
                />
              </>
            ) : null}

            {estado === 'INACCESIBLE' ? (
              <Controller
                control={form.control}
                name="motivo"
                render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                  <CampoValidacionVibrante error={error?.message} trigger={intentoValidacion}>
                    <Input
                      etiqueta="Motivo por el que es inaccesible"
                      placeholder="Ej. Perro suelto, caja bajo vehículo estacionado…"
                      multiline
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={error?.message}
                    />
                  </CampoValidacionVibrante>
                )}
              />
            ) : null}

            {estado === 'DANADO' ? (
              <Controller
                control={form.control}
                name="descripcion"
                render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                  <CampoValidacionVibrante error={error?.message} trigger={intentoValidacion}>
                    <Input
                      etiqueta="Descripción del daño"
                      placeholder="Ej. Vidrio roto, numerador empañado…"
                      multiline
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={error?.message}
                    />
                  </CampoValidacionVibrante>
                )}
              />
            ) : null}
          </Card>

          {pideLectura && calculo.consumo !== null && calculo.consumo >= 0 ? (
            <Card className={`gap-3 ${calculo.esAnomalo ? 'border-2 border-status-danger' : ''}`}>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Consumo del mes</Text>
                  <Text
                    className={`text-3xl font-extrabold ${calculo.esAnomalo ? 'text-red-700' : 'text-epmaps-dark'}`}>
                    {calculo.consumo} <Text className="text-base font-semibold text-slate-500">m³</Text>
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Promedio mensual</Text>
                  <Text className="text-3xl font-extrabold text-epmaps-dark">
                    {medidor?.consumoPromedio} <Text className="text-base font-semibold text-slate-500">m³</Text>
                  </Text>
                </View>
              </View>

              {calculo.esAnomalo ? (
                <View className="gap-3 rounded-2xl bg-status-danger/10 p-4">
                  <Text className="font-bold text-red-900">⚠ Consumo anómalo</Text>
                  <Text className="text-sm text-red-900">
                    Supera {FACTOR_ANOMALIA} veces el promedio mensual. Revisa el medidor y confirma
                    que la lectura es correcta. La foto del medidor será obligatoria.
                  </Text>
                  <Controller
                    control={form.control}
                    name="revisionConfirmada"
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                      <CampoValidacionVibrante error={error?.message} trigger={intentoValidacion}>
                        <Checkbox
                          marcado={value}
                          onCambiar={onChange}
                          etiqueta="Revisé el medidor y la lectura es correcta"
                          error={error?.message}
                        />
                      </CampoValidacionVibrante>
                    )}
                  />
                </View>
              ) : null}
            </Card>
          ) : null}

          <Button titulo="Continuar" onPress={continuar} />
        </ScrollView>
        </KeyboardAvoidingView>
      </PasoAnimado>
    </Fondo>
  );
}


================================================
ðŸ“„ ARCHIVO: src\app\(dashboard)\lectura\[codigo]\foto.tsx
================================================

import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { ScrollView } from 'react-native';

import { CameraCapture } from '@/components/CameraCapture';
import { PasoAnimado } from '@/components/PasoAnimado';
import { RegistroHeader } from '@/components/RegistroHeader';
import { Button, Fondo } from '@/components/ui';
import { useRegistro } from '@/hooks/useLecturaForm';

/** Paso 3: foto del medidor, obligatoria u opcional según R7. */
export default function FotoScreen() {
  const { codigo, original, form, calculo, marcarPaso } = useRegistro();
  useFocusEffect(useCallback(() => marcarPaso('foto'), [marcarPaso]));
  // useWatch y no watch: con React Compiler, watch no actualiza el botón.
  const estado = useWatch({ control: form.control, name: 'estado' });
  const fotoUri = useWatch({ control: form.control, name: 'fotoUri' });

  const motivo =
    estado === 'DANADO'
      ? 'el medidor está dañado'
      : calculo.esAnomalo
        ? 'el consumo supera el triple del promedio'
        : null;

  const continuar = async () => {
    if (await form.trigger('fotoUri')) {
      router.push({ pathname: '/lectura/[codigo]/resumen', params: { codigo } });
    }
  };

  return (
    <Fondo>
      <PasoAnimado>
        <RegistroHeader paso={3} titulo="Foto de respaldo" />
        <ScrollView contentContainerClassName="gap-4 p-4 pb-10">
          <Controller
            control={form.control}
            name="fotoUri"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <CameraCapture
                codigoMedidor={codigo}
                fotoUri={value}
                obligatoria={calculo.fotoObligatoria}
                motivoObligatoria={motivo}
                onCambiar={(uri) => {
                  onChange(uri);
                  if (uri) form.clearErrors('fotoUri');
                }}
                error={error?.message}
                fotoProtegida={original?.fotoUri}
              />
            )}
          />
          <Button
            titulo={!fotoUri && !calculo.fotoObligatoria ? 'Continuar sin foto' : 'Continuar'}
            disabled={!fotoUri && calculo.fotoObligatoria}
            onPress={continuar}
          />
        </ScrollView>
      </PasoAnimado>
    </Fondo>
  );
}


================================================
ðŸ“„ ARCHIVO: src\app\(dashboard)\lectura\[codigo]\index.tsx
================================================

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { RegistroHeader } from '@/components/RegistroHeader';
import { PasoAnimado } from '@/components/PasoAnimado';
import { Button, Fondo } from '@/components/ui';
import type { EstadoMedidor } from '@/domain/types';
import { useRegistro } from '@/hooks/useLecturaForm';

const OPCIONES: { estado: EstadoMedidor; titulo: string; detalle: string; color: string }[] = [
  {
    estado: 'NORMAL',
    titulo: 'Normal',
    detalle: 'El medidor se puede leer. La lectura es obligatoria.',
    color: 'bg-status-online',
  },
  {
    estado: 'INACCESIBLE',
    titulo: 'Inaccesible',
    detalle: 'No se puede llegar al medidor. Indica el motivo; no se registra lectura.',
    color: 'bg-status-offline',
  },
  {
    estado: 'DANADO',
    titulo: 'Dañado',
    detalle: 'Describe el daño. La lectura es opcional.',
    color: 'bg-status-danger',
  },
];

const SIGUIENTES_PASOS = [
  { paso: 'datos', ruta: '/lectura/[codigo]/datos' },
  { paso: 'foto', ruta: '/lectura/[codigo]/foto' },
  { paso: 'resumen', ruta: '/lectura/[codigo]/resumen' },
] as const;

/** Paso 1: estado del medidor (R5). */
export default function EstadoScreen() {
  const { codigo, form, marcarPaso, tomarPasoAReanudar } = useRegistro();

  useFocusEffect(useCallback(() => marcarPaso('estado'), [marcarPaso]));

  // R8: al reanudar se apilan los pasos hasta donde quedó, así "Volver" respeta el orden.
  useEffect(() => {
    const destino = tomarPasoAReanudar();
    if (!destino || destino === 'estado') return;
    for (const { paso, ruta } of SIGUIENTES_PASOS) {
      router.push({ pathname: ruta, params: { codigo } });
      if (paso === destino) break;
    }
  }, [codigo, tomarPasoAReanudar]);

  const continuar = async () => {
    if (await form.trigger('estado')) {
      router.push({ pathname: '/lectura/[codigo]/datos', params: { codigo } });
    }
  };

  return (
    <Fondo>
      <PasoAnimado>
        <RegistroHeader paso={1} titulo="Estado del medidor" />
        <ScrollView contentContainerClassName="gap-3 p-4 pb-10">
          <Controller
            control={form.control}
            name="estado"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View className="gap-3">
                {OPCIONES.map((op) => {
                  const elegido = value === op.estado;
                  return (
                    <Pressable
                      key={op.estado}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: elegido }}
                      onPress={() => {
                        onChange(op.estado);
                        // Un medidor inaccesible no registra lectura (R5).
                        if (op.estado === 'INACCESIBLE') form.setValue('lectura', '');
                      }}
                      className={`flex-row items-center gap-4 rounded-3xl border-2 p-5 ${
                        elegido ? 'border-epmaps-accent bg-epmaps-accent/10' : 'border-white bg-white/75'
                      }`}>
                      <View className={`h-4 w-4 rounded-full ${op.color}`} />
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-epmaps-dark">{op.titulo}</Text>
                        <Text className="text-sm text-slate-500">{op.detalle}</Text>
                      </View>
                      <View
                        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                          elegido ? 'border-epmaps-primary' : 'border-epmaps-dark/20'
                        }`}>
                        {elegido ? <View className="h-3 w-3 rounded-full bg-epmaps-primary" /> : null}
                      </View>
                    </Pressable>
                  );
                })}
                {error ? (
                  <Text className="text-sm font-semibold text-red-700">{error.message}</Text>
                ) : null}
              </View>
            )}
          />
          <View className="mt-2">
            <Button titulo="Continuar" onPress={continuar} />
          </View>
        </ScrollView>
      </PasoAnimado>
    </Fondo>
  );
}


================================================
ðŸ“„ ARCHIVO: src\app\(dashboard)\lectura\[codigo]\resumen.tsx
================================================

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { BotonEnviarLectura } from '@/components/BotonEnviarLectura';
import { FotoEvidenciaExpandible } from '@/components/FotoEvidenciaExpandible';
import { PasoAnimado } from '@/components/PasoAnimado';
import { RegistroHeader } from '@/components/RegistroHeader';
import { useToast } from '@/components/ToastProvider';
import { Badge, Card, Fondo } from '@/components/ui';
import {
  LecturaDuplicadaError,
  LecturaYaEnviadaError,
} from '@/database/repositories/lecturaRepository';
import { useRegistro } from '@/hooks/useLecturaForm';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const ETIQUETA_ESTADO = { NORMAL: 'Normal', INACCESIBLE: 'Inaccesible', DANADO: 'Dañado' } as const;

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View className="flex-row justify-between gap-4 border-b border-epmaps-dark/10 py-3">
      <Text className="text-sm text-slate-500">{etiqueta}</Text>
      <Text className="flex-1 text-right text-sm font-semibold text-epmaps-dark">{valor}</Text>
    </View>
  );
}

/** Paso 4: revisión final y guardado en el teléfono (R4) o corrección (R10). */
export default function ResumenScreen() {
  const { medidor, original, form, calculo, guardar, marcarPaso } = useRegistro();
  useFocusEffect(useCallback(() => marcarPaso('resumen'), [marcarPaso]));
  const { sincronizar } = useNetworkStatus();
  const notificar = useToast();
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guardadoEnCurso = useRef(false);
  const v = form.watch();

  // The ref prevents duplicate writes before React can render the disabled button.
  // eslint-disable-next-line react-hooks/refs
  const registrar = form.handleSubmit(async () => {
    if (guardadoEnCurso.current) return;
    guardadoEnCurso.current = true;
    setError(null);
    setGuardando(true);
    let id: number;
    try {
      id = await guardar();
    } catch (e) {
      console.error('No se pudo guardar la lectura', e);
      setError(
        e instanceof LecturaDuplicadaError || e instanceof LecturaYaEnviadaError
          ? e.message
          : `No se pudo guardar la lectura en el teléfono. Detalle: ${
              e instanceof Error ? e.message : String(e)
            }`,
      );
      setGuardando(false);
      guardadoEnCurso.current = false;
      return;
    }
    setGuardando(false);
    setGuardado(true);
    notificar('Lectura guardada en SQLite');
    await new Promise<void>((resolver) => setTimeout(resolver, 650));
    // Ya está guardada: un fallo del envío no debe reportarse como fallo al guardar.
    void sincronizar().catch((errorSincronizacion) => {
      console.warn('La lectura quedó guardada; se reintentará la sincronización', errorSincronizacion);
      notificar('Lectura guardada; envío pendiente de conexión');
    });
    router.replace({
      pathname: '/lectura/exito',
      params: { id: String(id), corregida: original ? '1' : '0' },
    });
  });

  return (
    <Fondo>
    <PasoAnimado>
      <RegistroHeader paso={4} titulo={original ? 'Confirmar corrección' : 'Confirmar registro'} />
      <ScrollView contentContainerClassName="gap-4 p-4 pb-10">
        <Card>
          <Fila etiqueta="Estado del medidor" valor={ETIQUETA_ESTADO[v.estado]} />
          {v.estado !== 'INACCESIBLE' ? (
            <Fila
              etiqueta="Lectura actual"
              valor={calculo.lectura !== null ? `${calculo.lectura} m³` : 'Sin lectura'}
            />
          ) : null}
          {medidor && calculo.lectura !== null ? (
            <>
              <Fila etiqueta="Lectura anterior" valor={`${medidor.ultimaLectura} m³`} />
              <Fila etiqueta="Consumo del mes" valor={`${calculo.consumo} m³`} />
            </>
          ) : null}
          {v.estado === 'INACCESIBLE' ? <Fila etiqueta="Motivo" valor={v.motivo} /> : null}
          {v.estado === 'DANADO' ? <Fila etiqueta="Descripción del daño" valor={v.descripcion} /> : null}
          <Fila etiqueta="Foto" valor={v.fotoUri ? 'Adjunta' : 'Sin foto'} />
          {calculo.esAnomalo ? (
            <View className="mt-3">
              <Badge tono="peligro" texto="Consumo anómalo · revisión confirmada" />
            </View>
          ) : null}
          {v.fotoUri ? (
            <FotoEvidenciaExpandible uri={v.fotoUri} />
          ) : null}
        </Card>

        <Card className="border-l-4 border-epmaps-secondary">
          <Text className="text-sm text-slate-600">
            La lectura se guarda en el teléfono y se enviará al sistema de la oficina cuando haya
            conexión. Mientras no se envíe, podrás corregirla.
          </Text>
        </Card>

        {error ? (
          <View className="rounded-2xl bg-status-danger/10 px-4 py-3">
            <Text className="text-sm font-semibold text-red-700">{error}</Text>
          </View>
        ) : null}

        <BotonEnviarLectura
          titulo={original ? 'Guardar corrección' : 'Registrar lectura'}
          cargando={guardando}
          completado={guardado}
          onPress={() => registrar()}
        />
        </ScrollView>
      </PasoAnimado>
    </Fondo>
  );
}


================================================
ðŸ“„ ARCHIVO: src\app\(dashboard)\lectura\[codigo]\_layout.tsx
================================================

import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { Button, Card, Fondo } from '@/components/ui';
import { obtenerBorrador, type Borrador } from '@/database/repositories/borradorRepository';
import { obtenerLectura } from '@/database/repositories/lecturaRepository';
import { obtenerMedidorEnCache } from '@/database/repositories/medidorRepository';
import type { Lectura, MedidorEnCache } from '@/domain/types';
import { RegistroProvider } from '@/hooks/useLecturaForm';
import { descartarBorrador } from '@/services/borradores';
import { volver } from '@/utils/navegacion';

interface Carga {
  medidor: MedidorEnCache | null;
  original: Lectura | null;
  borrador: Borrador | null;
}

/** Flujo de registro: `id` corrige una lectura (R10) y `reanudar` retoma el borrador (R8). */
export default function RegistroLayout() {
  const db = useSQLiteContext();
  const { codigo, id, reanudar } = useLocalSearchParams<{
    codigo: string;
    id?: string;
    reanudar?: string;
  }>();
  const [carga, setCarga] = useState<Carga | null>(null);

  useEffect(() => {
    Promise.all([
      obtenerMedidorEnCache(db, codigo),
      id ? obtenerLectura(db, Number(id)) : null,
      reanudar === '1' ? obtenerBorrador(db) : null,
    ]).then(async ([medidor, original, borrador]) => {
      // El borrador de una corrección que ya se envió no sirve.
      if (borrador && original && original.estadoEnvio !== 'PENDIENTE') await descartarBorrador(db);
      setCarga({ medidor, original, borrador });
    });
    // id y reanudar solo cuentan al abrir el flujo, no al avanzar entre pasos.
  }, [db, codigo]);

  if (!carga) {
    return (
      <Fondo className="items-center justify-center">
        <ActivityIndicator size="large" color="#0455BF" />
      </Fondo>
    );
  }

  if (carga.original && carga.original.estadoEnvio !== 'PENDIENTE') {
    return (
      <Fondo className="justify-center p-6">
        <Card className="gap-4">
          <Text className="text-lg font-bold text-epmaps-dark">No se puede corregir</Text>
          <Text className="text-sm text-slate-600">
            Esta lectura ya se envió al sistema de la oficina. Solo se pueden corregir las lecturas
            que aún no se envían.
          </Text>
          <Button titulo="Volver" variante="contorno" onPress={volver} />
        </Card>
      </Fondo>
    );
  }

  return (
    <RegistroProvider
      codigo={codigo}
      medidor={carga.medidor}
      original={carga.original}
      borrador={carga.borrador}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </RegistroProvider>
  );
}


================================================
ðŸ“„ ARCHIVO: src\app\(dashboard)\lecturas.tsx
================================================

import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LecturaItem } from '@/components/LecturaItem';
import { Card, Fondo, ReflejosCabecera } from '@/components/ui';
import { listarLecturasDeTecnico } from '@/database/repositories/lecturaRepository';
import type { Lectura } from '@/domain/types';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSession } from '@/hooks/useSession';
import { borradorDe } from '@/services/borradores';
import { volver } from '@/utils/navegacion';

/** Lecturas registradas por el técnico; las pendientes se pueden corregir (R10). */
export default function MisLecturasScreen() {
  const db = useSQLiteContext();
  const { top } = useSafeAreaInsets();
  const { sesion } = useSession();
  const { ultimaSincronizacion } = useNetworkStatus();
  const [lecturas, setLecturas] = useState<Lectura[]>([]);

  // Se recarga al volver a la pantalla y cuando termina un envío.
  useFocusEffect(
    useCallback(() => {
      if (sesion) listarLecturasDeTecnico(db, sesion.tecnico.codigo).then(setLecturas);
    }, [db, sesion, ultimaSincronizacion]),
  );

  return (
    <Fondo>
      <View
        style={{ paddingTop: top + 8 }}
        className="overflow-hidden rounded-b-[32px] bg-epmaps-dark px-5 pb-6">
        <ReflejosCabecera />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={volver}
          className="h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/15 active:bg-white/25">
          <Text className="text-xl font-bold text-white">‹</Text>
        </Pressable>
        <Text className="mt-4 text-2xl font-extrabold text-white">Mis lecturas</Text>
        <Text className="text-sm text-white/70">
          Puedes corregir una lectura mientras no se haya enviado.
        </Text>
      </View>

      <FlatList
        data={lecturas}
        keyExtractor={(l) => String(l.id)}
        contentContainerClassName="gap-3 p-4 pb-10"
        renderItem={({ item }) => (
          <LecturaItem
            lectura={item}
            onCorregir={async () => {
              // R8: un registro a la vez.
              if (sesion && (await borradorDe(db, sesion.tecnico.codigo))) {
                router.push('/borrador-modal');
                return;
              }
              router.push({
                pathname: '/lectura/[codigo]',
                params: { codigo: item.codigoMedidor, id: String(item.id) },
              });
            }}
          />
        )}
        ListEmptyComponent={
          <Card>
            <Text className="text-center text-sm text-slate-500">Aún no registras lecturas.</Text>
          </Card>
        }
      />
    </Fondo>
  );
}


================================================
ðŸ“„ ARCHIVO: src\app\(dashboard)\perfil.tsx
================================================

import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Fondo, Input, ReflejosCabecera } from '@/components/ui';
import { useSession } from '@/hooks/useSession';
import { useSesion } from '@/context/sesion';
import { mensajeDeError } from '@/lib/errores-firebase';

export default function PerfilScreen() {
  const { top } = useSafeAreaInsets();
  const { sesion, correo } = useSession();
  const { actualizarNombre } = useSesion();
  const [nombre, setNombre] = useState(sesion?.tecnico.nombre ?? '');
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setError(null);
    setGuardado(false);
    setGuardando(true);
    try {
      await actualizarNombre(nombre);
      setNombre(nombre.trim());
      setGuardado(true);
    } catch (errorActualizacion) {
      setError(mensajeDeError(errorActualizacion));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Fondo>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
          <View
            style={{ paddingTop: top + 16 }}
            className="overflow-hidden rounded-b-[32px] bg-epmaps-dark px-5 pb-8">
            <ReflejosCabecera />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver"
              onPress={() => router.back()}
              className="h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/15 active:bg-white/25">
              <Text className="text-xl font-bold text-white">‹</Text>
            </Pressable>
            <Text className="mt-4 text-2xl font-extrabold text-white">Mi perfil</Text>
            <Text className="text-sm text-white/70">Actualiza el nombre que aparece en tu cuenta.</Text>
          </View>

          <Card className="-mt-5 mx-4 mb-10 gap-5 p-6">
            <View className="gap-1">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Correo electrónico
              </Text>
              <Text className="text-base font-semibold text-epmaps-dark">{correo}</Text>
            </View>

            <Input
              etiqueta="Nombre"
              placeholder="Nombre y apellido"
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              value={nombre}
              onChangeText={(valor) => {
                setNombre(valor);
                setGuardado(false);
              }}
              returnKeyType="done"
              onSubmitEditing={guardar}
            />

            {error ? (
              <View accessibilityLiveRegion="polite" className="rounded-2xl bg-status-danger/10 px-4 py-3">
                <Text className="text-sm font-semibold text-red-700">{error}</Text>
              </View>
            ) : null}
            {guardado ? (
              <View accessibilityLiveRegion="polite" className="rounded-2xl bg-green-50 px-4 py-3">
                <Text className="text-sm font-semibold text-green-800">Nombre actualizado correctamente.</Text>
              </View>
            ) : null}

            <Button
              titulo="Guardar cambios"
              disabled={!nombre.trim() || nombre.trim() === sesion?.tecnico.nombre}
              cargando={guardando}
              onPress={guardar}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Fondo>
  );
}


================================================
ðŸ“„ ARCHIVO: src\app\(dashboard)\_layout.tsx
================================================

import { Stack } from 'expo-router';

// La consulta queda siempre en la base de la pila: el aviso y el registro tienen a dónde volver.
export const unstable_settings = {
  anchor: 'index',
};

export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="borrador-modal"
        options={{ presentation: 'transparentModal', animation: 'fade', gestureEnabled: false }}
      />
    </Stack>
  );
}


================================================
ðŸ“„ ARCHIVO: src\app\_layout.tsx
================================================

/**
 * Layout raíz: es lo primero que se ejecuta al abrir la app.
 *
 * Responsabilidades:
 *   1. Cargar las fuentes.
 *   2. Envolver la app en el ProveedorSesion (para que todas las pantallas
 *      conozcan al usuario).
 *   3. Decidir qué pantallas existen según haya o no sesión (Stack.Protected).
 *   4. Mantener visible la pantalla de carga (splash) hasta tener todo listo.
 */

import '@/global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';

import { NetworkStatusBar } from '@/components/NetworkStatusBar';
import { ToastProvider } from '@/components/ToastProvider';
import { DATABASE_NAME, initDatabase } from '@/database/client';
import { NetworkProvider } from '@/hooks/useNetworkStatus';
import { SessionProvider, useSession } from '@/hooks/useSession';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
        <ToastProvider>
          <SessionProvider>
            <AppShell />
          </SessionProvider>
        </ToastProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}

function AppShell() {
  const { sesion, cargando } = useSession();
  const autenticado = !cargando && sesion !== null;

  return (
    <NetworkProvider key={autenticado ? 'authenticated' : 'unauthenticated'} enabled={autenticado}>
      <View className="flex-1">
        {autenticado ? <NetworkStatusBar /> : null}
        {autenticado ? (
          <SinMargenSuperior>
            <RootNavigator />
          </SinMargenSuperior>
        ) : (
          <RootNavigator />
        )}
      </View>
    </NetworkProvider>
  );
}

/** La barra ya ocupa el área de la barra de estado; las pantallas no deben sumarla otra vez. */
function SinMargenSuperior({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaInsetsContext.Provider value={{ ...insets, top: 0 }}>{children}</SafeAreaInsetsContext.Provider>
  );
}

/** Sin sesión solo existe (auth); con sesión solo (dashboard). Expo Router redirige solo (R1). */
function RootNavigator() {
  const { sesion, cargando } = useSession();

  useEffect(() => {
    if (!cargando) SplashScreen.hideAsync();
  }, [cargando]);

  if (cargando) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={sesion !== null}>
        <Stack.Screen name="(dashboard)" />
      </Stack.Protected>
      <Stack.Protected guard={sesion === null}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\BotonEnviarLectura.tsx
================================================

import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const TrazoAnimado = Animated.createAnimatedComponent(Path);

export function BotonEnviarLectura({
  titulo,
  cargando,
  completado,
  onPress,
}: {
  titulo: string;
  cargando: boolean;
  completado: boolean;
  onPress: () => void;
}) {
  const [anchoMedido, setAnchoMedido] = useState(0);
  const ancho = useSharedValue(0);
  const escala = useSharedValue(1);
  const trazo = useSharedValue(24);
  const estiloBoton = useAnimatedStyle(() => ({
    width: ancho.value > 0 ? ancho.value : '100%',
  }));
  const estiloOnda = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
  }));
  const propsTrazo = useAnimatedProps(() => ({ strokeDashoffset: trazo.value }));

  useEffect(() => {
    if (!anchoMedido) return;
    if (!completado) {
      // The first measurement establishes the expanded width without animating from zero.
      // eslint-disable-next-line react-hooks/immutability
      ancho.value = anchoMedido;
      return;
    }
    ancho.value = withTiming(56, { duration: 260 });
    // Reanimated shared values are intentionally mutated to run the success animation.
    // eslint-disable-next-line react-hooks/immutability
    trazo.value = withTiming(0, { duration: 420 });
    // eslint-disable-next-line react-hooks/immutability
    escala.value = withSequence(withSpring(1.2), withSpring(1));
  }, [ancho, anchoMedido, completado, escala, trazo]);

  return (
    <View
      className="w-full items-center"
      onLayout={(evento) => setAnchoMedido(evento.nativeEvent.layout.width)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={completado ? 'Lectura guardada' : titulo}
        accessibilityState={{ disabled: cargando || completado, busy: cargando }}
        disabled={cargando || completado}
        onPress={onPress}>
        <Animated.View
          style={estiloBoton}
          className={`h-14 items-center justify-center bg-epmaps-primary px-4 ${
            completado ? 'rounded-full' : 'rounded-2xl'
          }`}>
          {completado ? (
            <Animated.View
              style={estiloOnda}
              className="h-10 w-10 items-center justify-center rounded-full border-2 border-white/60">
              <Svg width={28} height={28} viewBox="0 0 24 24">
                <TrazoAnimado
                  d="M4.5 12.5 9.5 17 20 6.5"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={24}
                  animatedProps={propsTrazo}
                />
              </Svg>
            </Animated.View>
          ) : cargando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-center text-base font-bold tracking-wide text-white">{titulo}</Text>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\CameraCapture.tsx
================================================

import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';

import { useCameraPermission } from '@/hooks/useCameraPermission';
import { eliminarFoto, persistirFoto } from '@/services/imageStorage';

import { Badge, Button, Card } from './ui';

interface CameraCaptureProps {
  codigoMedidor: string;
  fotoUri: string | null;
  obligatoria: boolean;
  motivoObligatoria: string | null;
  onCambiar: (uri: string | null) => void;
  error?: string;
  /** Foto de la lectura que se corrige: no se borra hasta guardar la corrección. */
  fotoProtegida?: string | null;
}

/** Foto del medidor con la cámara del sistema y manejo del permiso denegado (R7). */
export function CameraCapture({
  codigoMedidor,
  fotoUri,
  obligatoria,
  motivoObligatoria,
  onCambiar,
  error,
  fotoProtegida = null,
}: CameraCaptureProps) {
  const { estado, solicitar, abrirAjustes } = useCameraPermission();
  const [capturando, setCapturando] = useState(false);
  const [errorCaptura, setErrorCaptura] = useState<string | null>(null);

  const tomarFoto = async () => {
    setErrorCaptura(null);
    if (estado !== 'concedido' && !(await solicitar())) return;

    setCapturando(true);
    try {
      const resultado = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
      if (resultado.canceled) return;
      const nueva = await persistirFoto(resultado.assets[0].uri, codigoMedidor);
      descartar(fotoUri);
      onCambiar(nueva);
    } catch {
      setErrorCaptura('No se pudo guardar la foto. Inténtalo de nuevo.');
    } finally {
      setCapturando(false);
    }
  };

  const descartar = (uri: string | null) => {
    if (uri !== fotoProtegida) eliminarFoto(uri);
  };

  const quitarFoto = () => {
    descartar(fotoUri);
    onCambiar(null);
  };

  const sinPermiso = estado === 'denegado' || estado === 'bloqueado';

  return (
    <View className="gap-4">
      <Card className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-epmaps-dark">Foto del medidor</Text>
          <Badge tono={obligatoria ? 'peligro' : 'info'} texto={obligatoria ? 'Obligatoria' : 'Opcional'} />
        </View>
        <Text className="text-sm text-slate-600">
          La foto respalda qué marcaba el medidor el día de la visita, por si el cliente reclama
          por su consumo.
          {motivoObligatoria ? ` En este registro es obligatoria porque ${motivoObligatoria}.` : ''}
        </Text>

        {fotoUri ? (
          <>
            <Image
              source={{ uri: fotoUri }}
              accessibilityLabel="Foto del medidor"
              className="w-full rounded-2xl bg-epmaps-dark/10"
              style={{ aspectRatio: 3 / 4 }}
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button titulo="Tomar otra" variante="contorno" cargando={capturando} onPress={tomarFoto} />
              </View>
              {!obligatoria ? (
                <View className="flex-1">
                  <Button titulo="Quitar foto" variante="contorno" onPress={quitarFoto} />
                </View>
              ) : null}
            </View>
          </>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: estado === 'cargando' || capturando, busy: capturando }}
            disabled={estado === 'cargando' || capturando}
            onPress={estado === 'bloqueado' ? abrirAjustes : tomarFoto}
            className={`items-center gap-1 rounded-2xl border-2 border-dashed border-epmaps-accent bg-epmaps-accent/10 p-6 active:bg-epmaps-accent/20 ${
              estado === 'cargando' ? 'opacity-40' : ''
            }`}>
            {capturando ? (
              <ActivityIndicator color="#0455BF" />
            ) : (
              <>
                <Text className="text-3xl">📷</Text>
                <Text className="text-base font-bold text-epmaps-primary">
                  {estado === 'bloqueado' ? 'Abrir Ajustes' : 'Tomar fotografía del medidor'}
                </Text>
              </>
            )}
          </Pressable>
        )}

        {errorCaptura ? <Text className="text-sm font-semibold text-red-700">{errorCaptura}</Text> : null}
        {error && !fotoUri ? <Text className="text-sm font-semibold text-red-700">{error}</Text> : null}
      </Card>

      {sinPermiso && !fotoUri ? (
        <Card className="gap-2 border-l-4 border-status-offline">
          <Text className="font-bold text-epmaps-dark">La app no tiene permiso para usar la cámara</Text>
          <Text className="text-sm text-slate-600">
            Se necesita la cámara solo para fotografiar el medidor como respaldo de la lectura. No se
            usa para nada más.
          </Text>
          <Text className="text-sm text-slate-600">
            {estado === 'bloqueado'
              ? 'El permiso quedó bloqueado: actívalo en Ajustes › Permisos › Cámara.'
              : 'Pulsa "Tomar fotografía del medidor" para volver a pedir el permiso.'}
          </Text>
          <Text className="text-sm font-semibold text-epmaps-dark">
            {obligatoria
              ? 'Sin la foto no puedes completar este registro.'
              : 'Como la foto es opcional, puedes continuar sin ella.'}
          </Text>
        </Card>
      ) : null}
    </View>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\CampoValidacionVibrante.tsx
================================================

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function CampoValidacionVibrante({
  children,
  error,
  trigger,
}: {
  children: ReactNode;
  error?: string;
  trigger: number;
}) {
  const desplazamiento = useSharedValue(0);
  const estilo = useAnimatedStyle(() => ({
    transform: [{ translateX: desplazamiento.value }],
  }));

  useEffect(() => {
    if (error) {
      // Reanimated shared values are intentionally mutated to start the field shake.
      // eslint-disable-next-line react-hooks/immutability
      desplazamiento.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-7, { duration: 50 }),
        withTiming(7, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [desplazamiento, error, trigger]);

  return <Animated.View style={estilo}>{children}</Animated.View>;
}


================================================
ðŸ“„ ARCHIVO: src\components\FotoEvidenciaExpandible.tsx
================================================

import { useCallback, useMemo, useState } from 'react';
import { Image, Modal, Pressable, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export function FotoEvidenciaExpandible({ uri }: { uri: string }) {
  const { width, height } = useWindowDimensions();
  const [expandida, setExpandida] = useState(false);
  const desplazamiento = useSharedValue(0);
  const escala = useSharedValue(0.88);
  const opacidadFondo = useSharedValue(0);

  const cerrar = useCallback(() => {
    // Reanimated shared values are intentionally mutated to animate the close gesture.
    // eslint-disable-next-line react-hooks/immutability
    opacidadFondo.value = withTiming(0, { duration: 180 }, (terminada) => {
      if (terminada) runOnJS(setExpandida)(false);
    });
    // eslint-disable-next-line react-hooks/immutability
    escala.value = withSpring(0.88);
    // eslint-disable-next-line react-hooks/immutability
    desplazamiento.value = withSpring(0);
  }, [desplazamiento, escala, opacidadFondo]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((evento) => {
          // eslint-disable-next-line react-hooks/immutability
          desplazamiento.value = Math.max(0, evento.translationY);
        })
        .onEnd(() => {
          if (desplazamiento.value > 110) {
            runOnJS(cerrar)();
          } else {
            // eslint-disable-next-line react-hooks/immutability
            desplazamiento.value = withSpring(0, { damping: 18, stiffness: 180 });
          }
        }),
    [cerrar, desplazamiento],
  );

  const fondoAnimado = useAnimatedStyle(() => ({ opacity: opacidadFondo.value }));
  const fotoAnimada = useAnimatedStyle(() => ({
    opacity: opacidadFondo.value,
    transform: [
      { translateY: desplazamiento.value },
      {
        scale:
          escala.value *
          interpolate(desplazamiento.value, [0, 220], [1, 0.72], Extrapolation.CLAMP),
      },
    ],
  }));

  const abrir = () => {
    // Reanimated shared values are intentionally mutated when opening the image.
    // eslint-disable-next-line react-hooks/immutability
    desplazamiento.value = 0;
    // eslint-disable-next-line react-hooks/immutability
    escala.value = 0.88;
    // eslint-disable-next-line react-hooks/immutability
    opacidadFondo.value = 0;
    setExpandida(true);
    escala.value = withSpring(1, { damping: 16, stiffness: 150 });
    opacidadFondo.value = withTiming(1, { duration: 220 });
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ampliar foto del medidor"
        onPress={abrir}
        className="mt-3 overflow-hidden rounded-2xl">
        <Image
          source={{ uri }}
          accessibilityLabel="Foto del medidor"
          className="h-40 w-full bg-epmaps-dark/10"
          resizeMode="cover"
        />
      </Pressable>
      <Modal
        visible={expandida}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={cerrar}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Animated.View
            style={[{ backgroundColor: 'rgba(0,0,0,0.72)' }, fondoAnimado]}
            className="flex-1 items-center justify-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar foto ampliada"
              onPress={cerrar}
              className="absolute inset-0"
            />
            <GestureDetector gesture={pan}>
              <Animated.View
                style={[
                  { width: width - 32, height: height * 0.72 },
                  fotoAnimada,
                ]}
                className="overflow-hidden rounded-2xl bg-epmaps-dark/20">
                <Image source={{ uri }} className="h-full w-full" resizeMode="contain" />
              </Animated.View>
            </GestureDetector>
          </Animated.View>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\LecturaItem.tsx
================================================

import { Image, Text, View } from 'react-native';

import type { Lectura } from '@/domain/types';

import { Badge, Button, Card } from './ui';

const ETIQUETA_ESTADO = { NORMAL: 'Normal', INACCESIBLE: 'Inaccesible', DANADO: 'Dañado' } as const;

const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-EC', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

function BadgeEnvio({ lectura }: { lectura: Lectura }) {
  if (lectura.estadoEnvio === 'ENVIADA') return <Badge tono="exito" texto="Enviada" />;
  if (lectura.estadoEnvio === 'RECHAZADA') return <Badge tono="peligro" texto="Rechazada" />;
  return <Badge tono="advertencia" texto="Pendiente de envío" />;
}

/** Una lectura del técnico; solo las pendientes ofrecen corregir (R10). */
export function LecturaItem({ lectura, onCorregir }: { lectura: Lectura; onCorregir: () => void }) {
  const pendiente = lectura.estadoEnvio === 'PENDIENTE';

  return (
    <Card className="gap-3">
      <View className="flex-row gap-4">
        {lectura.fotoUri ? (
          <Image
            source={{ uri: lectura.fotoUri }}
            accessibilityLabel="Foto del medidor"
            className="h-20 w-20 rounded-2xl bg-epmaps-dark/10"
          />
        ) : null}
        <View className="flex-1 gap-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-extrabold text-epmaps-dark">{lectura.codigoMedidor}</Text>
            <Text className="text-xs text-slate-500">{fechaHora(lectura.registradaEn)}</Text>
          </View>
          <Text className="text-sm text-slate-600">
            {ETIQUETA_ESTADO[lectura.estadoMedidor]}
            {lectura.lectura !== null ? ` · ${lectura.lectura} m³` : ''}
            {lectura.consumo !== null ? ` · consumo ${lectura.consumo} m³` : ''}
          </Text>
          <View className="mt-1 flex-row flex-wrap gap-2">
            <BadgeEnvio lectura={lectura} />
            {lectura.verificacion === 'PENDIENTE_VERIFICAR' ? (
              <Badge tono="info" texto="Por verificar" />
            ) : null}
            {lectura.verificacion === 'REQUIERE_REVISION' ? (
              <Badge tono="peligro" texto="Requiere revisión" />
            ) : null}
            {lectura.esAnomalo ? <Badge tono="peligro" texto="Consumo anómalo" /> : null}
          </View>
        </View>
      </View>

      {pendiente ? (
        <Button titulo="Corregir" variante="contorno" onPress={onCorregir} />
      ) : (
        <Text className="text-xs text-slate-500">
          {lectura.estadoEnvio === 'RECHAZADA'
            ? lectura.motivoRechazo
            : 'Ya está en el sistema de la oficina: no se puede corregir.'}
        </Text>
      )}
    </Card>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\MedidorCard.tsx
================================================

import { Text, View } from 'react-native';

import type { MedidorEnCache } from '@/domain/types';
import type { OrigenMedidor } from '@/hooks/useMedidorSearch';

import { Badge, Card } from './ui';

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4 border-b border-epmaps-dark/10 py-3">
      <Text className="text-sm text-slate-500">{etiqueta}</Text>
      <Text className="flex-1 text-right text-sm font-semibold text-epmaps-dark">{valor}</Text>
    </View>
  );
}

function Metrica({ etiqueta, valor, unidad }: { etiqueta: string; valor: number; unidad: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-epmaps-accent/10 p-4">
      <Text className="text-xs font-bold uppercase tracking-wider text-epmaps-secondary">{etiqueta}</Text>
      <Text className="mt-1 text-2xl font-extrabold text-epmaps-dark">
        {valor.toLocaleString('es-EC')}
        <Text className="text-sm font-semibold text-slate-500"> {unidad}</Text>
      </Text>
    </View>
  );
}

/** Los siete datos del medidor que envía la oficina (R3). */
export function MedidorCard({ medidor, origen }: { medidor: MedidorEnCache; origen: OrigenMedidor }) {
  const activo = medidor.estado.toUpperCase() === 'ACTIVO';

  return (
    <Card className="gap-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xs font-bold uppercase tracking-wider text-epmaps-secondary">Medidor</Text>
          <Text className="text-2xl font-extrabold tracking-tight text-epmaps-dark">{medidor.codigo}</Text>
        </View>
        <Badge texto={medidor.estado} tono={activo ? 'exito' : 'peligro'} />
      </View>

      <View className="flex-row gap-3">
        <Metrica etiqueta="Última lectura" valor={medidor.ultimaLectura} unidad="m³" />
        <Metrica etiqueta="Promedio mensual" valor={medidor.consumoPromedio} unidad="m³" />
      </View>

      <View>
        <Dato etiqueta="Fecha última lectura" valor={fecha(medidor.fechaUltimaLectura)} />
        <Dato etiqueta="Dirección" valor={medidor.direccion} />
        <Dato etiqueta="Sector" valor={medidor.sector} />
        <Dato etiqueta="N.º de cuenta" valor={medidor.numeroCuenta} />
      </View>

      <Badge
        tono={origen === 'red' ? 'info' : 'advertencia'}
        texto={
          origen === 'red'
            ? 'Descargado del sistema de la oficina'
            : `Guardado en el teléfono · ${fecha(medidor.consultadoEn)} ${hora(medidor.consultadoEn)}`
        }
      />
    </Card>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\NetworkStatusBar.tsx
================================================

import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/** Barra superior visible en todas las pantallas: conexión y lecturas por enviar (R9). */
export function NetworkStatusBar() {
  const { top } = useSafeAreaInsets();
  const { enLinea, pendientes, sincronizando, sincronizar } = useNetworkStatus();
  const pulso = useSharedValue(0);
  const segundoPulso = useSharedValue(0);
  const activo = enLinea === true && (sincronizando || pendientes > 0);

  useEffect(() => {
    const repetir = () =>
      withRepeat(
        withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 0 })),
        -1,
        false,
      );
    pulso.value = activo ? repetir() : 0;
    segundoPulso.value = activo ? withDelay(450, repetir()) : 0;
  }, [activo, pulso, segundoPulso]);

  const estiloPulso = useAnimatedStyle(() => ({
    opacity: 0.6 * (1 - pulso.value),
    transform: [{ scale: 1 + pulso.value * 1.5 }],
  }));
  const estiloSegundoPulso = useAnimatedStyle(() => ({
    opacity: 0.6 * (1 - segundoPulso.value),
    transform: [{ scale: 1 + segundoPulso.value * 1.5 }],
  }));

  // Sobre verde y ámbar el texto va en azul oscuro: el blanco no se lee bajo el sol.
  const comprobando = enLinea === null;
  const fondo = comprobando ? 'bg-epmaps-dark' : enLinea ? 'bg-status-online' : 'bg-status-offline';
  const texto = comprobando ? 'text-white' : 'text-epmaps-dark';
  const estado = comprobando ? 'Comprobando conexión' : enLinea ? 'En línea' : 'Sin conexión';
  const cola = sincronizando
    ? 'Enviando…'
    : pendientes === 0
      ? 'Todo enviado'
      : `${pendientes} ${pendientes === 1 ? 'lectura' : 'lecturas'} por enviar`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${estado}. ${cola}.`}
      accessibilityHint="Toca para intentar enviar ahora"
      disabled={!enLinea || sincronizando || pendientes === 0}
      onPress={sincronizar}
      style={{ paddingTop: top + 4 }}
      className={`flex-row items-center justify-between px-4 pb-2 ${fondo}`}>
      <StatusBar style={comprobando ? 'light' : 'dark'} />
      <View className="flex-row items-center gap-2">
        <View className="h-3 w-3 items-center justify-center">
          {activo ? (
            <>
              <Animated.View
                style={estiloPulso}
                className="absolute h-3 w-3 rounded-full bg-status-online"
              />
              <Animated.View
                style={estiloSegundoPulso}
                className="absolute h-3 w-3 rounded-full bg-status-online"
              />
            </>
          ) : null}
          <View
            className={`h-2.5 w-2.5 rounded-full ${
              comprobando ? 'bg-epmaps-accent' : enLinea ? 'bg-status-online' : 'bg-status-offline'
            }`}
          />
        </View>
        <Text className={`text-sm font-bold ${texto}`}>{estado}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        {sincronizando ? (
          <ActivityIndicator size="small" color={comprobando ? '#FFFFFF' : '#023373'} />
        ) : null}
        <View className="rounded-full border border-white/40 bg-white/30 px-3 py-0.5">
          <Text className={`text-xs font-bold ${texto}`}>{cola}</Text>
        </View>
      </View>
    </Pressable>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\PasoAnimado.tsx
================================================

import type { ReactNode } from 'react';
import Animated, { FadeInRight } from 'react-native-reanimated';

/** Reanimated acompaña la transición direccional del Stack al entrar a cada paso. */
export function PasoAnimado({ children }: { children: ReactNode }) {
  return (
    <Animated.View entering={FadeInRight.duration(220)} className="flex-1">
      {children}
    </Animated.View>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\RegistroHeader.tsx
================================================

import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRegistro } from '@/hooks/useLecturaForm';
import { volver } from '@/utils/navegacion';

import { ReflejosCabecera } from './ui';

export const TOTAL_PASOS = 4;

export function RegistroHeader({ paso, titulo }: { paso: number; titulo: string }) {
  const { top } = useSafeAreaInsets();
  const { codigo } = useRegistro();

  return (
    <View
      style={{ paddingTop: top + 8 }}
      className="overflow-hidden rounded-b-[32px] bg-epmaps-dark px-5 pb-6">
      <ReflejosCabecera />
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={volver}
          className="h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/15 active:bg-white/25">
          <Text className="text-xl font-bold text-white">‹</Text>
        </Pressable>
        <View className="rounded-full border border-white/25 bg-white/15 px-3 py-1">
          <Text className="text-sm font-bold tracking-wider text-white">{codigo}</Text>
        </View>
        <View className="w-11" />
      </View>

      <Text className="mt-4 text-xs font-bold uppercase tracking-widest text-epmaps-accent">
        Paso {paso} de {TOTAL_PASOS}
      </Text>
      <Text className="text-2xl font-extrabold text-white">{titulo}</Text>

      <View className="mt-4 flex-row gap-2">
        {Array.from({ length: TOTAL_PASOS }, (_, i) => (
          <View
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < paso ? 'bg-epmaps-accent' : 'bg-white/20'}`}
          />
        ))}
      </View>
    </View>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\ToastProvider.tsx
================================================

import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Notificar = (mensaje: string) => void;

const ToastContext = createContext<Notificar | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { top } = useSafeAreaInsets();
  const [mensaje, setMensaje] = useState('');
  const desplazamiento = useSharedValue(-150);
  const opacidad = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notificar = useCallback((nuevoMensaje: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMensaje(nuevoMensaje);
    // Reanimated shared values are intentionally mutated to start the toast animation.
    // eslint-disable-next-line react-hooks/immutability
    desplazamiento.value = -150;
    // eslint-disable-next-line react-hooks/immutability
    opacidad.value = 0;
    desplazamiento.value = withSequence(
      withTiming(20, { duration: 280 }),
      withDelay(3500, withTiming(-150, { duration: 280 })),
    );
    opacidad.value = withSequence(
      withTiming(1, { duration: 280 }),
      withDelay(3500, withTiming(0, { duration: 280 })),
    );
    timer.current = setTimeout(() => setMensaje(''), 4060);
  }, [desplazamiento, opacidad]);

  const estilo = useAnimatedStyle(() => ({
    opacity: opacidad.value,
    transform: [{ translateY: desplazamiento.value }],
  }));

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <ToastContext value={notificar}>
      {children}
      {mensaje ? (
        <Animated.View
          pointerEvents="none"
          accessibilityRole="alert"
          style={[{ top: top + 8 }, estilo]}
          className="absolute left-4 right-4 z-50 rounded-2xl bg-epmaps-dark px-4 py-3 shadow-lg">
          <Text className="text-center text-sm font-bold text-white">{mensaje}</Text>
        </Animated.View>
      ) : null}
    </ToastContext>
  );
}

export function useToast(): Notificar {
  const notificar = use(ToastContext);
  if (!notificar) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return notificar;
}


================================================
ðŸ“„ ARCHIVO: src\components\ui\Badge.tsx
================================================

import { Text, View } from 'react-native';

type Tono = 'info' | 'exito' | 'advertencia' | 'peligro';

// Fondo suave y texto oscuro, legible bajo el sol; el texto siempre nombra el estado.
const estilos: Record<Tono, { fondo: string; texto: string }> = {
  info: { fondo: 'bg-epmaps-accent/20', texto: 'text-epmaps-dark' },
  exito: { fondo: 'bg-status-online/20', texto: 'text-emerald-900' },
  advertencia: { fondo: 'bg-status-offline/25', texto: 'text-amber-900' },
  peligro: { fondo: 'bg-status-danger/15', texto: 'text-red-800' },
};

export function Badge({ texto, tono = 'info' }: { texto: string; tono?: Tono }) {
  const estilo = estilos[tono];
  return (
    <View className={`self-start rounded-full px-3 py-1 ${estilo.fondo}`}>
      <Text className={`text-xs font-bold ${estilo.texto}`}>{texto}</Text>
    </View>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\ui\Button.tsx
================================================

import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type Variante = 'primario' | 'secundario' | 'contorno' | 'peligro';

const estilos: Record<Variante, { boton: string; texto: string; spinner: string }> = {
  primario: { boton: 'bg-epmaps-primary', texto: 'text-white', spinner: '#FFFFFF' },
  secundario: { boton: 'bg-epmaps-secondary', texto: 'text-white', spinner: '#FFFFFF' },
  contorno: {
    boton: 'border-2 border-epmaps-primary/40 bg-white/60',
    texto: 'text-epmaps-primary',
    spinner: '#0455BF',
  },
  peligro: { boton: 'bg-status-danger', texto: 'text-white', spinner: '#FFFFFF' },
};

interface ButtonProps extends Omit<PressableProps, 'children'> {
  titulo: string;
  variante?: Variante;
  cargando?: boolean;
}

/** Botón institucional; 56 px de alto, por encima del mínimo táctil de 44 px. */
export function Button({ titulo, variante = 'primario', cargando, disabled, ...rest }: ButtonProps) {
  const estilo = estilos[variante];
  const inactivo = disabled || cargando;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactivo, busy: !!cargando }}
      disabled={inactivo}
      className={`h-14 items-center justify-center rounded-2xl px-5 active:opacity-90 ${estilo.boton} ${disabled ? 'opacity-40' : ''}`}
      {...rest}>
      {cargando ? (
        <ActivityIndicator color={estilo.spinner} />
      ) : (
        <Text className={`text-base font-bold tracking-wide ${estilo.texto}`}>{titulo}</Text>
      )}
    </Pressable>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\ui\Card.tsx
================================================

import { View, type ViewProps } from 'react-native';

/** Tarjeta de vidrio: blanco translúcido con borde claro sobre el Fondo. */
export function Card({ className, ...rest }: ViewProps) {
  return (
    <View
      className={`rounded-3xl border border-white bg-white/75 p-5 ${className ?? ''}`}
      {...rest}
    />
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\ui\Checkbox.tsx
================================================

import { Pressable, Text, View } from 'react-native';

interface CheckboxProps {
  marcado: boolean;
  onCambiar: (marcado: boolean) => void;
  etiqueta: string;
  error?: string;
}

export function Checkbox({ marcado, onCambiar, etiqueta, error }: CheckboxProps) {
  return (
    <View className="gap-1">
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: marcado }}
        onPress={() => onCambiar(!marcado)}
        className="flex-row items-center gap-3 py-1">
        <View
          className={`h-7 w-7 items-center justify-center rounded-lg border-2 ${
            marcado ? 'border-epmaps-primary bg-epmaps-primary' : error ? 'border-status-danger bg-white' : 'border-epmaps-dark/20 bg-white'
          }`}>
          {marcado ? <Text className="text-base font-bold text-white">✓</Text> : null}
        </View>
        <Text className="flex-1 text-base font-semibold text-epmaps-dark">{etiqueta}</Text>
      </Pressable>
      {error ? <Text className="text-sm font-semibold text-red-700">{error}</Text> : null}
    </View>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\ui\Fondo.tsx
================================================

import { View, type ViewProps } from 'react-native';

/** Manchas de agua que las tarjetas translúcidas dejan ver: efecto liquid glass sin desenfoque. */
export function Fondo({ className, children, ...rest }: ViewProps) {
  return (
    <View className={`flex-1 overflow-hidden bg-epmaps-bg ${className ?? ''}`} {...rest}>
      <View
        style={{ pointerEvents: 'none' }}
        className="absolute -right-24 top-48 h-80 w-80 rounded-full bg-epmaps-accent/15"
      />
      <View
        style={{ pointerEvents: 'none' }}
        className="absolute -left-32 bottom-16 h-96 w-96 rounded-full bg-epmaps-secondary/10"
      />
      {children}
    </View>
  );
}

export function ReflejosCabecera() {
  return (
    <>
      <View
        style={{ pointerEvents: 'none' }}
        className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-epmaps-accent/20"
      />
      <View
        style={{ pointerEvents: 'none' }}
        className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-epmaps-primary/40"
      />
    </>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\ui\index.ts
================================================

export { Badge } from './Badge';
export { Button } from './Button';
export { Card } from './Card';
export { Checkbox } from './Checkbox';
export { Input } from './Input';
export { Fondo, ReflejosCabecera } from './Fondo';


================================================
ðŸ“„ ARCHIVO: src\components\ui\Input.tsx
================================================

import { useState, type ReactNode } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  etiqueta: string;
  error?: string | null;
  trailing?: ReactNode;
}

export function Input({ etiqueta, error, trailing, onFocus, onBlur, ...rest }: InputProps) {
  const [enfocado, setEnfocado] = useState(false);
  const borde = error
    ? 'border-status-danger'
    : enfocado
      ? 'border-epmaps-primary'
      : 'border-epmaps-dark/10';

  return (
    <View className="gap-1.5">
      <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">{etiqueta}</Text>
      <View className="relative">
        <TextInput
          accessibilityLabel={etiqueta}
          placeholderTextColor="#94A3B8"
          textAlignVertical={rest.multiline ? 'top' : 'center'}
          className={`rounded-2xl border-2 bg-white/80 px-4 text-base text-epmaps-dark ${trailing ? 'pr-20' : ''} ${rest.multiline ? 'min-h-28 py-3' : 'h-14'} ${borde}`}
          onFocus={(e) => {
            setEnfocado(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setEnfocado(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {trailing ? (
          <View className="absolute right-3 top-0 h-14 justify-center">{trailing}</View>
        ) : null}
      </View>
      {error ? <Text className="text-sm font-semibold text-red-700">{error}</Text> : null}
    </View>
  );
}


================================================
ðŸ“„ ARCHIVO: src\config\firebase.ts
================================================

/**
 * Conexion con Firebase para Android y ios.
 * Los valores reales se inyectan desde .env.local con EXPO_PUBLIC_*.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseError, getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

const firebaseConfigurado = Object.values(firebaseConfig).every((valor) => String(valor).trim().length > 0);

function crearAuth(): Auth | null {
  if (!firebaseConfigurado) {
    console.warn(
      'Firebase no está configurado todavía. Agrega las variables EXPO_PUBLIC_FIREBASE_* antes de usar autenticación.'
    );
    return null;
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/already-initialized') {
      return getAuth(app);
    }
    throw error;
  }
}

export const auth = crearAuth();

if (auth) {
  auth.languageCode = 'es';
}

export const firebaseReady = !!auth;

================================================
ðŸ“„ ARCHIVO: src\context\sesion.tsx
================================================

/**
 * Contexto de sesión: el único lugar de la app que habla con Firebase Auth.
 *
 * Las pantallas no importan Firebase directamente; llaman a las funciones de
 * este contexto (iniciarSesion, registrarse, etc.). Así, si mañana se cambia
 * Firebase por otro proveedor, solo se reescribe este archivo.
 */
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';

import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { auth } from '@/config/firebase';

type ValorSesion={
 //Usuario conectado o null si no hay sesion 
 usuario: User | null;

 //Nombre del perfil (displayName), se actuaiza siempre tras el registro 
   nombre: string | null;

 cargando: boolean; //True mientras Firebase verifica si hay sesión activa
 errorCarga: string | null;

iniciarSesion: (correo: string, clave: string) => Promise<void>;
  registrarse: (nombre: string, correo: string, clave: string) => Promise<void>;
actualizarNombre: (nombre: string) => Promise<void>;
enviarCorreoRecuperacion: (correo: string) => Promise<void>;
  cambiarClave: (claveActual: string, claveNueva: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;

}

const ContextoSesion = createContext<ValorSesion | null>(null);
 
/** Hook para leer la sesión desde cualquier pantalla. */
export function useSesion(): ValorSesion {
  // `use` es la forma moderna (React 19) de leer un contexto.
  const valor = use(ContextoSesion);
  if (!valor) {
    throw new Error('useSesion debe usarse dentro de <ProveedorSesion>.');
  }
  return valor;
}
 
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(() => Boolean(auth));
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  // Nombre del perfil guardado aparte: updateProfile modifica el mismo objeto
  // `user` sin cambiar su referencia, así que React no detectaría el cambio
  // si las pantallas leyeran usuario.displayName directamente.
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;

    // onAuthStateChanged se dispara al arrancar (con la sesión guardada o null)
    // y cada vez que alguien inicia o cierra sesión. Es la fuente de verdad:
    // la navegación (Stack.Protected en _layout.tsx) depende de este estado.
    const cancelarSuscripcion = onAuthStateChanged(
      auth,
      (usuarioFirebase) => {
        const usuarioVerificado = usuarioFirebase?.emailVerified ? usuarioFirebase : null;
        setUsuario(usuarioVerificado);
        setNombre(usuarioVerificado?.displayName ?? null);
        setErrorCarga(null);
        setCargando(false);
      },
      (errorAuth) => {
        console.error('No se pudo restaurar la sesión de Firebase', errorAuth);
        setUsuario(null);
        setNombre(null);
        setErrorCarga('No se pudo restaurar tu sesión. Inicia sesión nuevamente.');
        setCargando(false);
      },
    );
    // Al desmontar el proveedor dejamos de escuchar para no fugar memoria.
    return cancelarSuscripcion;
  }, []);
 
  async function iniciarSesion(correo: string, clave: string) {
    if (!auth) throw new Error('Firebase no está configurado. Agrega las variables EXPO_PUBLIC_FIREBASE_*');

    setErrorCarga(null);
    const credencial = await signInWithEmailAndPassword(auth, correo.trim(), clave);

    if (!credencial.user.emailVerified) {
      await signOut(auth);
      throw new Error('auth/email-not-verified');
    }
  }

  async function registrarse(nombreCompleto: string, correo: string, clave: string) {
    if (!auth) throw new Error('Firebase no está configurado. Agrega las variables EXPO_PUBLIC_FIREBASE_*');

    setErrorCarga(null);
    if (!nombreCompleto.trim()) throw new Error('Escribe tu nombre para crear la cuenta.');
    const credencial = await createUserWithEmailAndPassword(auth, correo.trim(), clave);
    const nombreLimpio = nombreCompleto.trim();

    await updateProfile(credencial.user, { displayName: nombreLimpio });
    await sendEmailVerification(credencial.user);

    // La cuenta se crea, se envía el correo de verificación y se cierra
    // la sesión para obligar a la validación antes de entrar al flujo principal.
    await signOut(auth);
    setNombre(nombreLimpio);
  }

  async function actualizarNombre(nombreCompleto: string) {
    if (!auth) throw new Error('Firebase no está configurado. Agrega las variables EXPO_PUBLIC_FIREBASE_*');

    const nombreLimpio = nombreCompleto.trim();
    if (!nombreLimpio) throw new Error('Escribe un nombre antes de guardar.');

    const actual = auth.currentUser;
    if (!actual) throw new Error('No hay una sesión activa.');

    await updateProfile(actual, { displayName: nombreLimpio });
    setNombre(nombreLimpio);
  }
 
  async function enviarCorreoRecuperacion(correo: string) {
    if (!auth) throw new Error('Firebase no está configurado. Agrega las variables EXPO_PUBLIC_FIREBASE_*');

    // Firebase envía un correo con un enlace a su página de restablecimiento.
    // Si el correo no existe, por la protección de enumeración NO lanza error:
    // por eso la pantalla muestra un mensaje neutro.
    await sendPasswordResetEmail(auth, correo.trim());
  }
 
  async function cambiarClave(claveActual: string, claveNueva: string) {
    if (!auth) throw new Error('Firebase no está configurado. Agrega las variables EXPO_PUBLIC_FIREBASE_*');

    const actual = auth.currentUser;
    if (!actual?.email) throw new Error('No hay una sesión activa.');
 
    // updatePassword es una operación sensible: Firebase la rechaza con
    // "auth/requires-recent-login" si la sesión no es reciente. Por eso
    // primero confirmamos la identidad con la contraseña actual.
    const credencial = EmailAuthProvider.credential(actual.email, claveActual);
    await reauthenticateWithCredential(actual, credencial);
    await updatePassword(actual, claveNueva);
  }
 
  async function cerrarSesion() {
    if (!auth) return;
    await signOut(auth);
  }
 
  return (
    <ContextoSesion
      value={{
        usuario,
        nombre,
        cargando,
        errorCarga,
        iniciarSesion,
        registrarse,
        actualizarNombre,
        enviarCorreoRecuperacion,
        cambiarClave,
        cerrarSesion,
      }}>
      {children}
    </ContextoSesion>
  );

}

================================================
ðŸ“„ ARCHIVO: src\database\client.ts
================================================

import type { SQLiteDatabase } from 'expo-sqlite';

import { migrateDbIfNeeded } from './migrations';

export const DATABASE_NAME = 'epmaps-lecturas.db';

/** Se pasa a `<SQLiteProvider onInit>`: corre antes de que se muestre cualquier pantalla. */
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await migrateDbIfNeeded(db);
}


================================================
ðŸ“„ ARCHIVO: src\database\migrations.ts
================================================

import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 6;

/** Columnas agregadas a `lecturas` después de la v2, con su definición. */
const COLUMNAS_V3 = {
  id_remoto: 'TEXT',
  enviada_en: 'TEXT',
};
const COLUMNAS_V4 = {
  registro_id: 'TEXT',
  revision: 'INTEGER NOT NULL DEFAULT 0',
  motivo_rechazo: 'TEXT',
};

const CREAR_BORRADOR = `
  CREATE TABLE IF NOT EXISTS borrador (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    codigo_medidor TEXT NOT NULL,
    lectura_id INTEGER,
    tecnico_codigo TEXT NOT NULL,
    paso TEXT NOT NULL,
    datos TEXT NOT NULL,
    actualizado_en TEXT NOT NULL
  );
`;

/** SQLite no tiene ADD COLUMN IF NOT EXISTS: se revisa PRAGMA table_info para poder repetirla. */
async function agregarColumnasFaltantes(
  db: SQLiteDatabase,
  tabla: string,
  columnas: Record<string, string>,
): Promise<void> {
  const existentes = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tabla})`);
  const nombres = new Set(existentes.map((c) => c.name));
  for (const [nombre, definicion] of Object.entries(columnas)) {
    if (!nombres.has(nombre)) {
      await db.execAsync(`ALTER TABLE ${tabla} ADD COLUMN ${nombre} ${definicion}`);
    }
  }
}

/** Aplica en orden las migraciones pendientes según PRAGMA user_version. */
export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion < 1) {
    // v1: caché de medidores consultados (R3).
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS medidores (
        codigo TEXT PRIMARY KEY NOT NULL,
        direccion TEXT NOT NULL,
        sector TEXT NOT NULL,
        numero_cuenta TEXT NOT NULL,
        estado TEXT NOT NULL,
        ultima_lectura REAL NOT NULL,
        fecha_ultima_lectura TEXT NOT NULL,
        consumo_promedio REAL NOT NULL,
        consultado_en TEXT NOT NULL
      );
    `);
  }

  if (currentVersion < 2) {
    // v2: lecturas (R4); la clave única impide dos registros del mismo medidor en el mes (R10).
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS lecturas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clave TEXT NOT NULL UNIQUE,
        codigo_medidor TEXT NOT NULL,
        periodo TEXT NOT NULL,
        tecnico_codigo TEXT NOT NULL,
        estado_medidor TEXT NOT NULL,
        lectura REAL,
        lectura_anterior REAL,
        consumo REAL,
        consumo_promedio REAL,
        es_anomalo INTEGER NOT NULL DEFAULT 0,
        revision_confirmada INTEGER NOT NULL DEFAULT 0,
        observacion TEXT,
        foto_uri TEXT,
        verificacion TEXT NOT NULL,
        estado_envio TEXT NOT NULL DEFAULT 'PENDIENTE',
        registrada_en TEXT NOT NULL
      );
    `);
  }

  if (currentVersion < 3) {
    // v3: datos del envío al sistema de la oficina (R9).
    await agregarColumnasFaltantes(db, 'lecturas', COLUMNAS_V3);
  }

  if (currentVersion < 4) {
    // v4: corrección de lecturas pendientes y rechazo de duplicados (R10).
    await agregarColumnasFaltantes(db, 'lecturas', COLUMNAS_V4);
  }

  if (currentVersion < 5) {
    // v5: registro a medio llenar que sobrevive al cierre de la app (R8). Solo uno a la vez.
    await db.execAsync(CREAR_BORRADOR);
  }

  if (currentVersion < 6) {
    // v6: reparación de bases marcadas en v4/v5 sin sus columnas (recarga en desarrollo).
    await agregarColumnasFaltantes(db, 'lecturas', { ...COLUMNAS_V3, ...COLUMNAS_V4 });
    await db.execAsync(CREAR_BORRADOR);
  }

  // Lecturas anteriores a v4 necesitan un registro_id para el envío idempotente.
  await db.execAsync(`UPDATE lecturas SET registro_id = 'v3-' || id WHERE registro_id IS NULL`);
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}


================================================
ðŸ“„ ARCHIVO: src\database\repositories\borradorRepository.ts
================================================

import type { SQLiteDatabase } from 'expo-sqlite';

import type { LecturaFormValues } from '@/domain/medidor.schema';

export type PasoRegistro = 'estado' | 'datos' | 'foto' | 'resumen';

/** Registro a medio llenar (R8). */
export interface Borrador {
  codigoMedidor: string;
  /** Lectura que se estaba corrigiendo (R10); null si era un registro nuevo. */
  lecturaId: number | null;
  tecnicoCodigo: string;
  paso: PasoRegistro;
  datos: Partial<LecturaFormValues>;
  actualizadoEn: string;
}

interface BorradorRow {
  codigo_medidor: string;
  lectura_id: number | null;
  tecnico_codigo: string;
  paso: PasoRegistro;
  datos: string;
  actualizado_en: string;
}

export async function obtenerBorrador(db: SQLiteDatabase): Promise<Borrador | null> {
  const row = await db.getFirstAsync<BorradorRow>('SELECT * FROM borrador WHERE id = 1');
  if (!row) return null;
  return {
    codigoMedidor: row.codigo_medidor,
    lecturaId: row.lectura_id,
    tecnicoCodigo: row.tecnico_codigo,
    paso: row.paso,
    datos: JSON.parse(row.datos) as Partial<LecturaFormValues>,
    actualizadoEn: row.actualizado_en,
  };
}

export async function guardarBorrador(
  db: SQLiteDatabase,
  b: Omit<Borrador, 'actualizadoEn'>,
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO borrador
       (id, codigo_medidor, lectura_id, tecnico_codigo, paso, datos, actualizado_en)
     VALUES (1, ?, ?, ?, ?, ?, ?)`,
    b.codigoMedidor,
    b.lecturaId,
    b.tecnicoCodigo,
    b.paso,
    JSON.stringify(b.datos),
    new Date().toISOString(),
  );
}

export async function eliminarBorrador(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM borrador');
}

/** True si alguna lectura guardada usa esa foto (no se debe borrar). */
export async function fotoEnUso(db: SQLiteDatabase, uri: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM lecturas WHERE foto_uri = ?',
    uri,
  );
  return (row?.n ?? 0) > 0;
}


================================================
ðŸ“„ ARCHIVO: src\database\repositories\lecturaRepository.ts
================================================

import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  CorreccionLectura,
  EstadoEnvio,
  EstadoMedidor,
  Lectura,
  NuevaLectura,
  Verificacion,
} from '@/domain/types';

/** Ya existe una lectura de ese medidor en ese mes (R10). */
export class LecturaDuplicadaError extends Error {
  constructor(codigoMedidor: string) {
    super(`Ya registraste una lectura del medidor ${codigoMedidor} este mes`);
    this.name = 'LecturaDuplicadaError';
  }
}

/** Se intentó corregir una lectura que ya llegó a la oficina (R10). */
export class LecturaYaEnviadaError extends Error {
  constructor() {
    super('Esta lectura ya se envió a la oficina y no se puede corregir');
    this.name = 'LecturaYaEnviadaError';
  }
}

interface LecturaRow {
  id: number;
  registro_id: string;
  clave: string;
  codigo_medidor: string;
  periodo: string;
  tecnico_codigo: string;
  estado_medidor: EstadoMedidor;
  lectura: number | null;
  lectura_anterior: number | null;
  consumo: number | null;
  consumo_promedio: number | null;
  es_anomalo: number;
  revision_confirmada: number;
  observacion: string | null;
  foto_uri: string | null;
  verificacion: Verificacion;
  estado_envio: EstadoEnvio;
  motivo_rechazo: string | null;
  revision: number;
  registrada_en: string;
}

function aLectura(row: LecturaRow): Lectura {
  return {
    id: row.id,
    registroId: row.registro_id,
    clave: row.clave,
    codigoMedidor: row.codigo_medidor,
    periodo: row.periodo,
    tecnicoCodigo: row.tecnico_codigo,
    estadoMedidor: row.estado_medidor,
    lectura: row.lectura,
    lecturaAnterior: row.lectura_anterior,
    consumo: row.consumo,
    consumoPromedio: row.consumo_promedio,
    esAnomalo: row.es_anomalo === 1,
    revisionConfirmada: row.revision_confirmada === 1,
    observacion: row.observacion,
    fotoUri: row.foto_uri,
    verificacion: row.verificacion,
    estadoEnvio: row.estado_envio,
    motivoRechazo: row.motivo_rechazo,
    revision: row.revision,
    registradaEn: row.registrada_en,
  };
}

export async function insertarLectura(db: SQLiteDatabase, l: NuevaLectura): Promise<number> {
  try {
    const result = await db.runAsync(
      `INSERT INTO lecturas
         (registro_id, clave, codigo_medidor, periodo, tecnico_codigo, estado_medidor, lectura,
          lectura_anterior, consumo, consumo_promedio, es_anomalo, revision_confirmada,
          observacion, foto_uri, verificacion, registrada_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      l.registroId,
      l.clave,
      l.codigoMedidor,
      l.periodo,
      l.tecnicoCodigo,
      l.estadoMedidor,
      l.lectura,
      l.lecturaAnterior,
      l.consumo,
      l.consumoPromedio,
      l.esAnomalo ? 1 : 0,
      l.revisionConfirmada ? 1 : 0,
      l.observacion,
      l.fotoUri,
      l.verificacion,
      l.registradaEn,
    );
    return result.lastInsertRowId;
  } catch (e) {
    // La clave medidor_mes es UNIQUE: un segundo registro del mismo mes se rechaza (R10).
    if (e instanceof Error && e.message.includes('UNIQUE constraint failed')) {
      throw new LecturaDuplicadaError(l.codigoMedidor);
    }
    throw e;
  }
}

/** Corrige solo si sigue pendiente (R10); la condición va en el mismo UPDATE para evitar carreras. */
export async function corregirLectura(
  db: SQLiteDatabase,
  id: number,
  c: CorreccionLectura,
): Promise<void> {
  const result = await db.runAsync(
    `UPDATE lecturas
       SET estado_medidor = ?, lectura = ?, lectura_anterior = ?, consumo = ?, consumo_promedio = ?,
           es_anomalo = ?, revision_confirmada = ?, observacion = ?, foto_uri = ?, verificacion = ?,
           revision = revision + 1
     WHERE id = ? AND estado_envio = 'PENDIENTE'`,
    c.estadoMedidor,
    c.lectura,
    c.lecturaAnterior,
    c.consumo,
    c.consumoPromedio,
    c.esAnomalo ? 1 : 0,
    c.revisionConfirmada ? 1 : 0,
    c.observacion,
    c.fotoUri,
    c.verificacion,
    id,
  );
  if (result.changes === 0) throw new LecturaYaEnviadaError();
}

export async function obtenerLectura(db: SQLiteDatabase, id: number): Promise<Lectura | null> {
  const row = await db.getFirstAsync<LecturaRow>('SELECT * FROM lecturas WHERE id = ?', id);
  return row ? aLectura(row) : null;
}

export async function obtenerLecturaPorClave(
  db: SQLiteDatabase,
  clave: string,
): Promise<Lectura | null> {
  const row = await db.getFirstAsync<LecturaRow>('SELECT * FROM lecturas WHERE clave = ?', clave);
  return row ? aLectura(row) : null;
}

export async function listarLecturasDeTecnico(
  db: SQLiteDatabase,
  tecnicoCodigo: string,
): Promise<Lectura[]> {
  const rows = await db.getAllAsync<LecturaRow>(
    'SELECT * FROM lecturas WHERE tecnico_codigo = ? ORDER BY registrada_en DESC',
    tecnicoCodigo,
  );
  return rows.map(aLectura);
}

/** Cola de envío en el orden en que se registraron (R9). */
export async function listarPendientesDeEnvio(db: SQLiteDatabase): Promise<Lectura[]> {
  const rows = await db.getAllAsync<LecturaRow>(
    `SELECT * FROM lecturas WHERE estado_envio = 'PENDIENTE' ORDER BY registrada_en`,
  );
  return rows.map(aLectura);
}

export async function contarPendientesDeEnvio(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total FROM lecturas WHERE estado_envio = 'PENDIENTE'`,
  );
  return row?.total ?? 0;
}

/** Resultado de comparar una lectura pendiente de verificar con la anterior (R4). */
export async function guardarVerificacion(
  db: SQLiteDatabase,
  id: number,
  datos: Pick<
    Lectura,
    'lecturaAnterior' | 'consumo' | 'consumoPromedio' | 'esAnomalo' | 'verificacion'
  >,
): Promise<void> {
  await db.runAsync(
    `UPDATE lecturas
       SET lectura_anterior = ?, consumo = ?, consumo_promedio = ?, es_anomalo = ?, verificacion = ?
     WHERE id = ?`,
    datos.lecturaAnterior,
    datos.consumo,
    datos.consumoPromedio,
    datos.esAnomalo ? 1 : 0,
    datos.verificacion,
    id,
  );
}

/** Marca como enviada esa revisión; si se corrigió mientras se enviaba, sigue pendiente. */
export async function marcarEnviada(
  db: SQLiteDatabase,
  id: number,
  revision: number,
  idRemoto: string,
): Promise<void> {
  await db.runAsync(
    `UPDATE lecturas SET estado_envio = 'ENVIADA', id_remoto = ?, enviada_en = ?
     WHERE id = ? AND revision = ?`,
    idRemoto,
    new Date().toISOString(),
    id,
    revision,
  );
}

export async function marcarRechazada(db: SQLiteDatabase, id: number, motivo: string): Promise<void> {
  await db.runAsync(
    `UPDATE lecturas SET estado_envio = 'RECHAZADA', motivo_rechazo = ? WHERE id = ?`,
    motivo,
    id,
  );
}


================================================
ðŸ“„ ARCHIVO: src\database\repositories\medidorRepository.ts
================================================

import type { SQLiteDatabase } from 'expo-sqlite';

import type { Medidor, MedidorEnCache } from '@/domain/types';

interface MedidorRow {
  codigo: string;
  direccion: string;
  sector: string;
  numero_cuenta: string;
  estado: string;
  ultima_lectura: number;
  fecha_ultima_lectura: string;
  consumo_promedio: number;
  consultado_en: string;
}

export async function obtenerMedidorEnCache(
  db: SQLiteDatabase,
  codigo: string,
): Promise<MedidorEnCache | null> {
  const row = await db.getFirstAsync<MedidorRow>('SELECT * FROM medidores WHERE codigo = ?', codigo);
  if (!row) return null;
  return {
    codigo: row.codigo,
    direccion: row.direccion,
    sector: row.sector,
    numeroCuenta: row.numero_cuenta,
    estado: row.estado,
    ultimaLectura: row.ultima_lectura,
    fechaUltimaLectura: row.fecha_ultima_lectura,
    consumoPromedio: row.consumo_promedio,
    consultadoEn: row.consultado_en,
  };
}

export async function guardarMedidorEnCache(
  db: SQLiteDatabase,
  medidor: Medidor,
): Promise<MedidorEnCache> {
  const consultadoEn = new Date().toISOString();
  await db.runAsync(
    `INSERT OR REPLACE INTO medidores
       (codigo, direccion, sector, numero_cuenta, estado, ultima_lectura,
        fecha_ultima_lectura, consumo_promedio, consultado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    medidor.codigo,
    medidor.direccion,
    medidor.sector,
    medidor.numeroCuenta,
    medidor.estado,
    medidor.ultimaLectura,
    medidor.fechaUltimaLectura,
    medidor.consumoPromedio,
    consultadoEn,
  );
  return { ...medidor, consultadoEn };
}


================================================
ðŸ“„ ARCHIVO: src\domain\medidor.rules.ts
================================================

import type { EstadoMedidor, Medidor } from './types';

/** Etiqueta del medidor: "MED-" seguido de exactamente seis dígitos (R2). */
export const CODIGO_MEDIDOR_REGEX = /^MED-\d{6}$/;

export const LONGITUD_CODIGO_MEDIDOR = 10;

/** Un consumo mayor a este múltiplo del promedio mensual es anómalo (R6). */
export const FACTOR_ANOMALIA = 3;

export function esCodigoMedidorValido(codigo: string): boolean {
  return CODIGO_MEDIDOR_REGEX.test(codigo);
}

/** Un dato en caché vale para toda la jornada: se reutiliza si se descargó hoy (R3). */
export function esDeLaJornada(fechaIso: string, ahora = new Date()): boolean {
  return new Date(fechaIso).toDateString() === ahora.toDateString();
}

export function calcularConsumo(medidor: Medidor, lectura: number): number {
  return lectura - medidor.ultimaLectura;
}

export function esConsumoAnomalo(medidor: Medidor, consumo: number): boolean {
  return consumo > medidor.consumoPromedio * FACTOR_ANOMALIA;
}

export function fotoEsObligatoria(estado: EstadoMedidor | undefined, esAnomalo: boolean): boolean {
  return estado === 'DANADO' || esAnomalo;
}

/** Mes de una fecha en formato AAAA-MM, en hora local. */
export function periodoDe(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
}

export function claveLectura(codigoMedidor: string, periodo: string): string {
  return `${codigoMedidor}_${periodo}`;
}

/** Identificador único de un registro; no necesita ser criptográfico. */
export function nuevoRegistroId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}


================================================
ðŸ“„ ARCHIVO: src\domain\medidor.schema.ts
================================================

import { z } from 'zod';

import { calcularConsumo, esConsumoAnomalo, fotoEsObligatoria } from './medidor.rules';
import type { Medidor } from './types';

export const ESTADOS_MEDIDOR = ['NORMAL', 'INACCESIBLE', 'DANADO'] as const;

const MIN_TEXTO = 5;

/** El esquema depende del medidor (R6); sin medidor solo se validan las reglas de R5. */
export function crearLecturaSchema(medidor: Medidor | null) {
  return z
    .object({
      estado: z.enum(ESTADOS_MEDIDOR, { error: 'Selecciona el estado del medidor' }),
      lectura: z.string().trim(),
      motivo: z.string().trim(),
      descripcion: z.string().trim(),
      revisionConfirmada: z.boolean(),
      fotoUri: z.string().nullable(),
    })
    .superRefine((d, ctx) => {
      const tieneLectura = d.lectura !== '';
      const lecturaValida = /^\d+$/.test(d.lectura);
      if (tieneLectura && !lecturaValida) {
        ctx.addIssue({ code: 'custom', path: ['lectura'], message: 'Ingresa solo números enteros' });
        return;
      }

      // R5: matriz de estados.
      if (d.estado === 'NORMAL' && !tieneLectura) {
        ctx.addIssue({
          code: 'custom',
          path: ['lectura'],
          message: 'La lectura es obligatoria si el medidor está normal',
        });
      }
      if (d.estado === 'INACCESIBLE') {
        if (d.motivo.length < MIN_TEXTO) {
          ctx.addIssue({
            code: 'custom',
            path: ['motivo'],
            message: `Indica el motivo (mínimo ${MIN_TEXTO} caracteres)`,
          });
        }
        if (tieneLectura) {
          ctx.addIssue({
            code: 'custom',
            path: ['lectura'],
            message: 'Un medidor inaccesible no registra lectura',
          });
        }
      }
      if (d.estado === 'DANADO' && d.descripcion.length < MIN_TEXTO) {
        ctx.addIssue({
          code: 'custom',
          path: ['descripcion'],
          message: `Describe el daño (mínimo ${MIN_TEXTO} caracteres)`,
        });
      }

      // R6: comparación con la lectura anterior.
      let esAnomalo = false;
      if (medidor && tieneLectura && d.estado !== 'INACCESIBLE') {
        const consumo = calcularConsumo(medidor, Number(d.lectura));
        esAnomalo = consumo >= 0 && esConsumoAnomalo(medidor, consumo);
        if (consumo < 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['lectura'],
            message: `No puede ser menor que la lectura anterior (${medidor.ultimaLectura} m³)`,
          });
        } else if (esAnomalo && !d.revisionConfirmada) {
          ctx.addIssue({
            code: 'custom',
            path: ['revisionConfirmada'],
            message: 'Confirma que revisaste el medidor para continuar',
          });
        }
      }

      // R7: foto obligatoria con consumo anómalo o medidor dañado.
      if (fotoEsObligatoria(d.estado, esAnomalo) && !d.fotoUri) {
        ctx.addIssue({
          code: 'custom',
          path: ['fotoUri'],
          message:
            d.estado === 'DANADO'
              ? 'La foto es obligatoria cuando el medidor está dañado'
              : 'La foto es obligatoria cuando el consumo es anómalo',
        });
      }
    });
}

export type LecturaFormValues = z.input<ReturnType<typeof crearLecturaSchema>>;


================================================
ðŸ“„ ARCHIVO: src\domain\passwordStrength.ts
================================================

export type PasswordStrength = 'débil' | 'media' | 'fuerte';

export function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null;

  const characterGroups = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;

  if (password.length >= 12 && characterGroups >= 3) return 'fuerte';
  if (password.length >= 8 && characterGroups >= 2) return 'media';
  return 'débil';
}


================================================
ðŸ“„ ARCHIVO: src\domain\types.ts
================================================

export interface Tecnico {
  codigo: string;
  nombre: string;
}

/** Identidad verificada que se asocia a los registros locales (R1). */
export interface Sesion {
  tecnico: Tecnico;
  iniciadaEn: string;
}

/** Los siete datos que envía el sistema de la oficina (R3), más el código. */
export interface Medidor {
  codigo: string;
  direccion: string;
  sector: string;
  numeroCuenta: string;
  estado: string;
  ultimaLectura: number;
  fechaUltimaLectura: string;
  consumoPromedio: number;
}

export interface MedidorEnCache extends Medidor {
  consultadoEn: string;
}

export type EstadoMedidor = 'NORMAL' | 'INACCESIBLE' | 'DANADO';

/** R4: VERIFICADA al registrar, PENDIENTE_VERIFICAR sin señal, REQUIERE_REVISION si resultó anómala. */
export type Verificacion = 'VERIFICADA' | 'PENDIENTE_VERIFICAR' | 'REQUIERE_REVISION';

/** R10: solo PENDIENTE se puede corregir; RECHAZADA: la oficina ya tenía la lectura del mes. */
export type EstadoEnvio = 'PENDIENTE' | 'ENVIADA' | 'RECHAZADA';

export interface Lectura {
  id: number;
  /** Identifica este registro concreto; distingue un reintento propio de un duplicado ajeno. */
  registroId: string;
  /** codigo_periodo: identifica la lectura de un medidor en un mes (R9, R10). */
  clave: string;
  codigoMedidor: string;
  periodo: string;
  tecnicoCodigo: string;
  estadoMedidor: EstadoMedidor;
  lectura: number | null;
  lecturaAnterior: number | null;
  consumo: number | null;
  consumoPromedio: number | null;
  esAnomalo: boolean;
  revisionConfirmada: boolean;
  /** Motivo (inaccesible) o descripción del daño (dañado). */
  observacion: string | null;
  fotoUri: string | null;
  verificacion: Verificacion;
  estadoEnvio: EstadoEnvio;
  motivoRechazo: string | null;
  /** Aumenta con cada corrección; evita marcar como enviada una versión ya corregida. */
  revision: number;
  registradaEn: string;
}

export type NuevaLectura = Omit<Lectura, 'id' | 'estadoEnvio' | 'motivoRechazo' | 'revision'>;

/** Campos que el técnico puede corregir mientras la lectura no se envíe (R10). */
export type CorreccionLectura = Pick<
  Lectura,
  | 'estadoMedidor'
  | 'lectura'
  | 'lecturaAnterior'
  | 'consumo'
  | 'consumoPromedio'
  | 'esAnomalo'
  | 'revisionConfirmada'
  | 'observacion'
  | 'fotoUri'
  | 'verificacion'
>;


================================================
ðŸ“„ ARCHIVO: src\hooks\useCameraPermission.ts
================================================

import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';

/** bloqueado: Android ya no muestra el diálogo; solo se activa desde Ajustes. */
export type EstadoPermisoCamara = 'cargando' | 'sin-preguntar' | 'concedido' | 'denegado' | 'bloqueado';

/** Permiso de cámara con expo-image-picker (R7). */
export function useCameraPermission() {
  const [permiso, pedirPermiso] = ImagePicker.useCameraPermissions();

  let estado: EstadoPermisoCamara;
  if (!permiso) estado = 'cargando';
  else if (permiso.granted) estado = 'concedido';
  else if (permiso.status === ImagePicker.PermissionStatus.UNDETERMINED) estado = 'sin-preguntar';
  else if (permiso.canAskAgain) estado = 'denegado';
  else estado = 'bloqueado';

  return {
    estado,
    solicitar: async () => (await pedirPermiso()).granted,
    abrirAjustes: () => Linking.openSettings(),
  };
}


================================================
ðŸ“„ ARCHIVO: src\hooks\useLecturaForm.tsx
================================================

import { zodResolver } from '@hookform/resolvers/zod';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, use, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useForm, type DefaultValues, type UseFormReturn } from 'react-hook-form';
import { AppState } from 'react-native';

import {
  eliminarBorrador,
  guardarBorrador,
  type Borrador,
  type PasoRegistro,
} from '@/database/repositories/borradorRepository';
import { corregirLectura, insertarLectura } from '@/database/repositories/lecturaRepository';
import {
  calcularConsumo,
  claveLectura,
  esConsumoAnomalo,
  fotoEsObligatoria,
  nuevoRegistroId,
  periodoDe,
} from '@/domain/medidor.rules';
import { crearLecturaSchema, type LecturaFormValues } from '@/domain/medidor.schema';
import type { Lectura, MedidorEnCache, Verificacion } from '@/domain/types';
import { eliminarFoto } from '@/services/imageStorage';
import { hayConexion } from '@/services/networkService';

import { useSession } from './useSession';

/** Espera tras la última tecla antes de escribir el borrador en SQLite. */
const DEBOUNCE_BORRADOR_MS = 300;

/** Registro en curso: el único autorizado a escribir el borrador (hay uno a la vez). */
let registroActivo: object | null = null;

interface Calculo {
  lectura: number | null;
  /** Null si no hay lectura o si no se tienen datos del medidor (sin señal y sin caché). */
  consumo: number | null;
  esAnomalo: boolean;
  fotoObligatoria: boolean;
}

interface RegistroContextValue {
  codigo: string;
  medidor: MedidorEnCache | null;
  /** Lectura que se está corrigiendo (R10); null en un registro nuevo. */
  original: Lectura | null;
  form: UseFormReturn<LecturaFormValues>;
  calculo: Calculo;
  /** Cada pantalla avisa cuál es al mostrarse, para reabrir el borrador en ese paso (R8). */
  marcarPaso: (paso: PasoRegistro) => void;
  /** Paso al que hay que avanzar al reanudar un borrador; se entrega una sola vez. */
  tomarPasoAReanudar: () => PasoRegistro | null;
  guardar: () => Promise<number>;
}

const RegistroContext = createContext<RegistroContextValue | null>(null);

// En un registro nuevo el estado arranca sin elegir: el técnico debe seleccionarlo.
const VALORES_INICIALES: DefaultValues<LecturaFormValues> = {
  lectura: '',
  motivo: '',
  descripcion: '',
  revisionConfirmada: false,
  fotoUri: null,
};

function valoresDe(l: Lectura): LecturaFormValues {
  return {
    estado: l.estadoMedidor,
    lectura: l.lectura !== null ? String(l.lectura) : '',
    motivo: l.estadoMedidor === 'INACCESIBLE' ? (l.observacion ?? '') : '',
    descripcion: l.estadoMedidor === 'DANADO' ? (l.observacion ?? '') : '',
    revisionConfirmada: l.revisionConfirmada,
    fotoUri: l.fotoUri,
  };
}

function calcular(medidor: MedidorEnCache | null, v: LecturaFormValues): Calculo {
  const lectura = v.estado !== 'INACCESIBLE' && /^\d+$/.test(v.lectura) ? Number(v.lectura) : null;
  const consumo = lectura !== null && medidor ? calcularConsumo(medidor, lectura) : null;
  const esAnomalo = consumo !== null && consumo >= 0 && esConsumoAnomalo(medidor!, consumo);
  return { lectura, consumo, esAnomalo, fotoObligatoria: fotoEsObligatoria(v.estado, esAnomalo) };
}

/** Un solo formulario para todos los pasos; se copia a SQLite en cada cambio (R8). */
export function RegistroProvider({
  codigo,
  medidor,
  original,
  borrador,
  children,
}: {
  codigo: string;
  medidor: MedidorEnCache | null;
  original: Lectura | null;
  /** Borrador que se reanuda; sus datos tienen prioridad sobre los de la lectura original. */
  borrador: Borrador | null;
  children: ReactNode;
}) {
  const db = useSQLiteContext();
  const { sesion } = useSession();
  const form = useForm<LecturaFormValues>({
    resolver: zodResolver(crearLecturaSchema(medidor)),
    defaultValues: {
      ...(original ? valoresDe(original) : VALORES_INICIALES),
      ...borrador?.datos,
    },
    mode: 'onTouched',
  });

  const calculo = calcular(medidor, form.watch());

  // --- Borrador (R8) ---
  const pasoActual = useRef<PasoRegistro>(borrador?.paso ?? 'estado');
  const pasoAReanudar = useRef<PasoRegistro | null>(borrador?.paso ?? null);
  // Solo hay borrador cuando el técnico cambió algo (o al reanudar uno existente).
  const hayCambios = useRef(borrador !== null);
  const terminado = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const instancia = useRef({}).current;

  const persistir = () => {
    clearTimeout(timer.current);
    // Solo el registro en curso escribe el borrador: uno ya terminado o descartado no lo revive.
    if (!hayCambios.current || terminado.current || !sesion || registroActivo !== instancia) return;
    guardarBorrador(db, {
      codigoMedidor: codigo,
      lecturaId: original?.id ?? null,
      tecnicoCodigo: sesion.tecnico.codigo,
      paso: pasoActual.current,
      datos: form.getValues(),
    });
  };
  useEffect(() => {
    registroActivo = instancia;
    const cambios = form.watch(() => {
      hayCambios.current = true;
      clearTimeout(timer.current);
      timer.current = setTimeout(persistir, DEBOUNCE_BORRADOR_MS);
    });
    // Al pasar a segundo plano (primer paso al quitar la app de recientes) se guarda ya.
    const app = AppState.addEventListener('change', (estado) => {
      if (estado !== 'active') persistir();
    });
    return () => {
      cambios.unsubscribe();
      app.remove();
      clearTimeout(timer.current);
      if (registroActivo === instancia) registroActivo = null;
      // Si un guardado del borrador quedó en vuelo al registrar, se borra otra vez al salir.
      if (terminado.current) eliminarBorrador(db).catch(() => {});
    };
  }, [form]);

  // Estables: las pantallas los usan en useFocusEffect.
  const marcarPaso = useCallback((paso: PasoRegistro) => {
    pasoActual.current = paso;
    persistir();
  }, []);

  const tomarPasoAReanudar = useCallback(() => {
    const paso = pasoAReanudar.current;
    pasoAReanudar.current = null;
    return paso;
  }, []);

  const guardar = async () => {
    const v = form.getValues();
    const { lectura, consumo, esAnomalo } = calcular(medidor, v);

    // R4: sin señal o sin datos del medidor, la comparación queda para cuando haya conexión.
    const verificacion: Verificacion =
      medidor && (await hayConexion()) ? 'VERIFICADA' : 'PENDIENTE_VERIFICAR';

    const datos = {
      estadoMedidor: v.estado,
      lectura,
      lecturaAnterior: medidor?.ultimaLectura ?? null,
      consumo,
      consumoPromedio: medidor?.consumoPromedio ?? null,
      esAnomalo,
      revisionConfirmada: esAnomalo && v.revisionConfirmada,
      observacion:
        v.estado === 'INACCESIBLE' ? v.motivo.trim() : v.estado === 'DANADO' ? v.descripcion.trim() : null,
      fotoUri: v.fotoUri,
      verificacion,
    };

    let id: number;
    if (original) {
      await corregirLectura(db, original.id, datos);
      id = original.id;
    } else {
      const ahora = new Date();
      const periodo = periodoDe(ahora);
      id = await insertarLectura(db, {
        ...datos,
        registroId: nuevoRegistroId(),
        clave: claveLectura(codigo, periodo),
        codigoMedidor: codigo,
        periodo,
        tecnicoCodigo: sesion!.tecnico.codigo,
        registradaEn: ahora.toISOString(),
      });
    }

    // La lectura ya está guardada. La limpieza que sigue no debe hacer fallar el registro.
    terminado.current = true;
    clearTimeout(timer.current);
    try {
      await eliminarBorrador(db);
      // La foto anterior de una corrección se conserva hasta confirmarla; recién ahora se borra.
      if (original && original.fotoUri !== v.fotoUri) eliminarFoto(original.fotoUri);
    } catch (e) {
      console.warn('Limpieza tras guardar la lectura', e);
    }
    return id;
  };

  return (
    <RegistroContext
      value={{
        codigo,
        medidor,
        original,
        form,
        calculo,
        marcarPaso,
        tomarPasoAReanudar,
        guardar,
      }}>
      {children}
    </RegistroContext>
  );
}

export function useRegistro(): RegistroContextValue {
  const ctx = use(RegistroContext);
  if (!ctx) throw new Error('useRegistro debe usarse dentro de <RegistroProvider>');
  return ctx;
}


================================================
ðŸ“„ ARCHIVO: src\hooks\useMedidorSearch.ts
================================================

import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';

import {
  guardarMedidorEnCache,
  obtenerMedidorEnCache,
} from '@/database/repositories/medidorRepository';
import { esDeLaJornada } from '@/domain/medidor.rules';
import type { MedidorEnCache } from '@/domain/types';
import { fetchMedidor, SinConexionError } from '@/services/api';

export type OrigenMedidor = 'red' | 'cache';

/** R3: caché del día sin tocar la red; si no, descarga; sin conexión, caché de cualquier día. */
export function useMedidorSearch() {
  const db = useSQLiteContext();
  const [medidor, setMedidor] = useState<MedidorEnCache | null>(null);
  const [origen, setOrigen] = useState<OrigenMedidor | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Sin señal y sin caché: se puede registrar igual sin datos del medidor (R4).
  const [sinConexion, setSinConexion] = useState(false);
  // Identifica la búsqueda vigente: una respuesta que llega tarde no debe pisar la pantalla.
  const busquedaActual = useRef(0);

  const limpiar = () => {
    busquedaActual.current++;
    setMedidor(null);
    setOrigen(null);
    setError(null);
    setSinConexion(false);
    setCargando(false);
  };

  const buscar = async (codigo: string) => {
    limpiar();
    const id = busquedaActual.current;
    const vigente = () => id === busquedaActual.current;
    const mostrar = (m: MedidorEnCache, o: OrigenMedidor) => {
      if (!vigente()) return;
      setMedidor(m);
      setOrigen(o);
    };
    const fallar = (mensaje: string) => {
      if (vigente()) setError(mensaje);
    };

    setCargando(true);
    try {
      const enCache = await obtenerMedidorEnCache(db, codigo);
      if (enCache && esDeLaJornada(enCache.consultadoEn)) {
        mostrar(enCache, 'cache');
        return;
      }

      try {
        const remoto = await fetchMedidor(codigo);
        if (!remoto) {
          fallar(`No existe un medidor con el código ${codigo}`);
          return;
        }
        mostrar(await guardarMedidorEnCache(db, remoto), 'red');
      } catch (e) {
        if (enCache) {
          mostrar(enCache, 'cache');
        } else if (e instanceof SinConexionError) {
          fallar('Sin conexión y este medidor no se ha consultado antes en el teléfono');
          if (vigente()) setSinConexion(true);
        } else {
          fallar(e instanceof Error ? e.message : 'No se pudo consultar el medidor');
        }
      }
    } finally {
      if (vigente()) setCargando(false);
    }
  };

  return { medidor, origen, cargando, error, sinConexion, buscar, limpiar };
}


================================================
ðŸ“„ ARCHIVO: src\hooks\useNetworkStatus.tsx
================================================

import { useSQLiteContext } from 'expo-sqlite';
import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { contarPendientesDeEnvio } from '@/database/repositories/lecturaRepository';
import { useToast } from '@/components/ToastProvider';
import { suscribirConexion } from '@/services/networkService';
import { procesarCola } from '@/services/syncQueue';

/** Reintento mientras haya pendientes y conexión, por si un envío falló con señal débil. */
const REINTENTO_MS = 30_000;

interface NetworkContextValue {
  /** null mientras NetInfo no reporta el primer estado. */
  enLinea: boolean | null;
  pendientes: number;
  sincronizando: boolean;
  /** Cambia cada vez que termina una sincronización, para que las pantallas recarguen. */
  ultimaSincronizacion: number;
  sincronizar: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

/** R9: envía al abrir, al reconectar, tras registrar y cada 30 s mientras haya pendientes. */
export function NetworkProvider({
  children,
  enabled = true,
}: {
  children: ReactNode;
  enabled?: boolean;
}) {
  const db = useSQLiteContext();
  const notificar = useToast();
  const [enLinea, setEnLinea] = useState<boolean | null>(null);
  const [pendientes, setPendientes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const [ultimaSincronizacion, setUltimaSincronizacion] = useState(0);
  const enLineaRef = useRef(false);
  const estadoAnterior = useRef<boolean | null>(null);

  const sincronizar = useCallback(async () => {
    if (!enabled) return;
    if (enLineaRef.current) {
      setSincronizando(true);
      try {
        await procesarCola(db);
      } finally {
        setSincronizando(false);
        setUltimaSincronizacion(Date.now());
      }
    }
    setPendientes(await contarPendientesDeEnvio(db));
  }, [db, enabled]);

  useEffect(
    () => {
      if (!enabled) {
        enLineaRef.current = false;
        estadoAnterior.current = null;
        return;
      }

      return suscribirConexion((conectado) => {
        const reconecto = conectado && !enLineaRef.current;
        if (estadoAnterior.current !== null && conectado !== estadoAnterior.current) {
          notificar(conectado ? 'Conexión restablecida. Sincronizando…' : 'Modo Offline Activado');
        }
        estadoAnterior.current = conectado;
        enLineaRef.current = conectado;
        setEnLinea(conectado);
        if (reconecto) sincronizar();
        else contarPendientesDeEnvio(db).then(setPendientes);
      });
    },
    [db, enabled, notificar, sincronizar],
  );

  useEffect(() => {
    if (!enabled || !enLinea || pendientes === 0) return;
    const timer = setInterval(sincronizar, REINTENTO_MS);
    return () => clearInterval(timer);
  }, [enabled, enLinea, pendientes, sincronizar]);

  return (
    <NetworkContext
      value={{ enLinea, pendientes, sincronizando, ultimaSincronizacion, sincronizar }}>
      {children}
    </NetworkContext>
  );
}

export function useNetworkStatus(): NetworkContextValue {
  const ctx = use(NetworkContext);
  if (!ctx) throw new Error('useNetworkStatus debe usarse dentro de <NetworkProvider>');
  return ctx;
}


================================================
ðŸ“„ ARCHIVO: src\hooks\useSession.tsx
================================================

import { ProveedorSesion, useSesion } from '@/context/sesion';
import type { Sesion } from '@/domain/types';

export const SessionProvider = ProveedorSesion;

export function useSession() {
  const { usuario, nombre, cargando, errorCarga, iniciarSesion, cerrarSesion } = useSesion();

  const sesion: Sesion | null = usuario
    ? {
        tecnico: {
          codigo: usuario.uid,
          nombre: nombre?.trim() || usuario.email || 'Usuario',
        },
        iniciadaEn: usuario.metadata.lastSignInTime ?? '',
      }
    : null;

  return {
    sesion,
    nombre,
    correo: usuario?.email ?? null,
    cargando,
    errorCarga,
    iniciarSesion,
    cerrarSesion,
  };
}


================================================
ðŸ“„ ARCHIVO: src\lib\errores-firebase.ts
================================================

/**
 * Traduce los códigos de error de Firebase Auth a mensajes claros en español.
 *
 * Firebase devuelve errores como "auth/invalid-credential". Mostrar eso al
 * usuario no sirve: el mensaje debe decir que paso y cómo corregirlo.
 */
import { FirebaseError } from 'firebase/app';
const mensajes: Record<string, string>={
      // Desde 2023 los proyectos nuevos tienen activada la "protección contra la
  // enumeración de correos": Firebase ya no distingue entre "el correo no
  // existe" y "la contraseña es incorrecta". Ambos llegan como invalid-credential.
  'auth/invalid-credential': 'El correo o la contraseña no coinciden. Revisa los datos e inténtalo de nuevo.',
  'auth/wrong-password': 'El correo o la contraseña no coinciden. Revisa los datos e inténtalo de nuevo.',
  'auth/user-not-found': 'El correo o la contraseña no coinciden. Revisa los datos e inténtalo de nuevo.',
  'auth/invalid-email': 'El correo no tiene un formato válido. Ejemplo: nombre.apellido@epn.edu.ec',
  'auth/missing-email': 'Escribe tu correo para continuar.',
  'auth/missing-password': 'Escribe tu contraseña para continuar.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña.',
  'auth/weak-password': 'La contraseña es muy débil. Usa al menos 8 caracteres.',
  'auth/password-does-not-meet-requirements':
    'La contraseña no cumple la política del proyecto. Combina mayúsculas, minúsculas y números.',
  'auth/too-many-requests': 'Hubo demasiados intentos seguidos. Espera unos minutos y vuelve a intentarlo.',
  'auth/network-request-failed': 'No hay conexión con Firebase. Revisa tu internet e inténtalo otra vez.',
  'auth/requires-recent-login': 'Por seguridad, cierra sesión, vuelve a ingresar y repite el cambio.',
  'auth/user-disabled': 'Esta cuenta fue deshabilitada. Comunícate con el administrador.',
  'auth/email-not-verified': 'Debes verificar tu correo antes de iniciar sesión.',
  'auth/operation-not-allowed':
    'El acceso con correo y contraseña no está habilitado en la consola de Firebase.',
  'auth/invalid-api-key': 'La configuración de Firebase no es válida. Revisa el archivo .env.local.',

}

/**
 * @param error  Lo que llegó al bloque catch.
 * @param reemplazos  Mensajes propios de una pantalla para ciertos códigos.
 *   Ejemplo: al cambiar la contraseña, invalid-credential significa
 *   "la contraseña actual no es correcta", no "el correo no coincide".
 */

export function mensajeDeError(error: unknown, reemplazos: Record<string, string> = {}): string {
  const codigo = error instanceof FirebaseError
    ? error.code
    : error instanceof Error && Object.hasOwn(mensajes, error.message)
      ? error.message
      : null;
  if (codigo) {
    if (reemplazos[codigo]) return reemplazos[codigo];
    if (mensajes[codigo]) return mensajes[codigo];
    // La API key mal copiada produce un código largo que empieza así.
    if (codigo.startsWith('auth/api-key-not-valid')) return mensajes['auth/invalid-api-key'];
    // Para errores no previstos mostramos el código: ayuda a depurar en el taller.
    return `No se pudo completar la operación (${codigo}).`;
  }
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}


================================================
ðŸ“„ ARCHIVO: src\services\api.ts
================================================

import type { Lectura, Medidor } from '@/domain/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/** Con señal débil una petición puede quedarse colgada; se corta a los 10 s. */
const TIMEOUT_MS = 10_000;

/** No hubo respuesta del servidor: sin señal, tiempo agotado o red caída. */
export class SinConexionError extends Error {
  constructor() {
    super('Sin conexión con el sistema de la oficina');
    this.name = 'SinConexionError';
  }
}

async function pedir(ruta: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${API_URL}${ruta}`, { ...init, signal: controller.signal });
  } catch {
    throw new SinConexionError();
  } finally {
    clearTimeout(timer);
  }
}

/** MockAPI filtra por coincidencia parcial y responde 404 sin resultados: se busca el código exacto. */
export async function fetchMedidor(codigo: string): Promise<Medidor | null> {
  const res = await pedir(`/medidores?codigo=${encodeURIComponent(codigo)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`El sistema de la oficina respondió con error ${res.status}`);
  const medidores = (await res.json()) as Medidor[];
  return medidores.find((m) => m.codigo === codigo) ?? null;
}

interface LecturaRemota {
  id: string;
  clave: string;
  registroId?: string;
}

/** Lectura ya registrada en la oficina con esa clave (medidor + mes), o null. */
export async function buscarLecturaRemota(clave: string): Promise<LecturaRemota | null> {
  const res = await pedir(`/Lecturas?clave=${encodeURIComponent(clave)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`El sistema de la oficina respondió con error ${res.status}`);
  const lecturas = (await res.json()) as LecturaRemota[];
  return lecturas.find((l) => l.clave === clave) ?? null;
}

function cuerpoLectura(l: Lectura): string {
  return JSON.stringify({
    registroId: l.registroId,
    clave: l.clave,
    codigoMedidor: l.codigoMedidor,
    periodo: l.periodo,
    estadoMedidor: l.estadoMedidor,
    lectura: l.lectura,
    lecturaAnterior: l.lecturaAnterior,
    consumo: l.consumo,
    esAnomalo: l.esAnomalo,
    revisionConfirmada: l.revisionConfirmada,
    observacion: l.observacion,
    fotoUri: l.fotoUri,
    empleadoCodigo: l.tecnicoCodigo,
    registradaEn: l.registradaEn,
    verificacion: l.verificacion,
  });
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function crearLecturaRemota(l: Lectura): Promise<string> {
  const res = await pedir('/Lecturas', { method: 'POST', headers: JSON_HEADERS, body: cuerpoLectura(l) });
  if (!res.ok) throw new Error(`El sistema de la oficina respondió con error ${res.status}`);
  const creada = (await res.json()) as LecturaRemota;
  return creada.id;
}

export async function actualizarLecturaRemota(idRemoto: string, l: Lectura): Promise<void> {
  const res = await pedir(`/Lecturas/${idRemoto}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: cuerpoLectura(l),
  });
  if (!res.ok) throw new Error(`El sistema de la oficina respondió con error ${res.status}`);
}


================================================
ðŸ“„ ARCHIVO: src\services\borradores.ts
================================================

import type { SQLiteDatabase } from 'expo-sqlite';

import {
  eliminarBorrador,
  fotoEnUso,
  obtenerBorrador,
  type Borrador,
} from '@/database/repositories/borradorRepository';
import { obtenerLectura, obtenerLecturaPorClave } from '@/database/repositories/lecturaRepository';
import { claveLectura, periodoDe } from '@/domain/medidor.rules';

import { eliminarFoto } from './imageStorage';

/** R8: no sirve el borrador de una lectura ya enviada o de un medidor ya registrado este mes. */
async function esObsoleto(db: SQLiteDatabase, b: Borrador): Promise<boolean> {
  if (b.lecturaId !== null) {
    const lectura = await obtenerLectura(db, b.lecturaId);
    return lectura === null || lectura.estadoEnvio !== 'PENDIENTE';
  }
  const clave = claveLectura(b.codigoMedidor, periodoDe(new Date()));
  return (await obtenerLecturaPorClave(db, clave)) !== null;
}

/** Borrador del técnico; los obsoletos se descartan sin preguntar. */
export async function borradorDe(db: SQLiteDatabase, tecnicoCodigo: string): Promise<Borrador | null> {
  const borrador = await obtenerBorrador(db);
  if (!borrador || borrador.tecnicoCodigo !== tecnicoCodigo) return null;
  if (await esObsoleto(db, borrador)) {
    await descartarBorrador(db);
    return null;
  }
  return borrador;
}

/** Descarta el registro a medias (R8) y su foto, salvo que pertenezca a una lectura guardada. */
export async function descartarBorrador(db: SQLiteDatabase): Promise<void> {
  const borrador = await obtenerBorrador(db);
  await eliminarBorrador(db);
  const foto = borrador?.datos.fotoUri;
  if (foto && !(await fotoEnUso(db, foto))) eliminarFoto(foto);
}


================================================
ðŸ“„ ARCHIVO: src\services\duplicados.ts
================================================

import type { SQLiteDatabase } from 'expo-sqlite';

import { obtenerLecturaPorClave } from '@/database/repositories/lecturaRepository';
import { claveLectura, periodoDe } from '@/domain/medidor.rules';
import type { Lectura, Medidor } from '@/domain/types';

import { buscarLecturaRemota } from './api';
import { hayConexion } from './networkService';

export interface Duplicado {
  motivo: string;
  /** Si el duplicado está en el teléfono y sigue pendiente, se puede corregir en su lugar. */
  lecturaLocal: Lectura | null;
}

/** R10: se revisa en el teléfono, en la última lectura del medidor y, con señal, en la oficina. */
export async function buscarDuplicado(
  db: SQLiteDatabase,
  codigo: string,
  medidor: Medidor | null,
): Promise<Duplicado | null> {
  const periodo = periodoDe(new Date());
  const clave = claveLectura(codigo, periodo);

  const local = await obtenerLecturaPorClave(db, clave);
  if (local) {
    return {
      motivo:
        local.estadoEnvio === 'PENDIENTE'
          ? 'Ya registraste este medidor este mes. Aún no se envía, así que puedes corregirla.'
          : 'Ya registraste este medidor este mes y la lectura ya se envió a la oficina.',
      lecturaLocal: local,
    };
  }

  if (medidor && periodoDe(new Date(medidor.fechaUltimaLectura)) === periodo) {
    const fecha = new Date(medidor.fechaUltimaLectura).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'long',
    });
    return {
      motivo: `El sistema de la oficina ya tiene la lectura de este mes (${fecha}).`,
      lecturaLocal: null,
    };
  }

  if (await hayConexion()) {
    try {
      if (await buscarLecturaRemota(clave)) {
        return {
          motivo: 'El sistema de la oficina ya tiene una lectura de este medidor en este mes.',
          lecturaLocal: null,
        };
      }
    } catch {
      // Sin respuesta de la oficina: se permite registrar; el envío volverá a revisarlo.
    }
  }
  return null;
}


================================================
ðŸ“„ ARCHIVO: src\services\imageStorage.ts
================================================

import { Directory, File, Paths } from 'expo-file-system';

/** R7: la cámara deja la foto en caché; se mueve a documentos, que solo se borra al desinstalar. */
const carpetaFotos = () => new Directory(Paths.document, 'fotos-lecturas');

export async function persistirFoto(uriTemporal: string, codigoMedidor: string): Promise<string> {
  const carpeta = carpetaFotos();
  carpeta.create({ idempotent: true, intermediates: true });
  const foto = new File(uriTemporal);
  const destino = new File(carpeta, `${codigoMedidor}_${Date.now()}.jpg`);
  await foto.move(destino);
  return destino.uri;
}

export function eliminarFoto(uri: string | null): void {
  if (!uri) return;
  const foto = new File(uri);
  if (foto.exists) foto.delete();
}


================================================
ðŸ“„ ARCHIVO: src\services\networkService.ts
================================================

import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

/** Hay conexión real a internet; mientras NetInfo no lo sabe (null) se asume que sí. */
export function estaEnLinea(state: NetInfoState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false;
}

export async function hayConexion(): Promise<boolean> {
  return estaEnLinea(await NetInfo.fetch());
}

/** Avisa cada cambio de conectividad (R9); se dispara también al suscribirse. */
export function suscribirConexion(onCambio: (enLinea: boolean) => void): () => void {
  return NetInfo.addEventListener((state) => onCambio(estaEnLinea(state)));
}


================================================
ðŸ“„ ARCHIVO: src\services\syncQueue.ts
================================================

import type { SQLiteDatabase } from 'expo-sqlite';

import {
  guardarVerificacion,
  listarPendientesDeEnvio,
  marcarEnviada,
  marcarRechazada,
} from '@/database/repositories/lecturaRepository';
import { guardarMedidorEnCache } from '@/database/repositories/medidorRepository';
import { calcularConsumo, esConsumoAnomalo } from '@/domain/medidor.rules';
import type { Lectura, Verificacion } from '@/domain/types';

import {
  actualizarLecturaRemota,
  buscarLecturaRemota,
  crearLecturaRemota,
  fetchMedidor,
  SinConexionError,
} from './api';

export interface ResultadoSync {
  enviadas: number;
  fallidas: number;
}

/** R4: al reconectar, una lectura sin señal anómala o menor a la anterior va como REQUIERE_REVISION. */
async function verificar(db: SQLiteDatabase, l: Lectura): Promise<Lectura> {
  if (l.verificacion !== 'PENDIENTE_VERIFICAR') return l;

  const medidor = await fetchMedidor(l.codigoMedidor);
  let datos: Pick<Lectura, 'lecturaAnterior' | 'consumo' | 'consumoPromedio' | 'esAnomalo'> & {
    verificacion: Verificacion;
  };

  if (!medidor) {
    datos = { ...l, verificacion: 'REQUIERE_REVISION' };
  } else {
    await guardarMedidorEnCache(db, medidor);
    const consumo = l.lectura !== null ? calcularConsumo(medidor, l.lectura) : null;
    const esAnomalo = consumo !== null && consumo >= 0 && esConsumoAnomalo(medidor, consumo);
    const respaldada = l.revisionConfirmada && l.fotoUri !== null;
    const requiereRevision = (consumo !== null && consumo < 0) || (esAnomalo && !respaldada);
    datos = {
      lecturaAnterior: medidor.ultimaLectura,
      consumo,
      consumoPromedio: medidor.consumoPromedio,
      esAnomalo,
      verificacion: requiereRevision ? 'REQUIERE_REVISION' : 'VERIFICADA',
    };
  }

  await guardarVerificacion(db, l.id, datos);
  return { ...l, ...datos };
}

/** R9: mismo registroId = reintento propio (PUT); otro registroId = la oficina ya la tiene (R10). */
async function enviar(db: SQLiteDatabase, l: Lectura): Promise<void> {
  const existente = await buscarLecturaRemota(l.clave);
  if (!existente) {
    await marcarEnviada(db, l.id, l.revision, await crearLecturaRemota(l));
  } else if (existente.registroId === l.registroId) {
    await actualizarLecturaRemota(existente.id, l);
    await marcarEnviada(db, l.id, l.revision, existente.id);
  } else {
    await marcarRechazada(
      db,
      l.id,
      'El sistema de la oficina ya tenía una lectura de este medidor en este mes',
    );
  }
}

async function ejecutar(db: SQLiteDatabase): Promise<ResultadoSync> {
  const resultado: ResultadoSync = { enviadas: 0, fallidas: 0 };
  for (const pendiente of await listarPendientesDeEnvio(db)) {
    try {
      await enviar(db, await verificar(db, pendiente));
      resultado.enviadas++;
    } catch (e) {
      // Sin señal no tiene sentido seguir: se reintenta al recuperar la conexión.
      if (e instanceof SinConexionError) break;
      resultado.fallidas++;
    }
  }
  return resultado;
}

let enCurso: Promise<ResultadoSync> | null = null;

/** Procesa la cola. Si ya hay un envío en curso devuelve ese mismo, así nunca corren dos a la vez. */
export function procesarCola(db: SQLiteDatabase): Promise<ResultadoSync> {
  enCurso ??= ejecutar(db).finally(() => {
    enCurso = null;
  });
  return enCurso;
}


================================================
ðŸ“„ ARCHIVO: src\uniwind-types.d.ts
================================================

// NOTE: This file is generated by uniwind and it should not be edited manually.
/// <reference types="uniwind/types" />

declare module 'uniwind' {
    export interface UniwindConfig {
        themes: readonly ['light', 'dark']
    }
}

export {}


================================================
ðŸ“„ ARCHIVO: src\utils\navegacion.ts
================================================

import { router } from 'expo-router';

/** Vuelve a la pantalla anterior; si no hay ninguna (p. ej. se abrió al iniciar la app), va al inicio. */
export function volver(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}


================================================
ðŸ“„ ARCHIVO: tsconfig.json
================================================

{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": [
        "./src/*"
      ],
      "@/assets/*": [
        "./assets/*"
      ],
      "@firebase/auth":[
        "./node_modules/@firebase/auth/dist/index.rn.d.ts"
      ]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}