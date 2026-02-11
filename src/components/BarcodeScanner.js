import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { colors, spacing, radius } from '../theme';

const { width } = Dimensions.get('window');

const BarcodeScanner = ({ visible, onClose, onProductFound }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && !permission) {
      requestPermission();
    }
  }, [visible]);

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      const { data: result } = await api.get(`/api/items/barcode/${data}`);

      if (result.item) {
        onProductFound({
          item_name: result.item.name,
          item_id: result.item.id,
          price: result.prices?.[0]?.price || null,
          chain_name: result.prices?.[0]?.chain_name || null,
        });
        onClose();
      } else {
        Alert.alert('לא נמצא', 'המוצר לא נמצא במאגר', [
          {
            text: 'סרוק שוב',
            onPress: () => {
              setScanned(false);
              setLoading(false);
            },
          },
          { text: 'ביטול', onPress: onClose },
        ]);
      }
    } catch (err) {
      Alert.alert('שגיאה', 'שגיאה בחיפוש המוצר', [
        {
          text: 'נסה שוב',
          onPress: () => {
            setScanned(false);
            setLoading(false);
          },
        },
        { text: 'ביטול', onPress: onClose },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setScanned(false);
    setLoading(false);
    onClose();
  };

  if (!visible) return null;

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
            <Text style={styles.permissionText}>
              אנא אפשר גישה למצלמה בהגדרות המכשיר
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Text style={styles.closeBtnText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.scannerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>סרוק ברקוד</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Scanner */}
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93'],
          }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            {loading
              ? 'מחפש מוצר...'
              : scanned
              ? 'נסרק!'
              : 'מקם את הברקוד במרכז המסגרת'}
          </Text>
        </View>
      </View>
    </Modal>
  );
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
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  permissionText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  closeBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
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
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: width * 0.7,
    height: width * 0.5,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: radius.md,
    backgroundColor: 'transparent',
  },
  instructions: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
});

export default BarcodeScanner;
