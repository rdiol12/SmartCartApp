import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, Share, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import SwipeDownModal from './SwipeDownModal';
import { colors, spacing, radius } from '../theme';

const InviteLinkModal = ({ visible, onClose, listId }) => {
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/api/lists/${listId}/invite`);
      setInviteLink(data.inviteLink);
    } catch (err) {
      Alert.alert('שגיאה', err.response?.data?.message || 'שגיאה ביצירת הקישור');
    } finally {
      setLoading(false);
    }
  };

  const shareLink = async () => {
    try {
      await Share.share({ message: inviteLink });
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = () => {
    setInviteLink('');
    onClose();
  };

  return (
    <SwipeDownModal visible={visible} onClose={handleClose}>
      <View style={styles.header}>
        <Text style={styles.title}>הזמנה לרשימה</Text>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {!inviteLink ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
            <Ionicons name="link-outline" size={48} color={colors.textMuted} style={{ opacity: 0.4, marginBottom: spacing.md }} />
            <Text style={styles.desc}>צור לינק הזמנה כדי להזמין חברים לרשימה</Text>
            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={generateLink} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnText}>צור לינק הזמנה</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.shareLabel}>שתף את הלינק הזה עם חברים:</Text>
            <TextInput style={styles.linkInput} value={inviteLink} editable={false} selectTextOnFocus />
            <TouchableOpacity style={styles.btn} onPress={shareLink}>
              <Ionicons name="share-outline" size={18} color="#fff" />
              <Text style={styles.btnText}> שתף</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
        <Text style={styles.closeBtnText}>סגור</Text>
      </TouchableOpacity>
    </SwipeDownModal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: 16, fontWeight: '700' },
  body: { padding: spacing.lg },
  desc: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
  btn: {
    backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  shareLabel: { fontSize: 14, fontWeight: '600', textAlign: 'right', marginBottom: spacing.sm },
  linkInput: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    padding: spacing.sm, fontSize: 13, marginBottom: spacing.md, textAlign: 'left',
  },
  closeBtn: { padding: spacing.md, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border },
  closeBtnText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
});

export default InviteLinkModal;
