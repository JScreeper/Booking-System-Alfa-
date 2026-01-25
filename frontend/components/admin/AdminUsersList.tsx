'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/ToastContainer';
import { LoadingSkeleton, ListSkeleton } from '@/components/ui/LoadingSkeleton';
import styles from './AdminUsersList.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersList() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        showToast('Please login', 'error');
        return;
      }

      // Note: We need to create a users endpoint in the backend
      // For now, we'll show a message
      showToast('User management endpoint needs to be implemented', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      // TODO: Implement role change endpoint
      showToast('Role change functionality needs to be implemented', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to update role', 'error');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <ListSkeleton count={5} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <div className={styles.empty}>
          <p>No users found</p>
          <p className={styles.emptySubtext}>
            User management endpoint needs to be implemented in the backend
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredUsers.map((user) => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                  <h3 className={styles.userName}>
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className={styles.userEmail}>{user.email}</p>
                  <p className={styles.userDate}>
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className={styles.userActions}>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className={styles.roleSelect}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
