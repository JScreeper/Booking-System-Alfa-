'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './RegisterForm.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function RegisterForm() {
  const router = useRouter();
  const [registrationType, setRegistrationType] = useState<'user' | 'business'>('user');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    organizationName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate business registration
      if (registrationType === 'business' && !formData.organizationName.trim()) {
        setError('Ime firme je obavezno');
        setLoading(false);
        return;
      }

      const payload = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        ...(registrationType === 'business' && formData.organizationName.trim()
          ? { organizationName: formData.organizationName.trim() }
          : {}),
      };

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('storage')); // Dispatch event to update useAuth

      // Redirect based on registration type
      if (registrationType === 'business' && data.user.organizationId) {
        // Business owner - redirect to admin panel
        router.push('/admin');
      } else {
        // Regular user - redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label className={styles.label}>Registracija kao:</label>
        <div className={styles.registrationType}>
          <button
            type="button"
            className={`${styles.typeButton} ${registrationType === 'user' ? styles.typeButtonActive : ''}`}
            onClick={() => setRegistrationType('user')}
          >
            👤 Korisnik
          </button>
          <button
            type="button"
            className={`${styles.typeButton} ${registrationType === 'business' ? styles.typeButtonActive : ''}`}
            onClick={() => setRegistrationType('business')}
          >
            🏢 Firma
          </button>
        </div>
        <p className={styles.typeDescription}>
          {registrationType === 'user'
            ? 'Registruj se kao korisnik i rezerviši termine'
            : 'Kreiraj svoju firmu i upravljaj rezervacijama'}
        </p>
      </div>

      {registrationType === 'business' && (
        <div className={styles.field}>
          <label htmlFor="organizationName" className={styles.label}>
            Ime firme *
          </label>
          <input
            id="organizationName"
            type="text"
            value={formData.organizationName}
            onChange={(e) =>
              setFormData({ ...formData, organizationName: e.target.value })
            }
            className={styles.input}
            required={registrationType === 'business'}
            minLength={2}
            placeholder="Npr. Salon Lepota, Teretana Fit, Klinika Zdravlje..."
          />
          <p className={styles.typeDescription}>
            Ovo ime će biti vidljivo klijentima kada rezervišu termine
          </p>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className={styles.input}
          required
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="firstName" className={styles.label}>
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className={styles.input}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="lastName" className={styles.label}>
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className={styles.input}
            required
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className={styles.input}
          required
          minLength={6}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={styles.button}
      >
        {loading
          ? registrationType === 'business'
            ? 'Kreiranje firme...'
            : 'Kreiranje naloga...'
          : registrationType === 'business'
          ? 'Kreiraj firmu'
          : 'Registruj se'}
      </button>

      <p className={styles.linkText}>
        Already have an account?{' '}
        <Link href="/login" className={styles.link}>
          Login here
        </Link>
      </p>
    </form>
  );
}
