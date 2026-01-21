import { useEffect, useState, useMemo } from 'react';
import { analyticsAPI, KPIComparison, DailyTransaction } from '../services/api';

interface KPICardsProps {
  periodDays?: number;
}

// Premium color palette for KPI cards - 2026 style
const KPI_THEMES = [
  { 
    name: 'blue',
    iconBg: 'linear-gradient(135deg, #E6F4F1 0%, #D1E8E3 100%)',
    iconColor: '#7FB3C8',
    accentBorder: '#7FB3C8',
    sparkColor: '#7FB3C8'
  },
  { 
    name: 'emerald',
    iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
    iconColor: '#059669',
    accentBorder: '#6EE7B7',
    sparkColor: '#10B981'
  },
  { 
    name: 'violet',
    iconBg: 'linear-gradient(135deg, #E6F4F1 0%, #D1E8E3 100%)',
    iconColor: '#7FB3C8',
    accentBorder: '#7FB3C8',
    sparkColor: '#7FB3C8'
  },
  { 
    name: 'teal',
    iconBg: 'linear-gradient(135deg, #E6F4F1 0%, #D1E8E3 100%)',
    iconColor: '#7FB3C8',
    accentBorder: '#7FB3C8',
    sparkColor: '#7FB3C8'
  },
  { 
    name: 'indigo',
    iconBg: 'linear-gradient(135deg, #E6F4F1 0%, #D1E8E3 100%)',
    iconColor: '#7FB3C8',
    accentBorder: '#7FB3C8',
    sparkColor: '#7FB3C8'
  },
  { 
    name: 'amber',
    iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    iconColor: '#D97706',
    accentBorder: '#FCD34D',
    sparkColor: '#F59E0B'
  },
  { 
    name: 'pink',
    iconBg: 'linear-gradient(135deg, #E6F4F1 0%, #D1E8E3 100%)',
    iconColor: '#7FB3C8',
    accentBorder: '#7FB3C8',
    sparkColor: '#7FB3C8'
  },
  { 
    name: 'rose',
    iconBg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
    iconColor: '#DC2626',
    accentBorder: '#FCA5A5',
    sparkColor: '#EF4444'
  },
];

// Mini Sparkline Component - Improved
const Sparkline = ({ 
  data, 
  color, 
  isHovered,
  barCount = 12
}: { 
  data: number[]; 
  color: string; 
  isHovered: boolean;
  barCount?: number;
}) => {
  // If no data or empty, show placeholder bars
  if (!data || data.length === 0) {
    return (
      <div style={{
        marginTop: '12px',
        height: '28px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '2px',
        opacity: 0.3
      }}>
        {Array(barCount).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${20 + Math.random() * 60}%`,
              backgroundColor: color,
              borderRadius: '2px',
              opacity: 0.2
            }}
          />
        ))}
      </div>
    );
  }
  
  // Filter out any NaN or undefined values and ensure numbers
  const cleanData = data.map(v => {
    const num = Number(v);
    return isNaN(num) ? 0 : num;
  });
  
  // Get max value, ensuring it's at least 1 to avoid division by zero
  const max = Math.max(...cleanData, 1);
  const min = Math.min(...cleanData.filter(v => v > 0), 0);
  
  // Normalize to percentages (with a minimum height of 8% for visibility)
  const normalized = cleanData.map(v => {
    if (max === min || max === 0) return 50; // All same values, show 50%
    const percent = ((v - min) / (max - min)) * 100;
    return Math.max(percent, 8); // Minimum 8% height for visibility
  });
  
  return (
    <div style={{
      marginTop: '12px',
      height: '28px',
      display: 'flex',
      alignItems: 'flex-end',
      gap: '2px',
      opacity: isHovered ? 1 : 0.6,
      transition: 'opacity 0.2s ease'
    }}>
      {normalized.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${h}%`,
            backgroundColor: color,
            borderRadius: '2px',
            opacity: 0.4 + (i / normalized.length) * 0.6,
            transition: 'height 0.3s ease, opacity 0.2s ease'
          }}
        />
      ))}
    </div>
  );
};

