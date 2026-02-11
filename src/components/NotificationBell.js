import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import socket from '../socket';
import { colors, spacing, radius } from '../theme';

const NotificationBell = () => {
  const [requests, setRequests] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const { data } = await api.get('/api/kid-requests/pending');
        setRequests(data.requests);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPending();

    const onNewRequest = (req) => {
      setRequests((prev) => [req, ...prev]);
    };
    socket.on('new_kid_request', onNewRequest);
    return () => socket.off('new_kid_request', onNewRequest);
  }, []);

  const handleResolve = async (requestId, action) => {
    try {
      await api.post(`/api/kid-requests/${requestId}/resolve`, { action });
      setRequests((prev) => prev.filter((r) => r.id !== requestId && r.requestId !== requestId));
    } catch (err) {
      console.error(err);
    }
  };

  const count = requests.length;

  return (
    <View>
      <TouchableOpacity onPress={() => setOpen(true)} style={styles.bellBtn}>
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.panel} onStartShouldSetResponder={() => true}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>בקשות ממתינות</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {requests.length === 0 ? (
              <Text style={styles.emptyText}>אין בקשות ממתינות</Text>
            ) : (
              <FlatList
                data={requests}
                keyExtractor={(item) => String(item.id || item.requestId)}
                renderItem={({ item }) => {
                  const id = item.id || item.requestId;
                  const childName = item.child_first_name || item.childName;
                  const listName = item.list_name || item.listName;
                  const itemName = item.item_name || item.itemName;
                  const qty = item.quantity;
                  return (
                    <View style={styles.requestItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.requestText}>
                          <Text style={{ fontWeight: '700' }}>{childName}</Text> רוצה להוסיף{' '}
                          <Text style={{ fontWeight: '700' }}>{itemName}</Text>
                          {qty > 1 ? ` (x${qty})` : ''} לרשימה{' '}
                          <Text style={{ fontWeight: '700' }}>{listName}</Text>
                        </Text>
                      </View>
                      <View style={styles.requestActions}>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: colors.success + '15' }]}
                          onPress={() => handleResolve(id, 'approve')}
                        >
                          <Ionicons name="checkmark" size={18} color={colors.success} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: colors.danger + '15' }]}
                          onPress={() => handleResolve(id, 'reject')}
                        >
                          <Ionicons name="close" size={18} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  bellBtn: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: colors.danger, borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  panel: { backgroundColor: colors.surface, borderRadius: radius.lg, maxHeight: '70%' },
  panelHeader: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  panelTitle: { fontSize: 16, fontWeight: '700', textAlign: 'right' },
  emptyText: { textAlign: 'center', color: colors.textMuted, padding: spacing.xl, fontSize: 14 },
  requestItem: {
    flexDirection: 'row-reverse', alignItems: 'center', padding: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  requestText: { fontSize: 13, textAlign: 'right', lineHeight: 20 },
  requestActions: { flexDirection: 'row', gap: 6, marginStart: spacing.sm },
  actionBtn: { padding: 6, borderRadius: radius.sm },
});

export default NotificationBell;
