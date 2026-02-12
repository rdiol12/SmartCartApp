import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

const ListControls = ({ onSortChange, onFilterChange, onSearchChange }) => {
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sortOptions = [
    { value: 'default', label: 'ברירת מחדל' },
    { value: 'name', label: 'שם (א-ת)' },
    { value: 'category', label: 'לפי מחלקה' },
    { value: 'route', label: 'מסלול חנות' },
    { value: 'price', label: 'מחיר' },
    { value: 'checked', label: 'מסומנים תחילה' },
    { value: 'unchecked', label: 'לא מסומנים תחילה' },
  ];

  const filterOptions = [
    { value: 'all', label: 'הכל', icon: 'list' },
    { value: 'unchecked', label: 'לא מסומנים', icon: 'square-outline' },
    { value: 'checked', label: 'מסומנים', icon: 'checkbox' },
  ];

  const handleSort = (value) => {
    setSortBy(value);
    setShowSort(false);
    onSortChange(value);
  };

  const handleFilter = (value) => {
    setFilter(value);
    onFilterChange(value);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    onSearchChange(text);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginLeft: spacing.xs }} />
        <TextInput
          style={styles.searchInput}
          placeholder="חפש ברשימה..."
          value={searchQuery}
          onChangeText={handleSearch}
          textAlign="right"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter & Sort Buttons */}
      <View style={styles.controls}>
        {filterOptions.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.filterBtn, filter === opt.value && styles.filterBtnActive]}
            onPress={() => handleFilter(opt.value)}
          >
            <Ionicons 
              name={opt.icon} 
              size={14} 
              color={filter === opt.value ? colors.primary : colors.textMuted} 
            />
            <Text style={[styles.filterText, filter === opt.value && styles.filterTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)}>
          <Ionicons name="swap-vertical" size={14} color={colors.primary} />
          <Text style={styles.sortText}>מיון</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Modal */}
      <Modal visible={showSort} transparent animationType="fade" onRequestClose={() => setShowSort(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSort(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>מיון לפי</Text>
            {sortOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={styles.sortOption}
                onPress={() => handleSort(opt.value)}
              >
                <Text style={[styles.sortOptionText, sortBy === opt.value && { color: colors.primary, fontWeight: '600' }]}>
                  {opt.label}
                </Text>
                {sortBy === opt.value && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  controls: {
    flexDirection: 'row-reverse',
    gap: spacing.xs,
  },
  filterBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
  },
  filterBtnActive: {
    backgroundColor: colors.primary + '15',
  },
  filterText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  sortBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.primary + '15',
    marginLeft: 'auto',
  },
  sortText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  sortOption: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortOptionText: {
    fontSize: 14,
    textAlign: 'right',
  },
});

export default ListControls;
