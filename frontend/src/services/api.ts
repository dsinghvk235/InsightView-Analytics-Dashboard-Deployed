import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
console.log("✅ API_BASE_URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add error interceptor for debugging
api.interceptors.request.use(
  (config) => config,
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data, error.config?.url);
    return Promise.reject(error);
  }
);

// Types
export interface AnalyticsOverview {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalRevenue: number;
  averageTransactionAmount: number;
  successRate: number;
}

export interface KPIMetrics {
  totalUsers: number;
  totalTransactions: number;
  newUsersToday: number;
  pendingTransactions: number;
  totalGTV: number;
  successRate: number;
  averageTicketSize: number;
  failedTransactionCount: number;
  failedVolume: number;
}

export interface KPIComparison {
  // Current values
  totalUsers: number;
  totalTransactions: number;
  newUsersToday: number;
  pendingTransactions: number;
  totalGTV: number;
  successRate: number;
  averageTicketSize: number;
  failedTransactionCount: number;
  failedVolume: number;
  // Percentage changes
  totalUsersChange: number;
  totalTransactionsChange: number;
  newUsersTodayChange: number;
  pendingTransactionsChange: number;
  totalGTVChange: number;
  successRateChange: number;
  averageTicketSizeChange: number;
  failedTransactionCountChange: number;
  failedVolumeChange: number;
  // Period info
  currentPeriod: string;
  previousPeriod: string;
}

export interface DailyTransaction {
  date: string;
  totalTransactions: number;
  totalAmount: number;
  successfulTransactions: number;
  successfulAmount: number;
  failedTransactions: number;
  successRate: number;
}

export interface RevenueOverTime {
  date: string;
  revenue: number;
}

export interface TransactionStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface PaymentMethod {
  paymentMethod: string;
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  percentage: number;
}

export interface Transaction {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  paymentMethod: string;
  paymentProvider: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface HourlyTransaction {
  hour: number; // 0-23
  transactionCount: number;
  totalAmount: number;
  successfulTransactions: number;
  successfulAmount: number;
  successRate: number;
}

// Search Types
export interface SearchResult {
  query: string;
  matchedInsight: string | null;
  title: string;
  description: string;
  data: Record<string, any> | null;
}

export type SearchRange = '7d' | '30d' | '90d' | 'all' | 'custom';

// Export Types
export type ExportMetric = 'TRANSACTIONS_SUMMARY' | 'REVENUE_SUMMARY' | 'FAILED_TRANSACTIONS' | 'CURRENCY_BREAKDOWN';
export type ExportFormat = 'CSV' | 'JSON';

export interface ExportRequest {
  metric: ExportMetric;
  range: string;
  format: ExportFormat;
}

export interface ExportMetricInfo {
  value: string;
  displayName: string;
  description: string;
}

export interface ExportOptions {
  metrics: ExportMetricInfo[];
  formats: string[];
  ranges: string[];
}

// AI Insights Types
export interface AIInsightsRequest {
  range: '7d' | '30d' | '90d';
}

export interface AIInsightsResponse {
  summary: string;
  insights: string[];
  disclaimer: string;
  periodAnalyzed: string;
  success: boolean;
}

// Notification Types
export interface Notification {
  id: number;
  type: string;
  typeDisplayName: string;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  severityColor: string;
  read: boolean;
  metricValue: number | null;
  thresholdValue: number | null;
  comparisonPeriod: string | null;
  createdAt: string;
  relativeTime: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
}

// API Functions
export const analyticsAPI = {
  // Overview
  getOverview: async (): Promise<AnalyticsOverview> => {
    const response = await api.get('/analytics/overview');
    return response.data;
  },

  // KPIs
  getKPIs: async (startDate?: string, endDate?: string): Promise<KPIMetrics> => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/analytics/kpis', { params });
    return response.data;
  },

  // KPIs with Comparison
  getKPIComparison: async (periodDays: number = 30): Promise<KPIComparison> => {
    const response = await api.get('/analytics/kpis/comparison', { params: { periodDays } });
    return response.data;
  },

  // Daily Analytics
  getDailyTransactions: async (startDate: string, endDate: string): Promise<DailyTransaction[]> => {
    const response = await api.get('/analytics/transactions/by-date', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Revenue Over Time
  getRevenueOverTime: async (startDate: string, endDate: string): Promise<RevenueOverTime[]> => {
    const response = await api.get('/analytics/revenue/over-time', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Transaction Status
  getTransactionStatus: async (startDate?: string, endDate?: string): Promise<TransactionStatus[]> => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/analytics/transactions/by-status', { params });
    return response.data;
  },

  // Payment Methods
  getPaymentMethods: async (startDate: string, endDate: string): Promise<PaymentMethod[]> => {
    const response = await api.get('/analytics/transactions/by-payment-method', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Paginated Transactions
  getTransactions: async (
    page: number = 0,
    size: number = 20,
    filters?: {
      email?: string;
      status?: string;
      paymentMethod?: string;
      minAmount?: number;
      maxAmount?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PaginatedTransactions> => {
    const params: any = { page, size };
    if (filters) {
      Object.assign(params, filters);
    }
    const response = await api.get('/analytics/transactions/table', { params });
    return response.data;
  },

  // Hourly Transaction Stats (for heatmap)
  getHourlyTransactions: async (startDate: string, endDate: string): Promise<HourlyTransaction[]> => {
    const response = await api.get('/analytics/transactions/by-hour', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Analytics Search
  // Supports both period-based (7d, 30d) and explicit date range searches
  search: async (
    query: string, 
    range: SearchRange = '7d', 
    days?: number,
    startDate?: string,
    endDate?: string
  ): Promise<SearchResult> => {
    const params: Record<string, any> = { q: query, range };
    if (range === 'custom') {
      if (startDate && endDate) {
        // Use explicit date range
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (days) {
        // Use days count
        params.days = days;
      }
    }
    const response = await api.get('/analytics/search', { params });
    return response.data;
  },

  // Analytics Export
  // Returns a blob for file download
  exportData: async (request: ExportRequest): Promise<Blob> => {
    const response = await api.post('/analytics/export', request, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get available export options (metrics, formats, ranges)
  getExportOptions: async (): Promise<ExportOptions> => {
    const response = await api.get('/analytics/export/metrics');
    return response.data;
  },

  // AI Insights
  // Generate AI-powered insights from analytics data
  // The AI interprets existing aggregated metrics - it does NOT query the database
  getAIInsights: async (range: '7d' | '30d' | '90d' = '7d'): Promise<AIInsightsResponse> => {
    const response = await api.post('/analytics/ai-insights', { range });
    return response.data;
  },
};

// Notification API Functions
export const notificationAPI = {
  // Get all notifications with unread count
  getNotifications: async (): Promise<NotificationListResponse> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Get unread count only (for polling)
  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark a specific notification as read
  markAsRead: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ success: boolean; message: string; count: number }> => {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },

  // Manually trigger notification generation (for testing)
  generateNotifications: async (): Promise<{ success: boolean; message: string; executionTimeMs: number }> => {
    const response = await api.post('/notifications/generate');
    return response.data;
  },
};

export default api;
