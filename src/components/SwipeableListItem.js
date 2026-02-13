import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme';

const SWIPE_THRESHOLD = 60;
const MAX_SWIPE = 80;

const SwipeableListItem = ({ children, onDelete, onCheck, isChecked }) => {
  const pan = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  const resetPosition = () => {
    isOpen.current = false;
    Animated.spring(pan, {
      toValue: 0,
      useNativeDriver: false,
      friction: 8,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      // Don't steal the touch on start — let taps pass through to children
      onStartShouldSetPanResponder: () => false,
      // Only claim the gesture when there's clear horizontal movement
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 15 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
      onPanResponderGrant: () => {
        // If open, close it first
        if (isOpen.current) {
          resetPosition();
        }
      },
      onPanResponderMove: (_, gs) => {
        if (gs.dx < 0) {
          // Swipe left (delete)
          pan.setValue(Math.max(gs.dx, -MAX_SWIPE));
        } else if (gs.dx > 0) {
          // Swipe right (check)
          pan.setValue(Math.min(gs.dx, MAX_SWIPE));
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -SWIPE_THRESHOLD) {
          // Swiped left far enough - show delete
          isOpen.current = true;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.spring(pan, {
            toValue: -MAX_SWIPE,
            useNativeDriver: false,
            friction: 8,
          }).start();
        } else if (gs.dx > SWIPE_THRESHOLD) {
          // Swiped right far enough - trigger check
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onCheck?.();
          resetPosition();
        } else {
          // Snap back
          resetPosition();
        }
      },
      onPanResponderTerminate: () => {
        // Gesture was interrupted — snap back so it doesn't get stuck
        resetPosition();
      },
    })
  ).current;

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.timing(pan, {
      toValue: -400,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      onDelete?.();
    });
  };

  return (
    <View style={styles.container}>
      {/* Right action (swipe left to reveal) - Delete */}
      <View style={styles.actionsRight}>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash" size={24} color="#fff" />
          <Text style={styles.actionText}>מחק</Text>
        </TouchableOpacity>
      </View>

      {/* Left action (swipe right to reveal) - Check */}
      <View style={styles.actionsLeft}>
        <View style={styles.checkBtn}>
          <Ionicons name={isChecked ? "close-circle" : "checkmark-circle"} size={24} color="#fff" />
          <Text style={styles.actionText}>{isChecked ? 'בטל' : 'סמן'}</Text>
        </View>
      </View>

      {/* Main content */}
      <Animated.View
        style={[styles.content, { transform: [{ translateX: pan }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  content: {
    backgroundColor: colors.surface,
    zIndex: 10,
  },
  actionsRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: MAX_SWIPE,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionsLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: MAX_SWIPE,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  deleteBtn: {
    backgroundColor: colors.danger,
    width: MAX_SWIPE,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
  },
  checkBtn: {
    backgroundColor: colors.success,
    width: MAX_SWIPE,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: radius.md,
    borderBottomRightRadius: radius.md,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default SwipeableListItem;
