'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminAppointmentsList from '@/components/admin/AdminAppointmentsList';
import AdminStats from '@/components/admin/AdminStats';
import AdminUsersList from '@/components/admin/AdminUsersList';
import AdminServicesList from '@/components/admin/AdminServicesList';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import CalendarView from '@/components/bookings/CalendarView';
import { useToast } from '@/components/ui/ToastContainer';
import { apiFetch } from '@/utils/api';
import styles from './admin.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type TabType = 'overview' | 'analytics' | 'appointments' | 'users' | 'services' | 'calendar';

export default function AdminPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'calendar' || activeTab === 'overview') {
      fetchAppointments();
    }
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      const response = await apiFetch('/appointments?admin=true');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch');
      }
      const data = await response.json();
      setAppointments(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load appointments', 'error');
    }
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>Manage your booking system</p>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
          >
            📈 Analytics
          </button>
          <button
            onClick={() => {
              setActiveTab('appointments');
              fetchAppointments();
            }}
            className={`${styles.tab} ${activeTab === 'appointments' ? styles.active : ''}`}
          >
            📅 Appointments
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`${styles.tab} ${activeTab === 'calendar' ? styles.active : ''}`}
          >
            📆 Calendar
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`${styles.tab} ${activeTab === 'services' ? styles.active : ''}`}
          >
            🛎️ Services
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'overview' && (
            <>
              <AdminStats />
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Recent Appointments</h2>
                <AdminAppointmentsList limit={5} />
              </div>
            </>
          )}

          {activeTab === 'analytics' && (
            <div className={styles.section}>
              <AnalyticsDashboard />
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>All Appointments</h2>
              <AdminAppointmentsList />
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Calendar View</h2>
              <CalendarView appointments={appointments} />
            </div>
          )}

          {activeTab === 'users' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>User Management</h2>
              <AdminUsersList />
            </div>
          )}

          {activeTab === 'services' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Service Management</h2>
              <AdminServicesList />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
