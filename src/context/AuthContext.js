import React, { createContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setAccessToken } from '../api';
import socket from '../socket';
import { registerForPushNotifications, savePushToken, removePushToken } from '../utils/pushNotifications';
import * as Notifications from 'expo-notifications';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLinkedChild, setIsLinkedChild] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedRefresh = await AsyncStorage.getItem('refreshToken');
        if (!storedRefresh) {
          setLoading(false);
          return;
        }

        const res = await api.post('/api/refresh', { refreshToken: storedRefresh });
        const token = res.data.accessToken;
        setAccessToken(token);

        if (res.data.refreshToken) {
          await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
        }

        const userRes = await api.get('/api/me');
        setUser(userRes.data.user);
      } catch (err) {
        console.log('No active session');
        await AsyncStorage.removeItem('refreshToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Derive isLinkedChild and manage socket connection when user changes
  useEffect(() => {
    if (user) {
      setIsLinkedChild(!!user.parent_id);
      if (!socket.connected) socket.connect();
      socket.emit('register_user', user.id);

      // Register for push notifications
      (async () => {
        const token = await registerForPushNotifications();
        if (token) await savePushToken(token);
      })();

      // Listen for incoming notifications
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        // Notification received while app is in foreground
      });

      // Listen for notification taps
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        // Could navigate to specific screen based on data.type
      });
    } else {
      setIsLinkedChild(false);
      if (socket.connected) socket.disconnect();
    }

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

  const login = async (loginId, password) => {
    const isEmail = loginId.includes('@');
    const body = isEmail
      ? { email: loginId, password }
      : { username: loginId, password };

    const res = await api.post('/api/login', body);
    setAccessToken(res.data.accessToken);

    if (res.data.refreshToken) {
      await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
    }

    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await removePushToken();
      await api.post('/api/logout');
    } catch (e) {
      // ignore
    }
    await AsyncStorage.removeItem('refreshToken');
    setAccessToken(null);
    setUser(null);
  };

  const logoutAll = async () => {
    try {
      await api.post('/api/logout-all');
    } catch (e) {
      // ignore
    }
    await AsyncStorage.removeItem('refreshToken');
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, isLinkedChild, login, logout, logoutAll }}
    >
      {children}
    </AuthContext.Provider>
  );
};
