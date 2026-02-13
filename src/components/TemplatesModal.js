import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTemplates, deleteTemplate, saveTemplate, loadTemplateItems } from '../utils/templates';
import SwipeDownModal from './SwipeDownModal';
import { colors, spacing, radius } from '../theme';

const TemplatesModal = ({ visible, onClose, onLoadTemplate, currentItems }) => {
  const [templates, setTemplates] = useState([]);
  const [showSave, setShowSave] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    if (visible) {
      loadTemplates();
    }
  }, [visible]);

  const loadTemplates = async () => {
    const data = await getTemplates();
    setTemplates(data);
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      Alert.alert('שגיאה', 'הזן שם לתבנית');
      return;
    }

    const template = await saveTemplate(templateName.trim(), currentItems);
    if (template) {
      setTemplateName('');
      setShowSave(false);
      loadTemplates();
      Alert.alert('נשמר!', 'התבנית נשמרה בהצלחה');
    }
  };

  const handleDelete = async (templateId) => {
    Alert.alert(
      'מחיקת תבנית',
      'האם אתה בטוח שברצונך למחוק תבנית זו?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            await deleteTemplate(templateId);
            loadTemplates();
          },
        },
      ]
    );
  };

  const handleLoad = async (templateId) => {
    const items = await loadTemplateItems(templateId);
    onLoadTemplate?.(items);
    onClose();
  };

  return (
    <SwipeDownModal visible={visible} onClose={onClose} maxHeight="80%">
      <View style={styles.header}>
        <Text style={styles.title}>תבניות רשימה</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {showSave ? (
          <View style={styles.saveForm}>
            <TextInput
              style={styles.input}
              placeholder="שם התבנית..."
              value={templateName}
              onChangeText={setTemplateName}
              textAlign="right"
              autoFocus
            />
            <View style={styles.saveActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>שמור</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowSave(false)}>
                <Text style={styles.cancelText}>ביטול</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.createBtn} onPress={() => setShowSave(true)}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.createText}>שמור רשימה נוכחית כתבנית</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={templates}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text style={styles.emptyText}>אין תבניות שמורות</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.templateCard}>
              <TouchableOpacity
                style={styles.templateContent}
                onPress={() => handleLoad(item.id)}
              >
                <Text style={styles.templateName}>{item.name}</Text>
                <Text style={styles.templateMeta}>
                  {item.items.length} פריטים
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
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
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
  },
  createBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.primary + '10',
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  createText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  saveForm: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: 14,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  saveActions: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 14,
    color: colors.textMuted,
    paddingVertical: spacing.xs,
  },
  templateCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  templateContent: {
    flex: 1,
    padding: spacing.md,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  templateMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'right',
  },
  deleteBtn: {
    padding: spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
    paddingVertical: spacing.xl,
  },
});

export default TemplatesModal;
