'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import DarkModeToggle from '@/components/ui/DarkModeToggle';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} onClick={closeMobileMenu}>
          Booking System
        </Link>

        {/* Desktop Menu */}
        <div className={styles.desktopMenu}>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className={styles.link}>
                Dashboard
              </Link>
              <Link href="/bookings" className={styles.link}>
                Bookings
              </Link>
              <Link href="/services" className={styles.link}>
                Services
              </Link>
              {user?.role === 'ADMIN' && (
                <>
                  <Link href="/business-hours" className={styles.link}>
                    Business Hours
                  </Link>
                  <Link href="/admin" className={styles.link}>
                    Admin Panel
                  </Link>
                </>
              )}
              <div className={styles.userMenu}>
                <DarkModeToggle />
                <span className={styles.userName}>
                  {user?.firstName} {user?.lastName}
                </span>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <DarkModeToggle />
              <Link href="/login" className={styles.link}>
                Login
              </Link>
              <Link href="/register" className={styles.registerButton}>
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={styles.hamburger}>
            <span className={mobileMenuOpen ? styles.open : ''}></span>
            <span className={mobileMenuOpen ? styles.open : ''}></span>
            <span className={mobileMenuOpen ? styles.open : ''}></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {isAuthenticated ? (
            <>
              <div className={styles.mobileUserInfo}>
                <span className={styles.mobileUserName}>
                  {user?.firstName} {user?.lastName}
                </span>
                <span className={styles.mobileUserRole}>{user?.role}</span>
              </div>
              <Link
                href="/dashboard"
                className={styles.mobileLink}
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
              <Link
                href="/bookings"
                className={styles.mobileLink}
                onClick={closeMobileMenu}
              >
                Bookings
              </Link>
              <Link
                href="/services"
                className={styles.mobileLink}
                onClick={closeMobileMenu}
              >
                Services
              </Link>
              {user?.role === 'ADMIN' && (
                <>
                  <Link
                    href="/business-hours"
                    className={styles.mobileLink}
                    onClick={closeMobileMenu}
                  >
                    Business Hours
                  </Link>
                  <Link
                    href="/admin"
                    className={styles.mobileLink}
                    onClick={closeMobileMenu}
                  >
                    Admin Panel
                  </Link>
                </>
              )}
              <div className={styles.mobileDarkMode}>
                <DarkModeToggle />
              </div>
              <button
                onClick={handleLogout}
                className={styles.mobileLogoutButton}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={styles.mobileLink}
                onClick={closeMobileMenu}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={styles.mobileRegisterButton}
                onClick={closeMobileMenu}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
