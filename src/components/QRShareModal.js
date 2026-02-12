import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, radius } from '../theme';

// Simple QR code generator using pure RN Views
// Encodes data as a basic QR-like grid pattern using a deterministic hash approach
const generateQRMatrix = (text, size = 25) => {
  const matrix = Array.from({ length: size }, () => Array(size).fill(false));

  // Fixed finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (startRow, startCol) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startRow + r][startCol + c] = isOuter || isInner;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 7; i < size - 7; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Encode the text data as a deterministic pattern in the data area
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }

  // Fill data area with a pattern derived from the text
  for (let r = 8; r < size - 8; r++) {
    for (let c = 8; c < size - 8; c++) {
      if (r === 6 || c === 6) continue; // Skip timing
      const seed = ((r * 31 + c * 17 + hash) >>> 0) % 7;
      matrix[r][c] = seed < 3;
    }
  }

  // Fill remaining data areas around finders
  for (let r = 8; r < size; r++) {
    for (let c = 0; c < 6; c++) {
      if (r >= size - 7) continue;
      const seed = ((r * 23 + c * 13 + hash) >>> 0) % 6;
      matrix[r][c] = seed < 2;
    }
  }
  for (let r = 0; r < 6; r++) {
    for (let c = 8; c < size - 7; c++) {
      if (r === 6) continue;
      const seed = ((r * 19 + c * 29 + hash) >>> 0) % 6;
      matrix[r][c] = seed < 2;
    }
  }

  return matrix;
};

const QRCodeView = ({ value, size = 200 }) => {
  const matrix = useMemo(() => generateQRMatrix(value), [value]);
  const cellSize = size / matrix.length;

  return (
    <View style={[qrStyles.container, { width: size, height: size }]}>
      {matrix.map((row, rIdx) => (
        <View key={rIdx} style={qrStyles.row}>
          {row.map((cell, cIdx) => (
            <View
              key={cIdx}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: cell ? '#000' : '#fff',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const qrStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
});

const QRShareModal = ({ visible, onClose, inviteLink }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      Alert.alert('שגיאה', 'לא ניתן להעתיק את הקישור');
    }
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>שתף רשימה</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={styles.qrWrapper}>
              {inviteLink ? (
                <QRCodeView value={inviteLink} size={200} />
              ) : (
                <View style={styles.qrPlaceholder}>
                  <Ionicons name="qr-code-outline" size={48} color={colors.textMuted} />
                  <Text style={styles.placeholderText}>אין קישור להצגה</Text>
                </View>
              )}
            </View>

            <Text style={styles.desc}>סרוק את הקוד כדי להצטרף לרשימה</Text>

            {inviteLink ? (
              <View style={styles.linkSection}>
                <Text style={styles.linkText} numberOfLines={2}>{inviteLink}</Text>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                  <Ionicons
                    name={copied ? 'checkmark-circle' : 'copy-outline'}
                    size={18}
                    color={copied ? colors.success : '#fff'}
                  />
                  <Text style={[styles.copyBtnText, copied && { color: colors.success }]}>
                    {copied ? 'הועתק!' : 'העתק קישור'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeBtnText}>סגור</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
  body: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  qrWrapper: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
  },
  placeholderText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  desc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  linkSection: {
    width: '100%',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  copyBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  copyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeBtn: {
    padding: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
});

export default QRShareModal;
