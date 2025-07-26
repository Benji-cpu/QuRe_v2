// components/QRTypeSelector.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { QR_TYPES } from '../../constants/QRTypes';
import { useTheme } from '../../contexts/ThemeContext';
import { QRCodeType } from '../../types/QRCode';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface QRTypeSelectorProps {
  selectedType: QRCodeType;
  onTypeSelect: (type: QRCodeType) => void;
}

export default function QRTypeSelector({ selectedType, onTypeSelect }: QRTypeSelectorProps) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Define the priority order
  const priorityOrder: QRCodeType[] = ['link', 'whatsapp', 'instagram'];
  
  // Separate top 3 and remaining types
  const topTypes = QR_TYPES.filter(type => priorityOrder.includes(type.type))
    .sort((a, b) => priorityOrder.indexOf(a.type) - priorityOrder.indexOf(b.type));
  
  const remainingTypes = QR_TYPES.filter(type => !priorityOrder.includes(type.type));

  const toggleExpanded = () => {
    LayoutAnimation.configureNext({
      duration: 200,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setIsExpanded(!isExpanded);
  };

  const renderTypeButton = (typeConfig: any) => (
    <TouchableOpacity
      key={typeConfig.type}
      style={[
        styles.typeButton,
        { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
        selectedType === typeConfig.type && [styles.selectedType, { backgroundColor: theme.surface, borderColor: theme.primary }]
      ]}
      onPress={() => onTypeSelect(typeConfig.type)}
    >
      <Text style={styles.typeIcon}>{typeConfig.icon}</Text>
      <Text style={[
        styles.typeTitle,
        { color: theme.textSecondary },
        selectedType === typeConfig.type && [styles.selectedTypeText, { color: theme.primary }]
      ]}>
        {typeConfig.title}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Select QR Code Type</Text>
      
      {/* Top 3 types - always visible */}
      <View style={styles.typesGrid}>
        {topTypes.map(renderTypeButton)}
      </View>
      
      {/* Remaining types - collapsible */}
      {isExpanded && (
        <View style={[styles.typesGrid, styles.expandedGrid]}>
          {remainingTypes.map(renderTypeButton)}
        </View>
      )}
      
      {/* Expand/Collapse button */}
      <TouchableOpacity 
        style={[styles.expandButton, { borderColor: theme.border }]} 
        onPress={toggleExpanded}
      >
        <Text style={[styles.expandButtonText, { color: theme.textSecondary }]}>
          {isExpanded ? 'Show Less' : 'Show More'}
        </Text>
        <Ionicons 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={16} 
          color={theme.textSecondary} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  expandedGrid: {
    marginTop: 10,
  },
  typeButton: {
    flex: 1,
    minWidth: '30%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedType: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  typeTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  selectedTypeText: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 15,
    gap: 8,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
});