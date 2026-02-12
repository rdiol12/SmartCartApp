import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal,
  ActivityIndicator, Alert, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';
import { colors, spacing, radius } from '../theme';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'ארוחת בוקר', icon: 'sunny-outline' },
  { value: 'lunch', label: 'ארוחת צהריים', icon: 'restaurant-outline' },
  { value: 'dinner', label: 'ארוחת ערב', icon: 'moon-outline' },
  { value: 'snack', label: 'חטיף', icon: 'cafe-outline' },
];

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export default function MealPlannerScreen() {
  const [recipes, setRecipes] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);

  // Recipe form
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '1', unit: '' }]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recipesRes, plansRes] = await Promise.all([
        api.get('/api/recipes'),
        api.get('/api/meal-plans?week=' + getWeekStart()),
      ]);
      setRecipes(recipesRes.data.recipes || []);
      setMealPlans(plansRes.data.plans || []);
    } catch (err) {
      console.error('Error fetching meal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    const start = new Date(now.setDate(diff));
    return start.toISOString().split('T')[0];
  };

  const getWeekDates = () => {
    const start = new Date(getWeekStart());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date.toISOString().split('T')[0];
    });
  };

  const handleAddRecipe = async () => {
    if (!recipeName.trim()) return Alert.alert('שגיאה', 'נא להזין שם מתכון');
    const validIngredients = ingredients.filter(i => i.name.trim());
    if (validIngredients.length === 0) return Alert.alert('שגיאה', 'נא להוסיף לפחות מרכיב אחד');

    try {
      await api.post('/api/recipes', { name: recipeName.trim(), ingredients: validIngredients });
      setRecipeName('');
      setIngredients([{ name: '', quantity: '1', unit: '' }]);
      setShowAddRecipe(false);
      fetchData();
    } catch (err) {
      Alert.alert('שגיאה', 'שגיאה בשמירת המתכון');
    }
  };

  const handleAddMeal = async (recipeId) => {
    if (!selectedDay || !selectedMealType) return;
    try {
      await api.post('/api/meal-plans', {
        date: selectedDay,
        mealType: selectedMealType,
        recipeId,
      });
      setShowAddMeal(false);
      fetchData();
    } catch (err) {
      Alert.alert('שגיאה', 'שגיאה בהוספת ארוחה');
    }
  };

  const handleGenerateList = async () => {
    const recipeIds = [...new Set(mealPlans.map(p => p.recipe_id))];
    if (recipeIds.length === 0) return Alert.alert('אין מתכונים', 'הוסף ארוחות לתוכנית השבועית');

    Alert.alert(
      'צור רשימת קניות',
      'ליצור רשימת קניות מכל המתכונים בתוכנית השבועית?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'צור רשימה',
          onPress: async () => {
            try {
              await api.post('/api/meal-plans/generate-list', { recipeIds });
              Alert.alert('נוצר!', 'רשימת הקניות נוצרה בהצלחה');
            } catch (err) {
              Alert.alert('שגיאה', 'שגיאה ביצירת הרשימה');
            }
          },
        },
      ]
    );
  };

  const addIngredientRow = () => {
    setIngredients([...ingredients, { name: '', quantity: '1', unit: '' }]);
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const weekDates = getWeekDates();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>תפריט שבועי</Text>
        <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateList}>
          <Ionicons name="cart-outline" size={16} color="#fff" />
          <Text style={styles.generateBtnText}>צור רשימה</Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Calendar */}
      {weekDates.map((date, dayIndex) => {
        const dayMeals = mealPlans.filter(p => p.date?.split('T')[0] === date);
        const isToday = date === new Date().toISOString().split('T')[0];

        return (
          <View key={date} style={[styles.dayCard, isToday && styles.dayCardToday]}>
            <View style={styles.dayHeader}>
              <Text style={[styles.dayName, isToday && { color: colors.primary }]}>
                {DAYS[dayIndex]}
              </Text>
              <Text style={styles.dayDate}>{date.slice(5)}</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedDay(date);
                  setShowAddMeal(true);
                }}
              >
                <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {dayMeals.length === 0 ? (
              <Text style={styles.noMeals}>אין ארוחות מתוכננות</Text>
            ) : (
              dayMeals.map((meal) => {
                const mealInfo = MEAL_TYPES.find(m => m.value === meal.meal_type) || MEAL_TYPES[0];
                return (
                  <View key={meal.id} style={styles.mealRow}>
                    <Ionicons name={mealInfo.icon} size={16} color={colors.textMuted} />
                    <Text style={styles.mealType}>{mealInfo.label}</Text>
                    <Text style={styles.mealRecipe}>{meal.recipe_name || 'מתכון'}</Text>
                  </View>
                );
              })
            )}
          </View>
        );
      })}

      {/* Recipes Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>המתכונים שלי</Text>
        <TouchableOpacity onPress={() => setShowAddRecipe(true)}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {recipes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="restaurant-outline" size={40} color={colors.textMuted} style={{ opacity: 0.4 }} />
          <Text style={styles.emptyText}>אין מתכונים עדיין</Text>
          <TouchableOpacity style={styles.addRecipeBtn} onPress={() => setShowAddRecipe(true)}>
            <Text style={styles.addRecipeBtnText}>הוסף מתכון ראשון</Text>
          </TouchableOpacity>
        </View>
      ) : (
        recipes.map(recipe => (
          <View key={recipe.id} style={styles.recipeCard}>
            <Text style={styles.recipeName}>{recipe.name}</Text>
            <Text style={styles.recipeIngredients}>
              {(recipe.ingredients || []).map(i => i.name).join(' · ')}
            </Text>
          </View>
        ))
      )}

      {/* Add Recipe Modal */}
      <Modal visible={showAddRecipe} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddRecipe(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>מתכון חדש</Text>
              <TouchableOpacity onPress={handleAddRecipe}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.primary }}>שמור</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.label}>שם המתכון</Text>
              <TextInput
                style={styles.input}
                value={recipeName}
                onChangeText={setRecipeName}
                placeholder="לדוגמה: פסטה ברוטב עגבניות"
                textAlign="right"
              />

              <Text style={styles.label}>מרכיבים</Text>
              {ingredients.map((ing, i) => (
                <View key={i} style={styles.ingredientRow}>
                  <TextInput
                    style={[styles.input, { flex: 2 }]}
                    value={ing.name}
                    onChangeText={(v) => updateIngredient(i, 'name', v)}
                    placeholder="שם מרכיב"
                    textAlign="right"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={ing.quantity}
                    onChangeText={(v) => updateIngredient(i, 'quantity', v)}
                    placeholder="כמות"
                    keyboardType="decimal-pad"
                    textAlign="center"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={ing.unit}
                    onChangeText={(v) => updateIngredient(i, 'unit', v)}
                    placeholder="יחידה"
                    textAlign="right"
                  />
                </View>
              ))}
              <TouchableOpacity style={styles.addIngredientBtn} onPress={addIngredientRow}>
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={{ fontSize: 13, color: colors.primary }}>הוסף מרכיב</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Meal Modal */}
      <Modal visible={showAddMeal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAddMeal(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>בחר ארוחה</Text>

            <Text style={styles.label}>סוג ארוחה</Text>
            <View style={styles.mealTypeRow}>
              {MEAL_TYPES.map(mt => (
                <TouchableOpacity
                  key={mt.value}
                  style={[styles.mealTypeBtn, selectedMealType === mt.value && styles.mealTypeBtnActive]}
                  onPress={() => setSelectedMealType(mt.value)}
                >
                  <Ionicons name={mt.icon} size={18} color={selectedMealType === mt.value ? colors.primary : colors.textMuted} />
                  <Text style={[styles.mealTypeBtnText, selectedMealType === mt.value && { color: colors.primary }]}>
                    {mt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>בחר מתכון</Text>
            {recipes.length === 0 ? (
              <Text style={styles.noMeals}>אין מתכונים. הוסף מתכון קודם.</Text>
            ) : (
              recipes.map(recipe => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeOption}
                  onPress={() => handleAddMeal(recipe.id)}
                >
                  <Text style={styles.recipeOptionText}>{recipe.name}</Text>
                  <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },

  headerRow: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: { fontSize: 20, fontWeight: '700' },
  generateBtn: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  generateBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  dayCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  dayCardToday: { borderColor: colors.primary, borderWidth: 2 },
  dayHeader: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dayName: { fontSize: 14, fontWeight: '700' },
  dayDate: { fontSize: 12, color: colors.textMuted },
  noMeals: { fontSize: 12, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xs },

  mealRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs,
    paddingVertical: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border,
  },
  mealType: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  mealRecipe: { fontSize: 13, fontWeight: '500', flex: 1, textAlign: 'right' },

  sectionHeader: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    marginTop: spacing.xl, marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' },

  emptyCard: {
    alignItems: 'center', padding: spacing.xxl, backgroundColor: colors.surface,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
  },
  emptyText: { fontSize: 14, color: colors.textMuted, marginTop: spacing.md },
  addRecipeBtn: {
    marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.primary, borderRadius: radius.md,
  },
  addRecipeBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  recipeCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  recipeName: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  recipeIngredients: { fontSize: 12, color: colors.textMuted, textAlign: 'right', marginTop: 4 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },

  label: { fontSize: 13, fontWeight: '600', textAlign: 'right', marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.sm, fontSize: 14, marginBottom: spacing.xs,
  },
  ingredientRow: { flexDirection: 'row-reverse', gap: spacing.xs },
  addIngredientBtn: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4,
    paddingVertical: spacing.sm, justifyContent: 'center',
  },

  mealTypeRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.xs },
  mealTypeBtn: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: radius.sm, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
  },
  mealTypeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  mealTypeBtnText: { fontSize: 12, color: colors.textMuted },

  recipeOption: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  recipeOptionText: { fontSize: 14, fontWeight: '500' },
});
