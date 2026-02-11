import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { colors, spacing, radius } from '../theme';

export default function StoreScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 12;
  const offsetRef = useRef(0);

  useEffect(() => {
    api.get('/api/categories')
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offsetRef.current;
    if (!reset) setLoadingMore(true);
    try {
      const params = { limit, offset: currentOffset };
      if (selectedCategory) params.category = selectedCategory;
      if (sortBy) params.sort = sortBy;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const { data } = await api.get('/api/store', { params });
      const newProducts = Array.isArray(data.products) ? data.products : [];

      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }
      offsetRef.current = data.nextOffset || currentOffset + newProducts.length;
      setHasMore(data.hasMore ?? false);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, sortBy, searchQuery]);

  useEffect(() => {
    setLoading(true);
    offsetRef.current = 0;
    fetchProducts(true);
  }, [selectedCategory, sortBy, searchQuery]);

  const handleEndReached = () => {
    if (hasMore && !loadingMore) fetchProducts();
  };

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
          <Text style={styles.price}>₪{item.price ?? '—'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>טוען מוצרים...</Text>
      </View>
    );
  }

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

      {/* Filters */}
      {categories.length > 0 && (
        <FlatList
          data={[{ value: '', label: 'הכל' }, ...categories.map((c) => ({ value: c, label: c }))]}
          keyExtractor={(item) => item.value}
          horizontal
          inverted
          showsHorizontalScrollIndicator={false}
          style={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedCategory === item.value && styles.filterChipActive]}
              onPress={() => setSelectedCategory(item.value)}
            >
              <Text style={[styles.filterText, selectedCategory === item.value && styles.filterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Products */}
      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={48} color={colors.textMuted} style={{ opacity: 0.4 }} />
          <Text style={styles.emptyTitle}>לא נמצאו מוצרים</Text>
          <Text style={styles.emptySubtitle}>נסה לשנות את הפילטרים</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) => `${item.item_id || index}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          renderItem={renderProduct}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
            ) : !hasMore && products.length > 0 ? (
              <Text style={styles.endText}>הגעת לסוף הרשימה</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  loadingText: { color: colors.textMuted, marginTop: spacing.md },
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
  filterList: { maxHeight: 40, marginBottom: spacing.md },
  filterChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginHorizontal: 3,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: colors.text },
  filterTextActive: { color: '#fff' },
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
  endText: { textAlign: 'center', color: colors.textMuted, fontSize: 13, paddingVertical: spacing.lg },
});
