"use client";

import React, { useState, useEffect } from 'react';
import { AuditService } from '../../../../services/audit.service';
import { AuditLogEntry } from '../../../../types/audit';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useRouter } from 'next/navigation';

const SecurityEventsPage = () => {
  const [securityLogs, setSecurityLogs] = useState<AuditLogEntry[]>([]);
  const [highSeverityLogs, setHighSeverityLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(24); // hours
  const [activeTab, setActiveTab] = useState<'security' | 'high-severity'>('security');

  const { role, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadSecurityEvents();
  }, [isAuthenticated, role, timeRange]);

  const loadSecurityEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const [securityResponse, highSeverityResponse] = await Promise.all([
        AuditService.getRecentSecurityLogs(timeRange),
        AuditService.getHighSeverityLogs(timeRange)
      ]);

      setSecurityLogs(securityResponse || []);
      setHighSeverityLogs(highSeverityResponse || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security events');
      console.error('Error loading security events:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'INFO': return 'bg-blue-100 text-blue-800';
      case 'WARN': return 'bg-yellow-100 text-yellow-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'CRITICAL': return 'bg-red-200 text-red-900 font-bold';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AUTHENTICATION': return '🔐';
      case 'AUTHORIZATION': return '🛡️';
      case 'SECURITY': return '🚨';
      default: return '⚠️';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN': return '🔓';
      case 'LOGOUT': return '🔒';
      case 'ACCOUNT_LOCKED': return '🔐';
      case 'ACCOUNT_UNLOCKED': return '🔓';
      case 'PASSWORD_RESET_REQUEST': return '🔑';
      case 'PASSWORD_RESET_CONFIRM': return '✅';
      case 'EMAIL_VERIFICATION_SEND': return '📧';
      case 'EMAIL_VERIFICATION_CONFIRM': return '✅';
      default: return '⚡';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const currentLogs = activeTab === 'security' ? securityLogs : highSeverityLogs;

  if (!isAuthenticated || role !== 'ADMIN') {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Events</h1>
        <p className="text-gray-600">Monitor authentication, authorization, and security-related activities</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value={1}>Last Hour</option>
            <option value={24}>Last 24 Hours</option>
            <option value={168}>Last Week</option>
            <option value={720}>Last Month</option>
          </select>
        </div>

        <button
          onClick={loadSecurityEvents}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security Events ({securityLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('high-severity')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'high-severity'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            High Severity ({highSeverityLogs.length})
          </button>
        </nav>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-md">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading security events...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>Error: {error}</p>
            <button
              onClick={loadSecurityEvents}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : currentLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <p>No {activeTab === 'security' ? 'security events' : 'high severity events'} found in the selected time range</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentLogs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{getActionIcon(log.action)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {log.action.replace(/_/g, ' ')}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadgeClass(log.severity)}`}>
                          {log.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {log.description || `${log.action} event`}
                      </p>
                      <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <span className="mr-1">{getCategoryIcon(log.category)}</span>
                          {log.category}
                        </span>
                        {log.username && (
                          <span>👤 {log.username}</span>
                        )}
                        <span>🌐 {log.ipAddress}</span>
                        {log.resourceType && (
                          <span>📋 {log.resourceType}{log.resourceId ? `:${log.resourceId}` : ''}</span>
                        )}
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-3 p-3 bg-gray-100 rounded-md">
                          <details>
                            <summary className="cursor-pointer text-sm font-medium text-gray-700">
                              Event Details
                            </summary>
                            <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm text-gray-500">{formatTimestamp(log.timestamp)}</p>
                    <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {!loading && !error && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900">Total Security Events</h4>
            <p className="text-2xl font-bold text-blue-600">{securityLogs.length}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-900">High Severity Events</h4>
            <p className="text-2xl font-bold text-red-600">{highSeverityLogs.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-900">Critical Events</h4>
            <p className="text-2xl font-bold text-yellow-600">
              {currentLogs.filter(log => log.severity === 'CRITICAL').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityEventsPage;