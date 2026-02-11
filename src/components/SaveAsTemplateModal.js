import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { colors, spacing, radius } from '../theme';

const SaveAsTemplateModal = ({ visible, onClose, listId, listName }) => {
  const [templateName, setTemplateName] = useState(listName || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!templateName.trim()) {
      Alert.alert('שגיאה', 'אנא הזן שם לתבנית');
      return;
    }

    setSaving(true);
    try {
      await api.post('/api/templates', {
        listId: parseInt(listId),
        templateName: templateName.trim(),
      });

      Alert.alert('הצלחה!', 'התבנית נשמרה בהצלחה');
      setTemplateName('');
      onClose();
    } catch (err) {
      Alert.alert(
        'שגיאה',
        err.response?.data?.message || 'שגיאה בשמירת התבנית'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>שמירה כתבנית</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.description}>
              שמור את הרשימה הזו כתבנית כדי ליצור רשימות דומות בעתיד
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>שם התבנית</Text>
              <TextInput
                style={styles.input}
                placeholder="למשל: קניות שבועיות"
                value={templateName}
                onChangeText={setTemplateName}
                textAlign="right"
                autoFocus
                editable={!saving}
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.btnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={18} color="#fff" />
                    <Text style={styles.saveBtnText}>שמור תבנית</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>ביטול</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
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
  content: { padding: spacing.lg },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  inputGroup: { marginBottom: spacing.lg },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
  },
  actions: { gap: spacing.sm },
  saveBtn: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelBtn: {
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});

export default SaveAsTemplateModal;
