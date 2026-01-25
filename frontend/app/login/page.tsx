'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import styles from './login.module.css';

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>
        <LoginForm redirect={redirect || undefined} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.container}><div className={styles.card}>Loading...</div></div>}>
      <LoginContent />
    </Suspense>
  );
}
