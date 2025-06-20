import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppStateProvider } from '../contexts/AppStateContext';
import { IAPService } from '../services/IAPService';

export default function RootLayout() {
  useEffect(() => {
    // Initialize IAP when app starts
    IAPService.initialize().catch(console.error);
    
    return () => {
      // Cleanup when app unmounts
      IAPService.disconnect().catch(console.error);
    };
  }, []);
  
  return (
    <AppStateProvider>
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
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="modal/create" 
          options={{ 
            title: 'Create QR Code',
            presentation: 'modal',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="modal/edit" 
          options={{ 
            title: 'Edit QR Code',
            presentation: 'modal',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="modal/view" 
          options={{ 
            title: 'QR Code',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="modal/history" 
          options={{ 
            title: 'QR Code History',
            presentation: 'modal',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="modal/settings" 
          options={{ 
            title: 'Settings',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="modal/premium" 
          options={{ 
            title: 'Premium',
            presentation: 'modal',
          }} 
        />
      </Stack>
      <StatusBar style="light" />
    </AppStateProvider>
  );
}