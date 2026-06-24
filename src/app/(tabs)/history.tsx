import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useAdherence } from '../../hooks/useAdherence';
import { useAccessibility } from '../../components/AccessibilityProvider';
import { BarChart3, Share2, CircleDot, Volume2 } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { AdherenceLog } from '../../models/AdherenceLog';

export default function HistoryScreen() {
  const { getWeeklyReport, getMonthlyReport, logs } = useAdherence();
  const { getScaledFontSize: scaleFont, speak: accSpeak, triggerHaptic, highContrast } = useAccessibility();

  const weeklyData = getWeeklyReport();
  const monthlyStats = getMonthlyReport();

  // Speaks the report summary
  const speakReportSummary = () => {
    triggerHaptic(40);
    let speech = `Medication Adherence Report. `;
    speech += `Over the last 7 days, your daily compliance rates were: `;
    weeklyData.forEach(d => {
      speech += `${d.day}, ${d.percentage} percent. `;
    });
    speech += `In the last 30 days, you had ${monthlyStats.total} total doses. `;
    speech += `You took ${monthlyStats.taken} doses, which is an adherence rate of ${monthlyStats.takenRate} percent. `;
    speech += `You skipped ${monthlyStats.skipped} doses, and missed ${monthlyStats.missed} doses. `;
    accSpeak(speech);
  };

  // Generate CSV and share report
  const handleShareReport = async () => {
    triggerHaptic(60);
    accSpeak("Generating and opening sharing report.");

    try {
      // Build CSV content
      let csvContent = 'Date,Medicine Name,Dosage,Scheduled Time,Status,Timestamp\n';
      logs.forEach((log: AdherenceLog) => {
        const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        csvContent += `"${log.date}","${log.medicineName}","${log.dosage}","${log.scheduleTime}","${log.status}","${timeStr}"\n`;
      });

      // Write file locally
      const fileName = `${(FileSystem as any).documentDirectory}MediCare_Adherence_Report.csv`;
      await (FileSystem as any).writeAsStringAsync(fileName, csvContent, { encoding: (FileSystem as any).EncodingType.UTF8 });

      // Check if sharing is available
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileName);
      } else {
        alert("Sharing is not supported on this platform.");
      }
    } catch (e: any) {
      alert("Could not generate report: " + e.message);
    }
  };

  const primaryColor = highContrast ? '#FFFF00' : '#0D5C75';
  const takenColor = highContrast ? '#00FF00' : '#2E7D32';
  const skippedColor = highContrast ? '#888888' : '#64748B';
  const missedColor = highContrast ? '#FF3333' : '#C62828';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text
            variant="headlineMedium"
            style={{
              fontSize: scaleFont(26),
              fontWeight: 'bold',
              color: highContrast ? '#FFFFFF' : '#0F172A',
            }}
          >
            Adherence Reports
          </Text>
          <Text style={{ fontSize: scaleFont(14), color: highContrast ? '#FFFF00' : '#64748B', marginTop: 2 }}>
            Track compliance and export doctor records
          </Text>
        </View>

        <TouchableOpacity 
          onPress={speakReportSummary}
          style={[styles.audioBtn, { borderColor: primaryColor, borderWidth: highContrast ? 2 : 1 }]}
          accessibilityLabel="Read report summary aloud"
        >
          <Volume2 size={24} color={primaryColor} />
          <Text style={{ fontSize: scaleFont(13), color: primaryColor, fontWeight: 'bold', marginLeft: 4 }}>Read Report</Text>
        </TouchableOpacity>
      </View>

      {/* 7-Day Compliance Chart */}
      <View style={styles.sectionContainer}>
        <Card style={[styles.reportCard, { backgroundColor: highContrast ? '#000000' : '#FFFFFF', borderColor: highContrast ? '#FFFF00' : '#E2E8F0', borderWidth: highContrast ? 2 : 0 }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <BarChart3 size={24} color={primaryColor} />
              <Text style={[styles.cardTitle, { fontSize: scaleFont(18), color: highContrast ? '#FFFFFF' : '#1E293B', fontWeight: 'bold' }]}>
                Last 7 Days Progress
              </Text>
            </View>

            {/* Custom Bar Chart using Flexboxes */}
            <View style={styles.barChartContainer}>
              {weeklyData.map((d, index) => (
                <View key={index} style={styles.chartCol}>
                  {/* Bar wrapper */}
                  <View style={styles.barTrack}>
                    <View 
                      style={[
                        styles.barFill, 
                        { 
                          height: `${d.percentage}%`,
                          backgroundColor: d.percentage >= 80 ? takenColor : (d.percentage >= 40 ? '#F59E0B' : missedColor),
                        }
                      ]} 
                    />
                  </View>
                  {/* Percent label */}
                  <Text style={[styles.chartPercentLabel, { fontSize: scaleFont(11), color: highContrast ? '#FFFF00' : '#475569', fontWeight: 'bold' }]}>
                    {d.percentage}%
                  </Text>
                  {/* Day label */}
                  <Text style={[styles.chartDayLabel, { fontSize: scaleFont(13), color: highContrast ? '#FFFFFF' : '#64748B', fontWeight: 'bold' }]}>
                    {d.day}
                  </Text>
                </View>
              ))}
            </View>

          </Card.Content>
        </Card>
      </View>

      {/* 30-Day Adherence Stats */}
      <View style={styles.sectionContainer}>
        <Card style={[styles.reportCard, { backgroundColor: highContrast ? '#000000' : '#FFFFFF', borderColor: highContrast ? '#FFFF00' : '#E2E8F0', borderWidth: highContrast ? 2 : 0 }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <CircleDot size={24} color={primaryColor} />
              <Text style={[styles.cardTitle, { fontSize: scaleFont(18), color: highContrast ? '#FFFFFF' : '#1E293B', fontWeight: 'bold' }]}>
                Last 30 Days Adherence
              </Text>
            </View>

            {/* Compliance summary stats */}
            <View style={styles.statsSummaryRow}>
              <View style={styles.summaryValueCol}>
                <Text style={[styles.summaryPercentValue, { fontSize: scaleFont(32), color: takenColor, fontWeight: 'bold' }]}>
                  {monthlyStats.takenRate}%
                </Text>
                <Text style={{ fontSize: scaleFont(14), color: highContrast ? '#FFFFFF' : '#64748B' }}>Adherence Rate</Text>
              </View>
              <View style={styles.summaryMetaCol}>
                <Text style={{ fontSize: scaleFont(15), color: highContrast ? '#FFFFFF' : '#475569', fontWeight: '500' }}>
                  Total scheduled: <Text style={{ fontWeight: 'bold', color: primaryColor }}>{monthlyStats.total}</Text>
                </Text>
                <Text style={{ fontSize: scaleFont(15), color: highContrast ? '#FFFFFF' : '#475569', fontWeight: '500', marginTop: 4 }}>
                  Doses taken: <Text style={{ fontWeight: 'bold', color: takenColor }}>{monthlyStats.taken}</Text>
                </Text>
              </View>
            </View>

            {/* Segmented Adherence Progress Bar */}
            <View style={styles.segmentBarWrapper}>
              <View style={[styles.segment, { flex: Math.max(1, monthlyStats.taken), backgroundColor: takenColor }]} />
              <View style={[styles.segment, { flex: Math.max(1, monthlyStats.skipped), backgroundColor: skippedColor }]} />
              <View style={[styles.segment, { flex: Math.max(1, monthlyStats.missed), backgroundColor: missedColor }]} />
            </View>

            {/* Legends */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: takenColor }]} />
                <Text style={{ fontSize: scaleFont(14), color: highContrast ? '#FFFFFF' : '#475569', fontWeight: 'bold' }}>
                  Taken ({monthlyStats.taken})
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: skippedColor }]} />
                <Text style={{ fontSize: scaleFont(14), color: highContrast ? '#FFFFFF' : '#475569', fontWeight: 'bold' }}>
                  Skipped ({monthlyStats.skipped})
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: missedColor }]} />
                <Text style={{ fontSize: scaleFont(14), color: highContrast ? '#FFFFFF' : '#475569', fontWeight: 'bold' }}>
                  Missed ({monthlyStats.missed})
                </Text>
              </View>
            </View>

          </Card.Content>
        </Card>
      </View>

      {/* Share report button */}
      <View style={styles.shareBtnContainer}>
        <Button
          mode="contained"
          onPress={handleShareReport}
          style={[styles.shareBtn, highContrast && { borderWidth: 2, borderColor: '#00FF00' }]}
          buttonColor={highContrast ? '#FFFF00' : '#0D5C75'}
          textColor={highContrast ? '#000000' : '#FFFFFF'}
          contentStyle={{ height: 60 }}
          labelStyle={{ fontSize: scaleFont(16), fontWeight: 'bold' }}
          icon={() => <Share2 size={22} color={highContrast ? '#000000' : '#FFFFFF'} />}
        >
          Share Report with Family or Doctor
        </Button>
      </View>

      {/* Activity Logs History Feed */}
      <View style={styles.feedHeaderContainer}>
        <Text variant="titleMedium" style={{ fontSize: scaleFont(20), fontWeight: 'bold', color: highContrast ? '#FFFFFF' : '#0F172A' }}>
          Recent Activity Timeline
        </Text>
      </View>

      <View style={styles.feedContainer}>
        {logs.length === 0 ? (
          <Card style={{ borderRadius: 16, padding: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: scaleFont(15), color: '#64748B' }}>No intake logs recorded yet.</Text>
          </Card>
        ) : (
          [...logs]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 15) // Show last 15 actions
            .map((log) => {
              const dateObj = new Date(log.timestamp);
              const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateString = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
              
              let statusText = 'Taken';
              let statusCol = takenColor;
              if (log.status === 'skipped') { statusText = 'Skipped'; statusCol = skippedColor; }
              if (log.status === 'missed') { statusText = 'Missed'; statusCol = missedColor; }
              if (log.status === 'snoozed') { statusText = 'Snoozed'; statusCol = '#E65100'; }

              return (
                <View key={log.id} style={[styles.timelineCard, { borderLeftColor: statusCol, backgroundColor: highContrast ? '#000000' : '#FFFFFF', borderColor: highContrast ? '#FFFF00' : '#E2E8F0', borderWidth: highContrast ? 1 : 0 }]}>
                  <View style={styles.timelineMain}>
                    <Text style={{ fontSize: scaleFont(16), fontWeight: 'bold', color: highContrast ? '#FFFFFF' : '#0F172A' }}>
                      {log.medicineName}
                    </Text>
                    <Text style={{ fontSize: scaleFont(14), color: highContrast ? '#FFFF00' : '#64748B', marginTop: 2 }}>
                      {log.dosage} • Scheduled: {log.scheduleTime}
                    </Text>
                  </View>
                  <View style={styles.timelineMeta}>
                    <Text style={[styles.timelineStatus, { color: statusCol, fontSize: scaleFont(14) }]}>
                      {statusText}
                    </Text>
                    <Text style={{ fontSize: scaleFont(12), color: highContrast ? '#FFFFFF' : '#94A3B8', marginTop: 2 }}>
                      {dateString} at {timeString}
                    </Text>
                  </View>
                </View>
              );
            })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reportCard: {
    borderRadius: 24,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    marginLeft: 10,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 16,
    paddingBottom: 8,
  },
  chartCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 100,
    width: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  chartPercentLabel: {
    marginTop: 6,
  },
  chartDayLabel: {
    marginTop: 4,
  },
  statsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 24,
  },
  summaryValueCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryPercentValue: {
    lineHeight: 38,
  },
  summaryMetaCol: {
    flex: 1,
  },
  segmentBarWrapper: {
    height: 16,
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  segment: {
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  shareBtnContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  shareBtn: {
    borderRadius: 16,
    elevation: 2,
  },
  feedHeaderContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  feedContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  timelineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  timelineMain: {
    flex: 1,
    paddingRight: 12,
  },
  timelineMeta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timelineStatus: {
    fontWeight: 'bold',
  },
});
