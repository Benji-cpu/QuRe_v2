// app/components/qr-design/LogoPicker.tsx (updated)
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import LogoIconPicker from './LogoIconPicker';

interface LogoPickerProps {
  logo: string | null;
  onLogoSelect: (logo: string | null) => void;
}

export default function LogoPicker({ logo, onLogoSelect }: LogoPickerProps) {
  const { theme } = useTheme();
  const [showIconPicker, setShowIconPicker] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      onLogoSelect(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const removeLogo = () => {
    onLogoSelect(null);
  };

  const handleIconSelect = (iconValue: string) => {
    onLogoSelect(iconValue);
  };

  const actionsStyle = [styles.actions, logo && styles.actionsNoWrap];

  return (
    <View style={styles.container}>
      <View style={logo ? styles.titleRow : styles.row}>
        <Text style={[styles.label, { color: theme.text }]}>Custom Icon</Text>

        {!logo && (
          <View style={actionsStyle}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { borderColor: theme.border, backgroundColor: theme.surface },
              ]}
              onPress={pickImage}
            >
              <Text style={[styles.actionText, { color: theme.text }]}>Upload</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { borderColor: theme.border, backgroundColor: theme.surface },
              ]}
              onPress={() => setShowIconPicker(true)}
            >
              <Feather name="grid" size={16} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.primary }]}>Icon Library</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {logo && (
        <View style={styles.actionsRow}>
          <View style={actionsStyle}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { borderColor: theme.border, backgroundColor: theme.surface },
              ]}
              onPress={pickImage}
            >
              <Text style={[styles.actionText, { color: theme.text }]}>Upload</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { borderColor: theme.border, backgroundColor: theme.surface },
              ]}
              onPress={() => setShowIconPicker(true)}
            >
              <Feather name="grid" size={16} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.primary }]}>Icon Library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.removeButton, { borderColor: theme.error, backgroundColor: theme.error + '10' }]}
              onPress={removeLogo}
            >
              <Text style={[styles.removeText, { color: theme.error }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <LogoIconPicker
        visible={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelectIcon={handleIconSelect}
        selectedValue={logo || undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionsNoWrap: {
    flexWrap: 'nowrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  removeButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: 15,
    fontWeight: '600',
  },
});