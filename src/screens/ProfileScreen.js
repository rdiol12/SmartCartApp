import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { colors, spacing, radius } from '../theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout, logoutAll, isLinkedChild } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    setMessage({ type: '', text: '' });
    if (newPassword !== confirmNewPassword) {
      return setMessage({ type: 'error', text: 'הסיסמאות החדשות אינן תואמות' });
    }
    if (newPassword.length < 8) {
      return setMessage({ type: 'error', text: 'הסיסמה החדשה חייבת להיות באורך 8 תווים לפחות' });
    }
    if (currentPassword.length < 8) {
      return setMessage({ type: 'error', text: 'הסיסמה הנוכחית חייבת להיות באורך 8 תווים לפחות' });
    }
    if (currentPassword === newPassword) {
      return setMessage({ type: 'error', text: 'הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית' });
    }
    setSaving(true);
    try {
      await api.put('/api/user/password', { currentPassword, newPassword, confirmNewPassword });
      setMessage({ type: 'success', text: 'הסיסמה שונתה בהצלחה' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'שינוי הסיסמה נכשל' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('התנתקות', 'האם אתה בטוח?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'התנתק', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleLogoutAll = () => {
    Alert.alert('התנתקות מכל המכשירים', 'האם אתה בטוח?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'התנתק', style: 'destructive', onPress: () => logoutAll() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>הגדרות חשבון</Text>
      <Text style={styles.subtitle}>נהל את הפרטים והאבטחה של החשבון שלך</Text>

      {message.text ? (
        <View style={[styles.alert, message.type === 'error' ? styles.alertError : styles.alertSuccess]}>
          <Text style={[styles.alertText, { color: message.type === 'error' ? colors.danger : colors.success }]}>
            {message.text}
          </Text>
        </View>
      ) : null}

      {/* Change password */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>אבטחה</Text>
        </View>

        <Text style={styles.label}>סיסמה נוכחית</Text>
        <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry textAlign="left" />

        <Text style={styles.label}>סיסמה חדשה</Text>
        <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry textAlign="left" />

        <Text style={styles.label}>אישור סיסמה חדשה</Text>
        <TextInput style={styles.input} value={confirmNewPassword} onChangeText={setConfirmNewPassword} secureTextEntry textAlign="left" />

        <TouchableOpacity style={styles.ghostBtn} onPress={handleChangePassword} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.primary} size="small" /> : <Text style={styles.ghostBtnText}>עדכן סיסמה</Text>}
        </TouchableOpacity>
      </View>

      {/* Family management - parent only */}
      {!isLinkedChild && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>ניהול משפחה</Text>
          </View>
          <Text style={styles.cardDesc}>צור חשבונות לילדים כדי לאשר מוצרים שהם מוסיפים</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Family')}>
            <Ionicons name="people" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}> נהל ילדים</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Session management */}
      <View style={[styles.card, { borderColor: colors.danger + '30' }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.cardTitle, { color: colors.danger }]}>ניהול הפעלה</Text>
        </View>

        <TouchableOpacity style={styles.dangerBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.dangerBtnText}> התנתק</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.ghostBtn, { borderColor: colors.danger + '30', marginTop: spacing.sm }]} onPress={handleLogoutAll}>
          <Text style={[styles.ghostBtnText, { color: colors.danger }]}>התנתק מכל המכשירים</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
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
  cardDesc: { fontSize: 13, color: colors.textMuted, textAlign: 'right', marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', textAlign: 'right', marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, fontSize: 15, marginBottom: spacing.md,
  },
  ghostBtn: {
    padding: spacing.md, alignItems: 'center', borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  ghostBtnText: { fontSize: 14, fontWeight: '600', color: colors.text },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md,
  },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.danger, borderRadius: radius.md, padding: spacing.md,
  },
  dangerBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
