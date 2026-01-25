'use client';

import RegisterForm from '@/components/auth/RegisterForm';
import styles from './register.module.css';

export default function RegisterPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Account</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
