'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import styles from './AdminStats.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Stats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiFetch('/appointments?admin=true');

      if (!response.ok) {
        if (response.status === 401) {
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch');
      }
      const appointments = await response.json();

      const statsData: Stats = {
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter(
          (a: any) => a.status === 'PENDING',
        ).length,
        confirmedAppointments: appointments.filter(
          (a: any) => a.status === 'CONFIRMED',
        ).length,
        cancelledAppointments: appointments.filter(
          (a: any) => a.status === 'CANCELLED',
        ).length,
        completedAppointments: appointments.filter(
          (a: any) => a.status === 'COMPLETED',
        ).length,
        totalRevenue: appointments
          .filter((a: any) => a.status === 'CONFIRMED' || a.status === 'COMPLETED')
          .reduce((sum: number, a: any) => sum + (a.service?.price || 0), 0),
      };

      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading statistics...</div>;
  }

  if (!stats) {
    return <div className={styles.error}>Failed to load statistics</div>;
  }

  return (
    <div className={styles.grid}>
      <div className={styles.statCard}>
        <div className={styles.statIcon}>📅</div>
        <div className={styles.statContent}>
          <h3 className={styles.statLabel}>Total Appointments</h3>
          <p className={styles.statValue}>{stats.totalAppointments}</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>⏳</div>
        <div className={styles.statContent}>
          <h3 className={styles.statLabel}>Pending</h3>
          <p className={styles.statValue}>{stats.pendingAppointments}</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>✅</div>
        <div className={styles.statContent}>
          <h3 className={styles.statLabel}>Confirmed</h3>
          <p className={styles.statValue}>{stats.confirmedAppointments}</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>❌</div>
        <div className={styles.statContent}>
          <h3 className={styles.statLabel}>Cancelled</h3>
          <p className={styles.statValue}>{stats.cancelledAppointments}</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>✔️</div>
        <div className={styles.statContent}>
          <h3 className={styles.statLabel}>Completed</h3>
          <p className={styles.statValue}>{stats.completedAppointments}</p>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.revenueCard}`}>
        <div className={styles.statIcon}>💰</div>
        <div className={styles.statContent}>
          <h3 className={styles.statLabel}>Total Revenue</h3>
          <p className={styles.statValue}>${stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
