"use client";

import React, { useState, useEffect } from 'react';
import { AuditService } from '../../../services/audit.service';
import { AuditLogEntry, AuditLogSearchParams, AUDIT_CATEGORIES, AUDIT_SEVERITY_LEVELS } from '../../../types/audit';
import { useAuthStore } from '../../../store/useAuthStore';
import { useRouter } from 'next/navigation';

const AuditLogsPage = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchParams, setSearchParams] = useState<AuditLogSearchParams>({});
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const { role, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadAuditLogs();
  }, [isAuthenticated, role, currentPage, pageSize]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (Object.keys(searchParams).length > 0) {
        response = await AuditService.searchAuditLogs({
          ...searchParams,
          page: currentPage,
          size: pageSize
        });
      } else {
        response = await AuditService.getAllAuditLogs(currentPage, pageSize);
      }

      setAuditLogs(response?.content || []);
      setTotalPages(response?.totalPages || 0);
      setTotalElements(response?.totalElements || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadAuditLogs();
  };

  const handleClearSearch = () => {
    setSearchParams({});
    setCurrentPage(0);
    loadAuditLogs();
  };

  const handleExportCsv = () => {
    AuditService.exportToCsv(auditLogs, `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'INFO': return 'bg-blue-100 text-blue-800';
      case 'WARN': return 'bg-yellow-100 text-yellow-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'CRITICAL': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AUTHENTICATION': return '🔐';
      case 'AUTHORIZATION': return '🛡️';
      case 'DATA_CHANGE': return '📝';
      case 'SECURITY': return '🚨';
      case 'MAINTENANCE': return '🔧';
      case 'SYSTEM': return '⚙️';
      default: return '📋';
    }
  };

  if (!isAuthenticated || role !== 'ADMIN') {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Dashboard</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Logs</h1>
        <p className="text-gray-600">Monitor and review system activities and security events</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Search & Filter</h2>
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showAdvancedSearch ? 'Hide' : 'Show'} Advanced Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Username"
            value={searchParams.username || ''}
            onChange={(e) => setSearchParams({ ...searchParams, username: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <input
            type="text"
            placeholder="Action"
            value={searchParams.action || ''}
            onChange={(e) => setSearchParams({ ...searchParams, action: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <input
            type="text"
            placeholder="IP Address"
            value={searchParams.ipAddress || ''}
            onChange={(e) => setSearchParams({ ...searchParams, ipAddress: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {showAdvancedSearch && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <select
              value={searchParams.category || ''}
              onChange={(e) => setSearchParams({ ...searchParams, category: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Categories</option>
              {Object.values(AUDIT_CATEGORIES).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={searchParams.severity || ''}
              onChange={(e) => setSearchParams({ ...searchParams, severity: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Severities</option>
              {Object.values(AUDIT_SEVERITY_LEVELS).map(severity => (
                <option key={severity} value={severity}>{severity}</option>
              ))}
            </select>
            <input
              type="datetime-local"
              placeholder="Start Time"
              value={searchParams.startTime || ''}
              onChange={(e) => setSearchParams({ ...searchParams, startTime: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            <input
              type="datetime-local"
              placeholder="End Time"
              value={searchParams.endTime || ''}
              onChange={(e) => setSearchParams({ ...searchParams, endTime: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Search
          </button>
          <button
            onClick={handleClearSearch}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Clear
          </button>
          <button
            onClick={handleExportCsv}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            Showing {auditLogs.length} of {totalElements} audit logs
          </span>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Page size:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading audit logs...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>Error: {error}</p>
            <button
              onClick={loadAuditLogs}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.username || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.resourceType ? `${log.resourceType}${log.resourceId ? `:${log.resourceId}` : ''}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="flex items-center">
                        <span className="mr-2">{getCategoryIcon(log.category)}</span>
                        {log.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadgeClass(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;