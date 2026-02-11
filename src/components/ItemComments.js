import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import socket from '../socket';
import { colors, spacing, radius } from '../theme';

const ItemComments = ({ itemId, listId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await api.get(`/api/lists/${listId}/items/${itemId}/comments`);
        setComments(data.comments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();

    // Listen for new comments
    const handleNewComment = (data) => {
      if (data.itemId === itemId) {
        setComments((prev) => [...prev, data.comment]);
      }
    };

    socket.on('receive_comment', handleNewComment);
    return () => socket.off('receive_comment', handleNewComment);
  }, [itemId, listId]);

  const handleSubmit = () => {
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    socket.emit('add_comment', {
      itemId,
      listId,
      userId: user.id,
      comment: newComment.trim(),
    });

    setNewComment('');
    setSubmitting(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Comments List */}
      {comments.length > 0 ? (
        <FlatList
          data={comments}
          keyExtractor={(item, index) => `${item.id || index}`}
          style={styles.commentsList}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{item.first_name || 'User'}</Text>
                <Text style={styles.commentTime}>
                  {new Date(item.created_at).toLocaleDateString('he-IL', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={styles.commentText}>{item.comment}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>אין תגובות עדיין</Text>
      )}

      {/* Add Comment */}
      <View style={styles.addCommentContainer}>
        <TextInput
          style={styles.input}
          placeholder="הוסף תגובה..."
          value={newComment}
          onChangeText={setNewComment}
          textAlign="right"
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !newComment.trim() && styles.sendBtnDisabled]}
          onPress={handleSubmit}
          disabled={!newComment.trim() || submitting}
        >
          <Ionicons name="send" size={18} color={newComment.trim() ? colors.primary : colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { maxHeight: 300 },
  loadingContainer: { padding: spacing.md, alignItems: 'center' },
  commentsList: { maxHeight: 200, marginBottom: spacing.sm },
  commentItem: {
    backgroundColor: colors.bg,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  commentHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: { fontSize: 12, fontWeight: '600', color: colors.text },
  commentTime: { fontSize: 10, color: colors.textMuted },
  commentText: {
    fontSize: 13,
    color: colors.text,
    textAlign: 'right',
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  addCommentContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 13,
    maxHeight: 80,
  },
  sendBtn: { padding: spacing.sm },
  sendBtnDisabled: { opacity: 0.5 },
});

export default ItemComments;
