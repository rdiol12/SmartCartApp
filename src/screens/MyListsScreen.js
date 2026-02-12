import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import socket from '../socket';
import { colors, spacing, radius } from '../theme';
import { updateBadgeCount } from '../utils/badgeCount';

export default function MyListsScreen({ navigation }) {
  const { user, isLinkedChild } = useContext(AuthContext);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);

  // Kid request history
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('lists');

  const fetchLists = async () => {
    try {
      const { data } = await api.get('/api/lists');
      setLists(data.lists);
      
      // Update badge count with total unchecked items
      const totalUnchecked = data.lists.reduce((sum, list) => sum + (list.item_count || 0), 0);
      updateBadgeCount(totalUnchecked);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLists();
    if (isLinkedChild) fetchRequests();
  };

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/api/kid-requests/my');
      setRequests(data.requests);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchLists();
    if (isLinkedChild) fetchRequests();
  }, [isLinkedChild]));

  useEffect(() => {
    if (!isLinkedChild) return;
    const onResolved = (data) => {
      setRequests((prev) =>
        prev.map((r) => (r.id === data.requestId ? { ...r, status: data.status } : r))
      );
    };
    socket.on('request_resolved', onResolved);
    return () => socket.off('request_resolved', onResolved);
  }, [isLinkedChild]);

  const handleCreate = () => {
    if (!newListName.trim()) return;
    setCreating(true);
    socket.emit('create_list', { list_name: newListName.trim(), userId: user.id }, (res) => {
      setCreating(false);
      if (res.success) {
        setShowCreate(false);
        setNewListName('');
        navigation.navigate('ListDetail', { listId: res.listId, listName: newListName.trim() });
      } else {
        Alert.alert('שגיאה', res.msg || 'שגיאה ביצירת הרשימה');
      }
    });
  };

  const statusLabel = (s) => ({ pending: 'ממתין', approved: 'אושר', rejected: 'נדחה' }[s] || s);
  const statusColor = (s) => ({ pending: colors.textMuted, approved: colors.success, rejected: colors.danger }[s] || colors.textMuted);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isLinkedChild ? 'הרשימות של ההורים' : 'הרשימות שלי'}</Text>
        {!isLinkedChild && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>חדשה</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs for children */}
      {isLinkedChild && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'lists' && styles.tabActive]}
            onPress={() => setActiveTab('lists')}
          >
            <Text style={[styles.tabText, activeTab === 'lists' && styles.tabTextActive]}>רשימות</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>הבקשות שלי</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'lists' && (
        loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : (
          <FlatList
            data={lists}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
            }
            ListEmptyComponent={
              <Text style={styles.empty}>{isLinkedChild ? 'ההורים עוד לא יצרו רשימות' : 'אין רשימות עדיין'}</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listCard}
                onPress={() => navigation.navigate('ListDetail', { listId: item.id, listName: item.list_name })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.listName}>{item.list_name}</Text>
                  <Text style={styles.listMeta}>{item.item_count} פריטים · {item.member_count} חברים</Text>
                </View>
                {!isLinkedChild && (
                  <View style={[styles.badge, item.role === 'admin' ? styles.badgePrimary : styles.badgeMuted]}>
                    <Text style={[styles.badgeText, item.role === 'admin' ? styles.badgeTextPrimary : styles.badgeTextMuted]}>
                      {item.role === 'admin' ? 'מנהל' : 'חבר'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        )
      )}

      {activeTab === 'requests' && isLinkedChild && (
        <FlatList
          data={requests}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={<Text style={styles.empty}>אין בקשות עדיין</Text>}
          renderItem={({ item}) => (
            <View style={[styles.requestCard, { borderRightColor: statusColor(item.status), borderRightWidth: 3 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.requestName}>{item.item_name}{item.quantity > 1 ? ` x${item.quantity}` : ''}</Text>
                <Text style={styles.requestMeta}>{item.list_name}{item.price ? ` | ₪${item.price}` : ''}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
              </View>
            </View>
          )}
        />
      )}

      {/* Create list modal */}
      <Modal visible={showCreate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>יצירת רשימה חדשה</Text>
            <TextInput
              style={styles.input}
              placeholder="שם הרשימה"
              value={newListName}
              onChangeText={setNewListName}
              textAlign="right"
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreate(false)}>
                <Text style={styles.cancelText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, creating && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={creating}
              >
                <Text style={styles.createText}>{creating ? 'יוצר...' : 'צור'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'right' },
  addBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: 4 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tabs: { flexDirection: 'row-reverse', gap: spacing.sm, marginBottom: spacing.lg },
  tab: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.text },
  tabTextActive: { color: '#fff' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xxl },
  listCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg,
    flexDirection: 'row-reverse', alignItems: 'center', marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  listName: { fontSize: 15, fontWeight: '600', textAlign: 'right' },
  listMeta: { fontSize: 12, color: colors.textMuted, textAlign: 'right', marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgePrimary: { backgroundColor: colors.primary + '15' },
  badgeMuted: { backgroundColor: colors.border },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextPrimary: { color: colors.primary },
  badgeTextMuted: { color: colors.textMuted },
  requestCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg,
    flexDirection: 'row-reverse', alignItems: 'center', marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  requestName: { fontSize: 15, fontWeight: '600', textAlign: 'right' },
  requestMeta: { fontSize: 12, color: colors.textMuted, textAlign: 'right', marginTop: 2 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  statusText: { fontSize: 11, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  modal: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'right', marginBottom: spacing.lg },
  input: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: 15, marginBottom: spacing.lg },
  modalBtns: { flexDirection: 'row-reverse', gap: spacing.md },
  cancelBtn: { flex: 1, padding: spacing.md, alignItems: 'center', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  cancelText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  createBtn: { flex: 1, padding: spacing.md, alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.primary },
  createText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
