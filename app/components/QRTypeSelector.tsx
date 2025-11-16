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
  const priorityOrder: QRCodeType[] = ['whatsapp', 'instagram', 'link'];
  
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

  const renderTypeIcon = (typeConfig: (typeof QR_TYPES)[number], isSelected: boolean) => {
    const iconDefinition = typeConfig.iconDefinition;
    if (iconDefinition?.type === 'vector') {
      const Icon = iconDefinition.Icon;
      const iconColor = iconDefinition.color || theme.primary;
      const badgeBackground =
        iconDefinition.backgroundColor || (isSelected ? theme.surface : theme.surfaceVariant);

      return (
        <View
          style={[
            styles.iconBadge,
            {
              backgroundColor: badgeBackground,
              borderColor: isSelected ? iconColor : 'transparent',
            },
          ]}
        >
          <Icon
            name={iconDefinition.iconName as never}
            size={Math.round(26 * (iconDefinition.sizeScale ?? 1))}
            color={iconColor}
          />
        </View>
      );
    }

    if (iconDefinition?.type === 'emoji') {
      return (
        <Text style={[styles.emojiIcon, { color: isSelected ? theme.primary : theme.textSecondary }]}>
          {iconDefinition.emoji}
        </Text>
      );
    }

    return (
      <Text style={[styles.emojiIcon, { color: isSelected ? theme.primary : theme.textSecondary }]}>
        {typeConfig.icon}
      </Text>
    );
  };

  const renderTypeButton = (typeConfig: (typeof QR_TYPES)[number]) => {
    const isSelected = selectedType === typeConfig.type;
    return (
      <TouchableOpacity
        key={typeConfig.type}
        style={[
          styles.typeButton,
          { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
          isSelected && [styles.selectedType, { backgroundColor: theme.surface, borderColor: theme.primary }],
        ]}
        onPress={() => onTypeSelect(typeConfig.type)}
      >
        {renderTypeIcon(typeConfig, isSelected)}
        <Text
          style={[
            styles.typeTitle,
            { color: theme.textSecondary },
            isSelected && [styles.selectedTypeText, { color: theme.primary }],
          ]}
        >
          {typeConfig.title}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Choose QR Code Type</Text>
      
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
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
  },
  emojiIcon: {
    fontSize: 26,
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