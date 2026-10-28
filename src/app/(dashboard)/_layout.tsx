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
