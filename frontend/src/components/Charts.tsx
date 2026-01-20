import { useEffect, useState, useMemo, useCallback } from 'react';
import {
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
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { analyticsAPI, RevenueOverTime, PaymentMethod, TransactionStatus } from '../services/api';

// Premium chart color palette - 2026 style
const CHART_COLORS = {
  primary: '#7FB3C8',        // Accent Blue - main accent
  primaryLight: '#9FC4BB',
  primaryDark: '#6BA3B8',
  secondary: '#7FB3C8',
  success: '#10b981',        // Premium green
  warning: '#eab308',        // Premium yellow
  error: '#ef4444',          // Premium red
  purple: '#7FB3C8',
  pink: '#7FB3C8',
  teal: '#7FB3C8',
};

const PIE_COLORS = ['#7FB3C8', '#6BA3B8', '#9FC4BB', '#f59e0b', '#7FB3C8', '#7FB3C8'];

// Premium Payment Method Colors - Softer pastel-premium palette (2026)
const PAYMENT_METHOD_COLORS: { [key: string]: { main: string; light: string; glow: string } } = {
  'UPI': { 
    main: '#7FB3C8',      // Accent Blue - primary accent
    light: '#E6F4F1', 
    glow: 'rgba(127, 179, 200, 0.4)' 
  },
  'CREDIT_CARD': { 
    main: '#6BA3B8',      // Darker blue variant
    light: '#D1E8E3', 
    glow: 'rgba(107, 163, 184, 0.4)' 
  },
  'WALLETS': { 
    main: '#9FC4BB',      // Lighter blue variant
    light: '#E6F4F1', 
    glow: 'rgba(159, 196, 187, 0.4)' 
  },
};

// Human-readable labels for payment methods
const PAYMENT_METHOD_LABELS: { [key: string]: string } = {
  'UPI': 'UPI',
  'CREDIT_CARD': 'Credit Card',
  'WALLETS': 'Wallets',
};

// Premium Transaction Status Colors - Refined semantic palette (2026)
const STATUS_COLORS: { [key: string]: { main: string; light: string; glow: string; gradient: string; border: string } } = {
  'SUCCESS': { 
    main: '#2E9C7A',           // Semantic success fill
    light: 'rgba(46, 156, 122, 0.14)', 
    glow: 'rgba(46, 156, 122, 0.4)',
    gradient: 'linear-gradient(90deg, #2E9C7A 0%, #34B896 100%)',
    border: 'rgba(46, 156, 122, 0.35)'
  },
  'PENDING': { 
    main: '#D6A13A',           // Semantic pending fill
    light: 'rgba(214, 161, 58, 0.16)', 
    glow: 'rgba(214, 161, 58, 0.4)',
    gradient: 'linear-gradient(90deg, #D6A13A 0%, #E5B85A 100%)',
    border: 'rgba(214, 161, 58, 0.35)'
  },
  'FAILED': { 
    main: '#D65A5A',           // Semantic failed fill
    light: 'rgba(214, 90, 90, 0.14)', 
    glow: 'rgba(214, 90, 90, 0.4)',
    gradient: 'linear-gradient(90deg, #D65A5A 0%, #E57373 100%)',
    border: 'rgba(214, 90, 90, 0.35)'
  },
};

// Human-readable status labels
const STATUS_LABELS: { [key: string]: string } = {
  'SUCCESS': 'Success',
  'PENDING': 'Pending',
  'FAILED': 'Failed',
};

interface ChartsProps {
  periodDays?: number;
  showDatePicker?: boolean;
}

// Premium Tooltip Component for Revenue Chart
const PremiumRevenueTooltip = ({ 
  active, 
  payload, 
  label, 
  revenueData,
  formatCurrency 
}: any) => {
  if (!active || !payload || !payload.length) return null;

  const currentValue = payload[0]?.value || 0;
  const currentIndex = revenueData?.findIndex((d: RevenueOverTime) => d.date === label);
  const previousValue = currentIndex > 0 ? revenueData[currentIndex - 1]?.revenue : null;
  
  // Calculate delta vs previous day
  let delta = null;
  let deltaPercent = null;
  if (previousValue !== null && previousValue > 0) {
    delta = currentValue - previousValue;
    deltaPercent = ((delta / previousValue) * 100).toFixed(1);
  }

  const formattedDate = new Date(label).toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      borderRadius: '14px',
      padding: '14px 18px',
      boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 16px -4px rgba(0, 0, 0, 0.08)',
      minWidth: '180px',
      animation: 'tooltipFadeIn 0.15s ease-out'
    }}>
      {/* Date Header */}
      <p style={{ 
        fontSize: '11px', 
        fontWeight: 600, 
        color: 'rgba(0, 49, 66, 0.6)', 
        margin: '0 0 10px 0',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {formattedDate}
      </p>
      
      {/* Main Metric Row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        marginBottom: delta !== null ? '10px' : 0
      }}>
        <div style={{ 
          width: '10px', 
          height: '10px', 
          borderRadius: '50%', 
          backgroundColor: CHART_COLORS.primary,
          boxShadow: `0 0 8px ${CHART_COLORS.primary}50`
        }} />
        <div style={{ flex: 1 }}>
          <span style={{ 
            fontSize: '12px', 
            color: 'rgba(0, 49, 66, 0.6)',
            fontWeight: 500 
          }}>Revenue</span>
        </div>
        <span style={{ 
          fontSize: '15px', 
          fontWeight: 700, 
          color: '#003142',
          fontVariantNumeric: 'tabular-nums'
        }}>
          {formatCurrency(currentValue)}
        </span>
      </div>

      {/* Delta vs Previous Day */}
      {delta !== null && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 10px',
          backgroundColor: delta >= 0 ? '#ecfdf5' : '#fef2f2',
          borderRadius: '8px',
          border: `1px solid ${delta >= 0 ? '#d1fae5' : '#fee2e2'}`
        }}>
          <svg 
            width="14" 
            height="14" 
            fill="none" 
            stroke={delta >= 0 ? '#10b981' : '#ef4444'} 
            strokeWidth={2.5} 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d={delta >= 0 
                ? 'M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18' 
                : 'M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3'
              } 
            />
          </svg>
          <span style={{ 
            fontSize: '12px', 
            fontWeight: 600, 
            color: delta >= 0 ? '#059669' : '#dc2626'
          }}>
            {delta >= 0 ? '+' : ''}{deltaPercent}%
          </span>
          <span style={{ 
            fontSize: '11px', 
            color: 'rgba(0, 49, 66, 0.6)',
            marginLeft: '2px'
          }}>
            vs prev day
          </span>
        </div>
      )}
    </div>
  );
};

