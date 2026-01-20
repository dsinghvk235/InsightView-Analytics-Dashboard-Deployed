import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
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
};

export default api;
