import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button, Switch } from 'react-native-paper';
import { Type, Eye, Volume2 } from 'lucide-react-native';
import { useAccessibility } from './AccessibilityProvider';

export const AccessibilityPanel: React.FC = () => {
  const {
    fontSizeScale,
    setFontSizeScale,
    highContrast,
    setHighContrast,
    voiceGuidance,
    setVoiceGuidance,
    getScaledFontSize,
    speak,
  } = useAccessibility();

  const scales = [
    { label: 'Normal', value: 1.0 },
    { label: 'Large', value: 1.25 },
    { label: 'Very Large', value: 1.5 },
    { label: 'Maximum', value: 1.8 },
  ];

  const handleScaleChange = (scale: number) => {
    setFontSizeScale(scale);
    const selected = scales.find(s => s.value === scale);
    speak(`Text size set to ${selected?.label || 'normal'}`);
  };

  const currentThemeColor = highContrast ? '#FFFF00' : '#0D5C75';

  return (
    <Card
      style={[
        styles.panelCard,
        {
          borderColor: highContrast ? '#FFFF00' : '#E2E8F0',
          borderWidth: highContrast ? 2 : 1,
          backgroundColor: highContrast ? '#000000' : '#FFFFFF',
        },
      ]}
    >
      <Card.Content style={styles.content}>
        <Text
          variant="titleLarge"
          style={{
            fontSize: getScaledFontSize(20),
            color: highContrast ? '#FFFFFF' : '#0F172A',
            fontWeight: 'bold',
            marginBottom: 16,
          }}
        >
          Elderly Accessibility Assistant
        </Text>

        {/* Font Size Option */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Type size={24} color={currentThemeColor} />
            <Text
              style={[
                styles.sectionTitle,
                { fontSize: getScaledFontSize(16), color: highContrast ? '#FFFFFF' : '#334155' },
              ]}
            >
              Adjust Text Size
            </Text>
          </View>
          <View style={styles.buttonGroup}>
            {scales.map((s) => {
              const active = fontSizeScale === s.value;
              return (
                <TouchableOpacity
                  key={s.value}
                  onPress={() => handleScaleChange(s.value)}
                  style={[
                    styles.scaleBtn,
                    {
                      borderColor: active ? currentThemeColor : (highContrast ? '#888888' : '#CBD5E1'),
                      backgroundColor: active ? (highContrast ? '#000000' : '#E0F2FE') : 'transparent',
                      borderWidth: active ? 2.5 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: Math.round(14 * s.value),
                      fontWeight: active ? 'bold' : 'normal',
                      color: active ? (highContrast ? '#FFFF00' : '#0369A1') : (highContrast ? '#FFFFFF' : '#475569'),
                    }}
                  >
                    Aa
                  </Text>
                  <Text
                    style={[
                      styles.btnLabel,
                      {
                        fontSize: getScaledFontSize(12),
                        color: active ? (highContrast ? '#FFFF00' : '#0369A1') : (highContrast ? '#FFFFFF' : '#64748B'),
                      },
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* High Contrast Option */}
        <View style={[styles.section, styles.toggleRow]}>
          <View style={styles.toggleLabelCol}>
            <View style={styles.labelRow}>
              <Eye size={24} color={currentThemeColor} />
              <Text
                style={[
                  styles.sectionTitle,
                  { fontSize: getScaledFontSize(16), color: highContrast ? '#FFFFFF' : '#334155' },
                ]}
              >
                High Contrast Colors
              </Text>
            </View>
            <Text
              style={{
                fontSize: getScaledFontSize(13),
                color: highContrast ? '#FFFF00' : '#64748B',
                marginTop: 2,
              }}
            >
              Changes colors to high contrast yellow and black
            </Text>
          </View>
          <Switch
            value={highContrast}
            onValueChange={setHighContrast}
            color={highContrast ? '#FFFF00' : '#0D5C75'}
          />
        </View>

        {/* Voice Guidance Option */}
        <View style={[styles.section, styles.toggleRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <View style={styles.toggleLabelCol}>
            <View style={styles.labelRow}>
              <Volume2 size={24} color={currentThemeColor} />
              <Text
                style={[
                  styles.sectionTitle,
                  { fontSize: getScaledFontSize(16), color: highContrast ? '#FFFFFF' : '#334155' },
                ]}
              >
                Voice Guidance (TTS)
              </Text>
            </View>
            <Text
              style={{
                fontSize: getScaledFontSize(13),
                color: highContrast ? '#FFFF00' : '#64748B',
                marginTop: 2,
              }}
            >
              Reads aloud medicine timings, alerts and page actions
            </Text>
          </View>
          <Switch
            value={voiceGuidance}
            onValueChange={setVoiceGuidance}
            color={highContrast ? '#FFFF00' : '#0D5C75'}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  panelCard: {
    borderRadius: 16,
    marginVertical: 12,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    marginLeft: 10,
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  scaleBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 56, // Senior touch target compliance
  },
  btnLabel: {
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabelCol: {
    flex: 1,
    marginRight: 16,
  },
});
export default AccessibilityPanel;
