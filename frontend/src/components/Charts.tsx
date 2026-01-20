import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { analyticsAPI, RevenueOverTime, PaymentMethod, TransactionStatus } from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Charts = () => {
  const [revenueData, setRevenueData] = useState<RevenueOverTime[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const range = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
    setDateRange(range);
  }, []);

  useEffect(() => {
    if (!dateRange.startDate || !dateRange.endDate) return;

    const fetchChartData = async () => {
      try {
        setLoading(true);
        const [revenue, payments, status] = await Promise.all([
          analyticsAPI.getRevenueOverTime(dateRange.startDate, dateRange.endDate),
          analyticsAPI.getPaymentMethods(dateRange.startDate, dateRange.endDate),
          analyticsAPI.getTransactionStatus(dateRange.startDate, dateRange.endDate),
        ]);

        setRevenueData(revenue);
        setPaymentMethods(payments);
        setTransactionStatus(status);
      } catch (err) {
        console.error('Failed to load chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [dateRange]);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #f1f5f9'
  };

  // Calculate chart height based on date range
  const getChartHeight = () => {
    if (!dateRange.startDate || !dateRange.endDate) return 350;
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(350, Math.min(500, days * 8));
  };

  if (loading) {
    return (
      <div>
        <div style={{ ...cardStyle, marginBottom: '24px' }}>
          <div style={{ height: '24px', backgroundColor: '#e2e8f0', borderRadius: '8px', width: '25%', marginBottom: '24px' }}></div>
          <div style={{ height: `${getChartHeight()}px`, backgroundColor: '#f1f5f9', borderRadius: '12px' }}></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ height: '24px', backgroundColor: '#e2e8f0', borderRadius: '8px', width: '33%', marginBottom: '24px' }}></div>
              <div style={{ height: '280px', backgroundColor: '#f1f5f9', borderRadius: '12px' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Date Range Selector */}
      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg style={{ width: '20px', height: '20px', color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Date Range:</span>
          </div>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <span style={{ color: '#94a3b8' }}>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Revenue Over Time Chart */}
      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Revenue Overview</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Daily revenue trend for selected period</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#6366f1' }}></div>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Revenue</span>
          </div>
        </div>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(350, Math.min(500, revenueData.length * 8))}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                interval={revenueData.length > 60 ? Math.floor(revenueData.length / 15) : revenueData.length > 30 ? 'preserveStartEnd' : 0}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                formatter={(value: number | undefined) => value !== undefined ? [formatCurrency(value), 'Revenue'] : ['', 'Revenue']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#94a3b8' }}>No revenue data for selected date range</p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Payment Methods Pie Chart */}
        <div style={cardStyle}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Payment Methods</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Distribution by payment type</p>
          </div>
          {paymentMethods.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="60%" height={280}>
                <PieChart>
                  <Pie
                    data={paymentMethods.map(m => ({ name: m.paymentMethod, value: m.percentage }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentMethods.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                    formatter={(value: number | undefined) => value !== undefined ? [`${value.toFixed(1)}%`] : ['']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {paymentMethods.map((method, index) => (
                  <div key={method.paymentMethod} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#475569', margin: 0 }}>{method.paymentMethod}</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{method.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#94a3b8' }}>No payment method data</p>
            </div>
          )}
        </div>

        {/* Transaction Status Bar Chart */}
        <div style={cardStyle}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Transaction Status</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Breakdown by status type</p>
          </div>
          {transactionStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={transactionStatus} layout="vertical" barSize={40} barCategoryGap="15%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="status" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                  formatter={(value: number | undefined) => value !== undefined ? [value, 'Transactions'] : ['', 'Transactions']}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {transactionStatus.map((entry, index) => {
                    const statusColors: { [key: string]: string } = {
                      'SUCCESS': '#10b981', // Green
                      'PENDING': '#f59e0b', // Amber/Yellow
                      'FAILED': '#ef4444',  // Red
                    };
                    return <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#6366f1'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#94a3b8' }}>No status data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Charts;