// Custom Active Dot with Ring Effect
const CustomActiveDot = (props: any) => {
  const { cx, cy } = props;
  if (!cx || !cy) return null;
  
  return (
    <g>
      {/* Outer glow ring */}
      <circle 
        cx={cx} 
        cy={cy} 
        r={12} 
        fill={CHART_COLORS.primary} 
        fillOpacity={0.15}
        style={{ transition: 'all 0.15s ease' }}
      />
      {/* Middle ring */}
      <circle 
        cx={cx} 
        cy={cy} 
        r={8} 
        fill="#ffffff"
        stroke={CHART_COLORS.primary}
        strokeWidth={2}
        style={{ transition: 'all 0.15s ease' }}
      />
      {/* Inner dot */}
      <circle 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill={CHART_COLORS.primary}
        style={{ transition: 'all 0.15s ease' }}
      />
    </g>
  );
};

// Custom Cursor (Vertical Guide Line)
const CustomCursor = (props: any) => {
  const { points, height } = props;
  if (!points || !points[0]) return null;
  
  return (
    <line
      x1={points[0].x}
      y1={0}
      x2={points[0].x}
      y2={height}
      stroke="#cbd5e1"
      strokeWidth={1}
      strokeDasharray="4 4"
      style={{ transition: 'all 0.1s ease' }}
    />
  );
};

// Premium Payment Methods Tooltip
const PremiumPaymentTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const methodKey = data.name;
  const colorConfig = PAYMENT_METHOD_COLORS[methodKey] || { main: '#6366f1', light: '#eef2ff', glow: 'rgba(99, 102, 241, 0.4)' };
  const label = PAYMENT_METHOD_LABELS[methodKey] || methodKey;
  const percentage = data.value;

  return (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      borderRadius: '14px',
      padding: '14px 18px',
      boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 16px -4px rgba(0, 0, 0, 0.08)',
      minWidth: '140px',
      animation: 'tooltipFadeIn 0.15s ease-out'
    }}>
      {/* Header with colored dot and label */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        marginBottom: '10px'
      }}>
        <div style={{ 
          width: '10px', 
          height: '10px', 
          borderRadius: '4px', 
          backgroundColor: colorConfig.main,
          boxShadow: `0 0 10px ${colorConfig.glow}`
        }} />
        <span style={{ 
          fontSize: '14px', 
          fontWeight: 600, 
          color: '#003142'
        }}>
          {label}
        </span>
      </div>
      
      {/* Percentage Value */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '2px'
      }}>
        <span style={{ 
          fontSize: '26px', 
          fontWeight: 700, 
          color: colorConfig.main,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em'
        }}>
          {percentage.toFixed(1)}
        </span>
        <span style={{ 
          fontSize: '16px', 
          fontWeight: 600, 
          color: 'rgba(0, 49, 66, 0.5)'
        }}>
          %
        </span>
      </div>
      
      {/* Subtitle */}
      <p style={{ 
        fontSize: '11px', 
        color: 'rgba(0, 49, 66, 0.6)',
        margin: '6px 0 0 0',
        fontWeight: 500
      }}>
        of total payments
      </p>
    </div>
  );
};

