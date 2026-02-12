import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, Dimensions, ScrollView, FlatList,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { colors, spacing, radius } from '../theme';

const { width } = Dimensions.get('window');

const ReceiptScanner = ({ visible, onClose, onItemsFound }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);
  const [parsedItems, setParsedItems] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const cameraRef = useRef(null);

  useEffect(() => {
    if (visible && (!permission || !permission.granted)) {
      requestPermission();
    }
    if (!visible) {
      setParsedItems(null);
      setSelectedItems(new Set());
      setProcessing(false);
    }
  }, [visible]);

  const takePhoto = async () => {
    if (!cameraRef.current || processing) return;
    setProcessing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
        exif: false,
      });

      const { data } = await api.post('/api/receipt/scan', {
        image: photo.base64,
      });

      if (data.items && data.items.length > 0) {
        setParsedItems(data.items);
        // Select all items by default
        setSelectedItems(new Set(data.items.map((_, i) => i)));
      } else {
        Alert.alert('לא זוהו פריטים', 'לא הצלחנו לזהות פריטים בקבלה. נסה לצלם שוב.', [
          { text: 'נסה שוב', onPress: () => setProcessing(false) },
          { text: 'ביטול', onPress: onClose },
        ]);
      }
    } catch (err) {
      console.error('Receipt scan error:', err);
      Alert.alert('שגיאה', 'שגיאה בעיבוד הקבלה', [
        { text: 'נסה שוב', onPress: () => setProcessing(false) },
        { text: 'ביטול', onPress: onClose },
      ]);
    } finally {
      setProcessing(false);
    }
  };

  const toggleItem = (index) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleAddItems = () => {
    const items = parsedItems.filter((_, i) => selectedItems.has(i));
    if (items.length > 0) {
      onItemsFound(items);
    }
    onClose();
  };

  const handleClose = () => {
    setParsedItems(null);
    setSelectedItems(new Set());
    setProcessing(false);
    onClose();
  };

  if (!visible) return null;

  // Permission states
  if (!permission) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.container}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>מבקש הרשאת מצלמה...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.container}>
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-outline" size={64} color={colors.textMuted} />
            <Text style={styles.permissionTitle}>נדרשת הרשאת מצלמה</Text>
            <Text style={styles.permissionText}>אנא אפשר גישה למצלמה לסריקת קבלות</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Text style={styles.closeBtnText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Results view - show parsed items
  if (parsedItems) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.resultsTitle}>פריטים שזוהו</Text>
            <TouchableOpacity onPress={handleAddItems}>
              <Text style={styles.addBtnText}>הוסף ({selectedItems.size})</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={parsedItems}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={{ padding: spacing.md }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[styles.itemRow, selectedItems.has(index) && styles.itemRowSelected]}
                onPress={() => toggleItem(index)}
              >
                <Ionicons
                  name={selectedItems.has(index) ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={selectedItems.has(index) ? colors.primary : colors.textMuted}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.quantity > 1 && (
                    <Text style={styles.itemMeta}>כמות: {item.quantity}</Text>
                  )}
                </View>
                {item.price > 0 && (
                  <Text style={styles.itemPrice}>₪{Number(item.price).toFixed(2)}</Text>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>לא זוהו פריטים</Text>
            }
          />

          <View style={styles.resultsFooter}>
            <Text style={styles.totalText}>
              סה"כ: ₪{parsedItems
                .filter((_, i) => selectedItems.has(i))
                .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
                .toFixed(2)}
            </Text>
            <TouchableOpacity style={styles.addAllBtn} onPress={handleAddItems}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.addAllBtnText}>הוסף לרשימה</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Camera view
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.scannerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>סריקת קבלה</Text>
          <View style={{ width: 28 }} />
        </View>

        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="back"
        />

        {/* Receipt outline overlay */}
        <View style={styles.overlay}>
          <View style={styles.receiptArea}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <Text style={styles.instructionsText}>
            {processing ? 'מעבד קבלה...' : 'מקם את הקבלה במרכז המסגרת'}
          </Text>

          {processing ? (
            <ActivityIndicator size="large" color="#fff" style={{ marginTop: spacing.lg }} />
          ) : (
            <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const cornerStyle = {
  position: 'absolute',
  width: 30,
  height: 30,
  borderColor: '#fff',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    marginHorizontal: spacing.xl,
  },
  permissionTitle: { fontSize: 18, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  permissionText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  closeBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  closeBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Scanner
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptArea: {
    width: width * 0.8,
    height: width * 1.2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'transparent',
  },
  cornerTL: { ...cornerStyle, top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { ...cornerStyle, top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { ...cornerStyle, bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { ...cornerStyle, bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3 },

  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: spacing.xxl,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingTop: spacing.lg,
  },
  instructionsText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  captureBtn: {
    marginTop: spacing.lg,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  captureBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },

  // Results
  resultsContainer: { flex: 1, backgroundColor: colors.bg },
  resultsHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultsTitle: { fontSize: 17, fontWeight: '700' },
  addBtnText: { fontSize: 15, fontWeight: '600', color: colors.primary },

  itemRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', textAlign: 'right' },
  itemMeta: { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: colors.primary },
  emptyText: { textAlign: 'center', color: colors.textMuted, padding: spacing.xl },

  resultsFooter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalText: { fontSize: 16, fontWeight: '700' },
  addAllBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  addAllBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

export default ReceiptScanner;
