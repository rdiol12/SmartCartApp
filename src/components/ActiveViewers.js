import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import socket from '../socket';
import { colors, spacing, radius } from '../theme';

// Predefined colors for viewer circles
const VIEWER_COLORS = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b',
  '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4',
];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0];
  }
  return name.slice(0, 2);
};

const getViewerColor = (userId) => {
  const idx = (typeof userId === 'number' ? userId : 0) % VIEWER_COLORS.length;
  return VIEWER_COLORS[idx];
};

const ActiveViewers = ({ listId }) => {
  const { user } = useContext(AuthContext);
  const [viewers, setViewers] = useState([]);

  useEffect(() => {
    if (!listId || !user) return;

    // Emit that we are viewing this list
    socket.emit('viewing_list', {
      listId,
      userId: user.id,
      userName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
    });

    // Listen for viewers updates
    const onViewersUpdated = (viewersList) => {
      // Filter out the current user from the viewers display
      const others = (viewersList || []).filter((v) => v.userId !== user.id);
      setViewers(others);
    };

    socket.on('viewers_updated', onViewersUpdated);

    return () => {
      socket.emit('stop_viewing_list', { listId, userId: user.id });
      socket.off('viewers_updated', onViewersUpdated);
    };
  }, [listId, user]);

  if (viewers.length === 0) return null;

  const MAX_DISPLAY = 4;
  const displayed = viewers.slice(0, MAX_DISPLAY);
  const extraCount = viewers.length - MAX_DISPLAY;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>צופים עכשיו:</Text>
      <View style={styles.viewersRow}>
        {displayed.map((viewer, index) => (
          <View
            key={viewer.userId}
            style={[
              styles.circle,
              {
                backgroundColor: getViewerColor(viewer.userId),
                marginLeft: index > 0 ? -8 : 0,
                zIndex: MAX_DISPLAY - index,
              },
            ]}
          >
            <Text style={styles.initials}>{getInitials(viewer.userName)}</Text>
          </View>
        ))}
        {extraCount > 0 && (
          <View style={[styles.circle, styles.extraCircle, { marginLeft: -8 }]}>
            <Text style={styles.extraText}>+{extraCount}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
  },
  viewersRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  initials: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  extraCircle: {
    backgroundColor: colors.textMuted,
  },
  extraText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
});

export default ActiveViewers;
