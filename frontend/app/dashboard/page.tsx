'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import BookingList from '@/components/bookings/BookingList';
import CalendarView from '@/components/bookings/CalendarView';
import { useToast } from '@/components/ui/ToastContainer';
import { LoadingSkeleton, ListSkeleton } from '@/components/ui/LoadingSkeleton';
import styles from './dashboard.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        showToast('Please login to view appointments', 'error');
        return;
      }

      const response = await fetch(`${API_URL}/appointments`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          showToast('Session expired. Please login again', 'error');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('storage-update'));
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch appointments');
      }
      
      const data = await response.json();
      setAppointments(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = 
      apt.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.welcome}>
              Welcome back, {user?.firstName}! 👋
            </p>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div>
              <h3 className={styles.statTitle}>Total Appointments</h3>
              <p className={styles.statValue}>{appointments.length}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div>
              <h3 className={styles.statTitle}>Pending</h3>
              <p className={styles.statValue}>
                {appointments.filter((a) => a.status === 'PENDING').length}
              </p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div>
              <h3 className={styles.statTitle}>Confirmed</h3>
              <p className={styles.statValue}>
                {appointments.filter((a) => a.status === 'CONFIRMED').length}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.viewToggle}>
            <button
              onClick={() => setView('list')}
              className={`${styles.toggleButton} ${view === 'list' ? styles.active : ''}`}
            >
              📋 List
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`${styles.toggleButton} ${view === 'calendar' ? styles.active : ''}`}
            >
              📅 Calendar
            </button>
          </div>

          {view === 'list' && (
            <div className={styles.filters}>
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        <div className={styles.content}>
          {loading ? (
            <ListSkeleton count={3} />
          ) : view === 'calendar' ? (
            <CalendarView appointments={appointments} />
          ) : (
            <BookingList appointments={filteredAppointments} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
