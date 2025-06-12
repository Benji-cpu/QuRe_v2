// app/components/qr-design/LogoIconPicker.tsx
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LogoIconPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectIcon: (icon: string) => void;
}

const PRESET_ICONS = [
  { name: 'Bitcoin', emoji: '₿', category: 'crypto' },
  { name: 'Ethereum', emoji: '⟠', category: 'crypto' },
  { name: 'PayPal', emoji: '💳', category: 'payment' },
  { name: 'Venmo', emoji: '💸', category: 'payment' },
  { name: 'WhatsApp', emoji: '💬', category: 'social' },
  { name: 'Instagram', emoji: '📷', category: 'social' },
  { name: 'Twitter', emoji: '🐦', category: 'social' },
  { name: 'Facebook', emoji: '👤', category: 'social' },
  { name: 'LinkedIn', emoji: '💼', category: 'social' },
  { name: 'Email', emoji: '📧', category: 'contact' },
  { name: 'Phone', emoji: '📱', category: 'contact' },
  { name: 'Person', emoji: '👤', category: 'contact' },
  { name: 'Location', emoji: '📍', category: 'utility' },
  { name: 'WiFi', emoji: '📶', category: 'utility' },
  { name: 'Link', emoji: '🔗', category: 'utility' },
  { name: 'QR Code', emoji: '◼️', category: 'utility' },
  { name: 'Heart', emoji: '❤️', category: 'misc' },
  { name: 'Star', emoji: '⭐', category: 'misc' },
  { name: 'Home', emoji: '🏠', category: 'misc' },
  { name: 'Music', emoji: '🎵', category: 'misc' },
];

const CATEGORIES = ['crypto', 'payment', 'social', 'contact', 'utility', 'misc'];
const CATEGORY_LABELS: Record<string, string> = {
  crypto: 'Cryptocurrency',
  payment: 'Payment',
  social: 'Social Media',
  contact: 'Contact',
  utility: 'Utility',
  misc: 'Miscellaneous',
};

export default function LogoIconPicker({ visible, onClose, onSelectIcon }: LogoIconPickerProps) {
  const renderCategory = (category: string) => {
    const categoryIcons = PRESET_ICONS.filter(icon => icon.category === category);
    
    return (
      <View key={category} style={styles.categorySection}>
        <Text style={styles.categoryTitle}>{CATEGORY_LABELS[category]}</Text>
        <View style={styles.iconsGrid}>
          {categoryIcons.map((icon) => (
            <TouchableOpacity
              key={icon.name}
              style={styles.iconButton}
              onPress={() => {
                onSelectIcon(icon.emoji);
                onClose();
              }}
            >
              <Text style={styles.iconEmoji}>{icon.emoji}</Text>
              <Text style={styles.iconLabel}>{icon.name}</Text>
            </TouchableOpacity>
          ))}
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose an Icon</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {CATEGORIES.map(renderCategory)}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
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
    color: '#666',
  },
  categorySection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 80,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  iconEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  iconLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
});