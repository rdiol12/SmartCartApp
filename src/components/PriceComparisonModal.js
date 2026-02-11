import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { colors, spacing, radius } from '../theme';

const PriceComparisonModal = ({ visible, onClose, listId }) => {
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    if (visible && listId) {
      fetchComparison();
    }
  }, [visible, listId]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/lists/${listId}/compare`);
      setComparison(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>השוואת מחירים</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>משווה מחירים...</Text>
            </View>
          ) : comparison ? (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>סיכום</Text>
                <Text style={styles.summaryText}>
                  {comparison.chains?.length || 0} רשתות נמצאו
                </Text>
                {comparison.cheapest && (
                  <View style={styles.cheapestBadge}>
                    <Ionicons name="trophy" size={16} color={colors.success} />
                    <Text style={styles.cheapestText}>
                      הזול ביותר: {comparison.cheapest.name} - ₪
                      {comparison.cheapest.total?.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Chain Comparison */}
              {comparison.chains?.map((chain, index) => (
                <View key={chain.chain_id || index} style={styles.chainCard}>
                  <View style={styles.chainHeader}>
                    <Text style={styles.chainName}>{chain.chain_name}</Text>
                    <Text style={styles.chainTotal}>
                      ₪{chain.total?.toFixed(2) || '0.00'}
                    </Text>
                  </View>

                  {/* Available Items */}
                  {chain.items?.length > 0 && (
                    <View style={styles.itemsList}>
                      {chain.items.map((item, idx) => (
                        <View key={idx} style={styles.itemRow}>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.item_name}</Text>
                            <Text style={styles.itemQty}>x{item.quantity}</Text>
                          </View>
                          <Text style={styles.itemPrice}>
                            ₪{item.price?.toFixed(2)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Missing Items */}
                  {chain.missing?.length > 0 && (
                    <View style={styles.missingSection}>
                      <Text style={styles.missingTitle}>
                        חסרים ({chain.missing.length})
                      </Text>
                      {chain.missing.map((item, idx) => (
                        <Text key={idx} style={styles.missingItem}>
                          • {item}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}

              {(!comparison.chains || comparison.chains.length === 0) && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                  <Text style={styles.emptyText}>
                    לא נמצאו מחירים לפריטים ברשימה
                  </Text>
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>שגיאה בטעינת ההשוואה</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'right' },
  closeBtn: { padding: 4 },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: 14,
  },
  content: { padding: spacing.lg },
  summaryCard: {
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  summaryText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
  },
  cheapestBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    backgroundColor: colors.success + '15',
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  cheapestText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
  },
  chainCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chainHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chainName: { fontSize: 16, fontWeight: '700', textAlign: 'right' },
  chainTotal: { fontSize: 18, fontWeight: '700', color: colors.primary },
  itemsList: { gap: spacing.xs },
  itemRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  itemInfo: { flexDirection: 'row-reverse', gap: spacing.sm, alignItems: 'center' },
  itemName: { fontSize: 13, textAlign: 'right' },
  itemQty: {
    fontSize: 11,
    color: colors.textMuted,
    backgroundColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  itemPrice: { fontSize: 13, fontWeight: '600' },
  missingSection: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.danger + '05',
    borderRadius: radius.sm,
  },
  missingTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger,
    textAlign: 'right',
    marginBottom: 4,
  },
  missingItem: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
  emptyContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default PriceComparisonModal;
