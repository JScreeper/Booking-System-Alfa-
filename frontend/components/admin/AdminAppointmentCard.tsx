'use client';

import { useState } from 'react';
import styles from './AdminAppointmentCard.module.css';

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
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface AdminAppointmentCardProps {
  appointment: Appointment;
  onStatusChange: (id: string, status: string) => void;
}

export default function AdminAppointmentCard({
  appointment,
  onStatusChange,
}: AdminAppointmentCardProps) {
  const [changingStatus, setChangingStatus] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  const handleStatusChange = async (newStatus: string) => {
    if (changingStatus) return;
    setChangingStatus(true);
    await onStatusChange(appointment.id, newStatus);
    setChangingStatus(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.serviceName}>{appointment.service.name}</h3>
          <p className={styles.userName}>
            {appointment.user.firstName} {appointment.user.lastName}
          </p>
          <p className={styles.userEmail}>{appointment.user.email}</p>
        </div>
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

      <div className={styles.actions}>
        {appointment.status === 'PENDING' && (
          <>
            <button
              onClick={() => handleStatusChange('CONFIRMED')}
              disabled={changingStatus}
              className={`${styles.actionButton} ${styles.confirmButton}`}
            >
              {changingStatus ? 'Updating...' : 'Confirm'}
            </button>
            <button
              onClick={() => handleStatusChange('CANCELLED')}
              disabled={changingStatus}
              className={`${styles.actionButton} ${styles.cancelButton}`}
            >
              Cancel
            </button>
          </>
        )}
        {appointment.status === 'CONFIRMED' && (
          <button
            onClick={() => handleStatusChange('COMPLETED')}
            disabled={changingStatus}
            className={`${styles.actionButton} ${styles.completeButton}`}
          >
            {changingStatus ? 'Updating...' : 'Mark Complete'}
          </button>
        )}
      </div>
    </div>
  );
}
