import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from 'recharts';
import { 
  analyticsAPI, 
  DailyTransaction, 
  PaymentMethod, 
  HourlyTransaction 
} from '../services/api';

const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  cyan: '#06b6d4',
  orange: '#f97316',
};

const PAYMENT_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.purple, COLORS.pink, COLORS.cyan];
const STATUS_COLORS: { [key: string]: string } = {
  'SUCCESS': COLORS.success,
  'PENDING': COLORS.warning,
  'FAILED': COLORS.danger,
};

const AdvancedCharts = () => {
  const [dailyData, setDailyData] = useState<DailyTransaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    setDateRange({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    });
  }, []);

  useEffect(() => {
    if (!dateRange.startDate || !dateRange.endDate) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [daily, payments, hourly] = await Promise.all([
          analyticsAPI.getDailyTransactions(dateRange.startDate, dateRange.endDate),
          analyticsAPI.getPaymentMethods(dateRange.startDate, dateRange.endDate),
          analyticsAPI.getHourlyTransactions(dateRange.startDate, dateRange.endDate),
        ]);

        setDailyData(daily);
        setPaymentMethods(payments);
        setHourlyData(hourly);
      } catch (err) {
        console.error('Failed to load advanced chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value.toFixed(0)}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #f1f5f9',
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
  };

  // Prepare stacked bar data for status split by date
  const stackedStatusData = dailyData.map(day => ({
    date: day.date,
    SUCCESS: day.successfulTransactions,
    FAILED: day.failedTransactions,
    PENDING: day.totalTransactions - day.successfulTransactions - day.failedTransactions,
  }));

  // Prepare heatmap data
  const getHeatmapColor = (count: number) => {
    const maxCount = Math.max(...hourlyData.map(h => h.transactionCount), 1);
    const intensity = count / maxCount;
    if (intensity > 0.8) return '#6366f1';
    if (intensity > 0.6) return '#818cf8';
    if (intensity > 0.4) return '#a5b4fc';
    if (intensity > 0.2) return '#c7d2fe';
    if (intensity > 0) return '#e0e7ff';
    return '#f1f5f9';
  };

  if (loading) {
    return (
      <div>
        <div style={{ ...cardStyle, marginBottom: '24px' }}>
          <div style={{ height: '24px', backgroundColor: '#e2e8f0', borderRadius: '8px', width: '25%', marginBottom: '24px' }}></div>
          <div style={{ height: '350px', backgroundColor: '#f1f5f9', borderRadius: '12px' }}></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
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
            style={inputStyle}
          />
          <span style={{ color: '#94a3b8' }}>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Chart 1: Daily Volume vs GTV (Bar + Line Combo) */}
      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Daily Volume vs GTV</h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Transaction count (bars) and Gross Transaction Value (line)</p>
        </div>
        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                interval={dailyData.length > 15 ? Math.floor(dailyData.length / 10) : 0}
              />
              <YAxis
                yAxisId="left"
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatNumber}
                label={{ value: 'Volume', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
                label={{ value: 'GTV', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                formatter={(value: number | undefined, name: string) => {
                  if (value === undefined) return ['', name];
                  if (name === 'totalTransactions') return [formatNumber(value), 'Volume'];
                  if (name === 'totalAmount') return [formatCurrency(value), 'GTV'];
                  return [value, name];
                }}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              />
              <Legend 
                formatter={(value) => value === 'totalTransactions' ? 'Volume' : 'GTV'}
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Bar yAxisId="left" dataKey="totalTransactions" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={dailyData.length > 30 ? 8 : 16} />
              <Line yAxisId="right" type="monotone" dataKey="totalAmount" stroke={COLORS.success} strokeWidth={3} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#94a3b8' }}>No data for selected date range</p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Chart 2: Payment Method Split (Donut Chart) */}
        <div style={cardStyle}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Payment Method Split</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Distribution by payment type</p>
          </div>
          {paymentMethods.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="55%" height={280}>
                <PieChart>
                  <Pie
                    data={paymentMethods.map(m => ({ name: m.paymentMethod, value: m.percentage, amount: m.totalAmount, count: m.transactionCount }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentMethods.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                    formatter={(value: number | undefined, _name: string, props: any) => {
                      if (value === undefined) return [''];
                      return [
                        <span key="tooltip">
                          <strong>{value.toFixed(1)}%</strong><br/>
                          {formatCurrency(props.payload.amount)}<br/>
                          {formatNumber(props.payload.count)} txns
                        </span>
                      ];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {paymentMethods.map((method, index) => (
                  <div key={method.paymentMethod} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: PAYMENT_COLORS[index % PAYMENT_COLORS.length] }}></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#334155', margin: 0 }}>{method.paymentMethod}</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                        {method.percentage.toFixed(1)}% • {formatCurrency(method.totalAmount)}
                      </p>
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

        {/* Chart 3: Status Split (Stacked Bar) */}
        <div style={cardStyle}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Status Split Over Time</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Daily breakdown by transaction status</p>
          </div>
          {stackedStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stackedStatusData} barSize={stackedStatusData.length > 20 ? 12 : 20} barCategoryGap="10%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric' })}
                  interval={stackedStatusData.length > 15 ? Math.floor(stackedStatusData.length / 8) : 0}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatNumber}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                  formatter={(value: number | undefined, name: string) => value !== undefined ? [formatNumber(value), name] : ['', name]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="SUCCESS" stackId="status" fill={STATUS_COLORS.SUCCESS} radius={[0, 0, 0, 0]} />
                <Bar dataKey="PENDING" stackId="status" fill={STATUS_COLORS.PENDING} radius={[0, 0, 0, 0]} />
                <Bar dataKey="FAILED" stackId="status" fill={STATUS_COLORS.FAILED} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#94a3b8' }}>No status data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Chart 4: Hourly Heatmap */}
      <div style={cardStyle}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Hourly Transaction Heatmap</h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Transaction volume by hour of day</p>
        </div>
        {hourlyData.length > 0 ? (
          <div>
            {/* Heatmap Grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
              {hourlyData.map((hour) => (
                <div
                  key={hour.hour}
                  style={{
                    width: 'calc(4.166% - 6px)',
                    minWidth: '50px',
                    aspectRatio: '1',
                    backgroundColor: getHeatmapColor(hour.transactionCount),
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  title={`${formatHour(hour.hour)}: ${formatNumber(hour.transactionCount)} transactions, ${formatCurrency(hour.totalAmount)}`}
                >
                  <span style={{ fontSize: '11px', fontWeight: 600, color: hour.transactionCount > 0 ? '#334155' : '#94a3b8' }}>
                    {formatHour(hour.hour)}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: hour.transactionCount > 0 ? '#0f172a' : '#cbd5e1' }}>
                    {formatNumber(hour.transactionCount)}
                  </span>
                </div>
              ))}
            </div>

            {/* Hourly Bar Chart */}
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData} barSize={20} barCategoryGap="15%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="hour"
                  stroke="#94a3b8"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatHour}
                  interval={1}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatNumber}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                  formatter={(value: number | undefined, name: string) => {
                    if (value === undefined) return ['', name];
                    if (name === 'transactionCount') return [formatNumber(value), 'Transactions'];
                    if (name === 'totalAmount') return [formatCurrency(value), 'Volume'];
                    return [value, name];
                  }}
                  labelFormatter={(hour) => formatHour(hour as number)}
                />
                <Bar dataKey="transactionCount" fill={COLORS.primary} radius={[4, 4, 0, 0]}>
                  {hourlyData.map((entry) => (
                    <Cell key={`cell-${entry.hour}`} fill={getHeatmapColor(entry.transactionCount)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Low</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['#f1f5f9', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'].map((color, i) => (
                  <div key={i} style={{ width: '24px', height: '12px', backgroundColor: color, borderRadius: '2px' }}></div>
                ))}
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>High</span>
            </div>
          </div>
        ) : (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#94a3b8' }}>No hourly data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedCharts;
