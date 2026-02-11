import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { colors, spacing, radius } from '../theme';

export default function JoinListScreen({ route, navigation }) {
  const { inviteCode } = route.params || {};
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [listInfo, setListInfo] = useState(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!inviteCode) {
      Alert.alert('שגיאה', 'קוד הזמנה חסר', [
        { text: 'אישור', onPress: () => navigation.navigate('HomeTab') },
      ]);
      return;
    }

    if (!user) {
      // User not logged in, redirect to login with returnTo
      navigation.navigate('Login', { returnTo: 'JoinList', inviteCode });
      return;
    }

    // Fetch list info from invite code
    fetchListInfo();
  }, [inviteCode, user]);

  const fetchListInfo = async () => {
    try {
      // Note: This assumes there's an endpoint to get invite info
      // If not available in backend, skip this and go straight to join
      const { data } = await api.get(`/api/invites/${inviteCode}`);
      setListInfo(data);
    } catch (err) {
      console.error(err);
      // If fetch fails, still allow join attempt
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      await api.post(`/api/join/${inviteCode}`);

      Alert.alert('הצטרפת בהצלחה!', 'הצטרפת לרשימה', [
        {
          text: 'עבור לרשימה',
          onPress: () => navigation.navigate('ListsTab'),
        },
      ]);
    } catch (err) {
      Alert.alert(
        'שגיאה',
        err.response?.data?.message || 'שגיאה בהצטרפות לרשימה'
      );
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>טוען...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="people" size={64} color={colors.primary} />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {listInfo?.list_name || 'הזמנה לרשימה'}
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          {listInfo?.creator_name
            ? `${listInfo.creator_name} הזמין אותך להצטרף לרשימה`
            : 'הוזמנת להצטרף לרשימת קניות משותפת'}
        </Text>

        {listInfo && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="list-outline" size={20} color={colors.textMuted} />
              <Text style={styles.infoText}>
                {listInfo.item_count || 0} פריטים
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color={colors.textMuted} />
              <Text style={styles.infoText}>
                {listInfo.member_count || 0} חברים
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity
          style={[styles.joinButton, joining && styles.buttonDisabled]}
          onPress={handleJoin}
          disabled={joining}
        >
          {joining ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.joinButtonText}>הצטרף לרשימה</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Text style={styles.cancelButtonText}>ביטול</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: 14,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
  },
  joinButton: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: spacing.md,
  },
  cancelButtonText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
