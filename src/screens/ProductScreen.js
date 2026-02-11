import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

export default function ProductScreen({ route, navigation }) {
  const raw = route.params?.product;
  const [quantity, setQuantity] = useState(1);

  const product = {
    name: raw?.item_name || 'מוצר לא נמצא',
    price: raw?.price || '—',
    description: raw?.description || 'אין תיאור זמין',
    chain_name: raw?.chain_name || 'לא ידוע',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Product image placeholder */}
      <View style={styles.imagePlaceholder}>
        <Ionicons name="cube-outline" size={64} color={colors.textMuted} style={{ opacity: 0.4 }} />
      </View>

      {/* Info card */}
      <View style={styles.card}>
        <View style={styles.chainBadge}>
          <Text style={styles.chainText}>{product.chain_name}</Text>
        </View>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>₪{product.price}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>תיאור</Text>
        <Text style={styles.description}>{product.description}</Text>

        {/* Quantity */}
        <View style={styles.qtyRow}>
          <Text style={styles.qtyLabel}>כמות:</Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Ionicons name="remove" size={18} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
              <Ionicons name="add" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => Alert.alert('נוסף', `נוספו ${quantity} פריטים`)}
        >
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.addBtnText}> הוסף לעגלה</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg },
  imagePlaceholder: {
    height: 220, backgroundColor: colors.surface, borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl,
    borderWidth: 1, borderColor: colors.border,
  },
  chainBadge: {
    alignSelf: 'flex-end', backgroundColor: colors.border,
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full, marginBottom: spacing.sm,
  },
  chainText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  name: { fontSize: 20, fontWeight: '700', textAlign: 'right', marginBottom: spacing.sm },
  price: { fontSize: 28, fontWeight: '700', color: colors.primary, textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  sectionTitle: { fontSize: 15, fontWeight: '700', textAlign: 'right', marginBottom: spacing.sm },
  description: { fontSize: 14, color: colors.textMuted, textAlign: 'right', lineHeight: 22 },
  qtyRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, marginTop: spacing.xl },
  qtyLabel: { fontSize: 14, fontWeight: '600' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyBtn: {
    width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  qtyValue: { fontSize: 16, fontWeight: '700', minWidth: 30, textAlign: 'center' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md + 2, marginTop: spacing.xl,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
