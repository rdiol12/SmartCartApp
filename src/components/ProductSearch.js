import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import api from '../api';
import { colors, spacing, radius } from '../theme';

const ProductSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/search', { params: { q: query } });
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="חפש מוצר..."
        value={query}
        onChangeText={setQuery}
        textAlign="right"
        autoFocus
      />
      {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.sm }} />}
      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          style={styles.results}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => onSelect(item)}>
              <Text style={styles.resultName}>{item.name}</Text>
              {item.manufacturer && (
                <Text style={styles.resultMeta}>({item.manufacturer})</Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.sm, padding: spacing.sm, fontSize: 14,
  },
  results: { maxHeight: 200, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, marginTop: 4 },
  resultItem: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm,
    padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface,
  },
  resultName: { fontSize: 13, fontWeight: '500', textAlign: 'right' },
  resultMeta: { fontSize: 11, color: colors.textMuted },
});

export default ProductSearch;
