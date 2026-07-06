import { initDB } from '@/database/db';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'; // ← vuelve a como estaba
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    initDB();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="splash" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Nuevo producto' }} />
        <Stack.Screen name="producto" options={{ title: 'Editar producto' }} />
        <Stack.Screen name="nuevo-pedido" options={{ title: 'Nuevo pedido' }} />
        <Stack.Screen name="pedido" options={{ title: 'Detalle del pedido' }} />
        <Stack.Screen name="mis-tiendas" options={{ title: 'Mis tiendas' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}