'use client';

import { useState, useEffect } from 'react';
import styles from './CalendarView.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  service: {
    name: string;
  };
  user?: {
    firstName: string;
    lastName: string;
  };
}

interface CalendarViewProps {
  appointments: Appointment[];
  onDateSelect?: (date: Date) => void;
}

export default function CalendarView({ appointments, onDateSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
  };

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyDay} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayAppointments = getAppointmentsForDate(date);
      const isToday = 
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();
      const isSelected = selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      days.push(
        <div
          key={day}
          className={`${styles.day} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
          onClick={() => handleDateClick(day)}
        >
          <span className={styles.dayNumber}>{day}</span>
          {dayAppointments.length > 0 && (
            <div className={styles.appointmentIndicator}>
              <span className={styles.appointmentCount}>{dayAppointments.length}</span>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button onClick={goToPreviousMonth} className={styles.navButton}>
          ←
        </button>
        <h2 className={styles.monthYear}>
          {monthNames[month]} {year}
        </h2>
        <button onClick={goToNextMonth} className={styles.navButton}>
          →
        </button>
      </div>
      <button onClick={goToToday} className={styles.todayButton}>
        Today
      </button>
      <div className={styles.weekdays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>
      <div className={styles.daysGrid}>
        {renderCalendarDays()}
      </div>
      {selectedDate && (
        <div className={styles.selectedDateInfo}>
          <h3>Appointments for {selectedDate.toLocaleDateString()}</h3>
          <div className={styles.appointmentsList}>
            {getAppointmentsForDate(selectedDate).length === 0 ? (
              <p className={styles.noAppointments}>No appointments on this date</p>
            ) : (
              getAppointmentsForDate(selectedDate).map((apt) => (
                <div key={apt.id} className={styles.appointmentItem}>
                  <span className={styles.time}>
                    {new Date(apt.startTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className={styles.serviceName}>{apt.service.name}</span>
                  <span className={`${styles.status} ${styles[apt.status.toLowerCase()]}`}>
                    {apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
