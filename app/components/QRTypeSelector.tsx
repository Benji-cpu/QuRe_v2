// components/QRTypeSelector.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { LayoutAnimation, LayoutChangeEvent, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
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
  onTypeSelectedFromExpanded?: () => void;
}

const GRID_COLUMNS = 3;
const GRID_GAP = 8;
const COLUMN_GAP = 8; // Kept for calculation compatibility, essentially acts as the 3rd gap

export default function QRTypeSelector({ selectedType, onTypeSelect, onTypeSelectedFromExpanded }: QRTypeSelectorProps) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [typeButtonSize, setTypeButtonSize] = useState<number | null>(null);

  // Define the priority order - top 3 shown when collapsed
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

      return (
        <Icon
          name={iconDefinition.iconName as never}
          size={Math.round(20 * (iconDefinition.sizeScale ?? 1))}
          color={iconColor}
        />
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

  const handleTypeSelect = (typeConfig: (typeof QR_TYPES)[number]) => {
    const wasExpanded = isExpanded;
    
    onTypeSelect(typeConfig.type);
    
    // If selected from expanded view, collapse and notify parent
    if (wasExpanded) {
      setIsExpanded(false);
      onTypeSelectedFromExpanded?.();
    }
  };

  const handleColumnsLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    // Calculate size for 4 items per row (3 types + 1 action column/spacer)
    // We use the same formula as before because it effectively divides by 4
    // GRID_COLUMNS (3) + 1 = 4 items
    // totalRowGap (2 gaps) + COLUMN_GAP (1 gap) = 3 gaps total
    const totalRowGap = GRID_GAP * (GRID_COLUMNS - 1);
    const computedSize = (width - COLUMN_GAP - totalRowGap) / (GRID_COLUMNS + 1);

    if (!Number.isFinite(computedSize) || computedSize <= 0) {
      return;
    }

    setTypeButtonSize((prev) => {
      if (prev === null || Math.abs(prev - computedSize) > 0.5) {
        return computedSize;
      }
      return prev;
    });
  }, []);

  const sharedButtonDimensions = typeButtonSize !== null ? { width: typeButtonSize } : null;

  const renderTypeButton = (typeConfig: (typeof QR_TYPES)[number]) => {
    const isSelected = selectedType === typeConfig.type;
    return (
      <TouchableOpacity
        key={typeConfig.type}
        style={[
          styles.typeButton,
          sharedButtonDimensions,
          { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
          isSelected && [styles.selectedType, { backgroundColor: theme.surface, borderColor: theme.primary }],
        ]}
        onPress={() => handleTypeSelect(typeConfig)}
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

  const renderExpandButton = () => (
    <TouchableOpacity 
      key="expand-button"
      style={[
        styles.typeButton,
        sharedButtonDimensions,
        { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
        isExpanded && [styles.selectedType, { backgroundColor: theme.surface, borderColor: theme.primary }],
      ]} 
      onPress={toggleExpanded}
    >
      <Ionicons 
        name={isExpanded ? 'chevron-up' : 'chevron-down'} 
        size={20} 
        color={isExpanded ? theme.primary : theme.textSecondary} 
      />
    </TouchableOpacity>
  );

  const renderSpacer = (index: number) => (
    <View 
      key={`spacer-${index}`}
      style={[styles.typeButton, sharedButtonDimensions, { opacity: 0, borderWidth: 0 }]} 
      pointerEvents="none"
    />
  );
  
  // Build the flat list of grid items
  const renderGridItems = () => {
    const items = [];
    
    // 1. Top 3 types
    topTypes.forEach(type => items.push(renderTypeButton(type)));
    
    // 2. Expand button (always in the 4th slot of the first row)
    items.push(renderExpandButton());
    
    // 3. Remaining types
    if (isExpanded) {
      remainingTypes.forEach((type, index) => {
        items.push(renderTypeButton(type));
        // Add spacer after every 3rd item to keep the 4th column empty
        if ((index + 1) % 3 === 0) {
          items.push(renderSpacer(index));
        }
      });
    }
    
    return items;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.gridContainer} onLayout={handleColumnsLayout}>
        {renderGridItems()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    alignItems: 'flex-start',
  },
  typeButton: {
    width: '22%', // Fallback width (approx 4 columns)
    aspectRatio: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  selectedType: {
    // Applied dynamically with theme colors
  },
  emojiIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  typeTitle: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedTypeText: {
    fontWeight: 'bold',
  },
});
