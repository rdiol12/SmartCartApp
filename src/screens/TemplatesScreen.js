import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { colors, spacing, radius } from '../theme';

export default function TemplatesScreen({ navigation }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await api.get('/api/templates');
        setTemplates(data.templates);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleApply = async (templateId, templateName) => {
    try {
      const { data } = await api.post(`/api/templates/${templateId}/apply`, { listName: templateName });
      navigation.navigate('ListDetail', { listId: data.listId, listName: templateName });
    } catch (err) {
      Alert.alert('שגיאה', err.response?.data?.message || 'שגיאה ביצירת רשימה מתבנית');
    }
  };

  const handleDelete = (templateId) => {
    Alert.alert('מחיקת תבנית', 'למחוק את התבנית?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/templates/${templateId}`);
            setTemplates((prev) => prev.filter((t) => t.id !== templateId));
          } catch (err) {
            console.error(err);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={templates}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.title}>התבניות שלי</Text>
            <Text style={styles.subtitle}>צור רשימות חדשות מתבניות שמורות</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={colors.textMuted} style={{ opacity: 0.4 }} />
            <Text style={styles.emptyTitle}>אין תבניות שמורות</Text>
            <Text style={styles.emptySubtitle}>שמור רשימה כתבנית מתוך דף הרשימה</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.templateCard}>
            <View style={styles.templateHeader}>
              <Text style={styles.templateName} numberOfLines={2}>{item.template_name}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{item.item_count} פריטים</Text>
              </View>
            </View>
            <View style={styles.templateActions}>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => handleApply(item.id, item.template_name)}
              >
                <Ionicons name="add-circle-outline" size={16} color="#fff" />
                <Text style={styles.applyBtnText}> צור רשימה</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  headerSection: { marginBottom: spacing.lg },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'right' },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'right' },
  row: { justifyContent: 'space-between' },
  templateCard: {
    width: '48%', backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  templateHeader: { marginBottom: spacing.sm },
  templateName: { fontSize: 14, fontWeight: '700', textAlign: 'right', marginBottom: spacing.xs },
  countBadge: {
    alignSelf: 'flex-end', backgroundColor: colors.border,
    paddingHorizontal: spacing.sm, paddingVertical: 1, borderRadius: radius.full,
  },
  countText: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  templateActions: { flexDirection: 'row-reverse', gap: spacing.xs, alignItems: 'center' },
  applyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: spacing.xs,
  },
  applyBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 4 },
  emptyContainer: { alignItems: 'center', marginTop: spacing.xxl },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: spacing.md },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
});
