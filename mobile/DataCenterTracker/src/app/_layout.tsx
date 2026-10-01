import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    console.log('🔥 RootLayout useEffect — calling loadFromStorage');
    loadFromStorage().then(() => {
      console.log('🔥 loadFromStorage done');
    }).catch((e) => {
      console.error('🔥 loadFromStorage error:', e);
    });
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
