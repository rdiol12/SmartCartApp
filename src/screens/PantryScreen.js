import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';
import { colors, spacing, radius } from '../theme';

export default function PantryScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [itemName, setItemName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('1');

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/api/pantry');
      setItems(data.items || []);
    } catch (err) {
      console.error('Error fetching pantry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!itemName.trim()) return Alert.alert('שגיאה', 'נא להזין שם פריט');
    if (!expiryDate.trim()) return Alert.alert('שגיאה', 'נא להזין תאריך תפוגה (YYYY-MM-DD)');

    try {
      await api.post('/api/pantry', {
        itemName: itemName.trim(),
        expiryDate: expiryDate.trim(),
        quantity: parseInt(quantity) || 1,
      });
      setItemName('');
      setExpiryDate('');
      setQuantity('1');
      setShowAdd(false);
      fetchItems();
    } catch (err) {
      Alert.alert('שגיאה', 'שגיאה בהוספת פריט');
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert('מחיקה', `למחוק את "${name}"?`, [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/pantry/${id}`);
            setItems(prev => prev.filter(i => i.id !== id));
          } catch (err) {
            Alert.alert('שגיאה', 'שגיאה במחיקה');
          }
        },
      },
    ]);
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  };

  const getExpiryColor = (days) => {
    if (days < 0) return colors.danger;
    if (days <= 2) return colors.warning;
    if (days <= 7) return '#f59e0b';
    return colors.success;
  };

  const getExpiryLabel = (days) => {
    if (days < 0) return `פג תוקף לפני ${Math.abs(days)} ימים`;
    if (days === 0) return 'פג תוקף היום!';
    if (days === 1) return 'פג תוקף מחר';
    return `${days} ימים`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>המזווה שלי</Text>
        <Text style={styles.subtitle}>מעקב תוקף מוצרים</Text>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: colors.danger + '30' }]}>
          <Text style={[styles.summaryNum, { color: colors.danger }]}>
            {items.filter(i => getDaysUntilExpiry(i.expiry_date) < 0).length}
          </Text>
          <Text style={styles.summaryLabel}>פג תוקף</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: colors.warning + '30' }]}>
          <Text style={[styles.summaryNum, { color: colors.warning }]}>
            {items.filter(i => {
              const d = getDaysUntilExpiry(i.expiry_date);
              return d >= 0 && d <= 3;
            }).length}
          </Text>
          <Text style={styles.summaryLabel}>עומד לפוג</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: colors.success + '30' }]}>
          <Text style={[styles.summaryNum, { color: colors.success }]}>
            {items.filter(i => getDaysUntilExpiry(i.expiry_date) > 3).length}
          </Text>
          <Text style={styles.summaryLabel}>תקין</Text>
        </View>
      </View>

      {/* Items list */}
      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 0 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="nutrition-outline" size={48} color={colors.textMuted} style={{ opacity: 0.4 }} />
            <Text style={styles.emptyTitle}>המזווה ריקה</Text>
            <Text style={styles.emptySubtitle}>הוסף מוצרים כדי לעקוב אחרי תאריכי תפוגה</Text>
          </View>
        }
        renderItem={({ item }) => {
          const daysLeft = getDaysUntilExpiry(item.expiry_date);
          const expiryColor = getExpiryColor(daysLeft);

          return (
            <View style={[styles.itemCard, { borderLeftColor: expiryColor, borderLeftWidth: 4 }]}>
              <View style={styles.itemContent}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.item_name}</Text>
                  <View style={styles.itemMeta}>
                    <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                    <Text style={styles.itemDate}>
                      {new Date(item.expiry_date).toLocaleDateString('he-IL')}
                    </Text>
                    {item.quantity > 1 && (
                      <Text style={styles.itemQty}>x{item.quantity}</Text>
                    )}
                  </View>
                </View>
                <View style={[styles.expiryBadge, { backgroundColor: expiryColor + '15' }]}>
                  <Ionicons
                    name={daysLeft < 0 ? 'alert-circle' : daysLeft <= 2 ? 'warning' : 'time-outline'}
                    size={14}
                    color={expiryColor}
                  />
                  <Text style={[styles.expiryText, { color: expiryColor }]}>
                    {getExpiryLabel(daysLeft)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.item_name)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAdd} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAdd(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>הוסף למזווה</Text>

            <Text style={styles.label}>שם המוצר</Text>
            <TextInput
              style={styles.input}
              value={itemName}
              onChangeText={setItemName}
              placeholder="לדוגמה: חלב תנובה 3%"
              textAlign="right"
            />

            <Text style={styles.label}>תאריך תפוגה</Text>
            <TextInput
              style={styles.input}
              value={expiryDate}
              onChangeText={setExpiryDate}
              placeholder="YYYY-MM-DD"
              textAlign="center"
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.label}>כמות</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              textAlign="center"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveBtnText}>הוסף</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },

  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'right' },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'right' },

  summaryRow: {
    flexDirection: 'row-reverse', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center', borderWidth: 1,
  },
  summaryNum: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  itemCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  itemContent: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', textAlign: 'right' },
  itemMeta: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginTop: 4 },
  itemDate: { fontSize: 11, color: colors.textMuted },
  itemQty: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },

  expiryBadge: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full,
  },
  expiryText: { fontSize: 11, fontWeight: '600' },
  deleteBtn: { padding: spacing.xs },

  emptyContainer: { alignItems: 'center', marginTop: spacing.xxl },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: spacing.md },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4, textAlign: 'center' },

  fab: {
    position: 'absolute', bottom: spacing.xl, left: spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', textAlign: 'right', marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, fontSize: 14,
  },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md,
    alignItems: 'center', marginTop: spacing.lg,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
