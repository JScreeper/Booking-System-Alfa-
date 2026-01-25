'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useToast } from '@/components/ui/ToastContainer';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { apiFetch } from '@/utils/api';
import styles from './AnalyticsDashboard.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const COLORS = ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#ef4444'];

interface AnalyticsData {
  totalAppointments: number;
  statusBreakdown: {
    PENDING: number;
    CONFIRMED: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  revenue: number;
  appointmentsByDay: Array<{ date: string; count: number }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
  topServices: Array<{ name: string; count: number }>;
  peakHours: Array<{ hour: number; count: number }>;
}

export default function AnalyticsDashboard() {
  const { showToast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      let startDate: string | undefined;
      const endDate = new Date().toISOString();

      switch (dateRange) {
        case '7d':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case '30d':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case '90d':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
          break;
        default:
          startDate = undefined;
      }

      let endpoint = '/appointments/analytics/stats';
      if (startDate) endpoint += `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
      else endpoint += `?endDate=${encodeURIComponent(endDate)}`;

      const response = await apiFetch(endpoint);

      if (!response.ok) {
        if (response.status === 401) {
          showToast('Session expired. Please login again', 'error');
          return;
        }
        if (response.status === 403) {
          showToast('Access denied. Admin only.', 'error');
          return;
        }
        const errorText = await response.text();
        console.error('Analytics error:', errorText);
        throw new Error(`Failed to fetch analytics: ${response.status} ${response.statusText}`);
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err: any) {
      showToast(err.message || 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <LoadingSkeleton width="100%" height="400px" />
      </div>
    );
  }

  if (!data) {
    return <div className={styles.error}>Failed to load analytics data</div>;
  }

  // Format data for charts
  const statusData = [
    { name: 'Pending', value: data.statusBreakdown.PENDING },
    { name: 'Confirmed', value: data.statusBreakdown.CONFIRMED },
    { name: 'Completed', value: data.statusBreakdown.COMPLETED },
    { name: 'Cancelled', value: data.statusBreakdown.CANCELLED },
  ];

  const appointmentsChartData = data.appointmentsByDay.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    appointments: item.count,
  }));

  const revenueChartData = data.revenueByDay.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.revenue,
  }));

  const peakHoursData = data.peakHours.map((item) => ({
    hour: `${item.hour}:00`,
    count: item.count,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Analytics Dashboard</h2>
        <div className={styles.dateRangeSelector}>
          <button
            onClick={() => setDateRange('7d')}
            className={`${styles.rangeButton} ${dateRange === '7d' ? styles.active : ''}`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDateRange('30d')}
            className={`${styles.rangeButton} ${dateRange === '30d' ? styles.active : ''}`}
          >
            30 Days
          </button>
          <button
            onClick={() => setDateRange('90d')}
            className={`${styles.rangeButton} ${dateRange === '90d' ? styles.active : ''}`}
          >
            90 Days
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`${styles.rangeButton} ${dateRange === 'all' ? styles.active : ''}`}
          >
            All Time
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Appointments</h3>
          <p className={styles.statValue}>{data.totalAppointments}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Revenue</h3>
          <p className={styles.statValue}>${data.revenue.toFixed(2)}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Completed</h3>
          <p className={styles.statValue}>{data.statusBreakdown.COMPLETED}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Pending</h3>
          <p className={styles.statValue}>{data.statusBreakdown.PENDING}</p>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Appointments Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={appointmentsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="appointments"
                stroke="#667eea"
                strokeWidth={2}
                name="Appointments"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Top Services</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topServices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#667eea" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Peak Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#764ba2" name="Appointments" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
