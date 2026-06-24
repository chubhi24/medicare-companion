import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { 
  Pill, 
  Droplet, 
  Syringe, 
  Clock, 
  AlertTriangle, 
  Check, 
  X, 
  AlertCircle,
  Volume2
} from 'lucide-react-native';
import { Medicine } from '../models/Medicine';
import { useAccessibility } from './AccessibilityProvider';

interface MedicineCardProps {
  medicine: Medicine;
  scheduleTime?: string; // HH:MM if displaying daily dashboard slot
  status?: 'taken' | 'skipped' | 'missed' | 'pending' | 'snoozed';
  onTaken?: () => void;
  onSkip?: () => void;
  onSnooze?: () => void;
  onPressCard?: () => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  scheduleTime,
  status = 'pending',
  onTaken,
  onSkip,
  onSnooze,
  onPressCard,
}) => {
  const { getScaledFontSize, highContrast, speak, triggerHaptic } = useAccessibility();

  // Determine icon based on type
  const getIcon = () => {
    const size = 32;
    const color = highContrast ? '#FFFF00' : '#0D5C75';
    switch (medicine.type) {
      case 'Tablet':
        return <Pill size={size} color={color} />;
      case 'Capsule':
        return <Pill size={size} color={color} style={{ transform: [{ rotate: '45deg' }] }} />;
      case 'Syrup':
        return <Droplet size={size} color={color} />;
      case 'Injection':
        return <Syringe size={size} color={color} />;
      default:
        return <Pill size={size} color={color} />;
    }
  };

  const isLowStock = medicine.quantity <= medicine.refillThreshold;

  // Build accessibility state description
  const speakMedicineInfo = () => {
    triggerHaptic(30);
    let details = `${medicine.name}. Dosage is ${medicine.dosage}.`;
    if (scheduleTime) {
      details += ` Scheduled for ${scheduleTime}.`;
    }
    if (medicine.notes) {
      details += ` Note: ${medicine.notes}.`;
    }
    if (isLowStock) {
      details += ` Warning: Low stock! Only ${medicine.quantity} left.`;
    }
    details += ` Status is ${status}.`;
    speak(details);
  };

  // Border styling based on high contrast and status
  const getBorderColor = () => {
    if (highContrast) {
      if (status === 'taken') return '#00FF00';
      if (status === 'skipped') return '#888888';
      if (status === 'missed') return '#FF3333';
      return '#FFFF00';
    }
    
    if (status === 'taken') return '#C8E6C9';
    if (status === 'skipped') return '#E2E8F0';
    if (status === 'missed') return '#FFCDD2';
    if (isLowStock) return '#FFE0B2';
    return '#E2E8F0';
  };

  const getBackgroundColor = () => {
    if (highContrast) return '#000000';
    
    if (status === 'taken') return '#F4FBF4';
    if (status === 'skipped') return '#F8FAFC';
    if (status === 'missed') return '#FFF8F8';
    return '#FFFFFF';
  };

  return (
    <Card
      style={[
        styles.card,
        {
          borderColor: getBorderColor(),
          backgroundColor: getBackgroundColor(),
          borderWidth: highContrast ? 2 : 1,
        },
      ]}
      onPress={onPressCard}
    >
      <Card.Content style={styles.cardContent}>
        {/* Top Info section */}
        <View style={styles.mainRow}>
          <View style={styles.iconContainer}>{getIcon()}</View>
          <View style={styles.detailsContainer}>
            <View style={styles.titleRow}>
              <Text
                variant="titleMedium"
                style={[
                  styles.nameText,
                  {
                    fontSize: getScaledFontSize(18),
                    color: highContrast ? '#FFFFFF' : '#0F172A',
                    fontWeight: 'bold',
                  },
                ]}
              >
                {medicine.name}
              </Text>
              
              <TouchableOpacity 
                onPress={speakMedicineInfo} 
                style={styles.speakerButton}
                accessibilityLabel="Hear details aloud"
              >
                <Volume2 size={24} color={highContrast ? '#FFFF00' : '#475569'} />
              </TouchableOpacity>
            </View>

            <Text
              variant="bodyMedium"
              style={{
                fontSize: getScaledFontSize(15),
                color: highContrast ? '#FFFF00' : '#475569',
                marginTop: 2,
                fontWeight: '600'
              }}
            >
              Dosage: {medicine.dosage} ({medicine.type})
            </Text>

            {scheduleTime && (
              <View style={styles.metaRow}>
                <Clock size={16} color={highContrast ? '#FFFF00' : '#64748B'} />
                <Text
                  variant="bodySmall"
                  style={[
                    styles.metaText,
                    {
                      fontSize: getScaledFontSize(14),
                      color: highContrast ? '#FFFF00' : '#64748B',
                      fontWeight: 'bold'
                    },
                  ]}
                >
                  Time: {scheduleTime}
                </Text>
              </View>
            )}

            {!scheduleTime && (
              <View style={styles.metaRow}>
                <Clock size={16} color={highContrast ? '#FFFF00' : '#64748B'} />
                <Text
                  variant="bodySmall"
                  style={[
                    styles.metaText,
                    {
                      fontSize: getScaledFontSize(14),
                      color: highContrast ? '#FFFF00' : '#64748B',
                    },
                  ]}
                >
                  Frequency: {medicine.frequency}
                </Text>
              </View>
            )}

            {medicine.notes && (
              <Text
                variant="bodySmall"
                style={[
                  styles.notesText,
                  {
                    fontSize: getScaledFontSize(13),
                    color: highContrast ? '#FFFFFF' : '#64748B',
                    fontStyle: 'italic',
                  },
                ]}
              >
                Note: {medicine.notes}
              </Text>
            )}

            {/* Low Stock Indicator */}
            {isLowStock && (
              <View style={[styles.refillRow, { backgroundColor: highContrast ? '#000000' : '#FFF3E0', borderColor: highContrast ? '#FF3333' : 'transparent', borderWidth: highContrast ? 1 : 0 }]}>
                <AlertTriangle size={18} color={highContrast ? '#FF3333' : '#E65100'} />
                <Text
                  variant="bodySmall"
                  style={[
                    styles.refillText,
                    {
                      fontSize: getScaledFontSize(13),
                      color: highContrast ? '#FF3333' : '#E65100',
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  Low stock: {medicine.quantity} left (threshold: {medicine.refillThreshold})
                </Text>
              </View>
            )}

            {/* Status indicators */}
            {status !== 'pending' && (
              <View style={styles.statusBadgeRow}>
                {status === 'taken' && (
                  <View style={[styles.badge, styles.takenBadge, highContrast && styles.hcBadge]}>
                    <Check size={14} color="#1B5E20" />
                    <Text style={styles.badgeTextTaken}>Taken</Text>
                  </View>
                )}
                {status === 'skipped' && (
                  <View style={[styles.badge, styles.skippedBadge, highContrast && styles.hcBadge]}>
                    <X size={14} color="#60646C" />
                    <Text style={styles.badgeTextSkipped}>Skipped</Text>
                  </View>
                )}
                {status === 'missed' && (
                  <View style={[styles.badge, styles.missedBadge, highContrast && styles.hcBadge]}>
                    <AlertCircle size={14} color="#B71C1C" />
                    <Text style={styles.badgeTextMissed}>Missed</Text>
                  </View>
                )}
                {status === 'snoozed' && (
                  <View style={[styles.badge, styles.snoozedBadge, highContrast && styles.hcBadge]}>
                    <Clock size={14} color="#E65100" />
                    <Text style={styles.badgeTextSnoozed}>Snoozed (10m)</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons: Only show if pending/snoozed and triggers are available */}
        {(status === 'pending' || status === 'snoozed') && (onTaken || onSkip || onSnooze) && (
          <View style={styles.actionRow}>
            {onSkip && (
              <Button
                mode="outlined"
                onPress={onSkip}
                style={[styles.actionButton, styles.skipBtn, highContrast && styles.hcActionBtn]}
                labelStyle={{ fontSize: getScaledFontSize(14), fontWeight: 'bold' }}
                contentStyle={styles.btnContent}
                textColor={highContrast ? '#FFFFFF' : '#475569'}
              >
                Skip
              </Button>
            )}
            {onSnooze && (
              <Button
                mode="outlined"
                onPress={onSnooze}
                style={[styles.actionButton, styles.snoozeBtn, highContrast && styles.hcActionBtn]}
                labelStyle={{ fontSize: getScaledFontSize(14), fontWeight: 'bold' }}
                contentStyle={styles.btnContent}
                textColor={highContrast ? '#FFFF00' : '#E65100'}
              >
                Snooze
              </Button>
            )}
            {onTaken && (
              <Button
                mode="contained"
                onPress={onTaken}
                style={[styles.actionButton, styles.takenBtn, highContrast && styles.hcActionBtnTaken]}
                labelStyle={{ fontSize: getScaledFontSize(15), fontWeight: 'bold' }}
                contentStyle={styles.btnContent}
                buttonColor={highContrast ? '#00FF00' : '#2E7D32'}
                textColor={highContrast ? '#000000' : '#FFFFFF'}
              >
                Take
              </Button>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardContent: {
    padding: 16,
  },
  mainRow: {
    flexDirection: 'row',
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  detailsContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    flex: 1,
    flexWrap: 'wrap',
  },
  speakerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  notesText: {
    marginTop: 6,
    lineHeight: 18,
  },
  refillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
  },
  refillText: {
    marginLeft: 6,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  takenBadge: {
    backgroundColor: '#E8F5E9',
  },
  skippedBadge: {
    backgroundColor: '#F1F5F9',
  },
  missedBadge: {
    backgroundColor: '#FFEBEE',
  },
  snoozedBadge: {
    backgroundColor: '#FFE0B2',
  },
  hcBadge: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeTextTaken: {
    color: '#1B5E20',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  badgeTextSkipped: {
    color: '#475569',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  badgeTextMissed: {
    color: '#C62828',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  badgeTextSnoozed: {
    color: '#E65100',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  btnContent: {
    height: 56, // Accessible height for elderly finger tapping!
  },
  skipBtn: {
    borderColor: '#94A3B8',
  },
  snoozeBtn: {
    borderColor: '#EF6C00',
  },
  takenBtn: {
    elevation: 2,
  },
  hcActionBtn: {
    borderColor: '#FFFF00',
    borderWidth: 2,
    backgroundColor: '#000000',
  },
  hcActionBtnTaken: {
    borderWidth: 2,
    borderColor: '#00FF00',
  },
});
export default MedicineCard;
