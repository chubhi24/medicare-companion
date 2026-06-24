import { useApp } from '../context/AppContext';
import { Medicine } from '../models/Medicine';
import { AdherenceLog, AdherenceStatus } from '../models/AdherenceLog';

export interface ScheduleSlot {
  id: string; // composite: medId_time
  medicine: Medicine;
  scheduleTime: string; // HH:MM
  status: AdherenceStatus | 'pending';
  log?: AdherenceLog;
}

export const useAdherence = () => {
  const {
    medicines,
    logs,
    isLoading,
    error,
    logAdherence,
    userProfile
  } = useApp();

  // Get medication schedule for a specific date (YYYY-MM-DD)
  const getScheduleForDate = (dateStr: string): ScheduleSlot[] => {
    const slots: ScheduleSlot[] = [];
    const targetDate = new Date(dateStr);
    
    medicines.forEach((med) => {
      // Check if date is within range
      const start = new Date(med.startDate);
      const end = new Date(med.endDate);
      
      // Zero out times for date comparison
      const startD = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
      const endD = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
      const targetD = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
      
      if (targetD < startD || targetD > endD) return;

      // Handle weekly schedule (matches day of week of start date)
      if (med.frequency === 'Weekly' && start.getDay() !== targetDate.getDay()) {
        return;
      }

      // Create a slot for each reminder time
      med.reminderTimes.forEach((time) => {
        // Find if there is a logged status for this date & time
        const log = logs.find(
          (l) => l.medicineId === med.id && l.date === dateStr && l.scheduleTime === time
        );

        let status: AdherenceStatus | 'pending' = 'pending';
        if (log) {
          status = log.status;
        } else {
          // If no log and time is past 30 mins, it is missed
          const now = new Date();
          const isToday = now.toISOString().split('T')[0] === dateStr;
          
          if (isToday) {
            const [hourStr, minStr] = time.split(':');
            const scheduledDateTime = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              parseInt(hourStr),
              parseInt(minStr)
            );
            
            const thirtyMins = 30 * 60 * 1000;
            if (now.getTime() - scheduledDateTime.getTime() > thirtyMins) {
              status = 'missed';
            }
          } else if (new Date().getTime() > targetDate.getTime()) {
            // Past date overall
            status = 'missed';
          }
        }

        slots.push({
          id: `${med.id}_${time}`,
          medicine: med,
          scheduleTime: time,
          status,
          log,
        });
      });
    });

    // Sort slots by schedule time
    return slots.sort((a, b) => a.scheduleTime.localeCompare(b.scheduleTime));
  };

  const getTodaySchedule = (): ScheduleSlot[] => {
    const todayStr = new Date().toISOString().split('T')[0];
    return getScheduleForDate(todayStr);
  };

  // Calculations for Today's Stats
  const todaySlots = getTodaySchedule();
  const todayTaken = todaySlots.filter((s) => s.status === 'taken').length;
  const todayTotal = todaySlots.length;
  const todayMissed = todaySlots.filter((s) => s.status === 'missed').length;
  const todaySkipped = todaySlots.filter((s) => s.status === 'skipped').length;
  
  const completionPercentage = todayTotal > 0 
    ? Math.round((todayTaken / todayTotal) * 100) 
    : 100;

  // Generate Weekly Compliance Metrics (last 7 days)
  const getWeeklyReport = () => {
    const reportData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      
      const slots = getScheduleForDate(dateStr);
      const taken = slots.filter((s) => s.status === 'taken').length;
      const total = slots.length;
      
      const compliance = total > 0 ? Math.round((taken / total) * 100) : 100;
      
      reportData.push({
        day: dayName,
        date: dateStr,
        taken,
        total,
        percentage: compliance,
      });
    }
    return reportData;
  };

  // Generate Monthly Stats (Taken vs Missed vs Skipped)
  const getMonthlyReport = () => {
    const last30DaysLogs = logs.filter((log) => {
      const thirtyDaysAgo = Date.now() - 30 * 86400000;
      return log.timestamp >= thirtyDaysAgo;
    });

    const taken = last30DaysLogs.filter((l) => l.status === 'taken').length;
    const skipped = last30DaysLogs.filter((l) => l.status === 'skipped').length;
    const missed = last30DaysLogs.filter((l) => l.status === 'missed').length;

    const total = taken + skipped + missed;

    return {
      taken,
      skipped,
      missed,
      total,
      takenRate: total > 0 ? Math.round((taken / total) * 100) : 100,
    };
  };

  return {
    getScheduleForDate,
    getTodaySchedule,
    todaySlots,
    todayTaken,
    todayTotal,
    todayMissed,
    todaySkipped,
    completionPercentage,
    streak: userProfile?.dailyStreak || 0,
    getWeeklyReport,
    getMonthlyReport,
    logAdherence,
    logs,
    isLoading,
    error,
  };
};
