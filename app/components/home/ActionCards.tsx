// app/components/home/ActionCards.tsx
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActionCardsProps {
  onExportWallpaper: () => void;
  onSettings: () => void;
}

export default function ActionCards({ onExportWallpaper, onSettings }: ActionCardsProps) {
  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.actionCard} onPress={onExportWallpaper}>
        <View style={styles.iconContainer}>
          <Feather name="download" size={20} color="white" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Export</Text>
          <Text style={styles.actionSubtitle}>Wallpaper</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={onSettings}>
        <View style={styles.iconContainer}>
          <Feather name="settings" size={20} color="white" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Settings</Text>
          <Text style={styles.actionSubtitle}>& Plans</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 1,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});