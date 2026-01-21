import { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Receipt,
  CircleDollarSign,
  CheckCircle2,
  UserPlus,
  Clock,
  BarChart3,
  AlertTriangle,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
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
            <AlertCircle size={24} strokeWidth={1.5} style={{ color: 'var(--error)' }} />
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
      icon: <Users size={20} strokeWidth={1.5} />,
    },
    {
      title: 'Transactions',
      value: formatNumber(kpis.totalTransactions),
      change: kpis.totalTransactionsChange,
      metricType: 'positive',
      theme: KPI_THEMES[1],
      sparkData: sparklineData.transactions,
      icon: <Receipt size={20} strokeWidth={1.5} />,
    },
    {
      title: 'Total GTV',
      value: formatCurrency(kpis.totalGTV),
      change: kpis.totalGTVChange,
      metricType: 'positive',
      theme: KPI_THEMES[2],
      sparkData: sparklineData.gtv,
      icon: <CircleDollarSign size={20} strokeWidth={1.5} />,
    },
    {
      title: 'Success Rate',
      value: `${kpis.successRate.toFixed(1)}%`,
      change: kpis.successRateChange,
      metricType: 'successRate',
      theme: getSuccessRateTheme(kpis.successRate),
      sparkData: sparklineData.successRate,
      icon: <CheckCircle2 size={20} strokeWidth={1.5} />,
    },
    {
      title: 'New Users',
      value: formatNumber(kpis.newUsersToday),
      change: kpis.newUsersTodayChange,
      metricType: 'positive',
      theme: KPI_THEMES[4],
      // Use transactions as proxy for new user activity
      sparkData: sparklineData.transactions,
      icon: <UserPlus size={20} strokeWidth={1.5} />,
    },
    {
      title: 'Pending',
      value: formatNumber(kpis.pendingTransactions),
      change: kpis.pendingTransactionsChange,
      metricType: 'pending',
      theme: KPI_THEMES[5],
      sparkData: sparklineData.pending,
      icon: <Clock size={20} strokeWidth={1.5} />,
    },
    {
      title: 'Avg Ticket',
      value: formatCurrency(kpis.averageTicketSize),
      change: kpis.averageTicketSizeChange,
      metricType: 'positive',
      theme: KPI_THEMES[6],
      sparkData: sparklineData.avgTicket,
      icon: <BarChart3 size={20} strokeWidth={1.5} />,
    },
    {
      title: 'Failed Vol.',
      value: formatCurrency(kpis.failedVolume),
      change: kpis.failedVolumeChange,
      metricType: 'failed',
      theme: KPI_THEMES[7],
      sparkData: sparklineData.failed,
      icon: <AlertTriangle size={20} strokeWidth={1.5} />,
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
                {card.change >= 0 ? <ArrowUp size={12} strokeWidth={2.5} /> : <ArrowDown size={12} strokeWidth={2.5} />}
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