const Charts = ({ periodDays, showDatePicker = true }: ChartsProps) => {
  const [revenueData, setRevenueData] = useState<RevenueOverTime[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showAvgLine, setShowAvgLine] = useState(false);
  const [activePaymentIndex, setActivePaymentIndex] = useState<number | null>(null);
  const [activeStatusIndex, setActiveStatusIndex] = useState<number | null>(null);
  const [statusMetricType, setStatusMetricType] = useState<'count' | 'amount'>('count');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const endDate = new Date();
    let startDate: Date;

    if (periodDays === 0) {
      startDate = new Date('2000-01-01');
    } else {
      const days = periodDays || 30;
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
    }

    const range = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
    setDateRange(range);
  }, [periodDays]);

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

  // Calculate peak, low, and average values
  const { peakPoint, lowPoint, averageValue } = useMemo(() => {
    if (!revenueData || revenueData.length === 0) {
      return { peakPoint: null, lowPoint: null, averageValue: 0 };
    }

    let peak = revenueData[0];
    let low = revenueData[0];
    let sum = 0;

    revenueData.forEach(point => {
      if (point.revenue > peak.revenue) peak = point;
      if (point.revenue < low.revenue) low = point;
      sum += point.revenue;
    });

    return {
      peakPoint: peak,
      lowPoint: low,
      averageValue: sum / revenueData.length
    };
  }, [revenueData]);

  const formatCurrency = useCallback((value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toLocaleString('en-IN')}`;
  }, []);

  // Calculate smart X-axis interval
  const xAxisInterval = useMemo(() => {
    const len = revenueData.length;
    if (len <= 7) return 0;
    if (len <= 14) return 1;
    if (len <= 30) return Math.floor(len / 7);
    if (len <= 60) return Math.floor(len / 10);
    return Math.floor(len / 12);
  }, [revenueData.length]);

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: isMobile ? '20px' : '28px',
    border: '1px solid #D1E8E3',
    boxShadow: '0 1px 3px rgba(0, 49, 66, 0.02), 0 8px 24px -4px rgba(0, 49, 66, 0.04)'
  };

  // Premium card style for revenue chart
  const revenueCardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: isMobile ? '20px' : '28px',
    border: '1px solid #B8D9D1',
    boxShadow: '0 1px 3px rgba(0, 49, 66, 0.02), 0 12px 40px -8px rgba(0, 49, 66, 0.06)',
    position: 'relative',
    overflow: 'hidden'
  };

  if (loading) {
    return (
      <div>
        <div style={{ ...revenueCardStyle, marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div className="skeleton" style={{ height: '22px', width: '180px', borderRadius: '6px', marginBottom: '10px' }} />
              <div className="skeleton" style={{ height: '14px', width: '140px', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="skeleton" style={{ height: '36px', width: '110px', borderRadius: '10px' }} />
              <div className="skeleton" style={{ height: '36px', width: '90px', borderRadius: '10px' }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: isMobile ? '280px' : '360px', borderRadius: '16px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={cardStyle}>
              <div className="skeleton" style={{ height: '20px', width: '140px', borderRadius: '6px', marginBottom: '20px' }} />
              <div className="skeleton" style={{ height: isMobile ? '220px' : '260px', borderRadius: '12px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Tooltip Animation Style */}
      <style>{`
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Date Range Selector */}
      {showDatePicker && (
        <div style={{ ...cardStyle, marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: '16px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #E6F4F1 0%, #D1E8E3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="18" height="18" fill="none" stroke={CHART_COLORS.primary} strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(0, 49, 66, 0.7)' }}>Custom Range</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              flex: isMobile ? 1 : 'none'
            }}>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#F0F9F7',
                  border: '1px solid #B8D9D1',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  flex: isMobile ? 1 : 'none',
                  minWidth: 0,
                  color: 'rgba(0, 49, 66, 0.7)',
                  transition: 'all 0.15s ease'
                }}
              />
              <span style={{ color: 'rgba(0, 49, 66, 0.5)', fontSize: '14px', flexShrink: 0 }}>to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#F0F9F7',
                  border: '1px solid #B8D9D1',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  flex: isMobile ? 1 : 'none',
                  minWidth: 0,
                  color: 'rgba(0, 49, 66, 0.7)',
                  transition: 'all 0.15s ease'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Premium Revenue Over Time Chart */}
      <div className="chart-card" style={{ ...revenueCardStyle, marginBottom: '24px' }}>
        {/* Premium Chart Header */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center', 
          justifyContent: 'space-between', 
          marginBottom: '24px',
          gap: '16px'
        }}>
          {/* Left: Title + Subtitle */}
          <div>
            <h3 style={{ 
              fontSize: isMobile ? '18px' : '20px', 
              fontWeight: 700, 
              color: '#003142', 
              margin: 0,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              Revenue Overview
              {/* Subtle live indicator */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                backgroundColor: '#ecfdf5',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#059669',
                textTransform: 'uppercase',
                letterSpacing: '0.03em'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  animation: 'pulse 2s ease-in-out infinite'
                }} />
                Live
              </span>
            </h3>
            <p style={{ 
              fontSize: '13px', 
              color: 'rgba(0, 49, 66, 0.6)', 
              margin: '6px 0 0 0',
              fontWeight: 500 
            }}>
              Daily revenue trend for selected period
            </p>
          </div>

          {/* Right: Controls */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            {/* Revenue Legend Chip */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '8px 14px',
              backgroundColor: '#F0F9F7',
              borderRadius: '10px',
              border: '1px solid #D1E8E3'
            }}>
              <div style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '3px', 
                backgroundColor: CHART_COLORS.primary 
              }} />
              <span style={{ fontSize: '13px', color: 'rgba(0, 49, 66, 0.6)', fontWeight: 600 }}>Revenue</span>
            </div>

            {/* Average Line Toggle */}
            <button
              onClick={() => setShowAvgLine(!showAvgLine)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: showAvgLine ? '#eef2ff' : '#f8fafc',
                border: `1px solid ${showAvgLine ? CHART_COLORS.primary : '#e2e8f0'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontSize: '13px',
                fontWeight: 500,
                color: showAvgLine ? CHART_COLORS.primary : '#64748b'
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
              <span>Avg Line</span>
            </button>
          </div>
        </div>

        {/* Chart Area */}
        {revenueData.length > 0 ? (
          <div style={{ position: 'relative' }}>
            {/* Peak & Low Annotations Key */}
            {(peakPoint || lowPoint) && (
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '16px',
                paddingLeft: isMobile ? '0' : '60px'
              }}>
                {peakPoint && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: 'rgba(0, 49, 66, 0.6)'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981'
                    }} />
                    <span>Peak: <strong style={{ color: '#003142' }}>{formatCurrency(peakPoint.revenue)}</strong></span>
                  </div>
                )}
                {lowPoint && peakPoint !== lowPoint && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: 'rgba(0, 49, 66, 0.6)'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#f59e0b'
                    }} />
                    <span>Low: <strong style={{ color: '#003142' }}>{formatCurrency(lowPoint.revenue)}</strong></span>
                  </div>
                )}
                {showAvgLine && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: 'rgba(0, 49, 66, 0.6)'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '2px',
                      backgroundColor: '#8b5cf6',
                      borderRadius: '1px'
                    }} />
                    <span>Avg: <strong style={{ color: '#003142' }}>{formatCurrency(averageValue)}</strong></span>
                  </div>
                )}
              </div>
            )}

            <ResponsiveContainer width="100%" height={isMobile ? 280 : 360}>
              <AreaChart 
                data={revenueData} 
                margin={{ 
                  left: isMobile ? -10 : 5, 
                  right: isMobile ? 10 : 20, 
                  top: 20, 
                  bottom: 10 
                }}
              >
                <defs>
                  {/* Premium gradient fill */}
                  <linearGradient id="premiumRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.2}/>
                    <stop offset="50%" stopColor={CHART_COLORS.primary} stopOpacity={0.08}/>
                    <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  {/* Glow effect for line */}
                  <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Subtle Gridlines */}
                <CartesianGrid 
                  strokeDasharray="4 4" 
                  stroke="#D1E8E3" 
                  vertical={false}
                  strokeWidth={1}
                  strokeOpacity={0.8}
                />

                {/* X-Axis */}
                <XAxis
                  dataKey="date"
                  stroke="#B8D9D1"
                  tick={{ 
                    fill: '#94a3b8', 
                    fontSize: isMobile ? 10 : 11,
                    fontWeight: 500 
                  }}
                  tickLine={false}
                  axisLine={{ stroke: '#f1f5f9', strokeWidth: 1 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    });
                  }}
                  interval={xAxisInterval}
                  dy={10}
                  tickMargin={8}
                />

                {/* Y-Axis */}
                <YAxis
                  stroke="#B8D9D1"
                  tick={{ 
                    fill: '#64748b', 
                    fontSize: isMobile ? 10 : 11,
                    fontWeight: 500
                  }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                  width={isMobile ? 50 : 65}
                  tickMargin={8}
                />

                {/* Average Reference Line */}
                {showAvgLine && (
                  <ReferenceLine 
                    y={averageValue} 
                    stroke="#8b5cf6" 
                    strokeDasharray="6 4" 
                    strokeWidth={1.5}
                    strokeOpacity={0.6}
                  />
                )}

                {/* Peak Point Annotation */}
                {peakPoint && (
                  <ReferenceDot
                    x={peakPoint.date}
                    y={peakPoint.revenue}
                    r={0}
                    label={{
                      value: 'Peak',
                      position: 'top',
                      fill: '#10b981',
                      fontSize: 10,
                      fontWeight: 600,
                      dy: -8
                    }}
                  />
                )}

                {/* Low Point Annotation */}
                {lowPoint && peakPoint !== lowPoint && (
                  <ReferenceDot
                    x={lowPoint.date}
                    y={lowPoint.revenue}
                    r={0}
                    label={{
                      value: 'Low',
                      position: 'bottom',
                      fill: '#f59e0b',
                      fontSize: 10,
                      fontWeight: 600,
                      dy: 12
                    }}
                  />
                )}

                {/* Custom Tooltip */}
                <Tooltip 
                  content={
                    <PremiumRevenueTooltip 
                      revenueData={revenueData} 
                      formatCurrency={formatCurrency}
                    />
                  }
                  cursor={<CustomCursor />}
                />

                {/* Area + Line */}
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="url(#premiumRevenueGradient)"
                  name="Revenue"
                  dot={false}
                  activeDot={<CustomActiveDot />}
                  style={{ filter: 'url(#lineGlow)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ 
            height: '320px', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#E6F4F1',
            borderRadius: '16px',
            border: '1px dashed #B8D9D1'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#E6F4F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="28" height="28" fill="none" stroke="#94a3b8" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <p style={{ color: 'rgba(0, 49, 66, 0.7)', fontSize: '15px', fontWeight: 600, margin: 0 }}>No revenue data available</p>
            <p style={{ color: 'rgba(0, 49, 66, 0.5)', fontSize: '13px', marginTop: '6px' }}>Try selecting a different date range</p>
          </div>
        )}
      </div>

      {/* Secondary Charts Grid */}
      <div className="chart-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
        gap: '24px' 
      }}>
        {/* Premium Payment Methods Donut Chart */}
        <div className="chart-card" style={{
          ...cardStyle,
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: isMobile ? '16px' : '18px', 
              fontWeight: 700, 
              color: '#003142', 
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Payment Methods
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(0, 49, 66, 0.6)', margin: '6px 0 0 0', fontWeight: 500 }}>
              Distribution by payment type
            </p>
          </div>
          
          {paymentMethods.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              gap: isMobile ? '24px' : '20px'
            }}>
              {/* Donut Chart with Center Label */}
              <div style={{ 
                position: 'relative',
                width: isMobile ? '100%' : '55%',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
                  <PieChart>
                    <defs>
                      {/* Subtle drop shadow for the donut */}
                      <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.08"/>
                      </filter>
                      {/* Glow effects for each segment */}
                      {paymentMethods.map((method) => (
                        <filter key={`glow-${method.paymentMethod}`} id={`glow-${method.paymentMethod}`} x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      ))}
                    </defs>
                    <Pie
                      data={paymentMethods.map(m => ({ name: m.paymentMethod, value: m.percentage }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 58 : 70}
                      outerRadius={isMobile ? 80 : 92}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={3}
                      cornerRadius={6}
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                      onMouseEnter={(_, index) => setActivePaymentIndex(index)}
                      onMouseLeave={() => setActivePaymentIndex(null)}
                      style={{ filter: 'url(#donutShadow)', cursor: 'pointer' }}
                    >
                      {paymentMethods.map((method, index) => {
                        const colorConfig = PAYMENT_METHOD_COLORS[method.paymentMethod] || { main: PIE_COLORS[index % PIE_COLORS.length] };
                        const isActive = activePaymentIndex === index;
                        const isInactive = activePaymentIndex !== null && activePaymentIndex !== index;
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={colorConfig.main}
                            style={{
                              filter: isActive ? `url(#glow-${method.paymentMethod})` : 'none',
                              opacity: isInactive ? 0.5 : 1,
                              transition: 'all 0.2s ease',
                              transform: isActive ? 'scale(1.04)' : 'scale(1)',
                              transformOrigin: 'center center'
                            }}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip content={<PremiumPaymentTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Label - Positioned absolutely over the donut */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  {/* Primary Label */}
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'rgba(0, 49, 66, 0.6)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    marginBottom: '2px'
                  }}>
                    Payments
                  </span>
                  
                  {/* Main Value */}
                  <span style={{
                    fontSize: isMobile ? '24px' : '28px',
                    fontWeight: 700,
                    color: '#003142',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1
                  }}>
                    100%
                  </span>
                  
                  {/* Secondary Insight - Most used method */}
                  {(() => {
                    const topMethod = paymentMethods.reduce((prev, curr) => 
                      prev.percentage > curr.percentage ? prev : curr
                    );
                    const label = PAYMENT_METHOD_LABELS[topMethod.paymentMethod] || topMethod.paymentMethod;
                    return (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        color: 'rgba(0, 49, 66, 0.5)',
                        marginTop: '4px',
                        maxWidth: isMobile ? '80px' : '90px',
                        lineHeight: 1.3
                      }}>
                        Most used: {label}
                      </span>
                    );
                  })()}
                </div>
              </div>
              
              {/* Premium Legend - Right side */}
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                gap: '10px',
                width: isMobile ? '100%' : 'auto',
                minWidth: isMobile ? 'auto' : '160px'
              }}>
                {paymentMethods.map((method, index) => {
                  const colorConfig = PAYMENT_METHOD_COLORS[method.paymentMethod] || { 
                    main: PIE_COLORS[index % PIE_COLORS.length], 
                    light: '#f8fafc',
                    glow: 'rgba(99, 102, 241, 0.4)'
                  };
                  const label = PAYMENT_METHOD_LABELS[method.paymentMethod] || method.paymentMethod;
                  const isActive = activePaymentIndex === index;
                  const isInactive = activePaymentIndex !== null && activePaymentIndex !== index;
                  
                  return (
                    <div 
                      key={method.paymentMethod}
                      onMouseEnter={() => setActivePaymentIndex(index)}
                      onMouseLeave={() => setActivePaymentIndex(null)}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '12px 14px',
                        backgroundColor: isActive ? colorConfig.light : '#f8fafc',
                        borderRadius: '12px',
                        border: `1px solid ${isActive ? colorConfig.main + '30' : '#f1f5f9'}`,
                        boxShadow: isActive ? `0 0 0 3px ${colorConfig.main}15` : 'none',
                        opacity: isInactive ? 0.6 : 1,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        transform: isActive ? 'translateX(4px)' : 'translateX(0)'
                      }}
                    >
                      {/* Top row: Dot + Label + Percentage */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Color dot with glow */}
                          <div style={{ 
                            width: '10px', 
                            height: '10px', 
                            borderRadius: '4px', 
                            backgroundColor: colorConfig.main,
                            boxShadow: isActive ? `0 0 10px ${colorConfig.glow}` : `0 0 6px ${colorConfig.glow}`,
                            flexShrink: 0,
                            transition: 'box-shadow 0.2s ease'
                          }} />
                          {/* Label */}
                          <span style={{ 
                            fontSize: '13px', 
                            fontWeight: 600, 
                            color: 'rgba(0, 49, 66, 0.7)'
                          }}>
                            {label}
                          </span>
                        </div>
                        {/* Percentage */}
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: 700, 
                          color: '#003142',
                          fontVariantNumeric: 'tabular-nums'
                        }}>
                          {method.percentage.toFixed(1)}%
                        </span>
                      </div>
                      
                      {/* Mini progress bar */}
                      <div style={{
                        width: '100%',
                        height: '4px',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${method.percentage}%`,
                          height: '100%',
                          backgroundColor: colorConfig.main,
                          borderRadius: '2px',
                          transition: 'width 0.8s ease-out'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ 
              height: '220px', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#E6F4F1',
              borderRadius: '16px',
              border: '1px dashed #B8D9D1'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#E6F4F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <svg width="24" height="24" fill="none" stroke="#94a3b8" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <p style={{ color: 'rgba(0, 49, 66, 0.7)', fontSize: '14px', fontWeight: 600, margin: 0 }}>No payment method data</p>
              <p style={{ color: 'rgba(0, 49, 66, 0.5)', fontSize: '12px', marginTop: '4px' }}>Data will appear when available</p>
            </div>
          )}
        </div>

        {/* Premium Transaction Status Bar Chart */}
        <div className="chart-card" style={{
          ...cardStyle,
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Header with optional metric toggle */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '24px',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div>
              <h3 style={{ 
                fontSize: isMobile ? '16px' : '18px', 
                fontWeight: 700, 
                color: '#003142', 
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                Transaction Status
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(0, 49, 66, 0.6)', margin: '6px 0 0 0', fontWeight: 500 }}>
                Breakdown by status type{statusMetricType === 'amount' && (
                  <span style={{ 
                    fontSize: '11px', 
                    color: 'rgba(0, 49, 66, 0.5)',
                    marginLeft: '8px',
                    fontStyle: 'italic'
                  }}>
                    • Estimated amounts
                  </span>
                )}
              </p>
            </div>
            
            {/* Metric selector chip */}
            <div style={{
              display: 'flex',
              gap: '6px',
              padding: '4px',
              backgroundColor: '#F0F9F7',
              borderRadius: '10px',
              border: '1px solid #D1E8E3'
            }}>
              <button 
                onClick={() => setStatusMetricType('count')}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: statusMetricType === 'count' ? 600 : 500,
                  color: statusMetricType === 'count' ? '#003142' : 'rgba(0, 49, 66, 0.6)',
              backgroundColor: statusMetricType === 'count' ? '#ffffff' : 'transparent',
                border: statusMetricType === 'count' ? '1px solid rgba(0, 49, 66, 0.1)' : 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: statusMetricType === 'count' ? '0 1px 2px rgba(0, 49, 66, 0.05)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Count
            </button>
            <button 
              onClick={() => setStatusMetricType('amount')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: statusMetricType === 'amount' ? 600 : 500,
                color: statusMetricType === 'amount' ? '#003142' : 'rgba(0, 49, 66, 0.6)',
                backgroundColor: statusMetricType === 'amount' ? '#ffffff' : 'transparent',
                border: statusMetricType === 'amount' ? '1px solid rgba(0, 49, 66, 0.1)' : 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: statusMetricType === 'amount' ? '0 1px 2px rgba(0, 49, 66, 0.05)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Amount
            </button>
            </div>
          </div>
          
          {transactionStatus.length > 0 ? (
            (() => {
              // Calculate estimated amounts (₹500-2000 average per transaction based on status)
              const ESTIMATED_AVG_AMOUNTS: { [key: string]: number } = {
                'SUCCESS': 1500,
                'PENDING': 1200,
                'FAILED': 800,
              };
              
              const statusWithAmounts = transactionStatus.map(s => ({
                ...s,
                estimatedAmount: s.count * (ESTIMATED_AVG_AMOUNTS[s.status] || 1000)
              }));
              
              return (
                <div style={{ position: 'relative' }}>
                  {/* Custom bar chart with tracks and labels */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '20px' : '24px',
                    padding: isMobile ? '0' : '0 12px'
                  }}>
                    {statusWithAmounts.map((entry, index) => {
                      const colorConfig = STATUS_COLORS[entry.status] || { 
                        main: '#7FB3C8', 
                        light: '#E6F4F1',
                        glow: 'rgba(127, 179, 200, 0.3)',
                        gradient: 'linear-gradient(90deg, #7FB3C8 0%, #9FC4BB 100%)',
                        border: 'rgba(127, 179, 200, 0.35)'
                      };
                      const label = STATUS_LABELS[entry.status] || entry.status;
                      const isActive = activeStatusIndex === index;
                      const isInactive = activeStatusIndex !== null && activeStatusIndex !== index;
                      
                      // Calculate values based on selected metric
                      const displayValue = statusMetricType === 'count' ? entry.count : entry.estimatedAmount;
                      const total = statusMetricType === 'count' 
                        ? statusWithAmounts.reduce((sum, s) => sum + s.count, 0)
                        : statusWithAmounts.reduce((sum, s) => sum + s.estimatedAmount, 0);
                      const percentage = total > 0 ? (displayValue / total) * 100 : 0;
                      const maxValue = statusMetricType === 'count'
                        ? Math.max(...statusWithAmounts.map(s => s.count))
                        : Math.max(...statusWithAmounts.map(s => s.estimatedAmount));
                      const barWidth = (displayValue / maxValue) * 100;
                      
                      // Format display value
                      const formatValue = (val: number) => {
                        if (statusMetricType === 'amount') {
                          if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
                          if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
                          if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
                          return `₹${val.toLocaleString('en-IN')}`;
                        }
                        return val.toLocaleString();
                      };
                      
                      return (
                        <div 
                          key={entry.status}
                          onMouseEnter={() => setActiveStatusIndex(index)}
                          onMouseLeave={() => setActiveStatusIndex(null)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? '10px' : '16px',
                            opacity: isInactive ? 0.5 : 1,
                            transition: 'opacity 0.2s ease',
                            cursor: 'pointer'
                          }}
                        >
                          {/* Status Label (Left) */}
                          <div style={{
                            minWidth: isMobile ? '70px' : '90px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: colorConfig.main,
                              boxShadow: isActive ? `0 0 8px ${colorConfig.glow}` : 'none',
                              transition: 'box-shadow 0.2s ease',
                              flexShrink: 0
                            }} />
                            <span style={{
                              fontSize: isMobile ? '12px' : '13px',
                              fontWeight: 600,
                              color: 'rgba(0, 49, 66, 0.7)',
                              textTransform: 'capitalize'
                            }}>
                              {label}
                            </span>
                          </div>
                          
                          {/* Bar Container with Track */}
                          <div style={{
                            flex: 1,
                            position: 'relative',
                            height: isMobile ? '28px' : '32px',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {/* Track (Background) */}
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              backgroundColor: isActive ? colorConfig.light : '#E6F4F1',
                              borderRadius: '12px',
                              border: `1px solid ${isActive ? colorConfig.border : 'rgba(0, 49, 66, 0.1)'}`,
                              transition: 'all 0.2s ease'
                            }} />
                            
                            {/* Actual Bar */}
                            <div style={{
                              position: 'relative',
                              width: `${barWidth}%`,
                              height: '100%',
                              background: isActive ? colorConfig.gradient : colorConfig.main,
                              borderRadius: '12px',
                              boxShadow: isActive ? `0 4px 16px ${colorConfig.glow}` : '0 2px 8px rgba(0, 49, 66, 0.06)',
                              transition: 'all 0.25s ease',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              paddingRight: barWidth > 25 ? '12px' : '0',
                              transform: isActive ? 'scaleY(1.08)' : 'scaleY(1)',
                              transformOrigin: 'left center',
                              animation: 'barGrow 0.8s ease-out'
                            }}>
                              {/* Inner label (if bar is wide enough) */}
                              {barWidth > 30 && (
                                <span style={{
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: '#ffffff',
                                  fontVariantNumeric: 'tabular-nums',
                                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}>
                                  {formatValue(displayValue)}
                                </span>
                              )}
                              
                              {/* End marker dot */}
                              {isActive && (
                                <div style={{
                                  position: 'absolute',
                                  right: '-5px',
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  backgroundColor: '#ffffff',
                                  border: `2px solid ${colorConfig.main}`,
                                  boxShadow: `0 0 10px ${colorConfig.glow}`,
                                  animation: 'dotPulse 1.5s ease-in-out infinite'
                                }} />
                              )}
                            </div>
                          </div>
                          
                          {/* Value + Percentage (Right) */}
                          <div style={{
                            minWidth: isMobile ? '90px' : '110px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: '2px'
                          }}>
                            <span style={{
                              fontSize: isMobile ? '13px' : '14px',
                              fontWeight: 700,
                              color: '#003142',
                              fontVariantNumeric: 'tabular-nums'
                            }}>
                              {formatValue(displayValue)}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: colorConfig.main,
                              fontVariantNumeric: 'tabular-nums'
                            }}>
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Total summary bar at bottom */}
                  <div style={{
                    marginTop: isMobile ? '20px' : '24px',
                    paddingTop: isMobile ? '16px' : '20px',
                    borderTop: '1px solid rgba(0, 49, 66, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: isMobile ? '16px 0 0 0' : '20px 12px 0 12px'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'rgba(0, 49, 66, 0.6)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Total {statusMetricType === 'amount' ? 'Amount' : 'Count'}
                    </span>
                    <span style={{
                      fontSize: isMobile ? '18px' : '20px',
                      fontWeight: 700,
                      color: '#003142',
                      fontVariantNumeric: 'tabular-nums'
                    }}>
                      {(() => {
                        const totalValue = statusMetricType === 'count'
                          ? statusWithAmounts.reduce((sum, s) => sum + s.count, 0)
                          : statusWithAmounts.reduce((sum, s) => sum + s.estimatedAmount, 0);
                        
                        if (statusMetricType === 'amount') {
                          if (totalValue >= 10000000) return `₹${(totalValue / 10000000).toFixed(2)}Cr`;
                          if (totalValue >= 100000) return `₹${(totalValue / 100000).toFixed(2)}L`;
                          if (totalValue >= 1000) return `₹${(totalValue / 1000).toFixed(1)}K`;
                          return `₹${totalValue.toLocaleString('en-IN')}`;
                        }
                        return totalValue.toLocaleString();
                      })()}
                    </span>
                  </div>
                </div>
              );
            })()
          ) : (
            <div style={{ 
              height: '220px', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#E6F4F1',
              borderRadius: '16px',
              border: '1px dashed #B8D9D1'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#E6F4F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <svg width="24" height="24" fill="none" stroke="#94a3b8" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <p style={{ color: 'rgba(0, 49, 66, 0.7)', fontSize: '14px', fontWeight: 600, margin: 0 }}>No status data available</p>
              <p style={{ color: 'rgba(0, 49, 66, 0.5)', fontSize: '12px', marginTop: '4px' }}>Data will appear when available</p>
            </div>
          )}
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        @keyframes barGrow {
          from { 
            width: 0;
            opacity: 0.8;
          }
          to { 
            width: 100%;
            opacity: 1;
          }
        }
        
        @keyframes dotPulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 1;
          }
          50% { 
            transform: scale(1.2); 
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default Charts;
