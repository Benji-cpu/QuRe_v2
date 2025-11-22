import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider } from '../contexts/AppStateContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { IAPService } from '../services/IAPService';
import { navigationService } from '../services/NavigationService';

function RootLayoutContent() {
  const { theme, mode } = useTheme();
  
  useEffect(() => {
    // Initialize IAP when app starts
    IAPService.initialize().catch(console.error);
    
    return () => {
      // Cleanup when app unmounts
      IAPService.disconnect().catch(console.error);
      navigationService.reset();
    };
  }, []);
  
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.primary,
          },
          headerTintColor: theme.primaryText,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: theme.background,
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
          name="modal/qrcode" 
          options={{ 
            title: 'QR Code',
            presentation: 'modal',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="modal/view" 
          options={{ 
            title: 'QR Code',
            presentation: 'modal',
            headerStyle: {
              backgroundColor: theme.surface,
            },
            headerTintColor: theme.text,
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
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="modal/premium" 
          options={{ 
            title: 'Premium',
            presentation: 'modal',
            headerShown: false,
          }} 
        />
      </Stack>
      <StatusBar 
        style={mode === 'dark' ? 'light' : 'dark'} 
        translucent={Platform.OS === 'android'}
        backgroundColor="transparent"
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}