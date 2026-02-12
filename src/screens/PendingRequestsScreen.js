import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import api from '../api';
import socket from '../socket';
import { colors, spacing, radius } from '../theme';

export default function PendingRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/api/kid-requests/pending');
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    const onNewRequest = (request) => {
      setRequests(prev => [request, ...prev]);
    };

    socket.on('new_kid_request', onNewRequest);

    return () => {
      socket.off('new_kid_request', onNewRequest);
    };
  }, []);

  const handleResolve = async (requestId, action) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await api.post(`/api/kid-requests/${requestId}/resolve`, { action });
      
      setRequests(prev => prev.filter(r => r.id !== requestId));
      
      Alert.alert(
        'הצלחה',
        action === 'approve' ? 'הבקשה אושרה והפריט נוסף לרשימה' : 'הבקשה נדחתה'
      );
    } catch (err) {
      Alert.alert('שגיאה', err.response?.data?.message || 'שגיאה בעיבוד הבקשה');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>בקשות ממתינות</Text>
        <Text style={styles.subtitle}>{requests.length} בקשות</Text>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={64} color={colors.textMuted} style={{ opacity: 0.3 }} />
            <Text style={styles.emptyTitle}>אין בקשות ממתינות</Text>
            <Text style={styles.emptySubtitle}>כל הבקשות מילדים טופלו</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.requestItemName}>
                  {item.item_name}
                  {item.quantity > 1 && <Text style={styles.quantity}> x{item.quantity}</Text>}
                </Text>
                <Text style={styles.requestMeta}>
                  <Ionicons name="person-outline" size={12} color={colors.textMuted} /> {item.child_name}
                  {' · '}
                  <Ionicons name="list-outline" size={12} color={colors.textMuted} /> {item.list_name}
                </Text>
                {item.price && (
                  <Text style={styles.price}>₪{Number(item.price).toFixed(2)}</Text>
                )}
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleResolve(item.id, 'reject')}
              >
                <Ionicons name="close-circle" size={20} color={colors.danger} />
                <Text style={[styles.actionText, { color: colors.danger }]}>דחה</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => handleResolve(item.id, 'approve')}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.actionText, { color: colors.success }]}>אשר</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRightWidth: 4,
    borderRightColor: colors.warning,
  },
  requestHeader: {
    flexDirection: 'row-reverse',
    marginBottom: spacing.sm,
  },
  requestItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  quantity: {
    fontSize: 14,
    color: colors.textMuted,
  },
  requestMeta: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  approveBtn: {
    backgroundColor: colors.success + '15',
    borderColor: colors.success + '30',
  },
  rejectBtn: {
    backgroundColor: colors.danger + '10',
    borderColor: colors.danger + '20',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
