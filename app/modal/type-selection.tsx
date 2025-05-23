import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useContext } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { QR_TYPES } from '../../constants/QRTypes';
import { QRCodeContext } from '../../context/QRCodeContext';
import { QRCodeType } from '../../types/qr-code';

export default function TypeSelectionModal() {
  const { activeQRType, setActiveQRType } = useContext(QRCodeContext);
  const params = useLocalSearchParams<{ returnTo?: string }>();
  
  const handleSelectType = (type: QRCodeType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveQRType(type);
    
    if (params.returnTo) {
      router.push(params.returnTo as string);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select QR Code Type</Text>
      <Text style={styles.description}>
        Choose the type of QR code you want to create
      </Text>

      <FlatList
        data={QR_TYPES}
        keyExtractor={(item) => item.type}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.typeItem,
              activeQRType === item.type && styles.selectedType,
            ]}
            onPress={() => handleSelectType(item.type)}
          >
            <View style={styles.iconContainer}>
              <Feather
                name={item.icon as any}
                size={24}
                color={activeQRType === item.type ? 'white' : Colors.primary}
              />
            </View>
            <View style={styles.typeInfo}>
              <Text style={styles.typeLabel}>{item.label}</Text>
              <Text style={styles.typeDescription}>{item.description}</Text>
            </View>
            {activeQRType === item.type && (
              <Feather name="check" size={20} color="white" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.l,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  description: {
    fontSize: 16,
    color: '#777',
    marginBottom: Layout.spacing.xl,
  },
  listContent: {
    paddingBottom: Layout.spacing.xl,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: Layout.spacing.m,
    borderRadius: Layout.borderRadius.large,
    marginBottom: Layout.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedType: {
    backgroundColor: Colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.m,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: '#777',
  },
  checkIcon: {
    marginLeft: Layout.spacing.s,
  },
});