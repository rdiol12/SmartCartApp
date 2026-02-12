import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import socket from '../socket';
import ListItemRow from '../components/ListItemRow';
import ProductSearch from '../components/ProductSearch';
import InviteLinkModal from '../components/InviteLinkModal';
import ListStats from '../components/ListStats';
import ListControls from '../components/ListControls';
import ShoppingModeToggle from '../components/ShoppingModeToggle';
import QuantityPicker from '../components/QuantityPicker';
import RecentItems from '../components/RecentItems';
import VoiceInput from '../components/VoiceInput';
import MultiSelectBar from '../components/MultiSelectBar';
import TemplatesModal from '../components/TemplatesModal';
import { addToRecent } from '../utils/recentItems';
import PriceComparisonModal from '../components/PriceComparisonModal';
import ChildAccessModal from '../components/ChildAccessModal';
import SaveAsTemplateModal from '../components/SaveAsTemplateModal';
import BarcodeScanner from '../components/BarcodeScanner';
import { colors, spacing, radius } from '../theme';
import { shareList, copyToClipboard } from '../utils/exportList';

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
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [showChildAccess, setShowChildAccess] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shoppingMode, setShoppingMode] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

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
    setItemName(product.name || product.item_name || product.product_name || '');
    if (product.price) setItemPrice(String(product.price));
    setShowSearch(false);
  };

  const handleBarcodeScanned = (product) => {
    setItemName(product.name || product.item_name || product.product_name || '');
    if (product.price) setItemPrice(String(product.price));
    setShowScanner(false);
  };

  const handleSelectRecent = (item) => {
    setItemName(item.itemname);
    setItemQty(String(item.quantity));
    setItemPrice(String(item.price || ''));
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleMultiSelectDelete = () => {
    selectedItems.forEach(itemId => {
      socket.emit('delete_item', { itemId, listId });
    });
    setSelectedItems([]);
    setMultiSelectMode(false);
  };

  const handleMultiSelectCheck = () => {
    selectedItems.forEach(itemId => {
      socket.emit('toggle_item', { itemId, listId, isChecked: true });
    });
    setSelectedItems([]);
    setMultiSelectMode(false);
  };

  const handleMultiSelectUncheck = () => {
    selectedItems.forEach(itemId => {
      socket.emit('toggle_item', { itemId, listId, isChecked: false });
    });
    setSelectedItems([]);
    setMultiSelectMode(false);
  };

  const handleDeleteList = () => {
    Alert.alert(
      'מחיקת רשימה',
      'האם אתה בטוח שברצונך למחוק רשימה זו? פעולה זו אינה הפיכה.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/lists/${listId}`);
              Alert.alert('הצלחה', 'הרשימה נמחקה');
              navigation.goBack();
            } catch (err) {
              Alert.alert('שגיאה', err.response?.data?.message || 'שגיאה במחיקת הרשימה');
            }
          },
        },
      ]
    );
  };

  const handleLeaveList = () => {
    Alert.alert(
      'עזיבת רשימה',
      'האם אתה בטוח שברצונך לעזוב רשימה זו?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'עזוב',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/api/lists/${listId}/leave`);
              Alert.alert('הצלחה', 'עזבת את הרשימה');
              navigation.goBack();
            } catch (err) {
              Alert.alert('שגיאה', err.response?.data?.message || 'שגיאה בעזיבת הרשימה');
            }
          },
        },
      ]
    );
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

  // Filter and sort items
  let displayItems = items;

  // Apply search filter
  if (searchQuery.trim()) {
    displayItems = displayItems.filter(item =>
      item.itemname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply status filter
  if (filter === 'checked') {
    displayItems = displayItems.filter(item => item.is_checked || item.paid_by);
  } else if (filter === 'unchecked') {
    displayItems = displayItems.filter(item => !item.is_checked && !item.paid_by);
  }

  // In shopping mode, automatically hide checked items
  if (shoppingMode) {
    displayItems = displayItems.filter(item => !item.is_checked && !item.paid_by);
  }

  // Apply sorting
  if (sortBy === 'name') {
    displayItems = [...displayItems].sort((a, b) => a.itemname.localeCompare(b.itemname, 'he'));
  } else if (sortBy === 'price') {
    displayItems = [...displayItems].sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
  } else if (sortBy === 'checked') {
    displayItems = [...displayItems].sort((a, b) => ((b.is_checked || b.paid_by) ? 1 : 0) - ((a.is_checked || a.paid_by) ? 1 : 0));
  } else if (sortBy === 'unchecked') {
    displayItems = [...displayItems].sort((a, b) => ((a.is_checked || a.paid_by) ? 1 : 0) - ((b.is_checked || b.paid_by) ? 1 : 0));
  }

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
            <TouchableOpacity style={styles.headerBtn} onPress={() => shareList(listName, items)}>
              <Ionicons name="share-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => setShowPriceComparison(true)}>
              <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => setShowTemplates(true)}>
              <Ionicons name="albums-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
            {userRole === 'admin' && (
              <>
                <TouchableOpacity style={styles.headerBtn} onPress={() => setShowChildAccess(true)}>
                  <Ionicons name="people-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn} onPress={() => setShowInvite(true)}>
                  <Ionicons name="person-add-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn} onPress={handleDeleteList}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </>
            )}
            {userRole === 'member' && (
              <TouchableOpacity style={styles.headerBtn} onPress={handleLeaveList}>
                <Ionicons name="exit-outline" size={18} color={colors.warning} />
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

      {/* List Stats */}
      <View style={{ paddingHorizontal: spacing.md }}>
        <ListStats items={items} />
      </View>

      {/* Recent Items */}
      <RecentItems onSelect={handleSelectRecent} />

      {/* Multi-Select Bar */}
      {multiSelectMode && (
        <MultiSelectBar
          selectedCount={selectedItems.length}
          onCancel={() => {
            setMultiSelectMode(false);
            setSelectedItems([]);
          }}
          onDelete={handleMultiSelectDelete}
          onCheck={handleMultiSelectCheck}
          onUncheck={handleMultiSelectUncheck}
        />
      )}

      {/* Shopping Mode & List Controls */}
      {items.length > 0 && !multiSelectMode && (
        <>
          <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs, flexDirection: 'row-reverse', gap: spacing.xs }}>
            <ShoppingModeToggle active={shoppingMode} onToggle={() => setShoppingMode(!shoppingMode)} />
            <TouchableOpacity
              style={styles.multiSelectBtn}
              onPress={() => setMultiSelectMode(true)}
            >
              <Ionicons name="checkmark-done-outline" size={16} color={colors.primary} />
              <Text style={styles.multiSelectText}>בחירה מרובה</Text>
            </TouchableOpacity>
          </View>
          {!shoppingMode && (
            <ListControls
              onSortChange={setSortBy}
              onFilterChange={setFilter}
              onSearchChange={setSearchQuery}
            />
          )}
        </>
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
          <View style={{ width: 90 }}>
            <QuantityPicker
              value={parseInt(itemQty) || 1}
              onChange={(val) => setItemQty(String(val))}
            />
          </View>
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
          <VoiceInput onResult={(text) => setItemName(text)} />
          <TouchableOpacity style={styles.searchBtn} onPress={() => setShowSearch(!showSearch)}>
            <Ionicons name="search-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchBtn} onPress={() => setShowScanner(true)}>
            <Ionicons name="barcode-outline" size={20} color={colors.primary} />
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
          data={displayItems}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          ListEmptyComponent={
            searchQuery || filter !== 'all' ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={colors.textMuted} style={{ opacity: 0.4 }} />
                <Text style={styles.emptyTitle}>לא נמצאו פריטים</Text>
                <Text style={styles.emptySubtitle}>נסה חיפוש או סינון אחר</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ListItemRow
              item={item}
              listId={listId}
              shoppingMode={shoppingMode}
              multiSelectMode={multiSelectMode}
              isSelected={selectedItems.includes(item.id)}
              onSelect={toggleItemSelection}
            />
          )}
        />
      )}

      {/* Modals */}
      <InviteLinkModal visible={showInvite} onClose={() => setShowInvite(false)} listId={listId} />
      <PriceComparisonModal
        visible={showPriceComparison}
        onClose={() => setShowPriceComparison(false)}
        listId={listId}
      />
      <ChildAccessModal
        visible={showChildAccess}
        onClose={() => setShowChildAccess(false)}
        listId={listId}
      />
      <SaveAsTemplateModal
        visible={showSaveTemplate}
        onClose={() => setShowSaveTemplate(false)}
        listId={listId}
        listName={listName}
      />
      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onProductFound={handleBarcodeScanned}
      />
      <TemplatesModal
        visible={showTemplates}
        onClose={() => setShowTemplates(false)}
        currentItems={items}
        onLoadTemplate={(templateItems) => {
          templateItems.forEach(item => {
            socket.emit('send_item', {
              listId: parseInt(listId),
              itemName: item.itemname,
              price: item.price || null,
              quantity: item.quantity || 1,
              addby: user.id,
              addat: new Date(),
              updatedat: new Date(),
            });
          });
        }}
      />
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
  multiSelectBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  multiSelectText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
