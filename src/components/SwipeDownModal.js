import React, { useRef } from 'react';
import {
  View, Modal, StyleSheet, Animated, PanResponder,
  Dimensions, TouchableWithoutFeedback,
} from 'react-native';
import { colors, spacing, radius } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 50;

const SwipeDownModal = ({ visible, onClose, children, maxHeight = '85%', centered = false }) => {
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        gs.dy > 8 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) translateY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > DISMISS_THRESHOLD || gs.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            translateY.setValue(0);
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, centered && styles.overlayCentered]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                centered ? styles.modalCentered : styles.modal,
                !centered && { maxHeight },
                { transform: [{ translateY }] },
              ]}
            >
              {/* Only the handle area responds to drag gestures */}
              <View {...panResponder.panHandlers} style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>
              {children}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  overlayCentered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  modalCentered: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    width: '92%',
    maxHeight: '85%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  handle: {
    width: 56,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
});

export default SwipeDownModal;
