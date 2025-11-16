// app/components/qr-design/LogoIconPicker.tsx
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import type { LogoIconCategory, LogoIconDefinition } from '../../constants/logoIcons';
import {
    LOGO_ICON_CATEGORIES,
    LOGO_ICON_CATEGORY_LABELS,
    LOGO_ICONS,
} from '../../constants/logoIcons';

interface LogoIconPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectIcon: (icon: string) => void;
  selectedValue?: string | null;
}

const renderIconContent = (
  icon: LogoIconDefinition,
  themeColors: { text: string; iconColor: string },
) => {
  if (icon.type === 'vector') {
    const { Icon, iconName, color, sizeScale } = icon;
    const iconSize = 32 * (sizeScale ?? 1);
    return (
      <Icon
        name={iconName as never}
        size={iconSize}
        color={color || themeColors.iconColor}
      />
    );
  }

  return (
    <Text style={[styles.emoji, { color: themeColors.iconColor }]}>{icon.emoji}</Text>
  );
};

export default function LogoIconPicker({
  visible,
  onClose,
  onSelectIcon,
  selectedValue,
}: LogoIconPickerProps) {
  const { theme } = useTheme();

  const renderCategory = (category: LogoIconCategory) => {
    const categoryIcons = LOGO_ICONS.filter((icon) => icon.category === category);

    return (
      <View key={category} style={styles.categorySection}>
        <Text style={[styles.categoryTitle, { color: theme.textSecondary }]}>
          {LOGO_ICON_CATEGORY_LABELS[category]}
        </Text>
        <View style={styles.iconsGrid}>
          {categoryIcons.map((icon) => {
            const isSelected = selectedValue === icon.value;
            const iconBackground =
              icon.type === 'vector'
                ? icon.backgroundColor || theme.surfaceVariant
                : theme.surfaceVariant;

            return (
              <TouchableOpacity
                key={icon.value}
                style={[
                  styles.iconButton,
                  {
                    backgroundColor: iconBackground,
                    borderColor: isSelected ? theme.primary : 'transparent',
                  },
                ]}
                onPress={() => {
                  onSelectIcon(icon.value);
                  onClose();
                }}
              >
                <View style={styles.iconPreviewWrapper}>
                  {renderIconContent(icon, { text: theme.text, iconColor: theme.text })}
                </View>
                <Text style={[styles.iconLabel, { color: theme.textSecondary }]}>
                  {icon.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.modalBackground }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Choose an Icon</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {LOGO_ICON_CATEGORIES.map(renderCategory)}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
  },
  categorySection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 88,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
  },
  iconLabel: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  iconPreviewWrapper: {
    height: 42,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emoji: {
    fontSize: 32,
    lineHeight: 36,
  },
});