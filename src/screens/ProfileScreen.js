import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import api from '../api';
import { colors, spacing, radius } from '../theme';
import { LANGUAGES, getCurrentLang, saveLang } from '../utils/i18n';

export default function ProfileScreen({ navigation }) {
  const { user, logout, logoutAll, isLinkedChild } = useContext(AuthContext);
  const { theme, toggleTheme, isDark } = useContext(ThemeContext);
  const [language, setLanguage] = useState(getCurrentLang());

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

      {/* Quick links */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="apps-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>כלים</Text>
        </View>
        <View style={styles.quickLinksGrid}>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Gamification')}>
            <Ionicons name="trophy-outline" size={22} color={colors.warning} />
            <Text style={styles.quickLinkText}>הישגים</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('MealPlanner')}>
            <Ionicons name="restaurant-outline" size={22} color={colors.success} />
            <Text style={styles.quickLinkText}>תפריט שבועי</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Pantry')}>
            <Ionicons name="nutrition-outline" size={22} color={colors.danger} />
            <Text style={styles.quickLinkText}>מזווה</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Templates')}>
            <Ionicons name="copy-outline" size={22} color={colors.primary} />
            <Text style={styles.quickLinkText}>תבניות</Text>
          </TouchableOpacity>
        </View>
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

      {/* Theme toggle */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>מראה</Text>
        </View>
        <View style={styles.themeRow}>
          {[
            { value: 'light', label: 'בהיר', icon: 'sunny-outline' },
            { value: 'dark', label: 'כהה', icon: 'moon-outline' },
            { value: 'auto', label: 'אוטומטי', icon: 'phone-portrait-outline' },
          ].map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.themeBtn, theme === opt.value && styles.themeBtnActive]}
              onPress={() => toggleTheme(opt.value)}
            >
              <Ionicons name={opt.icon} size={18} color={theme === opt.value ? colors.primary : colors.textMuted} />
              <Text style={[styles.themeBtnText, theme === opt.value && { color: colors.primary, fontWeight: '700' }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Language selector */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="language-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>שפה / Language</Text>
        </View>
        <View style={styles.themeRow}>
          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.themeBtn, language === lang.code && styles.themeBtnActive]}
              onPress={async () => {
                await saveLang(lang.code);
                setLanguage(lang.code);
                Alert.alert('שפה שונתה', 'יש להפעיל מחדש את האפליקציה כדי לראות את השינוי המלא');
              }}
            >
              <Text style={[styles.themeBtnText, language === lang.code && { color: colors.primary, fontWeight: '700' }]}>
                {lang.nativeLabel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
  themeRow: { flexDirection: 'row-reverse', gap: spacing.sm },
  themeBtn: {
    flex: 1, alignItems: 'center', gap: spacing.xs,
    paddingVertical: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
  },
  themeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  themeBtnText: { fontSize: 12, color: colors.textMuted },
  quickLinksGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm },
  quickLink: {
    width: '47%', alignItems: 'center', gap: spacing.xs,
    paddingVertical: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
  },
  quickLinkText: { fontSize: 12, fontWeight: '600', color: colors.text },
});
