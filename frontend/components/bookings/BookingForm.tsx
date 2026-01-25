'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/ToastContainer';
import styles from './BookingForm.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Service {
  id: string;
  name: string;
  duration: number;
  price?: number;
}

interface BookingFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingForm({ onClose, onSuccess }: BookingFormProps) {
  const { showToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [selectedService, selectedDate]);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/services`);
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data.filter((s: Service) => s.isActive));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(
        `${API_URL}/appointments/available-slots?serviceId=${selectedService}&date=${selectedDate}`,
      );
      if (!response.ok) throw new Error('Failed to fetch slots');
      const data = await response.json();
      setAvailableSlots(data);
    } catch (err) {
      console.error(err);
      setAvailableSlots([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedService || !selectedDate || !selectedSlot) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: selectedService,
          startTime: selectedSlot,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create appointment');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Book Appointment</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="service" className={styles.label}>
            Service *
          </label>
          <select
            id="service"
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setSelectedSlot('');
            }}
            className={styles.select}
            required
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} ({service.duration} min)
                {service.price && ` - $${service.price.toFixed(2)}`}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="date" className={styles.label}>
            Date *
          </label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSlot('');
            }}
            className={styles.input}
            min={minDate}
            required
          />
        </div>

        {availableSlots.length > 0 && (
          <div className={styles.field}>
            <label className={styles.label}>Available Time Slots *</label>
            <div className={styles.slotsGrid}>
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`${styles.slotButton} ${
                    selectedSlot === slot ? styles.selected : ''
                  }`}
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedService && selectedDate && availableSlots.length === 0 && (
          <div className={styles.noSlots}>
            No available time slots for this date
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="notes" className={styles.label}>
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedSlot}
            className={styles.submitButton}
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
}
