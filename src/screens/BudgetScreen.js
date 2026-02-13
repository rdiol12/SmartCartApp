import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';
import { colors, spacing, radius } from '../theme';

const BUDGET_KEY = 'monthly_budget';

export default function BudgetScreen() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState('');
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  // Re-fetch every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      // Load saved budget
      const savedBudget = await AsyncStorage.getItem(BUDGET_KEY);
      if (savedBudget) {
        setBudget(savedBudget);
        setBudgetInput(savedBudget);
      }

      // Fetch all lists with their items
      const { data } = await api.get('/api/lists');
      const allLists = data.lists || [];

      // For each list, fetch items to calculate spending
      const listsWithItems = await Promise.all(
        allLists.map(async (list) => {
          try {
            const res = await api.get(`/api/lists/${list.id}/items`);
            return { ...list, items: res.data.items || [] };
          } catch {
            return { ...list, items: [] };
          }
        })
      );

      setLists(listsWithItems);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBudget = async () => {
    const trimmed = budgetInput.trim();
    if (trimmed && !isNaN(parseFloat(trimmed))) {
      await AsyncStorage.setItem(BUDGET_KEY, trimmed);
      setBudget(trimmed);
    }
    setEditingBudget(false);
  };

  // Calculate totals across all lists
  const totalEstimated = lists.reduce((sum, list) => {
    return sum + list.items.reduce((s, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseFloat(item.quantity) || 1;
      return s + (price * qty);
    }, 0);
  }, 0);

  const totalSpent = lists.reduce((sum, list) => {
    return sum + list.items.reduce((s, item) => {
      if (!item.paid_by) return s;
      const price = parseFloat(item.price) || 0;
      const qty = parseFloat(item.quantity) || 1;
      return s + (price * qty);
    }, 0);
  }, 0);

  const budgetNum = parseFloat(budget) || 0;
  const budgetProgress = budgetNum > 0 ? Math.min((totalSpent / budgetNum) * 100, 100) : 0;
  const budgetRemaining = budgetNum > 0 ? budgetNum - totalSpent : 0;
  const isOverBudget = budgetNum > 0 && totalSpent > budgetNum;

  // Per-list breakdown (only lists that have items with prices)
  const listBreakdown = lists
    .map((list) => {
      const spent = list.items.reduce((s, item) => {
        if (!item.paid_by) return s;
        const price = parseFloat(item.price) || 0;
        const qty = parseFloat(item.quantity) || 1;
        return s + (price * qty);
      }, 0);
      const estimated = list.items.reduce((s, item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseFloat(item.quantity) || 1;
        return s + (price * qty);
      }, 0);
      return { id: list.id, name: list.list_name, spent, estimated };
    })
    .filter((l) => l.estimated > 0)
    .sort((a, b) => b.spent - a.spent);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>תקציב משפחתי</Text>
      <Text style={styles.subtitle}>מעקב הוצאות חודשי</Text>

      {/* Budget Input Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="wallet-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>תקציב חודשי</Text>
        </View>

        {editingBudget ? (
          <View style={styles.budgetEditRow}>
            <TextInput
              style={styles.budgetInput}
              placeholder="הכנס תקציב חודשי..."
              value={budgetInput}
              onChangeText={setBudgetInput}
              keyboardType="decimal-pad"
              textAlign="center"
              autoFocus
              onSubmitEditing={saveBudget}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={saveBudget}>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.budgetDisplay} onPress={() => setEditingBudget(true)}>
            <Text style={styles.budgetValue}>
              {budgetNum > 0 ? `₪${budgetNum.toLocaleString()}` : 'לא הוגדר'}
            </Text>
            <Ionicons name="pencil-outline" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Summary Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="wallet-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>₪{totalEstimated.toFixed(0)}</Text>
          <Text style={styles.statLabel}>סה"כ משוער</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="card-outline" size={24} color={colors.success} />
          </View>
          <Text style={[styles.statValue, { color: colors.success }]}>₪{totalSpent.toFixed(0)}</Text>
          <Text style={styles.statLabel}>שולם</Text>
        </View>

        {budgetNum > 0 && (
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: (isOverBudget ? colors.danger : colors.warning) + '15' }]}>
              <Ionicons
                name={isOverBudget ? 'alert-circle-outline' : 'trending-down-outline'}
                size={24}
                color={isOverBudget ? colors.danger : colors.warning}
              />
            </View>
            <Text style={[styles.statValue, { color: isOverBudget ? colors.danger : colors.warning }]}>
              ₪{Math.abs(budgetRemaining).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>{isOverBudget ? 'חריגה' : 'נותר'}</Text>
          </View>
        )}
      </View>

      {/* Budget Progress Bar */}
      {budgetNum > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="analytics-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>התקדמות</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${budgetProgress}%`,
                    backgroundColor: isOverBudget ? colors.danger : budgetProgress > 75 ? colors.warning : colors.success,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressPercentText}>{Math.round(budgetProgress)}%</Text>
          </View>

          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>₪{totalSpent.toFixed(0)} מתוך ₪{budgetNum.toFixed(0)}</Text>
          </View>

          {/* Circular-style summary */}
          <View style={styles.circularContainer}>
            <View style={[styles.circularOuter, { borderColor: isOverBudget ? colors.danger : colors.primary }]}>
              <Text style={[styles.circularPercent, { color: isOverBudget ? colors.danger : colors.primary }]}>
                {Math.round(budgetProgress)}%
              </Text>
              <Text style={styles.circularLabel}>מהתקציב</Text>
            </View>
          </View>
        </View>
      )}

      {/* Breakdown by List */}
      {listBreakdown.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="list-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>פירוט לפי רשימה</Text>
          </View>

          {listBreakdown.map((list) => {
            const listPercent = totalSpent > 0 ? (list.spent / totalSpent) * 100 : 0;
            return (
              <View key={list.id} style={styles.breakdownRow}>
                <View style={styles.breakdownInfo}>
                  <Text style={styles.breakdownName}>{list.name}</Text>
                  <Text style={styles.breakdownMeta}>
                    שולם: ₪{list.spent.toFixed(0)} · משוער: ₪{list.estimated.toFixed(0)}
                  </Text>
                </View>
                <View style={styles.breakdownBarContainer}>
                  <View style={styles.breakdownBarBg}>
                    <View style={[styles.breakdownBarFill, { width: `${Math.min(listPercent, 100)}%` }]} />
                  </View>
                </View>
                <Text style={styles.breakdownAmount}>₪{list.spent.toFixed(0)}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Empty state */}
      {listBreakdown.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={48} color={colors.textMuted} style={{ opacity: 0.4 }} />
          <Text style={styles.emptyTitle}>אין נתוני הוצאות</Text>
          <Text style={styles.emptySubtitle}>הוסף מחירים לפריטים ברשימות כדי לעקוב אחרי ההוצאות</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'right' },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'right', marginBottom: spacing.xl },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },

  // Budget input
  budgetEditRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    alignItems: 'center',
  },
  budgetInput: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 18,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetDisplay: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  budgetValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Progress bar
  progressBarContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  progressPercentText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    minWidth: 40,
    textAlign: 'left',
  },
  progressLabels: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },

  // Circular indicator
  circularContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  circularOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularPercent: {
    fontSize: 28,
    fontWeight: '800',
  },
  circularLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Breakdown
  breakdownRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  breakdownInfo: {
    flex: 1,
  },
  breakdownName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  breakdownMeta: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
  breakdownBarContainer: {
    width: 60,
  },
  breakdownBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    minWidth: 50,
    textAlign: 'left',
  },

  // Empty
  emptyContainer: { alignItems: 'center', marginTop: spacing.xxl },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: spacing.md },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
});
