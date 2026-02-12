import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

const ListStats = ({ items }) => {
  const total = items.length;
  const checked = items.filter(i => i.is_checked).length;
  const unchecked = total - checked;
  const progress = total > 0 ? (checked / total) * 100 : 0;
  
  const totalPrice = items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const qty = parseFloat(item.quantity) || 1;
    return sum + (price * qty);
  }, 0);

  if (total === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{total}</Text>
          <Text style={styles.statLabel}>פריטים</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.success }]}>{checked}</Text>
          <Text style={styles.statLabel}>הושלמו</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.warning }]}>{unchecked}</Text>
          <Text style={styles.statLabel}>נותרו</Text>
        </View>
        {totalPrice > 0 && (
          <View style={styles.stat}>
            <Text style={[styles.statValue, { fontSize: 16 }]}>₪{totalPrice.toFixed(2)}</Text>
            <Text style={styles.statLabel}>סה"כ</Text>
          </View>
        )}
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: radius.full,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    minWidth: 35,
    textAlign: 'left',
  },
});

export default ListStats;
