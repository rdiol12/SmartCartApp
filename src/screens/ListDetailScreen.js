import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import socket from '../socket';
import ListItemRow from '../components/ListItemRow';
import ProductSearch from '../components/ProductSearch';
import InviteLinkModal from '../components/InviteLinkModal';
import { colors, spacing, radius } from '../theme';

export default function ListDetailScreen({ route, navigation }) {
  const { listId, listName } = route.params;
  const { user, isLinkedChild } = useContext(AuthContext);

  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [userRole, setUserRole] = useState('member');
  const [loading, setLoading] = useState(true);

  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemPrice, setItemPrice] = useState('');

  const [showSearch, setShowSearch] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/api/lists/${listId}/items`);
        setList(data.list);
        setItems(data.items);
        setMembers(data.members);
        setUserRole(data.userRole);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403) navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    socket.emit('join_list', listId);

    const onReceiveItem = (newItem) => {
      setItems((prev) => [newItem, ...prev]);
    };
    const onItemStatusChanged = ({ itemId, isChecked }) => {
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, is_checked: isChecked } : i)));
    };
    const onItemDeleted = ({ itemId }) => {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    };
    const onNoteUpdated = ({ itemId, note }) => {
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, note } : i)));
    };
    const onItemPaid = ({ itemId, paid_by, paid_by_name, paid_at }) => {
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, paid_by, paid_by_name, paid_at } : i)));
    };
    const onItemUnpaid = ({ itemId }) => {
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, paid_by: null, paid_by_name: null, paid_at: null } : i)));
    };

    socket.on('receive_item', onReceiveItem);
    socket.on('item_status_changed', onItemStatusChanged);
    socket.on('item_deleted', onItemDeleted);
    socket.on('note_updated', onNoteUpdated);
    socket.on('item_paid', onItemPaid);
    socket.on('item_unpaid', onItemUnpaid);

    return () => {
      socket.off('receive_item', onReceiveItem);
      socket.off('item_status_changed', onItemStatusChanged);
      socket.off('item_deleted', onItemDeleted);
      socket.off('note_updated', onNoteUpdated);
      socket.off('item_paid', onItemPaid);
      socket.off('item_unpaid', onItemUnpaid);
    };
  }, [listId]);

  const handleAddItem = () => {
    if (!itemName.trim()) return;

    if (isLinkedChild) {
      api.post('/api/kid-requests', {
        listId: parseInt(listId),
        itemName: itemName.trim(),
        price: itemPrice || null,
        quantity: parseInt(itemQty) || 1,
      })
        .then(() => {
          setRequestMsg('הבקשה נשלחה לאישור ההורה');
          setTimeout(() => setRequestMsg(''), 3000);
        })
        .catch(() => {
          setRequestMsg('שגיאה בשליחת הבקשה');
          setTimeout(() => setRequestMsg(''), 3000);
        });
    } else {
      socket.emit('send_item', {
        listId: parseInt(listId),
        itemName: itemName.trim(),
        price: itemPrice || null,
        quantity: parseInt(itemQty) || 1,
        addby: user.id,
        addat: new Date(),
        updatedat: new Date(),
      });
    }

    setItemName('');
    setItemQty('1');
    setItemPrice('');
    setShowSearch(false);
  };

  const handleSearchSelect = (product) => {
    setItemName(product.item_name || product.name || '');
    if (product.price) setItemPrice(String(product.price));
    setShowSearch(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const checkedCount = items.filter((i) => i.is_checked || i.paid_by).length;
  const progress = items.length > 0 ? (checkedCount / items.length) * 100 : 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{list?.list_name || listName}</Text>
          <Text style={styles.membersText}>
            {members.map((m) => m.first_name).join(', ')}
          </Text>
        </View>
        {!isLinkedChild && (
          <View style={styles.headerActions}>
            {userRole === 'admin' && (
              <TouchableOpacity style={styles.headerBtn} onPress={() => setShowInvite(true)}>
                <Ionicons name="person-add-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Progress bar */}
      {items.length > 0 && (
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>{checkedCount} מתוך {items.length} הושלמו</Text>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      )}

      {/* Add Item Form */}
      <View style={styles.addForm}>
        <View style={styles.addRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="שם מוצר..."
            value={itemName}
            onChangeText={setItemName}
            textAlign="right"
            returnKeyType="done"
            onSubmitEditing={handleAddItem}
          />
          <TextInput
            style={[styles.input, { width: 60 }]}
            placeholder="כמות"
            value={itemQty}
            onChangeText={setItemQty}
            keyboardType="numeric"
            textAlign="center"
          />
          <TextInput
            style={[styles.input, { width: 75 }]}
            placeholder="מחיר"
            value={itemPrice}
            onChangeText={setItemPrice}
            keyboardType="decimal-pad"
            textAlign="center"
          />
        </View>
        <View style={styles.addActions}>
          <TouchableOpacity
            style={[styles.addBtn, isLinkedChild && styles.addBtnGhost]}
            onPress={handleAddItem}
          >
            <Text style={[styles.addBtnText, isLinkedChild && { color: colors.primary }]}>
              {isLinkedChild ? 'בקש' : 'הוסף'}
            </Text>
            <Ionicons
              name={isLinkedChild ? 'send-outline' : 'add'}
              size={18}
              color={isLinkedChild ? colors.primary : '#fff'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchBtn} onPress={() => setShowSearch(!showSearch)}>
            <Ionicons name="search-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {requestMsg ? (
          <Text style={styles.requestMsg}>{requestMsg}</Text>
        ) : null}
        {showSearch && (
          <View style={{ marginTop: spacing.sm }}>
            <ProductSearch onSelect={handleSearchSelect} />
          </View>
        )}
      </View>

      {/* Items List */}
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={48} color={colors.textMuted} style={{ opacity: 0.4 }} />
          <Text style={styles.emptyTitle}>הרשימה ריקה</Text>
          <Text style={styles.emptySubtitle}>הוסף פריטים למעלה כדי להתחיל</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          renderItem={({ item }) => (
            <ListItemRow item={item} listId={listId} />
          )}
        />
      )}

      {/* Invite modal */}
      <InviteLinkModal visible={showInvite} onClose={() => setShowInvite(false)} listId={listId} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'right' },
  membersText: { fontSize: 12, color: colors.textMuted, textAlign: 'right', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  headerBtn: { padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.primary + '10' },
  progressSection: { marginBottom: spacing.md },
  progressLabels: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 4 },
  progressText: { fontSize: 11, color: colors.textMuted },
  progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  addForm: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  addRow: { flexDirection: 'row-reverse', gap: spacing.xs },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, fontSize: 14,
  },
  addActions: { flexDirection: 'row-reverse', gap: spacing.sm, marginTop: spacing.sm },
  addBtn: {
    flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center',
    gap: 4, backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: spacing.sm,
  },
  addBtnGhost: { backgroundColor: colors.primary + '10' },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  searchBtn: { padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.primary + '10' },
  requestMsg: { fontSize: 13, color: colors.primary, fontWeight: '500', marginTop: spacing.sm, textAlign: 'right' },
  emptyContainer: { alignItems: 'center', marginTop: spacing.xxl },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: spacing.md },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});
