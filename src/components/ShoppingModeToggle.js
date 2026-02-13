import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

const ShoppingModeToggle = ({ active, onToggle }) => {
  return (
    <TouchableOpacity
      style={[styles.button, active && styles.buttonActive]}
      onPress={onToggle}
    >
      <Ionicons
        name={active ? "basket" : "basket-outline"}
        size={16}
        color={active ? '#fff' : colors.primary}
      />
      <Text style={[styles.text, active && styles.textActive]}>
        {active ? 'מצב קנייה פעיל' : 'מצב קנייה'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  buttonActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  textActive: {
    color: '#fff',
  },
});

export default ShoppingModeToggle;
