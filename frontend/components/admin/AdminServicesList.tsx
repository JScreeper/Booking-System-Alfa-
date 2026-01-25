'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/ToastContainer';
import ServiceForm from '@/components/services/ServiceForm';
import { LoadingSkeleton, ListSkeleton } from '@/components/ui/LoadingSkeleton';
import styles from './AdminServicesList.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  isActive: boolean;
}

export default function AdminServicesList() {
  const { showToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/services`);
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load services', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/services/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete service');
      showToast('Service deleted successfully', 'success');
      fetchServices();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete service', 'error');
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/services/${service.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !service.isActive }),
      });

      if (!response.ok) throw new Error('Failed to update service');
      showToast(
        `Service ${!service.isActive ? 'activated' : 'deactivated'}`,
        'success'
      );
      fetchServices();
    } catch (err: any) {
      showToast(err.message || 'Failed to update service', 'error');
    }
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <ListSkeleton count={3} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setShowForm(true);
          }}
          className={styles.addButton}
        >
          + Add Service
        </button>
      </div>

      {showForm && (
        <div className={styles.formContainer}>
          <ServiceForm
            service={editingService}
            onClose={() => {
              setShowForm(false);
              setEditingService(null);
            }}
            onSuccess={() => {
              setShowForm(false);
              setEditingService(null);
              fetchServices();
            }}
          />
        </div>
      )}

      {filteredServices.length === 0 ? (
        <div className={styles.empty}>
          <p>No services found</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`${styles.serviceCard} ${
                !service.isActive ? styles.inactive : ''
              }`}
            >
              <div className={styles.serviceHeader}>
                <h3 className={styles.serviceName}>{service.name}</h3>
                <span
                  className={`${styles.statusBadge} ${
                    service.isActive ? styles.active : styles.inactive
                  }`}
                >
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {service.description && (
                <p className={styles.serviceDescription}>{service.description}</p>
              )}
              <div className={styles.serviceDetails}>
                <span className={styles.detail}>
                  ⏱️ {service.duration} min
                </span>
                {service.price && (
                  <span className={styles.detail}>💰 ${service.price}</span>
                )}
              </div>
              <div className={styles.serviceActions}>
                <button
                  onClick={() => handleToggleActive(service)}
                  className={`${styles.actionButton} ${
                    service.isActive ? styles.deactivate : styles.activate
                  }`}
                >
                  {service.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => {
                    setEditingService(service);
                    setShowForm(true);
                  }}
                  className={`${styles.actionButton} ${styles.edit}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className={`${styles.actionButton} ${styles.delete}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
