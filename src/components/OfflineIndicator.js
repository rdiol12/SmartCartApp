import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { getQueue, processQueue } from '../utils/offlineQueue';
import socket from '../socket';

const OfflineIndicator = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const wasDisconnected = useRef(false);

  // Poll the queue count while offline
  useEffect(() => {
    let interval = null;

    const refreshQueueCount = async () => {
      const queue = await getQueue();
      setQueueCount(queue.length);
    };

    if (!isConnected) {
      refreshQueueCount();
      interval = setInterval(refreshQueueCount, 2000);
    } else {
      // Reset count when back online (queue will be cleared by processQueue)
      setQueueCount(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const connected = state.isConnected && state.isInternetReachable !== false;
      setIsConnected(connected);

      if (!connected) {
        wasDisconnected.current = true;
        // Slide down
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }).start();
      } else {
        // Connection restored - replay queued operations
        if (wasDisconnected.current) {
          wasDisconnected.current = false;
          await processQueue(socket);
          setQueueCount(0);
        }

        // Slide up after a delay
        setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: -60,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 2000);
      }
    });

    return () => unsubscribe();
  }, []);

  const offlineText = queueCount > 0
    ? `אין חיבור לאינטרנט · ${queueCount} פעולות ממתינות`
    : 'אין חיבור לאינטרנט';

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Ionicons
        name={isConnected ? "cloud-done" : "cloud-offline"}
        size={16}
        color="#fff"
      />
      <Text style={styles.text}>
        {isConnected ? 'חזרה לאינטרנט' : offlineText}
      </Text>
      {!isConnected && queueCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{queueCount}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.warning,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    zIndex: 1000,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.danger,
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginStart: spacing.xs,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default OfflineIndicator;
