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
