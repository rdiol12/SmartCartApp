import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { colors, spacing } from '../theme';

const VoiceInput = ({ onResult }) => {
  const [listening, setListening] = useState(false);

  const handleVoiceInput = async () => {
    // Note: Expo doesn't have built-in speech recognition (Speech-to-Text)
    // This would require expo-av with Google Speech API or similar
    // For now, show a helpful message
    
    Alert.alert(
      'קלט קולי',
      'תכונת קלט קולי דורשת API נוסף (Google Speech-to-Text).\n\nלהטמעה מלאה יש להוסיף:\n- Google Cloud Speech-to-Text API\n- expo-av לקלט אודיו\n\nהתכונה מוכנה לשילוב עתידי!',
      [{ text: 'הבנתי', style: 'default' }]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.button, listening && styles.buttonActive]}
      onPress={handleVoiceInput}
    >
      <Ionicons
        name={listening ? "mic" : "mic-outline"}
        size={20}
        color={listening ? '#fff' : colors.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  buttonActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
});

export default VoiceInput;
