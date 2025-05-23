// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196f3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'QuRe',
            headerShown: true,
          }} 
        />
        <Stack.Screen 
          name="modal/create" 
          options={{ 
            title: 'Create QR Code',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="modal/edit" 
          options={{ 
            title: 'Edit QR Code',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="modal/view" 
          options={{ 
            title: 'QR Code',
            presentation: 'modal',
          }} 
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}