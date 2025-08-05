// app/components/home/ActionCards.tsx
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActionCardsProps {
  onExportWallpaper: () => void;
  onShareWallpaper: () => void;
  onSettings: () => void;
}

export default function ActionCards({ onExportWallpaper, onShareWallpaper, onSettings }: ActionCardsProps) {
  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.actionCard} onPress={onExportWallpaper}>
        <View style={styles.iconContainer}>
          <Feather name="download" size={18} color="white" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Set as</Text>
          <Text style={styles.actionSubtitle}>Lock Screen</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={onShareWallpaper}>
        <View style={styles.iconContainer}>
          <Feather name="share" size={18} color="white" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Share</Text>
          <Text style={styles.actionSubtitle}>Lock Screen</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={onSettings}>
        <View style={styles.iconContainer}>
          <Feather name="settings" size={18} color="white" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Settings</Text>
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
    height: 60,
    gap: 8,
    zIndex: 10,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginBottom: 1,
  },
  actionSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});