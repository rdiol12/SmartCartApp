import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { colors, spacing, radius } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!loginId.trim()) return setError('יש להזין אימייל או שם משתמש');
    if (!password) return setError('יש להזין סיסמה');

    setLoading(true);
    try {
      await login(loginId.trim(), password);
    } catch (err) {
      setError(err.response?.data?.message || 'ההתחברות נכשלה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>🛒 SmartCart</Text>
        <Text style={styles.title}>ברוכים השבים</Text>
        <Text style={styles.subtitle}>התחבר כדי לנהל את הרשימות שלך</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>אימייל או שם משתמש</Text>
        <TextInput
          style={styles.input}
          placeholder="אימייל או שם משתמש"
          value={loginId}
          onChangeText={setLoginId}
          autoCapitalize="none"
          textAlign="left"
        />

        <Text style={styles.label}>סיסמה</Text>
        <TextInput
          style={styles.input}
          placeholder="הכנס סיסמה"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textAlign="left"
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.btnText}>התחברות</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotLink}>שכחת סיסמה?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>
            אין לך חשבון? <Text style={styles.linkBold}>הרשם כאן</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  brand: { fontSize: 28, fontWeight: '800', textAlign: 'center', color: colors.primary, marginBottom: spacing.sm },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'right', marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'right', marginBottom: spacing.xl },
  label: { fontSize: 13, fontWeight: '600', textAlign: 'right', marginBottom: spacing.xs, color: colors.text },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    marginBottom: spacing.lg,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md + 2,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: {
    backgroundColor: '#fef2f2',
    color: colors.danger,
    padding: spacing.md,
    borderRadius: radius.sm,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontSize: 13,
  },
  forgotLink: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  link: { textAlign: 'center', fontSize: 14, color: colors.textMuted },
  linkBold: { color: colors.primary, fontWeight: '600' },
});
