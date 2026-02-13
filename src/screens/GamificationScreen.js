import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';
import { colors, spacing, radius } from '../theme';

const BADGE_INFO = {
  first_item: { icon: 'star', color: '#f59e0b', label: 'פריט ראשון', desc: 'הוספת את הפריט הראשון!' },
  shopper_10: { icon: 'bag-check', color: '#10b981', label: 'קונה מנוסה', desc: 'שילמת על 10 פריטים' },
  streak_7: { icon: 'flame', color: '#ef4444', label: 'רצף שבועי', desc: '7 ימים רצופים של שימוש' },
  list_master: { icon: 'list', color: '#6366f1', label: 'מאסטר רשימות', desc: 'יצרת 10 רשימות' },
  budget_saver: { icon: 'wallet', color: '#8b5cf6', label: 'חוסך תקציב', desc: 'נשארת בתקציב חודש שלם' },
};

export default function GamificationScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/api/gamification/stats');
      setStats(data);
    } catch (err) {
      console.error('Error fetching gamification stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const points = stats?.points || 0;
  const streak = stats?.streak_days || 0;
  const badges = stats?.badges || [];
  const level = Math.floor(points / 100) + 1;
  const progressToNext = points % 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Points & Level Card */}
      <View style={styles.heroCard}>
        <View style={styles.levelCircle}>
          <Text style={styles.levelNumber}>{level}</Text>
          <Text style={styles.levelLabel}>רמה</Text>
        </View>
        <View style={styles.heroInfo}>
          <Text style={styles.pointsText}>{points} נקודות</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressToNext}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{progressToNext}/100 לרמה הבאה</Text>
        </View>
      </View>

      {/* Streak */}
      <View style={styles.streakCard}>
        <Ionicons name="flame" size={32} color={streak > 0 ? '#ef4444' : colors.textMuted} />
        <View style={{ flex: 1 }}>
          <Text style={styles.streakTitle}>רצף יומי</Text>
          <Text style={styles.streakValue}>
            {streak > 0 ? `${streak} ימים רצופים!` : 'התחל רצף היום!'}
          </Text>
        </View>
        <View style={styles.streakDots}>
          {[1, 2, 3, 4, 5, 6, 7].map(day => (
            <View
              key={day}
              style={[styles.streakDot, day <= streak && styles.streakDotActive]}
            />
          ))}
        </View>
      </View>

      {/* How to earn */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="trophy-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>איך צוברים נקודות</Text>
        </View>
        {[
          { action: 'הוספת פריט לרשימה', points: '+5' },
          { action: 'סימון פריט כשולם', points: '+10' },
          { action: 'השלמת רשימה', points: '+20' },
          { action: 'שימוש יומי (רצף)', points: '+5' },
        ].map((item, i) => (
          <View key={i} style={styles.earnRow}>
            <Text style={styles.earnAction}>{item.action}</Text>
            <Text style={styles.earnPoints}>{item.points}</Text>
          </View>
        ))}
      </View>

      {/* Badges */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="medal-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>תגים</Text>
        </View>

        <View style={styles.badgesGrid}>
          {Object.entries(BADGE_INFO).map(([key, info]) => {
            const earned = badges.some(b => b.badge_name === key);
            return (
              <View key={key} style={[styles.badgeItem, !earned && styles.badgeItemLocked]}>
                <View style={[styles.badgeIcon, { backgroundColor: earned ? info.color + '20' : colors.border }]}>
                  <Ionicons
                    name={info.icon}
                    size={24}
                    color={earned ? info.color : colors.textMuted}
                  />
                </View>
                <Text style={[styles.badgeLabel, !earned && { color: colors.textMuted }]}>
                  {info.label}
                </Text>
                <Text style={styles.badgeDesc}>{info.desc}</Text>
                {earned && (
                  <View style={styles.earnedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={styles.earnedText}>הושג!</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },

  heroCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  levelCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  levelNumber: { fontSize: 28, fontWeight: '800', color: '#fff' },
  levelLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)' },
  heroInfo: { flex: 1 },
  pointsText: { fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'right', marginBottom: spacing.xs },
  progressBar: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  progressLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'right', marginTop: 4 },

  streakCard: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg,
  },
  streakTitle: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  streakValue: { fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  streakDots: { flexDirection: 'row', gap: 4 },
  streakDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border,
  },
  streakDotActive: { backgroundColor: '#ef4444' },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg,
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },

  earnRow: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  earnAction: { fontSize: 13, textAlign: 'right' },
  earnPoints: { fontSize: 14, fontWeight: '700', color: colors.primary },

  badgesGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm },
  badgeItem: {
    width: '47%', backgroundColor: colors.bg, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center',
  },
  badgeItemLocked: { opacity: 0.5 },
  badgeIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
  },
  badgeLabel: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  badgeDesc: { fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  earnedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: spacing.xs,
  },
  earnedText: { fontSize: 10, color: colors.success, fontWeight: '600' },
});
