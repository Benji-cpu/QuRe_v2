import React, { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';
import Layout from '../constants/Layout';

interface FormFieldProps {
  label: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
  containerStyle?: ViewStyle;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  optional = false,
  error,
  children,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {optional && <Text style={styles.optional}>(Optional)</Text>}
      </View>
      {children}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.m,
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  optional: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.inactive,
    marginLeft: Layout.spacing.xs,
  },
  error: {
    fontSize: 12,
    color: Colors.error,
    marginTop: Layout.spacing.xs,
  },
});