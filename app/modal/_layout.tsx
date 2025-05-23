import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function ModalLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? Colors.backgroundDark : Colors.background,
        },
        headerTintColor: colorScheme === 'dark' ? Colors.textDark : Colors.text,
        headerShadowVisible: false,
        presentation: 'modal',
        animation: 'slide_from_bottom',
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? Colors.backgroundDark : Colors.background,
        },
      }}
    >
      <Stack.Screen
        name="create-qr"
        options={{
          title: 'Create QR Code',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="type-selection"
        options={{
          title: 'Select QR Type',
          headerShown: true,
        }}
      />
    </Stack>
  );
}