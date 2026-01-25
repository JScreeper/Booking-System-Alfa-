'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import styles from './page.module.css';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Booking System</h1>
        <p className={styles.subtitle}>
          Welcome to the booking system for small businesses
        </p>
        
        {isAuthenticated ? (
          <div className={styles.actions}>
            <Link href="/dashboard" className={styles.button}>
              📊 Dashboard
            </Link>
            <Link href="/bookings" className={styles.button}>
              📅 Book Appointment
            </Link>
            <Link href="/services" className={styles.button}>
              🛎️ Services
            </Link>
            {user?.role === 'ADMIN' && (
              <>
                <Link href="/business-hours" className={`${styles.button} ${styles.buttonSecondary}`}>
                  🕐 Business Hours
                </Link>
                <Link href="/admin" className={`${styles.button} ${styles.buttonSecondary}`}>
                  ⚙️ Admin Panel
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className={styles.actions}>
            <Link href="/login" className={styles.button}>
              Login
            </Link>
            <Link href="/register" className={`${styles.button} ${styles.buttonSecondary}`}>
              Get Started
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
