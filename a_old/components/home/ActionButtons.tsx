import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActionButtonsProps {
  onExportWallpaper: () => void;
  showActionButtons: boolean;
}

export default function ActionButtons({ onExportWallpaper, showActionButtons }: ActionButtonsProps) {
  const handleSettings = () => {
    router.push('/modal/settings');
  };

  if (!showActionButtons) {
    return null;
  }

  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.actionCard} onPress={onExportWallpaper}>
        <View style={styles.actionLeft}>
          <Text style={styles.actionIcon}>⬇</Text>
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Export Wallpaper</Text>
          <Text style={styles.actionSubtitle}>Save to your photos</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={handleSettings}>
        <View style={styles.actionLeft}>
          <Text style={styles.actionIcon}>⚙️</Text>
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Settings</Text>
          <Text style={styles.actionSubtitle}>Backgrounds & Plan Status</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={() => {}}>
        <View style={styles.actionLeft}>
          <Text style={styles.actionIcon}>⟨ ⟩</Text>
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Swipe to change background</Text>
          <Text style={styles.actionSubtitle}>Change gradient colors</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 40,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  actionLeft: {
    marginRight: 12,
  },
  actionIcon: {
    fontSize: 20,
    color: 'white',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 1,
  },
  actionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
}); 