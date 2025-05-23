import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useContext, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { QRCodeCard } from '../../components/QRCodeCard';
import { Colors } from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { PremiumContext } from '../../context/PremiumContext';
import { QRCodeContext } from '../../context/QRCodeContext';

export default function HomeScreen() {
  const { 
    primaryQRCode,
    secondaryQRCode,
    updateSlot,
    resetCreation,
    loading,
    refreshHistory 
  } = useContext(QRCodeContext);
  
  const { isPremium, checkFeatureAccess } = useContext(PremiumContext);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const handleCreateQR = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetCreation();
    router.push('/modal/create-qr');
  };

  const handleEditQR = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/modal/create-qr',
      params: { id }
    });
  };

  const handleSelectFromHistory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/history');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your QR Codes</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateQR}
        >
          <Feather name="plus" size={20} color="white" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.slotsContainer}>
        <View style={styles.slotColumn}>
          <Text style={styles.slotLabel}>Primary QR Code</Text>
          <View style={styles.slotWrapper}>
            {primaryQRCode ? (
              <QRCodeCard
                qrCode={primaryQRCode}
                size="large"
                onEdit={() => handleEditQR(primaryQRCode.id)}
              />
            ) : (
              <QRCodeCard
                qrCode={null}
                size="large"
                onPress={handleSelectFromHistory}
              />
            )}
          </View>
        </View>

        <View style={styles.slotColumn}>
          <Text style={styles.slotLabel}>Secondary QR Code</Text>
          <View style={styles.slotWrapper}>
            {isPremium ? (
              secondaryQRCode ? (
                <QRCodeCard
                  qrCode={secondaryQRCode}
                  size="large"
                  onEdit={() => handleEditQR(secondaryQRCode.id)}
                />
              ) : (
                <QRCodeCard
                  qrCode={null}
                  size="large"
                  onPress={handleSelectFromHistory}
                />
              )
            ) : (
              <View style={styles.premiumSlot}>
                <View style={styles.premiumBadge}>
                  <Feather name="star" size={32} color={Colors.secondary} />
                </View>
                <Text style={styles.premiumText}>Premium Feature</Text>
                <Text style={styles.premiumDescription}>
                  Upgrade to customize the secondary QR code slot
                </Text>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => router.push('/settings')}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent QR Codes</Text>
          <TouchableOpacity onPress={() => router.push('/history')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {/* Recent QR codes will be implemented in the next iteration */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Layout.spacing.l,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.l,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: Layout.spacing.xs,
  },
  slotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xl,
  },
  slotColumn: {
    flex: 1,
    alignItems: 'center',
  },
  slotLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.s,
    textAlign: 'center',
  },
  slotWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  premiumSlot: {
    width: Layout.qrCode.cardSize + 20,
    height: Layout.qrCode.cardSize + 60,
    backgroundColor: '#F8F9FA',
    borderRadius: Layout.borderRadius.large,
    borderWidth: 2,
    borderColor: Colors.inactive,
    borderStyle: 'dashed',
    padding: Layout.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    width: 60,
    height: 60,
    marginBottom: Layout.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  premiumText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: Layout.spacing.xs,
  },
  premiumDescription: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.m,
  },
  upgradeButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  recentSection: {
    marginBottom: Layout.spacing.l,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.m,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  viewAllText: {
    color: Colors.primary,
    fontWeight: '500',
  },
});