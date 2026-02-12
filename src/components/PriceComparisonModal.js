import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { colors, spacing, radius } from '../theme';

const PriceComparisonModal = ({ visible, onClose, listId }) => {
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState(null);
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'bestmix'

  useEffect(() => {
    if (visible && listId) {
      fetchComparison();
      setActiveTab('stores');
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

  const hasBestMix = comparison?.bestMix && comparison.bestMix.storeCount > 1;

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

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>משווה מחירים ברשתות...</Text>
            </View>
          ) : comparison ? (
            <>
              {/* Tabs */}
              {hasBestMix && (
                <View style={styles.tabs}>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'stores' && styles.tabActive]}
                    onPress={() => setActiveTab('stores')}
                  >
                    <Ionicons name="storefront-outline" size={16} color={activeTab === 'stores' ? '#fff' : colors.primary} />
                    <Text style={[styles.tabText, activeTab === 'stores' && styles.tabTextActive]}>לפי חנות</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'bestmix' && styles.tabActive]}
                    onPress={() => setActiveTab('bestmix')}
                  >
                    <Ionicons name="flash-outline" size={16} color={activeTab === 'bestmix' ? '#fff' : colors.primary} />
                    <Text style={[styles.tabText, activeTab === 'bestmix' && styles.tabTextActive]}>מיקס חכם</Text>
                  </TouchableOpacity>
                </View>
              )}

              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Summary Card */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>{comparison.totalItems}</Text>
                      <Text style={styles.summaryLabel}>פריטים</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>{comparison.matchedItems || 0}</Text>
                      <Text style={styles.summaryLabel}>נמצאו</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>{comparison.chains?.length || 0}</Text>
                      <Text style={styles.summaryLabel}>רשתות</Text>
                    </View>
                  </View>

                  {comparison.savings > 0 && (
                    <View style={styles.savingsBadge}>
                      <Ionicons name="trending-down" size={16} color={colors.success} />
                      <Text style={styles.savingsText}>
                        חסכון של עד ₪{comparison.savings.toFixed(2)} בבחירת הרשת הזולה
                      </Text>
                    </View>
                  )}
                </View>

                {activeTab === 'stores' ? (
                  /* === BY STORE TAB === */
                  <>
                    {comparison.cheapest && (
                      <View style={styles.winnerCard}>
                        <View style={styles.winnerIcon}>
                          <Ionicons name="trophy" size={24} color="#f59e0b" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.winnerLabel}>הרשת הזולה ביותר</Text>
                          <Text style={styles.winnerName}>{comparison.cheapest.chain_name}</Text>
                        </View>
                        <Text style={styles.winnerPrice}>₪{comparison.cheapest.total?.toFixed(2)}</Text>
                      </View>
                    )}

                    {comparison.chains?.map((chain, index) => {
                      const isCheapest = index === 0 && comparison.chains.length > 1;
                      const diff = comparison.cheapest ? chain.total - comparison.cheapest.total : 0;

                      return (
                        <View key={chain.chain_id || index} style={[styles.chainCard, isCheapest && styles.chainCardCheapest]}>
                          <View style={styles.chainHeader}>
                            <View style={styles.chainNameRow}>
                              <Text style={styles.chainRank}>#{index + 1}</Text>
                              <Text style={styles.chainName}>{chain.chain_name}</Text>
                              {isCheapest && <Ionicons name="checkmark-circle" size={16} color={colors.success} />}
                            </View>
                            <View style={{ alignItems: 'flex-start' }}>
                              <Text style={[styles.chainTotal, isCheapest && styles.chainTotalCheapest]}>
                                ₪{chain.total.toFixed(2)}
                              </Text>
                              {diff > 0 && (
                                <Text style={styles.chainDiff}>+₪{diff.toFixed(2)}</Text>
                              )}
                            </View>
                          </View>

                          <View style={styles.chainMeta}>
                            <Text style={styles.chainMetaText}>
                              {chain.itemCount} פריטים זמינים
                            </Text>
                            {chain.missingCount > 0 && (
                              <Text style={styles.chainMissing}>
                                {chain.missingCount} חסרים
                              </Text>
                            )}
                          </View>

                          {chain.items?.length > 0 && (
                            <View style={styles.itemsList}>
                              {chain.items.map((item, idx) => (
                                <View key={idx} style={styles.itemRow}>
                                  <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.item_name}</Text>
                                    {item.quantity > 1 && <Text style={styles.itemQty}>x{item.quantity}</Text>}
                                  </View>
                                  <Text style={styles.itemPrice}>₪{item.price?.toFixed(2)}</Text>
                                </View>
                              ))}
                            </View>
                          )}

                          {chain.missing?.length > 0 && (
                            <View style={styles.missingSection}>
                              <Text style={styles.missingTitle}>חסרים ({chain.missing.length})</Text>
                              {chain.missing.map((name, idx) => (
                                <Text key={idx} style={styles.missingItem}>• {name}</Text>
                              ))}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </>
                ) : (
                  /* === BEST MIX TAB === */
                  <>
                    {comparison.bestMix && (
                      <>
                        <View style={styles.bestMixHeader}>
                          <View style={styles.bestMixIcon}>
                            <Ionicons name="flash" size={28} color="#fff" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.bestMixTitle}>מיקס חכם</Text>
                            <Text style={styles.bestMixSubtitle}>
                              קנה מ-{comparison.bestMix.storeCount} חנויות שונות לחיסכון מקסימלי
                            </Text>
                          </View>
                          <View style={{ alignItems: 'flex-start' }}>
                            <Text style={styles.bestMixTotal}>₪{comparison.bestMix.total.toFixed(2)}</Text>
                            {comparison.bestMixSavings > 0 && (
                              <Text style={styles.bestMixSaving}>חסכון ₪{comparison.bestMixSavings.toFixed(2)}</Text>
                            )}
                          </View>
                        </View>

                        {/* Group items by store */}
                        {comparison.bestMix.stores.map((storeName) => {
                          const storeItems = comparison.bestMix.items.filter((i) => i.store === storeName);
                          const storeTotal = storeItems.reduce((s, i) => s + i.subtotal, 0);

                          return (
                            <View key={storeName} style={styles.bestMixStore}>
                              <View style={styles.bestMixStoreHeader}>
                                <View style={styles.bestMixStoreNameRow}>
                                  <Ionicons name="storefront" size={16} color={colors.primary} />
                                  <Text style={styles.bestMixStoreName}>{storeName}</Text>
                                </View>
                                <Text style={styles.bestMixStoreTotal}>₪{storeTotal.toFixed(2)}</Text>
                              </View>
                              {storeItems.map((item, idx) => (
                                <View key={idx} style={styles.itemRow}>
                                  <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.item_name}</Text>
                                    {item.quantity > 1 && <Text style={styles.itemQty}>x{item.quantity}</Text>}
                                  </View>
                                  <Text style={styles.itemPrice}>₪{item.price?.toFixed(2)}</Text>
                                </View>
                              ))}
                            </View>
                          );
                        })}
                      </>
                    )}
                  </>
                )}

                {(!comparison.chains || comparison.chains.length === 0) && (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={48} color={colors.textMuted} style={{ opacity: 0.4 }} />
                    <Text style={styles.emptyText}>לא נמצאו מחירים לפריטים ברשימה</Text>
                    <Text style={styles.emptySubtext}>הוסף פריטים מחיפוש המוצרים או סרוק ברקוד</Text>
                  </View>
                )}

                {comparison.unmatchedItems > 0 && (
                  <View style={styles.unmatchedNote}>
                    <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.unmatchedText}>
                      {comparison.unmatchedItems} פריטים לא נמצאו בבסיס הנתונים
                    </Text>
                  </View>
                )}
              </ScrollView>
            </>
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
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '90%',
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
  loadingContainer: { padding: spacing.xxl, alignItems: 'center' },
  loadingText: { marginTop: spacing.md, color: colors.textMuted, fontSize: 14 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },

  // Tabs
  tabs: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  tabTextActive: { color: '#fff' },

  // Summary
  summaryCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
  },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '700', color: colors.primary },
  summaryLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  savingsBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    backgroundColor: colors.success + '15',
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  savingsText: { fontSize: 12, fontWeight: '600', color: colors.success },

  // Winner card
  winnerCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#fef3c7',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#f59e0b30',
  },
  winnerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerLabel: { fontSize: 11, color: colors.textMuted },
  winnerName: { fontSize: 16, fontWeight: '700' },
  winnerPrice: { fontSize: 20, fontWeight: '700', color: colors.success },

  // Chain card
  chainCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chainCardCheapest: {
    borderColor: colors.success,
    borderWidth: 2,
    backgroundColor: colors.success + '08',
  },
  chainHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chainNameRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chainRank: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    backgroundColor: colors.border,
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    lineHeight: 22,
  },
  chainName: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  chainTotal: { fontSize: 18, fontWeight: '700', color: colors.primary },
  chainTotalCheapest: { color: colors.success },
  chainDiff: { fontSize: 11, color: colors.danger, fontWeight: '600' },
  chainMeta: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  chainMetaText: { fontSize: 11, color: colors.textMuted },
  chainMissing: { fontSize: 11, color: colors.danger, fontWeight: '500' },

  // Items
  itemsList: { gap: 2 },
  itemRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  itemInfo: { flexDirection: 'row-reverse', gap: spacing.sm, alignItems: 'center', flex: 1 },
  itemName: { fontSize: 13, textAlign: 'right' },
  itemQty: {
    fontSize: 10,
    color: colors.textMuted,
    backgroundColor: colors.border,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  itemPrice: { fontSize: 13, fontWeight: '600' },

  // Missing
  missingSection: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.danger + '08',
    borderRadius: radius.sm,
  },
  missingTitle: { fontSize: 12, fontWeight: '600', color: colors.danger, textAlign: 'right', marginBottom: 4 },
  missingItem: { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginTop: 2 },

  // Best Mix
  bestMixHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary + '15',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  bestMixIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestMixTitle: { fontSize: 16, fontWeight: '700' },
  bestMixSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  bestMixTotal: { fontSize: 20, fontWeight: '700', color: colors.primary },
  bestMixSaving: { fontSize: 11, color: colors.success, fontWeight: '600' },

  bestMixStore: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bestMixStoreHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  bestMixStoreNameRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bestMixStoreName: { fontSize: 14, fontWeight: '700' },
  bestMixStoreTotal: { fontSize: 14, fontWeight: '700', color: colors.primary },

  // Empty
  emptyContainer: { padding: spacing.xxl, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
  emptySubtext: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },

  // Unmatched note
  unmatchedNote: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
  },
  unmatchedText: { fontSize: 11, color: colors.textMuted },
});

export default PriceComparisonModal;
