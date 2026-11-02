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
