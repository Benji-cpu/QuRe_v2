import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LogoPickerProps {
  logo: string | null;
  onLogoSelect: (logo: string | null) => void;
}

export default function LogoPicker({ logo, onLogoSelect }: LogoPickerProps) {
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
    Alert.alert(
      'Remove Logo',
      'Are you sure you want to remove the logo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => onLogoSelect(null), style: 'destructive' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Logo</Text>
      <View style={styles.logoSection}>
        {logo ? (
          <View style={styles.logoPreview}>
            <Image source={{ uri: logo }} style={styles.logoImage} />
            <TouchableOpacity style={styles.removeButton} onPress={removeLogo}>
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addLogoButton} onPress={pickImage}>
            <Text style={styles.addLogoIcon}>+</Text>
            <Text style={styles.addLogoText}>Add Logo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f44336',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  addLogoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  addLogoIcon: {
    fontSize: 24,
    color: '#999',
  },
  addLogoText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});