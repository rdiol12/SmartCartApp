import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { colors, spacing, radius } from '../theme';

const ChildAccessModal = ({ visible, onClose, listId }) => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    if (visible && listId) {
      fetchChildren();
    }
  }, [visible, listId]);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/lists/${listId}/children`);
      setChildren(data.children || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccess = async (childId, currentHasAccess) => {
    setUpdating((prev) => ({ ...prev, [childId]: true }));

    try {
      if (currentHasAccess) {
        await api.delete(`/api/lists/${listId}/children/${childId}`);
      } else {
        await api.post(`/api/lists/${listId}/children/${childId}`);
      }

      // Update local state
      setChildren((prev) =>
        prev.map((child) =>
          child.id === childId ? { ...child, has_access: !currentHasAccess } : child
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating((prev) => ({ ...prev, [childId]: false }));
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>ניהול גישת ילדים</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>טוען...</Text>
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {children.length > 0 ? (
                <>
                  <Text style={styles.description}>
                    בחר אילו ילדים יכולים לגשת לרשימה זו
                  </Text>

                  {children.map((child) => (
                    <View key={child.id} style={styles.childRow}>
                      <View style={styles.childInfo}>
                        <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
                        <View style={styles.childDetails}>
                          <Text style={styles.childName}>{child.first_name}</Text>
                          <Text style={styles.childUsername}>@{child.username}</Text>
                        </View>
                      </View>

                      <Switch
                        value={child.has_access}
                        onValueChange={() => handleToggleAccess(child.id, child.has_access)}
                        disabled={updating[child.id]}
                        trackColor={{ false: colors.border, true: colors.primary + '50' }}
                        thumbColor={child.has_access ? colors.primary : colors.surface}
                      />
                    </View>
                  ))}
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={48} color={colors.textMuted} />
                  <Text style={styles.emptyTitle}>אין חשבונות ילדים</Text>
                  <Text style={styles.emptyText}>
                    צור חשבונות ילדים בהגדרות המשפחה כדי לנהל גישה
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'right' },
  closeBtn: { padding: 4 },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: 14,
  },
  content: { padding: spacing.lg },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  childRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  childInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
  },
  childDetails: { alignItems: 'flex-end' },
  childName: { fontSize: 15, fontWeight: '600', textAlign: 'right' },
  childUsername: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
  },
  emptyContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default ChildAccessModal;
