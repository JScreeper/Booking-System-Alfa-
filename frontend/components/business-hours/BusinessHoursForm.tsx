'use client';

import { useState } from 'react';
import styles from './BusinessHoursForm.module.css';

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

interface BusinessHoursFormProps {
  onSuccess: () => void;
}

export default function BusinessHoursForm({ onSuccess }: BusinessHoursFormProps) {
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    openTime: '09:00',
    closeTime: '17:00',
    isOpen: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/business-hours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save');
      }

      onSuccess();
      setFormData({ dayOfWeek: 1, openTime: '09:00', closeTime: '17:00', isOpen: true });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="dayOfWeek" className={styles.label}>
            Day
          </label>
          <select
            id="dayOfWeek"
            value={formData.dayOfWeek}
            onChange={(e) =>
              setFormData({ ...formData, dayOfWeek: Number(e.target.value) })
            }
            className={styles.select}
            required
          >
            {DAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.isOpen}
              onChange={(e) =>
                setFormData({ ...formData, isOpen: e.target.checked })
              }
              className={styles.checkbox}
            />
            Open
          </label>
        </div>
      </div>

      {formData.isOpen && (
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="openTime" className={styles.label}>
              Open Time
            </label>
            <input
              id="openTime"
              type="time"
              value={formData.openTime}
              onChange={(e) =>
                setFormData({ ...formData, openTime: e.target.value })
              }
              className={styles.input}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="closeTime" className={styles.label}>
              Close Time
            </label>
            <input
              id="closeTime"
              type="time"
              value={formData.closeTime}
              onChange={(e) =>
                setFormData({ ...formData, closeTime: e.target.value })
              }
              className={styles.input}
              required
            />
          </div>
        </div>
      )}

      <button type="submit" disabled={loading} className={styles.button}>
        {loading ? 'Saving...' : 'Save Hours'}
      </button>
    </form>
  );
}
