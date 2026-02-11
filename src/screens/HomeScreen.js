import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { colors, spacing, radius } from '../theme';

export default function HomeScreen({ navigation }) {
  const { user, isLinkedChild } = useContext(AuthContext);
  const [lists, setLists] = useState([]);
  const [stats, setStats] = useState({ totalLists: 0, totalItems: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/api/lists');
        const allLists = data.lists || [];
        setLists(allLists.slice(0, 6));

        // Calculate stats
        const totalLists = allLists.length;
        const totalItems = allLists.reduce((sum, list) => sum + (list.item_count || 0), 0);
        const completedItems = allLists.reduce((sum, list) => sum + (list.completed_count || 0), 0);
        const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        setStats({ totalLists, totalItems, completionRate });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>שלום, {user?.first_name} 👋</Text>
      <Text style={styles.subtitle}>
        {isLinkedChild ? 'בחר רשימה כדי לבקש מוצרים' : 'מה קונים היום?'}
      </Text>

      {/* Stats Cards */}
      {!isLinkedChild && !loading && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="list-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalLists}</Text>
            <Text style={styles.statLabel}>רשימות</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="basket-outline" size={24} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>פריטים</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#f59e0b15' }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>{stats.completionRate}%</Text>
            <Text style={styles.statLabel}>הושלמו</Text>
          </View>
        </View>
      )}

      {/* Quick actions */}
      {!isLinkedChild && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('ListsTab', { screen: 'MyLists' })}
          >
            <Ionicons name="list" size={24} color={colors.primary} />
            <Text style={styles.actionText}>הרשימות שלי</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('StoreTab')}
          >
            <Ionicons name="storefront" size={24} color={colors.success} />
            <Text style={styles.actionText}>חנות</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>רשימות אחרונות</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : lists.length === 0 ? (
        <Text style={styles.empty}>אין רשימות עדיין</Text>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listCard}
              onPress={() => navigation.navigate('ListsTab', { screen: 'ListDetail', params: { listId: item.id, listName: item.list_name } })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.listName}>{item.list_name}</Text>
                <Text style={styles.listMeta}>
                  {item.item_count} פריטים · {item.member_count} חברים
                </Text>
              </View>
              <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  greeting: { fontSize: 22, fontWeight: '700', textAlign: 'right', marginTop: spacing.md },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'right', marginBottom: spacing.md },
  statsContainer: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actions: { flexDirection: 'row-reverse', gap: spacing.md, marginBottom: spacing.xl },
  actionCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, alignItems: 'center', gap: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  actionText: { fontSize: 13, fontWeight: '600', color: colors.text },
  sectionTitle: { fontSize: 16, fontWeight: '700', textAlign: 'right', marginBottom: spacing.md },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  listCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg,
    flexDirection: 'row-reverse', alignItems: 'center', marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  listName: { fontSize: 15, fontWeight: '600', textAlign: 'right' },
  listMeta: { fontSize: 12, color: colors.textMuted, textAlign: 'right', marginTop: 2 },
});
