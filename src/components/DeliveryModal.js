import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  ActivityIndicator, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { copyDeliveryList } from '../utils/deliveryList';
import SwipeDownModal from './SwipeDownModal';
import { colors, spacing, radius } from '../theme';

const DELIVERY_PROVIDERS = [
  { id: 1, name: 'רמי לוי', url: 'https://www.rami-levy.co.il/he/online', icon: 'cart-outline' },
  { id: 2, name: 'שופרסל', url: 'https://www.shufersal.co.il/online/he/default', icon: 'storefront-outline' },
  { id: 3, name: 'יוחננוף', url: 'https://yochananof.co.il/', icon: 'basket-outline' },
  { id: 4, name: 'ויקטורי', url: 'https://www.victoryonline.co.il/', icon: 'bag-outline' },
  { id: 5, name: 'אושר עד', url: 'https://osherad.co.il/', icon: 'pricetag-outline' },
];

const DeliveryModal = ({ visible, onClose, listId, listName, items }) => {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible || !listId) return;
    fetchComparison();
  }, [visible, listId]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/lists/${listId}/compare`);
      setComparison(data);
    } catch (err) {
      console.error('Failed to fetch price comparison:', err);
      setComparison(null);
    } finally {
      setLoading(false);
    }
  };

  const getChainPrice = (providerName) => {
    if (!comparison?.chains) return null;
    const chain = comparison.chains.find(
      (c) => c.chain_name && providerName && c.chain_name.includes(providerName)
    );
    return chain ? chain.total : null;
  };

  const cheapestProvider = () => {
    if (!comparison?.cheapest) return null;
    return comparison.cheapest.chain_name;
  };

  const openProvider = async (provider) => {
    try {
      await Linking.openURL(provider.url);
    } catch (err) {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את האתר');
    }
  };

  const handleCopyAndOpen = async (provider) => {
    await copyDeliveryList(listName, items);
    openProvider(provider);
  };

  const uncheckedCount = items.filter((i) => !i.is_checked && !i.paid_by).length;

  const renderProvider = ({ item: provider }) => {
    const price = getChainPrice(provider.name);
    const isCheapest = cheapestProvider() && cheapestProvider().includes(provider.name);

    return (
      <View style={[styles.providerCard, isCheapest && styles.providerCardCheapest]}>
        <View style={styles.providerHeader}>
          <View style={styles.providerInfo}>
            <View style={[styles.providerIcon, isCheapest && { backgroundColor: colors.success + '15' }]}>
              <Ionicons name={provider.icon} size={22} color={isCheapest ? colors.success : colors.primary} />
            </View>
            <View>
              <Text style={styles.providerName}>{provider.name}</Text>
              {price != null && (
                <Text style={[styles.providerPrice, isCheapest && { color: colors.success }]}>
                  ₪{price.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
          {isCheapest && (
            <View style={styles.cheapestBadge}>
              <Ionicons name="flash" size={12} color={colors.success} />
              <Text style={styles.cheapestText}>הזול ביותר</Text>
            </View>
          )}
        </View>

        <View style={styles.providerActions}>
          <TouchableOpacity
            style={styles.copyBtn}
            onPress={() => copyDeliveryList(listName, items)}
          >
            <Ionicons name="copy-outline" size={16} color={colors.primary} />
            <Text style={styles.copyBtnText}>העתק רשימה</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.openBtn}
            onPress={() => handleCopyAndOpen(provider)}
          >
            <Ionicons name="open-outline" size={16} color="#fff" />
            <Text style={styles.openBtnText}>פתח אתר</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SwipeDownModal visible={visible} onClose={onClose}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>הזמנת משלוח</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Ionicons name="basket-outline" size={18} color={colors.primary} />
        <Text style={styles.summaryText}>
          {uncheckedCount} פריטים ברשימה "{listName}"
        </Text>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
        <Text style={styles.infoText}>
          העתק את הרשימה ופתח את אתר הרשת להזמנת משלוח. הרשימה תועתק ללוח אוטומטית.
        </Text>
      </View>

      {/* Provider list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>טוען מחירים...</Text>
        </View>
      ) : (
        <FlatList
          data={DELIVERY_PROVIDERS}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProvider}
          contentContainerStyle={{ paddingBottom: spacing.lg }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SwipeDownModal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
  summary: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  summaryText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
  },
  infoCard: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: spacing.xs,
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primary + '08',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  providerCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerCardCheapest: {
    borderColor: colors.success + '40',
    backgroundColor: colors.success + '05',
  },
  providerHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  providerInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
  },
  providerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
  },
  providerPrice: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 1,
  },
  cheapestBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.success + '15',
    borderRadius: radius.full,
  },
  cheapestText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.success,
  },
  providerActions: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  openBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  openBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});

export default DeliveryModal;
