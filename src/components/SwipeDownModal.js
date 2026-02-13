import React, { useRef, useCallback } from 'react';
import {
  View, Modal, StyleSheet, Animated, PanResponder,
  Dimensions, TouchableOpacity, Platform,
} from 'react-native';
import { colors, spacing, radius } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 50;

const SwipeDownModal = ({ visible, onClose, children, maxHeight = '85%', fullScreen = false }) => {
  const translateY = useRef(new Animated.Value(0)).current;

  const dismiss = useCallback(() => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      translateY.setValue(0);
    });
  }, [onClose, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) translateY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > DISMISS_THRESHOLD || gs.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            translateY.setValue(0);
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }).start();
      },
    })
  ).current;

  if (!visible) return null;

  const modalStyle = fullScreen
    ? [styles.modalFullScreen, { transform: [{ translateY }] }]
    : [styles.modal, { maxHeight }, { transform: [{ translateY }] }];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop — tap to close */}
        {!fullScreen && (
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={dismiss}
          />
        )}

        {/* Modal */}
        <Animated.View style={modalStyle}>
          {/* Drag handle — only this area has panResponder */}
          <View {...panResponder.panHandlers} style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  modalFullScreen: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: Platform.OS === 'ios' ? 50 : 30,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  handle: {
    width: 56,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
});

export default SwipeDownModal;
