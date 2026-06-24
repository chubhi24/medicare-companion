import { useApp } from '../context/AppContext';
import { Appointment } from '../models/Appointment';

export const useAppointments = () => {
  const {
    appointments,
    isLoading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment
  } = useApp();

  // Get upcoming appointments sorted chronologically
  const upcomingAppointments = appointments
    .filter((apt) => {
      const aptDateTime = new Date(`${apt.date}T${apt.time}`);
      return aptDateTime.getTime() > Date.now();
    })
    .sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
      return dateTimeA - dateTimeB;
    });

  return {
    appointments: [...appointments].sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
      return dateTimeB - dateTimeA; // History sorted newest first
    }),
    upcomingAppointments,
    isLoading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  };
};
