'use client';

import styles from './BookingCard.module.css';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  service: {
    id: string;
    name: string;
    duration: number;
    price?: number;
  };
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface BookingCardProps {
  appointment: Appointment;
  onCancel: (id: string) => void;
}

export default function BookingCard({ appointment, onCancel }: BookingCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '#059669';
      case 'PENDING':
        return '#f59e0b';
      case 'CANCELLED':
        return '#dc2626';
      case 'COMPLETED':
        return '#6366f1';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.serviceName}>{appointment.service.name}</h3>
        <span
          className={styles.status}
          style={{ color: getStatusColor(appointment.status) }}
        >
          {appointment.status}
        </span>
      </div>

      <div className={styles.details}>
        <div className={styles.detail}>
          <span className={styles.label}>Date:</span>
          <span className={styles.value}>{formatDate(appointment.startTime)}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>Time:</span>
          <span className={styles.value}>
            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
          </span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>Duration:</span>
          <span className={styles.value}>{appointment.service.duration} min</span>
        </div>
        {appointment.service.price && (
          <div className={styles.detail}>
            <span className={styles.label}>Price:</span>
            <span className={styles.value}>
              ${appointment.service.price.toFixed(2)}
            </span>
          </div>
        )}
        {appointment.notes && (
          <div className={styles.notes}>
            <span className={styles.label}>Notes:</span>
            <span className={styles.value}>{appointment.notes}</span>
          </div>
        )}
      </div>

      {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
        <button
          onClick={() => onCancel(appointment.id)}
          className={styles.cancelButton}
        >
          Cancel Appointment
        </button>
      )}
    </div>
  );
}
