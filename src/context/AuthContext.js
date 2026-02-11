import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setAccessToken } from '../api';
import socket from '../socket';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLinkedChild, setIsLinkedChild] = useState(false);

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
    } else {
      setIsLinkedChild(false);
      if (socket.connected) socket.disconnect();
    }
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
