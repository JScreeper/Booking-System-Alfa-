'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import BookingForm from '@/components/bookings/BookingForm';
import BookingList from '@/components/bookings/BookingList';
import { useToast } from '@/components/ui/ToastContainer';
import { useAuth } from '@/hooks/useAuth';
import styles from './bookings.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function BookingsPage() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  const fetchAppointments = async () => {
    try {
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
    }
  };

  const handleBookingSuccess = () => {
    setShowForm(false);
    fetchAppointments();
    showToast('Appointment booked successfully!', 'success');
  };

  const handleCancel = (id: string) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
    showToast('Appointment cancelled', 'info');
  };

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Book Appointment</h1>
            <p className={styles.subtitle}>Schedule your next appointment</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={styles.button}
          >
            {showForm ? '✕ Cancel' : '+ New Booking'}
          </button>
        </div>

        {showForm && (
          <div className={styles.formContainer}>
            <BookingForm
              onClose={() => setShowForm(false)}
              onSuccess={handleBookingSuccess}
            />
          </div>
        )}

        <div className={styles.listContainer}>
          <h2 className={styles.sectionTitle}>My Appointments</h2>
          <BookingList appointments={appointments} onCancel={handleCancel} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
