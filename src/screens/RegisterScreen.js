import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import api from '../api';
import { colors, spacing, radius } from '../theme';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    setError('');
    const { first_name, last_name, email, password, confirmPassword } = form;
    if (!first_name.trim() || !email.trim() || !password) {
      return setError('יש למלא את כל השדות');
    }
    if (password.length < 8) return setError('הסיסמה חייבת להיות לפחות 8 תווים');
    if (password !== confirmPassword) return setError('הסיסמאות אינן תואמות');

    setLoading(true);
    try {
      await api.post('/api/register', { first_name, last_name, email, password, confirmPassword });
      Alert.alert('הצלחה', 'ההרשמה הצליחה! בדוק את המייל שלך', [
        { text: 'אוקיי', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'ההרשמה נכשלה');
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
        <Text style={styles.title}>צור חשבון חדש</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>שם פרטי</Text>
        <TextInput style={styles.input} value={form.first_name} onChangeText={(v) => update('first_name', v)} textAlign="right" />

        <Text style={styles.label}>שם משפחה</Text>
        <TextInput style={styles.input} value={form.last_name} onChangeText={(v) => update('last_name', v)} textAlign="right" />

        <Text style={styles.label}>אימייל</Text>
        <TextInput style={styles.input} value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" autoCapitalize="none" textAlign="left" />

        <Text style={styles.label}>סיסמה</Text>
        <TextInput style={styles.input} value={form.password} onChangeText={(v) => update('password', v)} secureTextEntry textAlign="left" />

        <Text style={styles.label}>אישור סיסמה</Text>
        <TextInput style={styles.input} value={form.confirmPassword} onChangeText={(v) => update('confirmPassword', v)} secureTextEntry textAlign="left" />

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>הרשמה</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>
            כבר יש לך חשבון? <Text style={styles.linkBold}>התחבר כאן</Text>
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
  title: { fontSize: 22, fontWeight: '700', textAlign: 'right', marginBottom: spacing.xl },
  label: { fontSize: 13, fontWeight: '600', textAlign: 'right', marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, fontSize: 15, marginBottom: spacing.md,
  },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md + 2, alignItems: 'center', marginBottom: spacing.lg },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { backgroundColor: '#fef2f2', color: colors.danger, padding: spacing.md, borderRadius: radius.sm, textAlign: 'center', marginBottom: spacing.lg, fontSize: 13 },
  link: { textAlign: 'center', fontSize: 14, color: colors.textMuted },
  linkBold: { color: colors.primary, fontWeight: '600' },
});
