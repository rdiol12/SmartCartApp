import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme';

const SwipeableListItem = ({ children, onDelete, onCheck, isChecked }) => {
  const pan = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) => {
        // Only allow swipe left (negative dx)
        if (gestureState.dx < 0) {
          pan.setValue(Math.max(gestureState.dx, -150));
        } else if (gestureState.dx > 0) {
          pan.setValue(Math.min(gestureState.dx, 150));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -80) {
          // Swiped left far enough - show delete
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.spring(pan, {
            toValue: -150,
            useNativeDriver: false,
          }).start();
        } else if (gestureState.dx > 80) {
          // Swiped right far enough - trigger check
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onCheck?.();
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        } else {
          // Snap back
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
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
    width: 150,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionsLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 150,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  deleteBtn: {
    backgroundColor: colors.danger,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
  },
  checkBtn: {
    backgroundColor: colors.success,
    width: 80,
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
