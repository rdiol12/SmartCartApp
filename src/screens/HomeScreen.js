import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { colors, spacing, radius } from '../theme';

export default function HomeScreen({ navigation }) {
  const { user, isLinkedChild } = useContext(AuthContext);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const { data } = await api.get('/api/lists');
        setLists(data.lists.slice(0, 6));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>שלום, {user?.first_name} 👋</Text>
      <Text style={styles.subtitle}>
        {isLinkedChild ? 'בחר רשימה כדי לבקש מוצרים' : 'מה קונים היום?'}
      </Text>

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
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'right', marginBottom: spacing.xl },
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
