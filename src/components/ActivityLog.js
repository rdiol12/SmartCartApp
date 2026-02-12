import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { colors, spacing, radius } from '../theme';

const ACTION_CONFIG = {
  add: {
    label: 'הוסיף פריט',
    icon: 'add-circle-outline',
    color: colors.primary,
  },
  delete: {
    label: 'מחק פריט',
    icon: 'trash-outline',
    color: colors.danger,
  },
  check: {
    label: 'סימן פריט',
    icon: 'checkbox-outline',
    color: colors.success,
  },
  pay: {
    label: 'שילם',
    icon: 'cash-outline',
    color: colors.warning,
  },
};

const getRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'הרגע';
  if (minutes < 60) return `לפני ${minutes} דקות`;
  if (hours < 24) return `לפני ${hours} שעות`;
  if (days === 1) return 'אתמול';
  if (days < 7) return `לפני ${days} ימים`;
  return new Date(timestamp).toLocaleDateString('he-IL', {
    month: 'short',
    day: 'numeric',
  });
};

const ActivityLog = ({ visible, onClose, listId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible || !listId) return;

    const fetchActivity = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/lists/${listId}/activity`);
        setActivities(data.activities || data || []);
      } catch (err) {
        console.error('Failed to fetch activity log:', err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [visible, listId]);

  const getActionConfig = (actionType) => {
    return ACTION_CONFIG[actionType] || {
      label: actionType,
      icon: 'ellipse-outline',
      color: colors.textMuted,
    };
  };

  const renderActivity = ({ item, index }) => {
    const config = getActionConfig(item.action_type || item.type);
    const isLast = index === activities.length - 1;

    return (
      <View style={styles.activityItem}>
        {/* Timeline line */}
        <View style={styles.timelineCol}>
          <View style={[styles.timelineDot, { backgroundColor: config.color }]}>
            <Ionicons name={config.icon} size={14} color="#fff" />
          </View>
          {!isLast && <View style={styles.timelineLine} />}
        </View>

        {/* Content */}
        <View style={styles.activityContent}>
          <View style={styles.activityRow}>
            <Text style={styles.userName}>{item.user_name || item.userName || 'משתמש'}</Text>
            <Text style={[styles.actionLabel, { color: config.color }]}>{config.label}</Text>
          </View>
          {(item.item_name || item.itemName) && (
            <Text style={styles.itemName}>"{item.item_name || item.itemName}"</Text>
          )}
          <Text style={styles.timestamp}>{getRelativeTime(item.created_at || item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>יומן פעילות</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : activities.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={48} color={colors.textMuted} style={{ opacity: 0.4 }} />
                <Text style={styles.emptyText}>אין פעילות עדיין</Text>
              </View>
            ) : (
              <FlatList
                data={activities}
                keyExtractor={(item, index) => `${item.id || index}`}
                renderItem={renderActivity}
                contentContainerStyle={{ paddingVertical: spacing.sm }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>סגור</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
  body: {
    minHeight: 200,
    maxHeight: 400,
    paddingHorizontal: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  activityItem: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    minHeight: 60,
  },
  timelineCol: {
    alignItems: 'center',
    width: 28,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  activityContent: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  activityRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  itemName: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
});

export default ActivityLog;
