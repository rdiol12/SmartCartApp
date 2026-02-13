import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import ActivityTimeline from './ActivityTimeline';
import SwipeDownModal from './SwipeDownModal';
import { colors, spacing, radius } from '../theme';

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

  return (
    <SwipeDownModal visible={visible} onClose={onClose} maxHeight="80%">
      <View style={styles.header}>
        <Text style={styles.title}>יומן פעילות</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <ActivityTimeline activities={activities} loading={loading} />
      </View>

      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeBtnText}>סגור</Text>
      </TouchableOpacity>
    </SwipeDownModal>
  );
};

const styles = StyleSheet.create({
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
    flex: 1,
    paddingHorizontal: spacing.lg,
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
