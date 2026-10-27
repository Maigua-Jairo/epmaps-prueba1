import { Stack } from 'expo-router';

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
