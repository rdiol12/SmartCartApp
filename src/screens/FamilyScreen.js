import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { colors, spacing, radius } from '../theme';

export default function FamilyScreen() {
  const [children, setChildren] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const { data } = await api.get('/api/family/children');
        setChildren(data.children);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const handleCreate = async () => {
    if (!firstName.trim() || !username.trim() || !password) return;
    try {
      const { data } = await api.post('/api/family/create-child', {
        firstName: firstName.trim(),
        username: username.trim(),
        password,
      });
      setMessage({ type: 'success', text: `החשבון של ${data.child.first_name} נוצר בהצלחה!` });
      setFirstName('');
      setUsername('');
      setPassword('');
      const res = await api.get('/api/family/children');
      setChildren(res.data.children);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'שגיאה ביצירת חשבון' });
    }
  };

  const handleDelete = (childId, name) => {
    Alert.alert('מחיקת חשבון', `למחוק את החשבון של ${name}?`, [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/family/delete-child/${childId}`);
            setChildren((prev) => prev.filter((c) => c.id !== childId));
            setMessage({ type: 'success', text: `החשבון של ${name} נמחק` });
          } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'שגיאה במחיקה' });
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
        data={children}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>ניהול משפחה</Text>
            <Text style={styles.subtitle}>צור חשבונות לילדים. כשהם יוסיפו מוצרים לרשימה, תקבל בקשה לאישור</Text>

            {message.text ? (
              <View style={[styles.alert, message.type === 'error' ? styles.alertError : styles.alertSuccess]}>
                <Text style={[styles.alertText, { color: message.type === 'error' ? colors.danger : colors.success }]}>
                  {message.text}
                </Text>
              </View>
            ) : null}

            {/* Create child form */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-add-outline" size={20} color={colors.primary} />
                <Text style={styles.cardTitle}>צור חשבון ילד/ה</Text>
              </View>

              <Text style={styles.label}>שם הילד/ה</Text>
              <TextInput style={styles.input} placeholder="לדוגמה: דני" value={firstName} onChangeText={setFirstName} textAlign="right" />

              <Text style={styles.label}>שם משתמש (להתחברות)</Text>
              <TextInput style={styles.input} placeholder="לדוגמה: dani123" value={username} onChangeText={setUsername} autoCapitalize="none" textAlign="left" />

              <Text style={styles.label}>סיסמה</Text>
              <TextInput style={styles.input} placeholder="לפחות 4 תווים" value={password} onChangeText={setPassword} secureTextEntry textAlign="left" />

              <TouchableOpacity style={styles.primaryBtn} onPress={handleCreate}>
                <Ionicons name="person-add" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}> צור חשבון</Text>
              </TouchableOpacity>
            </View>

            {/* Children list header */}
            <View style={[styles.card, { marginBottom: 0 }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
                <Text style={styles.cardTitle}>חשבונות ילדים</Text>
              </View>
              {children.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
                  <Ionicons name="person-remove-outline" size={36} color={colors.textMuted} style={{ opacity: 0.4 }} />
                  <Text style={styles.emptyText}>אין חשבונות ילדים עדיין</Text>
                </View>
              )}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.childRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.childName}>{item.first_name}</Text>
              <Text style={styles.childUsername}>@{item.username}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id, item.first_name)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
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
  title: { fontSize: 20, fontWeight: '700', textAlign: 'right' },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'right', marginBottom: spacing.xl },
  alert: { padding: spacing.md, borderRadius: radius.sm, marginBottom: spacing.lg },
  alertError: { backgroundColor: '#fef2f2' },
  alertSuccess: { backgroundColor: '#f0fdf4' },
  alertText: { fontSize: 13, textAlign: 'center', fontWeight: '500' },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg,
  },
  cardHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', textAlign: 'right', marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, fontSize: 15, marginBottom: spacing.md,
  },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md,
  },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  emptyText: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm },
  childRow: {
    flexDirection: 'row-reverse', alignItems: 'center', padding: spacing.md,
    backgroundColor: colors.surface, marginHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  childName: { fontSize: 15, fontWeight: '600', textAlign: 'right' },
  childUsername: { fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  deleteBtn: { padding: spacing.sm },
});
