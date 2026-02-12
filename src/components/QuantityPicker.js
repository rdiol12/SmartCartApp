import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme';

const QuantityPicker = ({ value, onChange, min = 1, max = 99 }) => {
  const handleDecrease = () => {
    if (value > min) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(value + 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleDecrease}
        disabled={value <= min}
        style={[styles.button, value <= min && styles.buttonDisabled]}
      >
        <Ionicons name="remove" size={18} color={value <= min ? colors.textMuted : colors.primary} />
      </TouchableOpacity>
      
      <Text style={styles.value}>{value}</Text>
      
      <TouchableOpacity
        onPress={handleIncrease}
        disabled={value >= max}
        style={[styles.button, value >= max && styles.buttonDisabled]}
      >
        <Ionicons name="add" size={18} color={value >= max ? colors.textMuted : colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    minWidth: 30,
    textAlign: 'center',
  },
});

export default QuantityPicker;
