import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList, TextInput,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import socket from '../socket';
import { colors, spacing, radius } from '../theme';

const getTimeString = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ListChat = ({ visible, onClose, listId }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!visible || !listId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/lists/${listId}/chat`);
        setMessages(data.messages || data || []);
      } catch (err) {
        console.error('Failed to fetch chat messages:', err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const onReceiveMessage = (msg) => {
      if (String(msg.listId) === String(listId)) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('receive_chat_message', onReceiveMessage);

    return () => {
      socket.off('receive_chat_message', onReceiveMessage);
    };
  }, [visible, listId]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      listId,
      userId: user.id,
      message: newMessage.trim(),
    };

    socket.emit('send_chat_message', messageData);

    // Optimistically add the message locally
    const optimisticMsg = {
      id: `temp_${Date.now()}`,
      user_id: user.id,
      user_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      userName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      listId,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage('');
  };

  const isOwnMessage = (msg) => {
    return msg.user_id === user.id || msg.userId === user.id;
  };

  const getSenderName = (msg) => {
    return msg.user_name || msg.userName || msg.first_name || 'משתמש';
  };

  const renderMessage = ({ item }) => {
    const own = isOwnMessage(item);
    return (
      <View style={[styles.messageBubbleWrapper, own ? styles.ownWrapper : styles.otherWrapper]}>
        {!own && (
          <Text style={styles.senderName}>{getSenderName(item)}</Text>
        )}
        <View style={[styles.messageBubble, own ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, own ? styles.ownText : styles.otherText]}>
            {item.message}
          </Text>
        </View>
        <Text style={[styles.messageTime, own ? styles.ownTime : styles.otherTime]}>
          {getTimeString(item.created_at || item.timestamp || new Date())}
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeHeaderBtn}>
            <Ionicons name="arrow-forward" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>צ'אט רשימה</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Messages */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} style={{ opacity: 0.4 }} />
            <Text style={styles.emptyText}>אין הודעות עדיין</Text>
            <Text style={styles.emptySubtext}>שלח הודעה ראשונה לרשימה</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => `${item.id || index}`}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
          />
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={[styles.sendBtn, !newMessage.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!newMessage.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={newMessage.trim() ? '#fff' : colors.textMuted}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="הקלד הודעה..."
            value={newMessage}
            onChangeText={setNewMessage}
            textAlign="right"
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeHeaderBtn: {
    padding: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageBubbleWrapper: {
    marginBottom: spacing.sm,
    maxWidth: '80%',
  },
  ownWrapper: {
    alignSelf: 'flex-end',
  },
  otherWrapper: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'right',
    marginBottom: 2,
    paddingHorizontal: spacing.xs,
  },
  messageBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  ownBubble: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.xs,
  },
  otherBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomRightRadius: radius.lg,
    borderBottomLeftRadius: radius.xs,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
  },
  ownText: {
    color: '#fff',
  },
  otherText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    paddingHorizontal: spacing.xs,
  },
  ownTime: {
    textAlign: 'left',
  },
  otherTime: {
    textAlign: 'right',
  },
  inputBar: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    maxHeight: 100,
    textAlign: 'right',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.border,
  },
});

export default ListChat;
