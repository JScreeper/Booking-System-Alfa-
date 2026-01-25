'use client';

import { useState, useEffect } from 'react';
import AdminAppointmentCard from './AdminAppointmentCard';
import styles from './AdminAppointmentsList.module.css';

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
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface AdminAppointmentsListProps {
  limit?: number;
}

export default function AdminAppointmentsList({ limit }: AdminAppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/appointments?admin=true');

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await apiFetch(`/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      fetchAppointments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredAppointments = appointments
    .filter((apt) => {
      const matchesStatus = filter === 'all' || apt.status === filter;
      const matchesSearch =
        apt.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.user.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .slice(0, limit);

  if (loading) {
    return <div className={styles.loading}>Loading appointments...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div>
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search appointments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.filters}>
        <button
          onClick={() => setFilter('all')}
          className={`${styles.filterButton} ${
            filter === 'all' ? styles.active : ''
          }`}
        >
          All ({appointments.length})
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`${styles.filterButton} ${
            filter === 'PENDING' ? styles.active : ''
          }`}
        >
          Pending (
          {appointments.filter((a) => a.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilter('CONFIRMED')}
          className={`${styles.filterButton} ${
            filter === 'CONFIRMED' ? styles.active : ''
          }`}
        >
          Confirmed (
          {appointments.filter((a) => a.status === 'CONFIRMED').length})
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`${styles.filterButton} ${
            filter === 'COMPLETED' ? styles.active : ''
          }`}
        >
          Completed (
          {appointments.filter((a) => a.status === 'COMPLETED').length})
        </button>
        <button
          onClick={() => setFilter('CANCELLED')}
          className={`${styles.filterButton} ${
            filter === 'CANCELLED' ? styles.active : ''
          }`}
        >
          Cancelled (
          {appointments.filter((a) => a.status === 'CANCELLED').length})
        </button>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className={styles.empty}>No appointments found</div>
      ) : (
        <div className={styles.grid}>
          {filteredAppointments.map((appointment) => (
            <AdminAppointmentCard
              key={appointment.id}
              appointment={appointment}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
