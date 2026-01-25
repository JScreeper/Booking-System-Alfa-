'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/ToastContainer';
import styles from './ServiceForm.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Service {
  id?: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  isActive?: boolean;
}

interface ServiceFormProps {
  service?: Service | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ServiceForm({
  service,
  onClose,
  onSuccess,
}: ServiceFormProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        duration: service.duration || 30,
        price: service.price?.toString() || '',
        isActive: service.isActive !== undefined ? service.isActive : true,
      });
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const payload: any = {
        name: formData.name,
        description: formData.description || undefined,
        duration: Number(formData.duration),
      };

      if (formData.price) {
        payload.price = Number(formData.price);
      }

      if (service?.id) {
        payload.isActive = formData.isActive;
      }

      const url = service?.id
        ? `${API_URL}/services/${service.id}`
        : `${API_URL}/services`;

      const response = await fetch(url, {
        method: service?.id ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save service');
      }

      showToast(
        service?.id ? 'Service updated successfully!' : 'Service created successfully!',
        'success'
      );

      onSuccess();
    } catch (err: any) {
      const errorMsg = err.message || 'Something went wrong';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {service?.id ? 'Edit Service' : 'Create Service'}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Service Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={styles.input}
              required
              minLength={2}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="duration" className={styles.label}>
                Duration (minutes) *
              </label>
              <input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: Number(e.target.value) })
                }
                className={styles.input}
                required
                min={5}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="price" className={styles.label}>
                Price ($)
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className={styles.input}
                min={0}
              />
            </div>
          </div>

          {service?.id && (
            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className={styles.checkbox}
                />
                Active
              </label>
            </div>
          )}

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
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Saving...' : service?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
