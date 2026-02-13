import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme';

const ReorderControls = ({ onMoveUp, onMoveDown, isFirst, isLast }) => {
  const handleUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMoveUp();
  };

  const handleDown = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMoveDown();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleUp}
        disabled={isFirst}
        style={[styles.btn, isFirst && styles.btnDisabled]}
      >
        <Ionicons name="chevron-up" size={18} color={isFirst ? colors.textMuted : colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleDown}
        disabled={isLast}
        style={[styles.btn, isLast && styles.btnDisabled]}
      >
        <Ionicons name="chevron-down" size={18} color={isLast ? colors.textMuted : colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  btn: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
});

export default ReorderControls;
