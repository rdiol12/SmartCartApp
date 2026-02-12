import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { colors, spacing, radius } from '../theme';

export default function StoreScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/api/search', {
          params: { q: searchQuery.trim() },
        });
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timerRef.current);
  }, [searchQuery]);

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('Product', { product: item })}
    >
      <View style={styles.productImg}>
        <Ionicons name="cube-outline" size={32} color={colors.textMuted} />
      </View>
      <View style={styles.productBody}>
        <Text style={styles.productName} numberOfLines={2}>{item.item_name || 'מוצר'}</Text>
        <Text style={styles.productChain}>{item.chain_name || ''}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price ? `₪${Number(item.price).toFixed(2)}` : '—'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>חנות</Text>
      <Text style={styles.subtitle}>חפש והשווה מחירים בין רשתות</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="חפש מוצר..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          textAlign="right"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Loading */}
      {loading && (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
      )}

      {/* Products */}
      {!loading && searchQuery.trim().length < 2 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={colors.textMuted} style={{ opacity: 0.4 }} />
          <Text style={styles.emptyTitle}>חפש מוצר</Text>
          <Text style={styles.emptySubtitle}>הקלד לפחות 2 תווים כדי לחפש</Text>
        </View>
      ) : !loading && products.length === 0 && searchQuery.trim().length >= 2 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={48} color={colors.textMuted} style={{ opacity: 0.4 }} />
          <Text style={styles.emptyTitle}>לא נמצאו מוצרים</Text>
          <Text style={styles.emptySubtitle}>נסה מילת חיפוש אחרת</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) => `${item.item_id || index}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          renderItem={renderProduct}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'right' },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'right', marginBottom: spacing.md },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchIcon: { marginLeft: spacing.xs },
  searchInput: {
    flex: 1,
    padding: spacing.sm,
    fontSize: 15,
  },
  clearBtn: { padding: 4 },
  row: { justifyContent: 'space-between' },
  productCard: {
    width: '48%', backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, overflow: 'hidden',
  },
  productImg: {
    height: 100, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center',
  },
  productBody: { padding: spacing.sm },
  productName: { fontSize: 13, fontWeight: '600', textAlign: 'right', lineHeight: 18 },
  productChain: { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginTop: 2 },
  priceRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  price: { fontSize: 15, fontWeight: '700', color: colors.primary },
  emptyContainer: { alignItems: 'center', marginTop: spacing.xxl },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: spacing.md },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});
