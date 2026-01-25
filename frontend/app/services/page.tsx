'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ServiceList from '@/components/services/ServiceList';
import ServiceForm from '@/components/services/ServiceForm';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastContainer';
import styles from './services.module.css';

export default function ServicesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Services</h1>
            <p className={styles.subtitle}>Browse available services</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setEditingService(null);
                setShowForm(true);
              }}
              className={styles.addButton}
            >
              + Add Service
            </button>
          )}
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
                showToast(
                  editingService ? 'Service updated!' : 'Service created!',
                  'success'
                );
              }}
            />
          </div>
        )}

        <ServiceList
          isAdmin={isAdmin}
          onEdit={(service) => {
            setEditingService(service);
            setShowForm(true);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
