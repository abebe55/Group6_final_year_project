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
    <div className="min-h-screen bg-gray-100">
      {/* Light background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
      {/* Back Button & Welcome Section */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Home</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {username}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your North Wollo Tourism platform today.
        </p>
      </div>

      {/* System Status Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse border border-gray-200">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-700 rounded-md p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-300">
                Failed to load dashboard data
              </h3>
              <div className="mt-2 text-sm text-red-400">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadDashboardData}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : auditStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Events (24h)</p>
                <p className="text-2xl font-semibold text-gray-900">{auditStats.totalAuditLogs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Security Events</p>
                <p className="text-2xl font-semibold text-yellow-600">{auditStats.securityEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High Severity</p>
                <p className="text-2xl font-semibold text-red-600">{auditStats.highSeverityEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">System Status</p>
                <p className="text-sm font-semibold text-emerald-600">Operational</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="bg-white rounded-lg shadow-md p-6 hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-gray-300"
            >
              <div className="flex items-center mb-4">
                <div className={`flex-shrink-0 w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-white text-xl">{action.icon}</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{action.name}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Summary */}
      {auditStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Actions (24h)</h3>
            <div className="space-y-3">
              {Object.entries(auditStats.actionStatistics)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([action, count]) => (
                  <div key={action} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{action.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
            <div className="mt-4">
              <Link
                href="/admin/audit"
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                View all audit logs →
              </Link>
            </div>
          </div>

          {/* Resource Activity */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Activity (24h)</h3>
            <div className="space-y-3">
              {Object.entries(auditStats.resourceTypeStatistics)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([resource, count]) => (
                  <div key={resource} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{resource}</span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
            <div className="mt-4">
              <Link
                href="/admin/audit/dashboard"
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
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
      <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🟢</div>
            <p className="text-sm font-medium text-gray-900">Database</p>
            <p className="text-xs text-gray-500">Connected</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🟢</div>
            <p className="text-sm font-medium text-gray-900">Audit Logging</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🟢</div>
            <p className="text-sm font-medium text-gray-900">Security</p>
            <p className="text-xs text-gray-500">Monitoring</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;