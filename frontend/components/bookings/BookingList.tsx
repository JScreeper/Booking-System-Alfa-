'use client';

import BookingCard from './BookingCard';
import { LoadingSkeleton, ListSkeleton } from '@/components/ui/LoadingSkeleton';
import styles from './BookingList.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

interface BookingListProps {
  appointments: Appointment[];
  onCancel?: (id: string) => void;
}

export default function BookingList({ appointments, onCancel }: BookingListProps) {
  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to cancel appointment');
      onCancel?.(id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (appointments.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No appointments found</p>
        <p className={styles.emptySubtext}>Book your first appointment to get started!</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {appointments.map((appointment) => (
        <BookingCard
          key={appointment.id}
          appointment={appointment}
          onCancel={onCancel || handleCancel}
        />
      ))}
    </div>
  );
}
