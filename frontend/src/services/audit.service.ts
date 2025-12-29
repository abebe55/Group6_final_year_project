// frontend/src/services/audit.service.ts

import { api } from "./api";
import { 
  AuditLogEntry, 
  AuditLogSearchParams, 
  AuditStatistics, 
  ActivityCount, 
  CleanupResult, 
  RepairResult,
  SuspiciousActivity,
  IntegrityStatus
} from "../types/audit";

export class AuditService {
  private static getAuthToken(): string {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }
    return token;
  }

  // Get all audit logs with pagination
  static async getAllAuditLogs(page: number = 0, size: number = 20) {
    const token = this.getAuthToken();
    const response = await api.get<{
      content: AuditLogEntry[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>(`/admin/audit?page=${page}&size=${size}`, token);
    return response.data;
  }

  // Search audit logs with multiple criteria
  static async searchAuditLogs(params: AuditLogSearchParams) {
    const token = this.getAuthToken();
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get<{
      content: AuditLogEntry[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>(`/admin/audit/search?${queryParams.toString()}`, token);
    return response.data;
  }

  // Get audit logs for a specific user by ID
  static async getAuditLogsByUserId(userId: number, page: number = 0, size: number = 20) {
    const token = this.getAuthToken();
    const response = await api.get<{
      content: AuditLogEntry[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>(`/admin/audit/user/${userId}?page=${page}&size=${size}`, token);
    return response.data;
  }

  // Get audit logs for a specific username
  static async getAuditLogsByUsername(username: string, page: number = 0, size: number = 20) {
    const token = this.getAuthToken();
    const response = await api.get<{
      content: AuditLogEntry[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>(`/admin/audit/username/${username}?page=${page}&size=${size}`, token);
    return response.data;
  }

  // Get audit logs for a specific action
  static async getAuditLogsByAction(action: string, page: number = 0, size: number = 20) {
    const token = this.getAuthToken();
    const response = await api.get<{
      content: AuditLogEntry[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>(`/admin/audit/action/${action}?page=${page}&size=${size}`, token);
    return response.data;
  }

  // Get audit logs for a specific resource type
  static async getAuditLogsByResourceType(resourceType: string, resourceId?: string, page: number = 0, size: number = 20) {
    const token = this.getAuthToken();
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    if (resourceId) {
      queryParams.append('resourceId', resourceId);
    }

    const response = await api.get<{
      content: AuditLogEntry[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>(`/admin/audit/resource/${resourceType}?${queryParams.toString()}`, token);
    return response.data;
  }

  // Get recent security-related audit logs
  static async getRecentSecurityLogs(hours: number = 24) {
    const token = this.getAuthToken();
    const response = await api.get<AuditLogEntry[]>(`/admin/audit/security?hours=${hours}`, token);
    return response.data;
  }

  // Get high severity audit logs
  static async getHighSeverityLogs(hours: number = 24) {
    const token = this.getAuthToken();
    const response = await api.get<AuditLogEntry[]>(`/admin/audit/high-severity?hours=${hours}`, token);
    return response.data;
  }

  // Get audit log statistics
  static async getAuditStatistics(hours: number = 24) {
    const token = this.getAuthToken();
    const response = await api.get<AuditStatistics>(`/admin/audit/statistics?hours=${hours}`, token);
    return response.data;
  }

  // Find suspicious IP activity
  static async getSuspiciousActivity(hours: number = 24, userThreshold: number = 3, actionThreshold: number = 50) {
    const token = this.getAuthToken();
    const response = await api.get<SuspiciousActivity[]>(
      `/admin/audit/suspicious-activity?hours=${hours}&userThreshold=${userThreshold}&actionThreshold=${actionThreshold}`, 
      token
    );
    return response.data;
  }

  // Check audit log integrity
  static async checkIntegrity() {
    const token = this.getAuthToken();
    const response = await api.get<IntegrityStatus>(`/admin/audit/integrity/check`, token);
    return response.data;
  }

  // Repair missing checksums in audit logs
  static async repairIntegrity() {
    const token = this.getAuthToken();
    const response = await api.post<RepairResult>(`/admin/audit/integrity/repair`, {}, token);
    return response.data;
  }

  // Export audit logs for archival
  static async exportAuditLogs(days: number = 30, batchSize: number = 1000) {
    const token = this.getAuthToken();
    const response = await api.get<AuditLogEntry[]>(`/admin/audit/export?days=${days}&batchSize=${batchSize}`, token);
    return response.data;
  }

  // Cleanup old audit logs
  static async cleanupOldLogs(daysToKeep: number = 90) {
    const token = this.getAuthToken();
    const response = await api.del<CleanupResult>(`/admin/audit/cleanup?daysToKeep=${daysToKeep}`, token);
    return response.data;
  }

  // Get user activity count
  static async getUserActivityCount(userId: number, hours: number = 24) {
    const token = this.getAuthToken();
    const response = await api.get<ActivityCount>(`/admin/audit/activity/user/${userId}?hours=${hours}`, token);
    return response.data;
  }

  // Get IP address activity count
  static async getIpActivityCount(ipAddress: string, hours: number = 24) {
    const token = this.getAuthToken();
    const response = await api.get<ActivityCount>(`/admin/audit/activity/ip/${encodeURIComponent(ipAddress)}?hours=${hours}`, token);
    return response.data;
  }

  // Helper method to format audit log entries for display
  static formatAuditLogForDisplay(entry: AuditLogEntry) {
    return {
      ...entry,
      timestamp: new Date(entry.timestamp).toLocaleString(),
      severityColor: this.getSeverityColor(entry.severity),
      categoryIcon: this.getCategoryIcon(entry.category),
      actionDescription: this.getActionDescription(entry.action, entry.resourceType)
    };
  }

  // Helper method to get severity color for UI
  private static getSeverityColor(severity: string): string {
    switch (severity) {
      case 'INFO': return 'text-blue-600';
      case 'WARN': return 'text-yellow-600';
      case 'ERROR': return 'text-red-600';
      case 'CRITICAL': return 'text-red-800';
      default: return 'text-gray-600';
    }
  }

  // Helper method to get category icon for UI
  private static getCategoryIcon(category: string): string {
    switch (category) {
      case 'AUTHENTICATION': return '🔐';
      case 'AUTHORIZATION': return '🛡️';
      case 'DATA_CHANGE': return '📝';
      case 'SECURITY': return '🚨';
      case 'MAINTENANCE': return '🔧';
      case 'SYSTEM': return '⚙️';
      default: return '📋';
    }
  }

  // Helper method to get human-readable action description
  private static getActionDescription(action: string, resourceType?: string): string {
    const resource = resourceType ? resourceType.toLowerCase() : 'resource';
    
    switch (action) {
      case 'CREATE': return `Created ${resource}`;
      case 'UPDATE': return `Updated ${resource}`;
      case 'DELETE': return `Deleted ${resource}`;
      case 'LOGIN': return 'User logged in';
      case 'LOGOUT': return 'User logged out';
      case 'REGISTER': return 'User registered';
      case 'PASSWORD_RESET_REQUEST': return 'Password reset requested';
      case 'PASSWORD_RESET_CONFIRM': return 'Password reset confirmed';
      case 'EMAIL_VERIFICATION_SEND': return 'Email verification sent';
      case 'EMAIL_VERIFICATION_CONFIRM': return 'Email verified';
      case 'ACCOUNT_LOCKED': return 'Account locked';
      case 'ACCOUNT_UNLOCKED': return 'Account unlocked';
      case 'AUTHORIZATION_CHECK': return 'Permission checked';
      case 'TOKEN_REFRESH': return 'Token refreshed';
      case 'SESSION_EXPIRED': return 'Session expired';
      default: return action.toLowerCase().replace(/_/g, ' ');
    }
  }

  // Helper method to export audit logs as CSV
  static exportToCsv(auditLogs: AuditLogEntry[], filename: string = 'audit-logs.csv') {
    const headers = [
      'ID', 'User ID', 'Username', 'Action', 'Resource Type', 'Resource ID',
      'IP Address', 'Timestamp', 'Severity', 'Category', 'Description'
    ];

    const csvContent = [
      headers.join(','),
      ...auditLogs.map(log => [
        log.id,
        log.userId || '',
        log.username || '',
        log.action,
        log.resourceType || '',
        log.resourceId || '',
        log.ipAddress,
        log.timestamp,
        log.severity,
        log.category,
        `"${log.description || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}