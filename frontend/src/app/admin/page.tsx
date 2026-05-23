"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuditService } from '../../services/audit.service';
import { AuditStatistics } from '../../types/audit';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import SecurityAlerts from '../../components/admin/SecurityAlerts';

const AdminDashboard = () => {
  const [auditStats, setAuditStats] = useState<AuditStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { role, isAuthenticated, username } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, role]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load audit statistics for the last 24 hours
      const stats = await AuditService.getAuditStatistics(24);
      setAuditStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      name: 'View All Users',
      href: '/admin/users',
      icon: '👥',
      description: 'Manage user accounts and permissions',
      color: 'bg-blue-500'
    },
    {
      name: 'Manage Hotels',
      href: '/admin/hotels',
      icon: '🏨',
      description: 'Add, edit, and manage hotel listings',
      color: 'bg-green-500'
    },
    {
      name: 'Tourism Places',
      href: '/admin/tourisms',
      icon: '🏞️',
      description: 'Manage tourism destinations',
      color: 'bg-purple-500'
    },
    {
      name: 'View Bookings',
      href: '/admin/bookings',
      icon: '📅',
      description: 'Monitor and manage bookings',
      color: 'bg-orange-500'
    },
    {
      name: 'Audit Logs',
      href: '/admin/audit',
      icon: '📋',
      description: 'Review system activity logs',
      color: 'bg-red-500'
    },
    {
      name: 'Security Events',
      href: '/admin/audit/security',
      icon: '🚨',
      description: 'Monitor security events',
      color: 'bg-yellow-500'
    }
  ];

  if (!isAuthenticated || role !== 'ADMIN') {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-200 admin-page">
      {/* Light background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
      {/* Back Button & Welcome Section */}
      <div className="mb-8 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-6 rounded-xl shadow-xl">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors font-bold"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-bold">Back to Home</span>
        </button>
        <h1 className="text-3xl font-black text-white mb-2">
          Welcome back, {username}!
        </h1>
        <p className="text-blue-200 font-semibold">
          Here's what's happening with your North Wollo Tourism platform today.
        </p>
      </div>

      {/* System Status Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse border-2 border-gray-300">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-100 border-2 border-red-300 rounded-md p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-600">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-black text-red-700">
                Failed to load dashboard data
              </h3>
              <div className="mt-2 text-sm text-red-600 font-semibold">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadDashboardData}
                  className="bg-red-100 text-red-700 border-2 border-red-300 px-4 py-2 rounded-md hover:bg-red-200 text-sm font-black"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : auditStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-100 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-extrabold text-gray-800 uppercase tracking-wide">Total Events (24h)</p>
                <p className="text-3xl font-black text-blue-800">{auditStats.totalAuditLogs}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-100 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">🚨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-extrabold text-gray-800 uppercase tracking-wide">Security Events</p>
                <p className="text-3xl font-black text-yellow-700">{auditStats.securityEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-100 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-extrabold text-gray-800 uppercase tracking-wide">High Severity</p>
                <p className="text-3xl font-black text-red-700">{auditStats.highSeverityEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-100 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-extrabold text-gray-800 uppercase tracking-wide">System Status</p>
                <p className="text-lg font-black text-emerald-700">Operational</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="quick-action-card bg-gray-100 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:bg-gray-50 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className={`flex-shrink-0 w-16 h-16 ${action.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <span className="text-white text-3xl">{action.icon}</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-black text-gray-900">{action.name}</h3>
                </div>
              </div>
              <p className="text-base font-bold text-gray-800">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Summary */}
      {auditStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Actions */}
          <div className="bg-indigo-100 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
            <h3 className="text-lg font-black text-indigo-900 mb-4">Top Actions (24h)</h3>
            <div className="space-y-3">
              {Object.entries(auditStats.actionStatistics)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([action, count]) => (
                  <div key={action} className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm">
                    <span className="text-sm text-gray-800 font-bold">{action.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-black text-indigo-700 bg-indigo-200 px-2 py-1 rounded">{count}</span>
                  </div>
                ))}
            </div>
            <div className="mt-4">
              <Link
                href="/admin/audit"
                className="text-indigo-700 hover:text-indigo-900 text-sm font-black"
              >
                View all audit logs →
              </Link>
            </div>
          </div>

          {/* Resource Activity */}
          <div className="bg-purple-100 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
            <h3 className="text-lg font-black text-purple-900 mb-4">Resource Activity (24h)</h3>
            <div className="space-y-3">
              {Object.entries(auditStats.resourceTypeStatistics)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([resource, count]) => (
                  <div key={resource} className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm">
                    <span className="text-sm text-gray-800 font-bold">{resource}</span>
                    <span className="text-sm font-black text-purple-700 bg-purple-200 px-2 py-1 rounded">{count}</span>
                  </div>
                ))}
            </div>
            <div className="mt-4">
              <Link
                href="/admin/audit/dashboard"
                className="text-purple-700 hover:text-purple-900 text-sm font-black"
              >
                View detailed analytics →
              </Link>
            </div>
          </div>

          {/* Security Alerts */}
          <SecurityAlerts timeRange={24} maxAlerts={3} />
        </div>
      )}

      {/* System Health */}
      <div className="mt-8 bg-emerald-100 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
        <h3 className="text-lg font-black text-emerald-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-5 bg-white rounded-xl shadow-lg">
            <div className="text-4xl mb-2">🟢</div>
            <p className="text-base font-black text-gray-900">Database</p>
            <p className="text-sm text-emerald-700 font-bold">Connected</p>
          </div>
          <div className="text-center p-5 bg-white rounded-xl shadow-lg">
            <div className="text-4xl mb-2">🟢</div>
            <p className="text-base font-black text-gray-900">Audit Logging</p>
            <p className="text-sm text-emerald-700 font-bold">Active</p>
          </div>
          <div className="text-center p-5 bg-white rounded-xl shadow-lg">
            <div className="text-4xl mb-2">🟢</div>
            <p className="text-base font-black text-gray-900">Security</p>
            <p className="text-sm text-emerald-700 font-bold">Monitoring</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
