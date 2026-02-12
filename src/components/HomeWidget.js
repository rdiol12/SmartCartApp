import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { colors, spacing, radius } from '../theme';

const HomeWidget = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [topList, setTopList] = useState(null);
  const [uncheckedCount, setUncheckedCount] = useState(0);
  const [topItems, setTopItems] = useState([]);

  useEffect(() => {
    fetchTopList();
  }, []);

  const fetchTopList = async () => {
    try {
      const { data } = await api.get('/api/lists');
      const lists = data.lists || [];
      if (lists.length === 0) return;

      // Get the most recently updated list
      const latest = lists[0];
      setTopList(latest);

      const itemsRes = await api.get(`/api/lists/${latest.id}/items`);
      const items = itemsRes.data.items || [];
      const unchecked = items.filter(i => !i.is_checked && !i.paid_by);
      setUncheckedCount(unchecked.length);
      setTopItems(unchecked.slice(0, 5));
    } catch (err) {
      // silently fail
    }
  };

  if (!topList) return null;

  return (
    <View style={styles.widget}>
      <View style={styles.widgetHeader}>
        <View style={styles.widgetTitleRow}>
          <Ionicons name="list" size={18} color={colors.primary} />
          <Text style={styles.widgetTitle}>{topList.list_name}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{uncheckedCount} נותרו</Text>
        </View>
      </View>

      {topItems.length > 0 ? (
        topItems.map((item, idx) => (
          <View key={item.id || idx} style={styles.itemRow}>
            <Ionicons name="square-outline" size={16} color={colors.textMuted} />
            <Text style={styles.itemName} numberOfLines={1}>{item.itemname}</Text>
            {item.quantity > 1 && (
              <Text style={styles.itemQty}>x{item.quantity}</Text>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>כל הפריטים הושלמו!</Text>
      )}

      {uncheckedCount > 5 && (
        <Text style={styles.moreText}>+{uncheckedCount - 5} פריטים נוספים</Text>
      )}

      <TouchableOpacity
        style={styles.goBtn}
        onPress={() => navigation?.navigate('ListsTab', {
          screen: 'ListDetail',
          params: { listId: topList.id, listName: topList.list_name },
        })}
      >
        <Text style={styles.goBtnText}>פתח רשימה</Text>
        <Ionicons name="arrow-back" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  widget: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  widgetHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  widgetTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
  },
  widgetTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    textAlign: 'right',
  },
  itemQty: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: spacing.md,
  },
  moreText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  goBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: radius.md,
  },
  goBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default HomeWidget;
