import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRecentItems } from '../utils/recentItems';
import api from '../api';
import { colors, spacing, radius } from '../theme';

const RecentItems = ({ onSelect }) => {
  const [recent, setRecent] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    loadRecent();
    loadSuggestions();
  }, []);

  const loadRecent = async () => {
    const items = await getRecentItems();
    setRecent(items);
  };

  const loadSuggestions = async () => {
    try {
      const { data } = await api.get('/api/suggestions');
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (e) {
      // silently fail
    }
  };

  // Merge recent + suggestions, dedup by name
  const seen = new Set();
  const allItems = [];
  for (const item of recent) {
    if (!seen.has(item.itemname)) {
      seen.add(item.itemname);
      allItems.push(item);
    }
  }
  for (const item of suggestions) {
    if (!seen.has(item.itemname)) {
      seen.add(item.itemname);
      allItems.push(item);
    }
  }

  if (allItems.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <Ionicons name="flash-outline" size={12} color={colors.textMuted} /> הצעות מהירות
      </Text>
      <ScrollView
        horizontal
        inverted
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.chip}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.chipText}>{item.itemname}</Text>
            {item.quantity > 1 && (
              <Text style={styles.chipBadge}>x{item.quantity}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary + '10',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  chipText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  chipBadge: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default RecentItems;
