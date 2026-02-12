import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import socket from '../socket';
import ItemComments from './ItemComments';
import { colors, spacing, radius } from '../theme';
import { getCategoryIcon, getCategoryColor } from '../utils/categories';
import SwipeableListItem from './SwipeableListItem';

const ListItemRow = ({ item, listId, shoppingMode = false, multiSelectMode = false, isSelected = false, onSelect }) => {
  const { user } = useContext(AuthContext);
  const [showComments, setShowComments] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(item.note || '');
  const [qty, setQty] = useState(item.quantity || 1);
  const lastTapRef = useRef(0);

  // Fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    setQty(item.quantity || 1);
  }, [item.quantity]);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    socket.emit('toggle_item', { itemId: item.id, listId, isChecked: !item.is_checked });
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    socket.emit('delete_item', { itemId: item.id, listId });
  };

  const handleMarkPaid = () => {
    if (item.paid_by) {
      socket.emit('unmark_paid', { itemId: item.id, listId });
    } else {
      socket.emit('mark_paid', { itemId: item.id, listId, userId: user.id });
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleMarkPaid();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const handleQuantityChange = (delta) => {
    const newQty = Math.max(1, qty + delta);
    setQty(newQty);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    socket.emit('update_quantity', { itemId: item.id, listId, quantity: newQty });
  };

  const handleSaveNote = () => {
    if (noteText !== item.note) {
      socket.emit('update_note', { itemId: item.id, listId, note: noteText.trim() });
    }
    setEditingNote(false);
  };

  const handleCancelNote = () => {
    setNoteText(item.note || '');
    setEditingNote(false);
  };

  const isPaid = !!item.paid_by;
  const isChecked = item.is_checked;

  // Inline quantity stepper
  const QuantityStepper = () => (
    <View style={styles.qtyStepper}>
      <TouchableOpacity onPress={() => handleQuantityChange(-1)} style={styles.qtyBtn}>
        <Ionicons name="remove" size={14} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.qtyValue}>{qty}</Text>
      <TouchableOpacity onPress={() => handleQuantityChange(1)} style={styles.qtyBtn}>
        <Ionicons name="add" size={14} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  // In multi-select mode, show checkbox for selection
  if (multiSelectMode) {
    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <TouchableOpacity
          onPress={() => onSelect?.(item.id)}
          style={[
            styles.row,
            isSelected && styles.rowSelected,
          ]}
        >
          <View style={styles.content}>
            <View style={styles.checkbox}>
              <Ionicons
                name={isSelected ? 'checkbox' : 'square-outline'}
                size={24}
                color={isSelected ? colors.primary : colors.textMuted}
              />
            </View>
            <View style={styles.info}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(item.itemname)}</Text>
              <Text style={styles.name}>{item.itemname}</Text>
              {qty > 1 && (
                <View style={styles.badgeMuted}>
                  <Text style={styles.badgeMutedText}>x{qty}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // In shopping mode — double-tap to mark paid
  if (shoppingMode) {
    return (
      <SwipeableListItem onDelete={handleDelete} onCheck={handleToggle} isChecked={isChecked}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity
          onPress={handleToggle}
          onLongPress={handleDoubleTap}
          delayLongPress={0}
          style={[
            styles.row,
            styles.shoppingModeRow,
            isPaid && styles.rowPaid,
            isChecked && !isPaid && styles.rowChecked,
          ]}
        >
        <View style={styles.content}>
          <Ionicons
            name={isChecked ? 'checkbox' : 'square-outline'}
            size={32}
            color={isChecked ? colors.success : colors.textMuted}
            style={{ marginLeft: spacing.md }}
          />
          <View style={styles.info}>
            <Text style={[
              styles.name,
              styles.shoppingModeName,
              (isChecked || isPaid) && styles.nameStrikethrough,
            ]}>
              {item.itemname}
            </Text>
            <View style={styles.metaRow}>
              {qty > 1 && (
                <Text style={styles.metaText}>כמות: {qty}</Text>
              )}
              {item.price && (
                <Text style={[styles.metaText, { fontWeight: '600' }]}>
                  ₪{Number(item.price).toFixed(2)}
                </Text>
              )}
              {isPaid && (
                <Text style={[styles.metaText, { color: colors.success }]}>שולם</Text>
              )}
            </View>
          </View>
          {/* Mark paid button in shopping mode */}
          <TouchableOpacity onPress={handleMarkPaid} style={[styles.paidBtn, isPaid && styles.paidBtnActive]}>
            <Ionicons name="cash-outline" size={20} color={isPaid ? colors.success : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
        </Animated.View>
      </SwipeableListItem>
    );
  }

  return (
    <SwipeableListItem onDelete={handleDelete} onCheck={handleToggle} isChecked={isChecked}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDoubleTap}
          style={[
            styles.row,
            isPaid && styles.rowPaid,
            isChecked && !isPaid && styles.rowChecked,
          ]}
        >
      <View style={styles.content}>
        {/* Checkbox */}
        <TouchableOpacity onPress={handleToggle} style={styles.checkbox}>
          <Ionicons
            name={isChecked ? 'checkbox' : 'square-outline'}
            size={22}
            color={isChecked ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>

        {/* Item info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.categoryIcon}>{getCategoryIcon(item.itemname)}</Text>
            <Text style={[
              styles.name,
              (isChecked || isPaid) && styles.nameStrikethrough,
            ]}>
              {item.itemname}
            </Text>
            {item.price && (
              <View style={styles.badgePrice}>
                <Text style={styles.badgePriceText}>
                  ₪{Number(item.price).toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          {/* Quantity stepper */}
          <View style={styles.metaRow}>
            <QuantityStepper />
            {item.added_by_name && (
              <Text style={styles.metaText}>
                {item.added_by_name}
              </Text>
            )}
            {isPaid && (
              <Text style={[styles.metaText, { color: colors.success, fontWeight: '600' }]}>
                שולם ע"י {item.paid_by_name}
              </Text>
            )}
            {item.storename && (
              <Text style={styles.metaText}>{item.storename}</Text>
            )}
          </View>

          {editingNote ? (
            <View style={styles.noteEditor}>
              <TextInput
                style={styles.noteInput}
                value={noteText}
                onChangeText={setNoteText}
                placeholder="הוסף הערה..."
                textAlign="right"
                multiline
                autoFocus
              />
              <View style={styles.noteActions}>
                <TouchableOpacity onPress={handleSaveNote} style={styles.noteSaveBtn}>
                  <Text style={styles.noteSaveBtnText}>שמור</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancelNote}>
                  <Text style={styles.noteCancelText}>ביטול</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : item.note ? (
            <TouchableOpacity onPress={() => setEditingNote(true)}>
              <Text style={styles.note}>{item.note}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setEditingNote(true)}>
              <Text style={styles.addNoteBtn}>+ הוסף הערה</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => setShowComments(!showComments)} style={styles.iconBtn}>
            <Ionicons name="chatbubble-outline" size={18} color={showComments ? colors.primary : colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMarkPaid} style={[styles.iconBtn, isPaid && styles.iconBtnActive]}>
            <Ionicons name="cash-outline" size={18} color={isPaid ? colors.success : colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments Section */}
      {showComments && (
        <View style={styles.commentsSection}>
          <ItemComments itemId={item.id} listId={listId} />
        </View>
      )}
    </TouchableOpacity>
      </Animated.View>
    </SwipeableListItem>
  );
};

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  rowPaid: { backgroundColor: '#f0fdf4', borderColor: colors.success + '30' },
  rowChecked: { opacity: 0.7 },
  rowSelected: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  content: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  checkbox: { padding: 2 },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  name: { fontSize: 14, fontWeight: '600', textAlign: 'right' },
  nameStrikethrough: { textDecorationLine: 'line-through', color: colors.textMuted },
  badgeMuted: { backgroundColor: colors.border, paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.full },
  badgeMutedText: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  badgePrice: { backgroundColor: colors.primary + '15', paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.full },
  badgePriceText: { fontSize: 10, color: colors.primary, fontWeight: '600' },
  metaRow: { flexDirection: 'row-reverse', gap: spacing.sm, marginTop: 4, alignItems: 'center' },
  metaText: { fontSize: 11, color: colors.textMuted },
  note: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', textAlign: 'right', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6, borderRadius: radius.sm },
  iconBtnActive: { backgroundColor: colors.success + '15' },
  // Quantity stepper
  qtyStepper: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: colors.bg, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 2 },
  qtyBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  qtyValue: { fontSize: 12, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  // Paid button in shopping mode
  paidBtn: { padding: spacing.sm, borderRadius: radius.sm },
  paidBtnActive: { backgroundColor: colors.success + '15' },
  // Note
  noteEditor: { marginTop: spacing.sm },
  noteInput: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: 12,
    maxHeight: 80,
    textAlign: 'right',
  },
  noteActions: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  noteSaveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  noteSaveBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  noteCancelText: { fontSize: 12, color: colors.textMuted, paddingVertical: spacing.xs },
  addNoteBtn: {
    fontSize: 11,
    color: colors.primary,
    textAlign: 'right',
    marginTop: 4,
    fontStyle: 'italic',
  },
  commentsSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  shoppingModeRow: {
    paddingVertical: spacing.md,
    minHeight: 65,
  },
  shoppingModeName: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
});

export default ListItemRow;
