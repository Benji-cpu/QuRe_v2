// app/components/home/ActionCards.tsx
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActionCardsProps {
  onExportWallpaper: () => void;
  onShareWallpaper: () => void;
  onSettings: () => void;
  showShareButton?: boolean;
}

export default function ActionCards({ onExportWallpaper, onShareWallpaper, onSettings, showShareButton = false }: ActionCardsProps) {
  return (
    <View style={styles.actionsRow}>
      <TouchableOpacity style={[styles.actionCard, styles.cardSpacing]} onPress={onExportWallpaper}>
        <View style={styles.iconContainer}>
          <Feather name="download" size={18} color="white" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            Set as
          </Text>
          <Text style={styles.subtitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            Lock Screen
          </Text>
        </View>
      </TouchableOpacity>

      {showShareButton && (
        <TouchableOpacity style={[styles.actionCard, styles.cardSpacing]} onPress={onShareWallpaper}>
          <View style={styles.iconContainer}>
            <Feather name="share" size={18} color="white" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              Share
            </Text>
            <Text style={styles.subtitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              Lock Screen
            </Text>
          </View>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.actionCard} onPress={onSettings}>
        <View style={styles.iconContainer}>
          <Feather name="settings" size={18} color="white" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            Settings
          </Text>
          <Text style={styles.subtitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            & Plans
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardSpacing: {
    marginRight: 8,
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
  textContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