const KPICards = ({ periodDays = 7 }: KPICardsProps) => {
  const [kpis, setKpis] = useState<KPIComparison | null>(null);
  const [dailyData, setDailyData] = useState<DailyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Calculate date range for sparkline data
        const endDate = new Date();
        let startDate: Date;
        
        if (periodDays === 0) {
          // All time - get last 90 days for sparkline
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 90);
        } else {
          startDate = new Date();
          startDate.setDate(startDate.getDate() - periodDays);
        }
        
        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        
        // Fetch both KPI comparison and daily data in parallel
        const [kpiData, daily] = await Promise.all([
          analyticsAPI.getKPIComparison(periodDays),
          analyticsAPI.getDailyTransactions(formatDate(startDate), formatDate(endDate))
        ]);
        
        setKpis(kpiData);
        setDailyData(daily || []);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load KPIs';
        setError(errorMessage);
        console.error('KPI Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodDays]);

  // Generate sparkline data for each KPI from daily transactions
  const sparklineData = useMemo(() => {
    const maxPoints = isMobile ? 10 : 12;
    
    if (!dailyData || dailyData.length === 0) {
      return {
        transactions: [],
        gtv: [],
        successRate: [],
        failed: [],
        successful: [],
        pending: [],
        avgTicket: []
      };
    }

    // Sort by date and take last N points
    const sortedData = [...dailyData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const dataToUse = sortedData.slice(-maxPoints);

    // Extract data for each metric
    const transactions = dataToUse.map(d => d.totalTransactions || 0);
    const gtv = dataToUse.map(d => d.totalAmount || 0);
    const successRate = dataToUse.map(d => d.successRate || 0);
    const failed = dataToUse.map(d => d.failedTransactions || 0);
    const successful = dataToUse.map(d => d.successfulTransactions || 0);
    const pending = dataToUse.map(d => {
      const total = d.totalTransactions || 0;
      const success = d.successfulTransactions || 0;
      const fail = d.failedTransactions || 0;
      return Math.max(0, total - success - fail);
    });
    const avgTicket = dataToUse.map(d => {
      const total = d.totalTransactions || 0;
      const amount = d.totalAmount || 0;
      return total > 0 ? amount / total : 0;
    });

    return {
      transactions,
      gtv,
      successRate,
      failed,
      successful,
      pending,
      avgTicket
    };
  }, [dailyData, isMobile]);

  const getGridColumns = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 480) return 'repeat(2, 1fr)';
      if (window.innerWidth <= 768) return 'repeat(2, 1fr)';
      if (window.innerWidth <= 1024) return 'repeat(2, 1fr)';
      return 'repeat(4, 1fr)';
    }
    return 'repeat(4, 1fr)';
  };

  // Skeleton Loading State
  if (loading) {
    return (
      <div className="kpi-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: getGridColumns(), 
        gap: isMobile ? '12px' : '16px' 
      }}>
        {[...Array(isMobile ? 4 : 8)].map((_, i) => (
          <div 
            key={i} 
            className="animate-fadeInUp"
            style={{ 
              backgroundColor: 'var(--surface-base)', 
              borderRadius: '16px', 
              padding: isMobile ? '18px' : '20px', 
              border: '1px solid var(--border-subtle)',
              animationDelay: `${i * 50}ms`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div className="skeleton" style={{ height: isMobile ? '42px' : '46px', width: isMobile ? '42px' : '46px', borderRadius: '12px' }} />
              <div className="skeleton" style={{ height: '26px', width: '64px', borderRadius: '13px' }} />
            </div>
            <div className="skeleton" style={{ height: isMobile ? '26px' : '30px', width: '65%', borderRadius: '6px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ height: '14px', width: '45%', borderRadius: '4px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '28px', width: '100%', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    );
  }

  // Error State
  if (error || !kpis) {
    return (
      <div style={{ 
        backgroundColor: 'var(--surface-base)', 
        borderRadius: '16px', 
        padding: '28px', 
        border: '1px solid var(--error-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            background: 'var(--error-light)', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <svg width="24" height="24" fill="none" stroke="var(--error)" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Unable to load metrics</p>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>{error || 'Please try again later'}</p>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return new Intl.NumberFormat('en-IN').format(value);
  };

  const formatChange = (change: number) => {
    const prefix = change >= 0 ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  };

  const isPositiveChange = (change: number, metricType: string) => {
    if (metricType === 'failed' || metricType === 'pending') return change <= 0;
    return change >= 0;
  };

  // Dynamic theme for Success Rate based on value
  const getSuccessRateTheme = (rate: number) => {
    if (rate >= 95) {
      // Green theme - Excellent
      return {
        name: 'green',
        iconBg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        iconColor: '#059669',
        accentBorder: '#6ee7b7',
        sparkColor: '#10b981'
      };
    } else if (rate >= 90) {
      // Yellow/Amber theme - Warning
      return {
        name: 'amber',
        iconBg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        iconColor: '#d97706',
        accentBorder: '#fcd34d',
        sparkColor: '#f59e0b'
      };
    } else {
      // Red theme - Critical
      return {
        name: 'red',
        iconBg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        iconColor: '#dc2626',
        accentBorder: '#fca5a5',
        sparkColor: '#ef4444'
      };
    }
  };

  const kpiCards = [
    {
      title: 'Total Users',
      value: formatNumber(kpis.totalUsers),
      change: kpis.totalUsersChange,
      metricType: 'positive',
      theme: KPI_THEMES[0],
      // Use successful transactions as proxy for user activity
      sparkData: sparklineData.successful,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      title: 'Transactions',
      value: formatNumber(kpis.totalTransactions),
      change: kpis.totalTransactionsChange,
      metricType: 'positive',
      theme: KPI_THEMES[1],
      sparkData: sparklineData.transactions,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      ),
    },
    {
      title: 'Total GTV',
      value: formatCurrency(kpis.totalGTV),
      change: kpis.totalGTVChange,
      metricType: 'positive',
      theme: KPI_THEMES[2],
      sparkData: sparklineData.gtv,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Success Rate',
      value: `${kpis.successRate.toFixed(1)}%`,
      change: kpis.successRateChange,
      metricType: 'successRate',
      theme: getSuccessRateTheme(kpis.successRate),
      sparkData: sparklineData.successRate,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'New Users',
      value: formatNumber(kpis.newUsersToday),
      change: kpis.newUsersTodayChange,
      metricType: 'positive',
      theme: KPI_THEMES[4],
      // Use transactions as proxy for new user activity
      sparkData: sparklineData.transactions,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
      ),
    },
    {
      title: 'Pending',
      value: formatNumber(kpis.pendingTransactions),
      change: kpis.pendingTransactionsChange,
      metricType: 'pending',
      theme: KPI_THEMES[5],
      sparkData: sparklineData.pending,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Avg Ticket',
      value: formatCurrency(kpis.averageTicketSize),
      change: kpis.averageTicketSizeChange,
      metricType: 'positive',
      theme: KPI_THEMES[6],
      sparkData: sparklineData.avgTicket,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      title: 'Failed Vol.',
      value: formatCurrency(kpis.failedVolume),
      change: kpis.failedVolumeChange,
      metricType: 'failed',
      theme: KPI_THEMES[7],
      sparkData: sparklineData.failed,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
  ];

  return (
    <div 
      className="kpi-grid"
      style={{ 
        display: 'grid', 
        gridTemplateColumns: getGridColumns(), 
        gap: isMobile ? '12px' : '16px' 
      }}
    >
      {kpiCards.map((card, index) => {
        const isGood = isPositiveChange(card.change, card.metricType);
        const isHovered = hoveredCard === index;
        
        return (
          <div
            key={index}
            className="kpi-card animate-fadeInUp"
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              backgroundColor: 'var(--surface-base)',
              borderRadius: '16px',
              padding: isMobile ? '18px' : '20px',
              border: `1px solid ${isHovered ? card.theme.accentBorder : 'var(--border-subtle)'}`,
              boxShadow: isHovered 
                ? 'var(--shadow-card-hover)' 
                : 'var(--shadow-card)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'both'
            }}
          >
            {/* Header Row */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              justifyContent: 'space-between', 
              marginBottom: '14px' 
            }}>
              {/* Icon */}
              <div 
                className="kpi-icon"
                style={{
                  width: isMobile ? '42px' : '46px',
                  height: isMobile ? '42px' : '46px',
                  background: card.theme.iconBg,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: card.theme.iconColor,
                  transition: 'transform 0.2s ease',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {card.icon}
              </div>
              
              {/* Trend Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: isGood ? 'var(--success-light)' : 'var(--error-light)',
                color: isGood ? 'var(--success)' : 'var(--error)',
                border: `1px solid ${isGood ? 'var(--success-soft)' : 'var(--error-soft)'}`
              }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.change >= 0 ? 'M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18' : 'M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3'} />
                </svg>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatChange(card.change)}</span>
              </div>
            </div>
            
            {/* Value & Label */}
            <div>
              <p 
                className="kpi-value text-numeric"
                style={{ 
                  fontSize: isMobile ? '24px' : '28px', 
                  fontWeight: 700, 
                  color: 'var(--text-primary)', 
                  margin: '0 0 4px 0',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {card.value}
              </p>
              <p 
                className="kpi-title"
                style={{ 
                  fontSize: isMobile ? '12px' : '13px', 
                  color: 'var(--text-tertiary)', 
                  margin: 0,
                  fontWeight: 500,
                  letterSpacing: '0.01em'
                }}
              >
                {card.title}
              </p>
            </div>
            
            {/* Dynamic Sparkline */}
            <Sparkline 
              data={card.sparkData} 
              color={card.theme.sparkColor}
              isHovered={isHovered}
              barCount={isMobile ? 10 : 12}
            />
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
