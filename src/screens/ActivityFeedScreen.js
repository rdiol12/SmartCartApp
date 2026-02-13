import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import ActivityTimeline from '../components/ActivityTimeline';
import { colors, spacing, radius } from '../theme';

const ACTION_FILTERS = [
  { key: null, label: 'הכל', icon: 'apps-outline' },
  { key: 'item_added', label: 'הוספה', icon: 'add-circle-outline' },
  { key: 'item_deleted', label: 'מחיקה', icon: 'trash-outline' },
  { key: 'item_toggled', label: 'סימון', icon: 'checkbox-outline' },
  { key: 'item_paid', label: 'תשלום', icon: 'cash-outline' },
];

const DATE_FILTERS = [
  { key: null, label: 'הכל' },
  { key: 'today', label: 'היום' },
  { key: 'week', label: 'השבוע' },
  { key: 'month', label: 'החודש' },
];

const getDateFrom = (key) => {
  if (!key) return null;
  const now = new Date();
  if (key === 'today') {
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }
  if (key === 'week') {
    now.setDate(now.getDate() - 7);
    return now.toISOString();
  }
  if (key === 'month') {
    now.setMonth(now.getMonth() - 1);
    return now.toISOString();
  }
  return null;
};

export default function ActivityFeedScreen() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionFilter, setActionFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 50;

  const fetchActivities = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    try {
      const params = { limit: LIMIT, offset: currentOffset };
      if (actionFilter) params.action = actionFilter;
      const dateFrom = getDateFrom(dateFilter);
      if (dateFrom) params.from = dateFrom;

      const { data } = await api.get('/api/activity/feed', { params });
      const fetched = data.activities || [];

      if (reset) {
        setActivities(fetched);
        setOffset(fetched.length);
      } else {
        setActivities((prev) => [...prev, ...fetched]);
        setOffset((prev) => prev + fetched.length);
      }
      setHasMore(fetched.length === LIMIT);
    } catch (err) {
      console.error('Failed to fetch activity feed:', err);
      if (reset) setActivities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [actionFilter, dateFilter, offset]);

  useEffect(() => {
    setLoading(true);
    setOffset(0);
    fetchActivities(true);
  }, [actionFilter, dateFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    setOffset(0);
    fetchActivities(true);
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    fetchActivities(false);
  };

  return (
    <View style={styles.container}>
      {/* Action filter chips */}
      <ScrollView
        horizontal
        inverted
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {ACTION_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key || 'all'}
            style={[styles.chip, actionFilter === f.key && styles.chipActive]}
            onPress={() => setActionFilter(f.key)}
          >
            <Ionicons
              name={f.icon}
              size={14}
              color={actionFilter === f.key ? '#fff' : colors.primary}
            />
            <Text style={[styles.chipText, actionFilter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Date filter chips */}
      <ScrollView
        horizontal
        inverted
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.dateFilterScroll}
      >
        {DATE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key || 'all-date'}
            style={[styles.dateChip, dateFilter === f.key && styles.dateChipActive]}
            onPress={() => setDateFilter(f.key)}
          >
            <Text style={[styles.dateChipText, dateFilter === f.key && styles.dateChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Timeline */}
      <View style={styles.timelineContainer}>
        <ActivityTimeline
          activities={activities}
          loading={loading}
          showListName={true}
          emptyText="אין פעילות עדיין"
          onEndReached={loadMore}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  filterScroll: {
    flexGrow: 0,
    paddingTop: spacing.md,
  },
  filterRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  chipTextActive: {
    color: '#fff',
  },
  dateFilterScroll: {
    flexGrow: 0,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  dateChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  dateChipTextActive: {
    color: '#fff',
  },
  timelineContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
