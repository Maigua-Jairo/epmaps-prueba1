import '@/global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';

import { NetworkStatusBar } from '@/components/NetworkStatusBar';
import { DATABASE_NAME, initDatabase } from '@/database/client';
import { NetworkProvider } from '@/hooks/useNetworkStatus';
import { SessionProvider, useSession } from '@/hooks/useSession';

SplashScreen.preventAutoHideAsync();

/** Pesos de Manrope que usa la app; los nombres coinciden con los de tailwind.config.js. */
const FUENTES = {
  Manrope_400Regular: require('../../assets/fonts/Manrope_400Regular.ttf'),
  Manrope_500Medium: require('../../assets/fonts/Manrope_500Medium.ttf'),
  Manrope_600SemiBold: require('../../assets/fonts/Manrope_600SemiBold.ttf'),
  Manrope_700Bold: require('../../assets/fonts/Manrope_700Bold.ttf'),
  Manrope_800ExtraBold: require('../../assets/fonts/Manrope_800ExtraBold.ttf'),
};

export default function RootLayout() {
  const [fuentesCargadas, errorFuentes] = useFonts(FUENTES);

  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
      <NetworkProvider>
        <SessionProvider>
          <StatusBar style="light" />
          <View className="flex-1">
            {/* R9: la barra está sobre el navegador, así aparece en todas las pantallas. */}
            <NetworkStatusBar />
            <SinMargenSuperior>
              {/* Si la fuente fallara, la app sigue con la del sistema. */}
              <RootNavigator fuentesListas={fuentesCargadas || errorFuentes !== null} />
            </SinMargenSuperior>
          </View>
        </SessionProvider>
      </NetworkProvider>
    </SQLiteProvider>
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
function RootNavigator({ fuentesListas }: { fuentesListas: boolean }) {
  const { sesion, cargando } = useSession();
  const listo = !cargando && fuentesListas;

  useEffect(() => {
    if (listo) SplashScreen.hideAsync();
  }, [listo]);

  if (!listo) return null;

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
