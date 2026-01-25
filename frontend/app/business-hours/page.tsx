'use client';

import { useEffect, useState } from 'react';
import BusinessHoursForm from '@/components/business-hours/BusinessHoursForm';
import { useAuth } from '@/hooks/useAuth';
import styles from './business-hours.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function BusinessHoursPage() {
  const { user, isAuthenticated } = useAuth();
  const [hours, setHours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHours();
    }
  }, [isAuthenticated]);

  const fetchHours = async () => {
    try {
      const response = await fetch(`${API_URL}/business-hours`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setHours(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.message}>Please login to view business hours</div>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Business Hours</h1>

      {isAdmin && (
        <div className={styles.adminSection}>
          <BusinessHoursForm onSuccess={fetchHours} />
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.grid}>
          {DAYS.map((day) => {
            const dayHours = hours.find((h) => h.dayOfWeek === day.value);
            return (
              <div key={day.value} className={styles.card}>
                <h3 className={styles.dayName}>{day.label}</h3>
                {dayHours && dayHours.isOpen ? (
                  <div className={styles.hours}>
                    <span>{dayHours.openTime}</span>
                    <span> - </span>
                    <span>{dayHours.closeTime}</span>
                  </div>
                ) : (
                  <div className={styles.closed}>Closed</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
