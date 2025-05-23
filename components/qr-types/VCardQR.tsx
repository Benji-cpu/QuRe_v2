import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Layout from '../../constants/Layout';
import { VCardQRInput, createVCardQR } from '../../services/qrGenerators/vCardQR';
import { QRCodeType, VCardQRCode } from '../../types/qr-code';
import { isValidEmail } from '../../utils/validators';
import { Button } from '../Button';
import { FormField } from '../FormField';
import { Input } from '../Input';

interface VCardQRProps {
  initialData?: Partial<VCardQRCode>;
  onSave: (qrCode: VCardQRCode) => void;
  onCancel: () => void;
}

export const VCardQR: React.FC<VCardQRProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
  const [mobileNumber, setMobileNumber] = useState(initialData?.mobileNumber || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [website, setWebsite] = useState(initialData?.website || '');
  const [company, setCompany] = useState(initialData?.company || '');
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || '');
  const [fax, setFax] = useState(initialData?.fax || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [postCode, setPostCode] = useState(initialData?.postCode || '');
  const [country, setCountry] = useState(initialData?.country || '');
  const [label, setLabel] = useState(initialData?.label || '');
  
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    mobileNumber?: string;
    email?: string;
    website?: string;
    label?: string;
  }>({});

  useEffect(() => {
    if (firstName && lastName && !label) {
      setLabel(`${firstName} ${lastName}`);
    }
  }, [firstName, lastName]);

  const validate = (): boolean => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      mobileNumber?: string;
      email?: string;
      website?: string;
      label?: string;
    } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (email && !isValidEmail(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const vCardQRInput: VCardQRInput = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      mobileNumber: mobileNumber.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      company: company.trim() || undefined,
      jobTitle: jobTitle.trim() || undefined,
      fax: fax.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      postCode: postCode.trim() || undefined,
      country: country.trim() || undefined,
      label: label.trim() || undefined,
    };

    const vCardQRCode = initialData
      ? {
          ...initialData,
          ...vCardQRInput,
          type: QRCodeType.VCARD,
          updatedAt: Date.now(),
        } as VCardQRCode
      : createVCardQR(vCardQRInput);

    onSave(vCardQRCode);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}
      >
        <View style={styles.section}>
          <FormField
            label="First Name"
            error={errors.firstName}
          >
            <Input
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
            />
          </FormField>

          <FormField
            label="Last Name"
            error={errors.lastName}
          >
            <Input
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
            />
          </FormField>
        </View>

        <View style={styles.section}>
          <FormField
            label="Phone Number"
            optional
            error={errors.phoneNumber}
          >
            <Input
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />
          </FormField>

          <FormField
            label="Mobile Number"
            optional
            error={errors.mobileNumber}
          >
            <Input
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Mobile number"
              keyboardType="phone-pad"
            />
          </FormField>

          <FormField
            label="Email"
            optional
            error={errors.email}
          >
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </FormField>

          <FormField
            label="Website"
            optional
            error={errors.website}
          >
            <Input
              value={website}
              onChangeText={setWebsite}
              placeholder="Website URL"
              keyboardType="url"
              autoCapitalize="none"
            />
          </FormField>
        </View>

        <View style={styles.section}>
          <FormField
            label="Company"
            optional
          >
            <Input
              value={company}
              onChangeText={setCompany}
              placeholder="Company name"
            />
          </FormField>

          <FormField
            label="Job Title"
            optional
          >
            <Input
              value={jobTitle}
              onChangeText={setJobTitle}
              placeholder="Job title"
            />
          </FormField>

          <FormField
            label="Fax"
            optional
          >
            <Input
              value={fax}
              onChangeText={setFax}
              placeholder="Fax number"
              keyboardType="phone-pad"
            />
          </FormField>
        </View>

        <View style={styles.section}>
          <FormField
            label="Address"
            optional
          >
            <Input
              value={address}
              onChangeText={setAddress}
              placeholder="Street address"
            />
          </FormField>

          <FormField
            label="City"
            optional
          >
            <Input
              value={city}
              onChangeText={setCity}
              placeholder="City"
            />
          </FormField>

          <FormField
            label="Post Code"
            optional
          >
            <Input
              value={postCode}
              onChangeText={setPostCode}
              placeholder="Post code / ZIP"
            />
          </FormField>

          <FormField
            label="Country"
            optional
          >
            <Input
              value={country}
              onChangeText={setCountry}
              placeholder="Country"
            />
          </FormField>
        </View>

        <FormField
          label="QR Code Label"
          optional
          error={errors.label}
        >
          <Input
            value={label}
            onChangeText={setLabel}
            placeholder="Enter a label for this QR code"
          />
        </FormField>

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={onCancel}
            variant="outline"
            style={styles.button}
          />
          <Button
            title="Save"
            onPress={handleSave}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollContainer: {
    maxHeight: 500,
  },
  section: {
    marginBottom: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: Layout.spacing.m,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Layout.spacing.l,
    marginBottom: Layout.spacing.xl,
  },
  button: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
});