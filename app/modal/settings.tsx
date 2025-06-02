import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GRADIENT_PRESETS } from '../../constants/Gradients';
import { UserPreferencesService } from '../../services/UserPreferences';

export default function SettingsModal() {
  const [selectedGradientId, setSelectedGradientId] = useState('sunset');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const preferences = await UserPreferencesService.getPreferences();
      const premium = await UserPreferencesService.isPremium();
      setSelectedGradientId(preferences.selectedGradientId);
      setIsPremium(premium);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleGradientSelect = async (gradientId: string) => {
    try {
      setSelectedGradientId(gradientId);
      await UserPreferencesService.updateGradient(gradientId);
    } catch (error) {
      Alert.alert('Error', 'Failed to update gradient');
    }
  };

  const handlePremiumToggle = async () => {
    try {
      const newStatus = !isPremium;
      await UserPreferencesService.setPremium(newStatus);
      setIsPremium(newStatus);
      Alert.alert('Success', `Premium status ${newStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update premium status');
    }
  };

  const handleUpgrade = () => {
    router.push('/modal/premium');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Background Gradients</Text>
        
        <View style={styles.gradientsGrid}>
          {GRADIENT_PRESETS.map((gradient) => (
            <TouchableOpacity
              key={gradient.id}
              style={[
                styles.gradientOption,
                selectedGradientId === gradient.id && styles.selectedGradient
              ]}
              onPress={() => handleGradientSelect(gradient.id)}
            >
              <LinearGradient
                colors={gradient.colors}
                start={gradient.start}
                end={gradient.end}
                style={styles.gradientPreview}
              />
              <Text style={styles.gradientName}>{gradient.name}</Text>
              {selectedGradientId === gradient.id && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Plan Status</Text>
        
        <View style={styles.planContainer}>
          <View style={styles.planInfo}>
            <Text style={styles.planTitle}>
              {isPremium ? 'Premium Plan' : 'Free Plan'}
            </Text>
            <Text style={styles.planDescription}>
              {isPremium 
                ? 'You have access to all features including secondary QR codes and custom backgrounds.'
                : 'Upgrade to Premium for unlimited QR codes and advanced customization options.'
              }
            </Text>
          </View>
          
          {!isPremium ? (
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PREMIUM ACTIVE</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Developer Options</Text>
        
        <TouchableOpacity style={styles.devOption} onPress={handlePremiumToggle}>
          <Text style={styles.devOptionText}>
            {isPremium ? 'Disable Premium (Test)' : 'Enable Premium (Test)'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 20,
  },
  gradientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  gradientOption: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedGradient: {
    borderColor: '#2196f3',
  },
  gradientPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientName: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  planContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  planInfo: {
    marginBottom: 15,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  premiumBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumBadgeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  devOption: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  devOptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});