import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import socket from '../socket';
import { colors, spacing, radius } from '../theme';

export default function ProductScreen({ route, navigation }) {
  const raw = route.params?.product;
  const { user } = useContext(AuthContext);
  const [quantity, setQuantity] = useState(1);
  const [showListPicker, setShowListPicker] = useState(false);
  const [lists, setLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);

  const product = {
    name: raw?.item_name || 'מוצר לא נמצא',
    price: raw?.price || '—',
    description: raw?.description || 'אין תיאור זמין',
    chain_name: raw?.chain_name || 'לא ידוע',
  };

  const fetchLists = async () => {
    setLoadingLists(true);
    try {
      const { data } = await api.get('/api/lists');
      setLists(data.lists || []);
    } catch (err) {
      console.error(err);
      Alert.alert('שגיאה', 'לא ניתן לטעון את הרשימות');
    } finally {
      setLoadingLists(false);
    }
  };

  const handleAddToList = (list) => {
    socket.emit('send_item', {
      listId: parseInt(list.id),
      itemName: product.name,
      price: raw?.price || null,
      quantity,
      addby: user.id,
      addat: new Date(),
      updatedat: new Date(),
      productId: raw?.item_id || raw?.id || null,
    });
    setShowListPicker(false);
    Alert.alert('נוסף בהצלחה', `${product.name} (x${quantity}) נוסף לרשימה "${list.list_name}"`);
  };

  const handleOpenListPicker = () => {
    fetchLists();
    setShowListPicker(true);
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
          onPress={handleOpenListPicker}
        >
          <Ionicons name="list-outline" size={20} color="#fff" />
          <Text style={styles.addBtnText}> הוסף לרשימה</Text>
        </TouchableOpacity>
      </View>

      {/* List Picker Modal */}
      <Modal visible={showListPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>בחר רשימה</Text>
              <TouchableOpacity onPress={() => setShowListPicker(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            {loadingLists ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} />
            ) : lists.length === 0 ? (
              <Text style={styles.emptyText}>אין רשימות זמינות</Text>
            ) : (
              <FlatList
                data={lists}
                keyExtractor={(item) => String(item.id)}
                style={styles.listPickerList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listPickerItem}
                    onPress={() => handleAddToList(item)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listPickerName}>{item.list_name}</Text>
                      <Text style={styles.listPickerMeta}>{item.item_count} פריטים</Text>
                    </View>
                    <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  modal: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, maxHeight: '70%' },
  modalHeader: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'right' },
  emptyText: { textAlign: 'center', color: colors.textMuted, marginVertical: spacing.xl, fontSize: 14 },
  listPickerList: { maxHeight: 300 },
  listPickerItem: {
    flexDirection: 'row-reverse', alignItems: 'center', padding: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  listPickerName: { fontSize: 15, fontWeight: '600', textAlign: 'right' },
  listPickerMeta: { fontSize: 12, color: colors.textMuted, textAlign: 'right', marginTop: 2 },
});
