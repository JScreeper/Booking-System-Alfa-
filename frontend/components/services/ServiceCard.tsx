'use client';

import styles from './ServiceCard.module.css';

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  isActive: boolean;
}

interface ServiceCardProps {
  service: Service;
  isAdmin: boolean;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

export default function ServiceCard({
  service,
  isAdmin,
  onEdit,
  onDelete,
}: ServiceCardProps) {
  return (
    <div className={`${styles.card} ${!service.isActive ? styles.inactive : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.name}>{service.name}</h3>
        {!service.isActive && (
          <span className={styles.badge}>Inactive</span>
        )}
      </div>

      {service.description && (
        <p className={styles.description}>{service.description}</p>
      )}

      <div className={styles.details}>
        <div className={styles.detail}>
          <span className={styles.label}>Duration:</span>
          <span className={styles.value}>{service.duration} min</span>
        </div>
        {service.price !== null && service.price !== undefined && (
          <div className={styles.detail}>
            <span className={styles.label}>Price:</span>
            <span className={styles.value}>${service.price.toFixed(2)}</span>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className={styles.actions}>
          <button
            onClick={() => onEdit(service)}
            className={styles.editButton}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className={styles.deleteButton}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
