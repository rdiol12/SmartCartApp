import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

const MultiSelectBar = ({ selectedCount, onCancel, onDelete, onCheck, onUncheck }) => {
  if (selectedCount === 0) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
        <Ionicons name="close" size={20} color={colors.text} />
      </TouchableOpacity>
      
      <Text style={styles.count}>{selectedCount} נבחרו</Text>
      
      <View style={styles.actions}>
        <TouchableOpacity onPress={onCheck} style={styles.actionBtn}>
          <Ionicons name="checkmark-circle-outline" size={22} color={colors.success} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onUncheck} style={styles.actionBtn}>
          <Ionicons name="close-circle-outline" size={22} color={colors.warning} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + '30',
  },
  cancelBtn: {
    padding: spacing.xs,
  },
  count: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  actionBtn: {
    padding: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.sm,
  },
});

export default MultiSelectBar;
