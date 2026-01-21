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
  ComposedChart,
} from 'recharts';
import { 
  analyticsAPI, 
  DailyTransaction, 
  PaymentMethod, 
  HourlyTransaction 
} from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

// Premium color palette
const COLORS = {
  primary: '#7FB3C8',
  primaryLight: '#9FC4BB',
  secondary: '#7FB3C8',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  purple: '#7FB3C8',
  pink: '#7FB3C8',
  teal: '#7FB3C8',
};

const PIE_COLORS = ['#7FB3C8', '#6BA3B8', '#9FC4BB', '#f59e0b', '#7FB3C8', '#7FB3C8'];

// Premium Payment Method Colors - Muted theme palette matching screenshot
const PAYMENT_METHOD_COLORS: { [key: string]: { main: string; light: string; glow: string } } = {
  'UPI': { 
    main: '#7FB3C8',      // Muted blue-cyan (matches theme)
    light: '#E6F4F1', 
    glow: 'rgba(127, 179, 200, 0.4)' 
  },
  'CREDIT_CARD': { 
    main: '#6BA3B8',      // Muted blue (matches theme)
    light: '#E0EFF2', 
    glow: 'rgba(107, 163, 184, 0.4)' 
  },
  'WALLETS': { 
    main: '#9FC4BB',      // Muted green-cyan (matches theme)
    light: '#EBF6F4', 
    glow: 'rgba(159, 196, 187, 0.4)' 
  },
};

const PAYMENT_METHOD_LABELS: { [key: string]: string } = {
  'UPI': 'UPI',
  'CREDIT_CARD': 'Credit Card',
  'WALLETS': 'Wallets',
};

// ==================== PREMIUM HEATMAP COLOR SYSTEM ====================
// Theme-aware color scales for light and dark modes
const getHeatmapColorScale = (isDark: boolean) => {
  if (isDark) {
    // Dark mode: Gradient from dark navy to lighter accent blue
    return {
      colors: [
        '#001F2A', // 0 - Empty/No data (darkest navy)
        '#002833', // 1 - Very low
        '#003142', // 2 - Low
        '#004052', // 3 - Low-medium
        '#005162', // 4 - Medium-low
        '#006172', // 5 - Medium
        '#5A93A8', // 6 - Medium-high
        '#6BA3B8', // 7 - High
        '#7FB3C8', // 8 - Very high (accent blue)
        '#9FC4BB', // 9 - Peak (lighter accent)
      ],
      textColors: [
        'rgba(240, 249, 247, 0.4)', // 0
        'rgba(240, 249, 247, 0.5)', // 1
        'rgba(240, 249, 247, 0.6)', // 2
        'rgba(240, 249, 247, 0.7)', // 3
        'rgba(240, 249, 247, 0.8)', // 4
        '#F0F9F7', // 5
        '#003142', // 6
        '#003142', // 7
        '#003142', // 8
        '#003142', // 9
      ],
      labelColors: [
        'rgba(240, 249, 247, 0.35)', // 0
        'rgba(240, 249, 247, 0.45)', // 1
        'rgba(240, 249, 247, 0.55)', // 2
        'rgba(240, 249, 247, 0.65)', // 3
        'rgba(240, 249, 247, 0.75)', // 4
        '#F0F9F7', // 5
        '#003142', // 6
        '#003142', // 7
        '#003142', // 8
        '#003142', // 9
      ]
    };
  } else {
    // Light mode: Gradient from light mint to dark navy
    return {
      colors: [
        '#E6F4F1', // 0 - Empty/No data (light mint)
        '#D1E8E3', // 1 - Very low
        '#B8D9D1', // 2 - Low
        '#9FC4BB', // 3 - Low-medium
        '#8BB5AD', // 4 - Medium-low
        '#7FB3C8', // 5 - Medium (accent blue)
        '#6BA3B8', // 6 - Medium-high
        '#5A93A8', // 7 - High
        '#4A8398', // 8 - Very high
        '#003142', // 9 - Peak (primary dark)
      ],
      textColors: [
        'rgba(0, 49, 66, 0.5)', // 0
        'rgba(0, 49, 66, 0.6)', // 1
        'rgba(0, 49, 66, 0.7)', // 2
        'rgba(0, 49, 66, 0.8)', // 3
        '#003142', // 4
        '#003142', // 5
        '#ffffff', // 6
        '#ffffff', // 7
        '#ffffff', // 8
        '#ffffff', // 9
      ],
      labelColors: [
        'rgba(0, 49, 66, 0.4)', // 0
        'rgba(0, 49, 66, 0.5)', // 1
        'rgba(0, 49, 66, 0.6)', // 2
        'rgba(0, 49, 66, 0.7)', // 3
        '#003142', // 4
        '#003142', // 5
        'rgba(255,255,255,0.8)', // 6
        'rgba(255,255,255,0.75)', // 7
        'rgba(255,255,255,0.7)', // 8
        'rgba(255,255,255,0.7)', // 9
      ]
    };
  }
};

// Premium Heatmap Component with all enhanced features
interface HourlyHeatmapPremiumProps {
  hourlyData: HourlyTransaction[];
  isMobile: boolean;
  formatHour: (hour: number) => string;
  formatNumber: (value: number) => string;
  formatCurrency: (value: number) => string;
  cardStyle: React.CSSProperties;
}

const HourlyHeatmapPremium: React.FC<HourlyHeatmapPremiumProps> = ({
  hourlyData,
  isMobile,
  formatHour,
  formatNumber,
  formatCurrency,
  cardStyle
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const HEATMAP_COLOR_SCALE = getHeatmapColorScale(isDark);
  
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    hour: number;
    x: number;
    y: number;
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Trigger load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate statistics for smart insights
  const stats = (() => {
    if (!hourlyData.length) return null;
    
    const counts = hourlyData.map(h => h.transactionCount);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts.filter(c => c > 0));
    const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
    const totalCount = counts.reduce((a, b) => a + b, 0);
    
    // Find peak hours (top 3)
    const sortedByCount = [...hourlyData].sort((a, b) => b.transactionCount - a.transactionCount);
    const peakHours = sortedByCount.slice(0, 3).map(h => h.hour);
    
    // Find lowest hours (bottom 3 with activity)
    const lowestHours = sortedByCount
      .filter(h => h.transactionCount > 0)
      .slice(-3)
      .map(h => h.hour);
    
    return { maxCount, minCount, avgCount, totalCount, peakHours, lowestHours };
  })();

  // Enhanced color calculation with smooth interpolation
  const getHeatmapColorIndex = (count: number): number => {
    if (!stats || count === 0) return 0;
    const intensity = count / stats.maxCount;
    // Map to 1-9 range (0 is reserved for no data)
    return Math.min(9, Math.max(1, Math.ceil(intensity * 9)));
  };

  const getHeatmapColor = (count: number): string => {
    return HEATMAP_COLOR_SCALE.colors[getHeatmapColorIndex(count)];
  };

  const getTextColor = (count: number): string => {
    return HEATMAP_COLOR_SCALE.textColors[getHeatmapColorIndex(count)];
  };

  const getLabelColor = (count: number): string => {
    return HEATMAP_COLOR_SCALE.labelColors[getHeatmapColorIndex(count)];
  };

  // Check if hour is peak or lowest
  const isPeakHour = (hour: number): boolean => stats?.peakHours.includes(hour) ?? false;
  const isLowestHour = (hour: number): boolean => stats?.lowestHours.includes(hour) ?? false;

  // Calculate percentile rank
  const getPercentileRank = (count: number): number => {
    if (!stats || count === 0) return 0;
    const rank = hourlyData.filter(h => h.transactionCount <= count).length;
    return Math.round((rank / hourlyData.length) * 100);
  };

  // Format number with decimal for consistency
  const formatValueConsistent = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  // Handle hover with tooltip positioning
  const handleCellHover = (hour: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredHour(hour);
    setTooltipData({
      hour,
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  };

  const handleCellLeave = () => {
    setHoveredHour(null);
    setTooltipData(null);
  };

  // Get hour data
  const getHourData = (hour: number) => hourlyData.find(h => h.hour === hour);

  // Premium Tooltip Component
  const PremiumTooltip = () => {
    if (!tooltipData || hoveredHour === null) return null;
    
    const hourData = getHourData(hoveredHour);
    if (!hourData) return null;
    
    const percentile = getPercentileRank(hourData.transactionCount);
    const deltaVsAvg = stats ? ((hourData.transactionCount - stats.avgCount) / stats.avgCount * 100) : 0;
    const nextHour = (hoveredHour + 1) % 24;
    
    return (
      <div
        style={{
          position: 'fixed',
          left: tooltipData.x,
          top: tooltipData.y - 12,
          transform: 'translate(-50%, -100%)',
          zIndex: 1000,
          pointerEvents: 'none',
          animation: 'tooltipSlideIn 0.15s ease-out'
        }}
      >
        <div style={{
          backgroundColor: 'var(--surface-overlay)',
          opacity: 0.98,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-default)',
          borderRadius: '14px',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-dropdown)',
          minWidth: '200px'
        }}>
          {/* Hour Range Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            paddingBottom: '10px',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: getHeatmapColor(hourData.transactionCount),
              boxShadow: `0 0 8px ${getHeatmapColor(hourData.transactionCount)}60`
            }} />
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em'
            }}>
              {formatHour(hoveredHour)} – {formatHour(nextHour)}
            </span>
            {isPeakHour(hoveredHour) && (
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#7FB3C8',
                backgroundColor: 'var(--bg-page)',
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.02em'
              }}>
                PEAK
              </span>
            )}
          </div>
          
          {/* Volume Metric */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--text-tertiary)',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Transaction Volume
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1
            }}>
              {hourData.transactionCount.toLocaleString()}
            </div>
          </div>
          
          {/* Stats Row */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '12px'
          }}>
            {/* Percentile Rank */}
            <div>
              <div style={{
                fontSize: '10px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                marginBottom: '2px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Rank
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: percentile >= 75 ? '#7FB3C8' : 'var(--text-secondary)'
              }}>
                Top {100 - percentile}%
              </div>
            </div>
            
            {/* Delta vs Average */}
            <div>
              <div style={{
                fontSize: '10px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                marginBottom: '2px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                vs Avg
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                fontWeight: 600,
                color: deltaVsAvg >= 0 ? 'var(--success)' : 'var(--error)'
              }}>
                <svg 
                  width="12" 
                  height="12" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={2.5} 
                  viewBox="0 0 24 24"
                  style={{ transform: deltaVsAvg < 0 ? 'rotate(180deg)' : 'none' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
                {Math.abs(deltaVsAvg).toFixed(0)}%
              </div>
            </div>
          </div>
          
          {/* Amount */}
          <div style={{
            paddingTop: '10px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 500,
              color: 'rgba(0, 49, 66, 0.5)',
              marginBottom: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Total Value
            </div>
            <div style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {formatCurrency(hourData.totalAmount)}
            </div>
          </div>
        </div>
        
        {/* Tooltip Arrow */}
        <div style={{
          position: 'absolute',
          bottom: '-6px',
          left: '50%',
          width: '12px',
          height: '12px',
          backgroundColor: 'var(--surface-overlay)',
          opacity: 0.98,
          border: '1px solid var(--border-default)',
          borderTop: 'none',
          borderLeft: 'none',
          transform: 'translateX(-50%) rotate(45deg)',
          boxShadow: 'var(--shadow-sm)'
        }} />
      </div>
    );
  };

  // Premium Bar Chart Tooltip
  const PremiumBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length || hoveredHour !== null) return null;
    
    const hourData = payload[0]?.payload;
    if (!hourData) return null;
    
    const deltaVsAvg = stats ? ((hourData.transactionCount - stats.avgCount) / stats.avgCount * 100) : 0;
    const nextHour = (label + 1) % 24;
    
    return (
      <div style={{
        backgroundColor: 'var(--surface-overlay)',
        opacity: 0.98,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-default)',
        borderRadius: '14px',
        padding: '14px 18px',
        boxShadow: 'var(--shadow-dropdown)',
        minWidth: '180px',
        animation: 'tooltipFadeIn 0.15s ease-out'
      }}>
        {/* Hour Range */}
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '3px',
            backgroundColor: getHeatmapColor(hourData.transactionCount)
          }} />
          {formatHour(label)} – {formatHour(nextHour)}
        </div>
        
        {/* Volume */}
        <div style={{
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '8px',
          fontVariantNumeric: 'tabular-nums'
        }}>
          {hourData.transactionCount.toLocaleString()}
        </div>
        
        {/* Delta Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          backgroundColor: deltaVsAvg >= 0 ? '#ecfdf5' : '#fef2f2',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 600,
          color: deltaVsAvg >= 0 ? '#059669' : '#dc2626'
        }}>
          {deltaVsAvg >= 0 ? '+' : ''}{deltaVsAvg.toFixed(0)}% vs avg
        </div>
      </div>
    );
  };

  if (!hourlyData.length) {
    return (
      <div style={cardStyle}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: isMobile ? '17px' : '19px', fontWeight: 700, color: '#003142', margin: 0, letterSpacing: '-0.02em' }}>
            Hourly Transaction Heatmap
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '6px 0 0 0', fontWeight: 500 }}>
            Transaction volume distribution by hour
          </p>
        </div>
        <div style={{ 
          height: '280px', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'var(--bg-page)',
          borderRadius: '16px',
          border: '1px dashed var(--border-default)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
                backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px'
          }}>
            <svg width="26" height="26" fill="none" stroke="var(--text-muted)" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 600, margin: 0 }}>No hourly data available</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>Data will appear when transactions are recorded</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      ...cardStyle,
      padding: isMobile ? '20px' : '24px',
      position: 'relative',
      overflow: 'visible'
    }}>
      {/* Premium Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '24px',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        {/* Left: Title + Subtitle */}
        <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
          <h3 style={{ 
            fontSize: isMobile ? '17px' : '19px', 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            Hourly Transaction Heatmap
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '6px 0 0 0', fontWeight: 500 }}>
            Transaction volume distribution across 24 hours
          </p>
        </div>
        
        {/* Right: Quick Stats */}
        {stats && (
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {/* Peak Hour Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
                backgroundColor: 'var(--bg-subtle)',
              border: '1px solid #B8D9D1',
              borderRadius: '10px'
            }}>
              <svg width="14" height="14" fill="none" stroke="#7FB3C8" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Peak: {formatHour(stats.peakHours[0])}
              </span>
            </div>
            
            {/* Total Volume */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)' }}>Total:</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {formatValueConsistent(stats.totalCount)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Premium Heatmap Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(6, 1fr)' : 'repeat(12, 1fr)', 
        gap: isMobile ? '6px' : '8px', 
        marginBottom: '24px' 
      }}>
        {hourlyData.map((hour, index) => {
          const isHovered = hoveredHour === hour.hour;
          const isPeak = isPeakHour(hour.hour);
          const isLowest = isLowestHour(hour.hour) && !isPeak;
          const colorIndex = getHeatmapColorIndex(hour.transactionCount);
          
          return (
            <div
              key={hour.hour}
              onMouseEnter={(e) => handleCellHover(hour.hour, e)}
              onMouseLeave={handleCellLeave}
              style={{
                position: 'relative',
                aspectRatio: isMobile ? '1' : '1.1',
                backgroundColor: getHeatmapColor(hour.transactionCount),
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: isMobile ? '6px' : '8px',
                border: isHovered 
                  ? `2px solid ${colorIndex >= 5 ? (isDark ? 'rgba(127, 179, 200, 0.8)' : 'rgba(255,255,255,0.6)') : 'var(--accent-blue)'}` 
                  : `1px solid ${isDark ? 'rgba(127, 179, 200, 0.15)' : 'rgba(0, 49, 66, 0.04)'}`,
                boxShadow: isHovered 
                  ? `0 8px 24px -4px ${getHeatmapColor(hour.transactionCount)}50, 0 0 0 4px ${getHeatmapColor(hour.transactionCount)}20`
                  : isPeak 
                    ? `0 0 0 2px ${isDark ? 'rgba(127, 179, 200, 0.3)' : '#7c3aed30'}, inset 0 0 0 1px ${isDark ? 'rgba(127, 179, 200, 0.2)' : 'rgba(255,255,255,0.2)'}`
                    : isDark ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.03)',
                transform: isHovered ? 'scale(1.04) translateY(-2px)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: isLoaded ? 1 : 0,
                animation: isLoaded ? `heatmapCellFadeIn 0.4s ease-out ${index * 0.02}s both` : 'none',
                zIndex: isHovered ? 10 : 1
              }}
            >
              {/* Peak/Lowest Indicator */}
              {isPeak && (
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: 'var(--accent-blue)',
                  boxShadow: isDark ? '0 0 6px rgba(127, 179, 200, 0.5)' : '0 0 6px rgba(127, 179, 200, 0.5)'
                }} />
              )}
              {isLowest && hour.transactionCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: 'var(--accent-blue)',
                  opacity: 0.6
                }} />
              )}
              
              {/* Hour Label */}
              <span style={{ 
                fontSize: isMobile ? '9px' : '10px', 
                fontWeight: 600, 
                color: getLabelColor(hour.transactionCount),
                marginBottom: '2px',
                letterSpacing: '0.01em',
                opacity: 0.9
              }}>
                {formatHour(hour.hour).replace(' ', '')}
              </span>
              
              {/* Value */}
              <span style={{ 
                fontSize: isMobile ? '13px' : '14px', 
                fontWeight: 700, 
                color: getTextColor(hour.transactionCount),
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.01em'
              }}>
                {formatValueConsistent(hour.transactionCount)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Premium Bar Chart - Desktop only */}
      {!isMobile && (
        <div style={{ marginBottom: '20px' }}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart 
              data={hourlyData} 
              barSize={14} 
              barCategoryGap="8%"
              margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
              onMouseMove={(state: any) => {
                if (state?.activeTooltipIndex !== undefined) {
                  setHoveredHour(state.activeTooltipIndex);
                }
              }}
              onMouseLeave={() => setHoveredHour(null)}
            >
              <defs>
                {/* Gradient definitions for each intensity level */}
                {HEATMAP_COLOR_SCALE.colors.map((color, i) => (
                  <linearGradient key={`barGrad-${i}`} id={`barGradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="var(--border-subtle)" 
                vertical={false}
                strokeWidth={0.8}
              />
              <XAxis
                dataKey="hour"
                stroke="var(--border-default)"
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border-subtle)', strokeWidth: 1 }}
                tickFormatter={formatHour}
                interval={1}
                dy={8}
              />
              <YAxis
                stroke="var(--border-default)"
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatNumber}
                width={40}
                tickMargin={8}
              />
              <Tooltip content={<PremiumBarTooltip />} cursor={{ fill: 'rgba(127, 179, 200, 0.08)', radius: 4 }} />
              <Bar 
                dataKey="transactionCount" 
                radius={[6, 6, 0, 0]}
                animationBegin={200}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {hourlyData.map((entry) => {
                  const colorIndex = getHeatmapColorIndex(entry.transactionCount);
                  const isBarHovered = hoveredHour === entry.hour;
                  return (
                    <Cell 
                      key={`bar-${entry.hour}`} 
                      fill={`url(#barGradient-${colorIndex})`}
                      style={{
                        filter: isBarHovered ? 'brightness(1.1)' : 'none',
                        transition: 'filter 0.15s ease'
                      }}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Premium Continuous Gradient Legend */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: isMobile ? '12px' : '16px',
        padding: '14px 20px',
                backgroundColor: 'var(--bg-subtle)',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Low Label */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '40px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)' }}>Low</span>
          {stats && (
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
              {formatValueConsistent(stats.minCount)}
            </span>
          )}
        </div>
        
        {/* Continuous Gradient Bar */}
        <div style={{
          flex: 1,
          maxWidth: isMobile ? '160px' : '240px',
          height: '10px',
          borderRadius: '5px',
          background: `linear-gradient(to right, ${HEATMAP_COLOR_SCALE.colors.slice(1).join(', ')})`,
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
        }} />
        
        {/* High Label */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '40px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)' }}>High</span>
          {stats && (
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
              {formatValueConsistent(stats.maxCount)}
            </span>
          )}
        </div>
        
        {/* Legend Indicators */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginLeft: '16px',
          paddingLeft: '16px',
          borderLeft: '1px solid var(--border-subtle)'
        }}>
          {/* Peak Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '3px',
              backgroundColor: '#7FB3C8',
              boxShadow: '0 0 4px rgba(127, 179, 200, 0.4)'
            }} />
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)' }}>Peak</span>
          </div>
        </div>
      </div>

      {/* Tooltip Portal */}
      {tooltipData && <PremiumTooltip />}
      
      {/* Animation Styles */}
      <style>{`
        @keyframes heatmapCellFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes tooltipSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, calc(-100% + 8px));
          }
          to {
            opacity: 1;
            transform: translate(-50%, -100%);
          }
        }
      `}</style>
    </div>
  );
};

// Premium Status Colors - Refined semantic palette matching Charts.tsx
const STATUS_COLORS: { [key: string]: { main: string; light: string; glow: string; border: string } } = {
  'SUCCESS': { 
    main: '#2E9C7A',      // Semantic success fill
    light: 'rgba(46, 156, 122, 0.14)',
    glow: 'rgba(46, 156, 122, 0.4)',
    border: 'rgba(46, 156, 122, 0.35)'
  },
  'PENDING': { 
    main: '#D6A13A',      // Semantic pending fill
    light: 'rgba(214, 161, 58, 0.16)',
    glow: 'rgba(214, 161, 58, 0.4)',
    border: 'rgba(214, 161, 58, 0.35)'
  },
  'FAILED': { 
    main: '#D65A5A',      // Semantic failed fill
    light: 'rgba(214, 90, 90, 0.14)',
    glow: 'rgba(214, 90, 90, 0.4)',
    border: 'rgba(214, 90, 90, 0.35)'
  },
};

const AdvancedCharts = () => {
  const [dailyData, setDailyData] = useState<DailyTransaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showVolume, setShowVolume] = useState(true);
  const [showGTV, setShowGTV] = useState(true);
  const [showSuccess, setShowSuccess] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [showFailed, setShowFailed] = useState(true);
  const [statusViewMode, setStatusViewMode] = useState<'count' | 'percentage'>('count');
  const [activePaymentIndex, setActivePaymentIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    backgroundColor: 'var(--surface-base)',
    borderRadius: '16px',
    padding: isMobile ? '18px' : '24px',
    border: '1px solid var(--border-subtle)',
    boxShadow: 'var(--shadow-card)'
  };

  // Prepare stacked bar data for status split by date
  const stackedStatusData = dailyData.map(day => {
    const success = day.successfulTransactions;
    const failed = day.failedTransactions;
    const pending = day.totalTransactions - success - failed;
    const total = day.totalTransactions;
    
    if (statusViewMode === 'percentage' && total > 0) {
      return {
        date: day.date,
        SUCCESS: (success / total) * 100,
        FAILED: (failed / total) * 100,
        PENDING: (pending / total) * 100,
        // Keep raw values for tooltip
        _successRaw: success,
        _failedRaw: failed,
        _pendingRaw: pending,
      };
    }
    
    return {
      date: day.date,
      SUCCESS: success,
      FAILED: failed,
      PENDING: pending,
    };
  });

  // Premium tooltip for Daily Volume vs GTV chart
  const PremiumDualAxisTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const volumeData = payload.find((p: any) => p.dataKey === 'totalTransactions');
    const gtvData = payload.find((p: any) => p.dataKey === 'totalAmount');
    
    // Calculate delta vs previous day
    const currentIndex = dailyData.findIndex(d => d.date === label);
    const previousDay = currentIndex > 0 ? dailyData[currentIndex - 1] : null;
    
    const volumeDelta = previousDay ? volumeData?.value - previousDay.totalTransactions : null;
    const gtvDelta = previousDay ? gtvData?.value - previousDay.totalAmount : null;
    const gtvDeltaPercent = previousDay && previousDay.totalAmount > 0 
      ? ((gtvDelta! / previousDay.totalAmount) * 100).toFixed(1) 
      : null;

    return (
      <div style={{
        backgroundColor: 'var(--surface-overlay)',
        opacity: 0.98,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border-default)',
        borderRadius: '14px',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-dropdown)',
        minWidth: '220px',
        animation: 'tooltipFadeIn 0.15s ease-out'
      }}>
        {/* Date Header */}
        <p style={{ 
          fontSize: '11px', 
          fontWeight: 600, 
          color: 'var(--text-tertiary)', 
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {new Date(label).toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </p>
        
        {/* Volume Metric */}
        {volumeData && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '6px'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '3px', 
                backgroundColor: COLORS.primary,
                boxShadow: `0 0 8px ${COLORS.primary}40`
              }} />
              <span style={{ 
                fontSize: '12px', 
                color: 'var(--text-tertiary)',
                fontWeight: 500 
              }}>
                Volume
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em'
              }}>
                {formatNumber(volumeData.value)}
              </span>
              {volumeDelta !== null && (
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  color: volumeDelta >= 0 ? 'var(--success)' : 'var(--error)'
                }}>
                  {volumeDelta >= 0 ? '+' : ''}{volumeDelta >= 0 ? formatNumber(volumeDelta) : formatNumber(Math.abs(volumeDelta))}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* GTV Metric */}
        {gtvData && (
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '6px'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '3px', 
                backgroundColor: COLORS.success,
                boxShadow: `0 0 8px ${COLORS.success}40`
              }} />
              <span style={{ 
                fontSize: '12px', 
                color: 'var(--text-tertiary)',
                fontWeight: 500 
              }}>
                GTV
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em'
              }}>
                {formatCurrency(gtvData.value)}
              </span>
              {gtvDelta !== null && gtvDeltaPercent !== null && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  backgroundColor: gtvDelta >= 0 ? '#ecfdf5' : '#fef2f2',
                  borderRadius: '6px',
                  border: `1px solid ${gtvDelta >= 0 ? '#d1fae5' : '#fee2e2'}`
                }}>
                  <svg 
                    width="12" 
                    height="12" 
                    fill="none" 
                    stroke={gtvDelta >= 0 ? 'var(--success)' : 'var(--error)'} 
                    strokeWidth={2.5} 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d={gtvDelta >= 0 
                        ? 'M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18' 
                        : 'M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3'
                      } 
                    />
                  </svg>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    color: gtvDelta >= 0 ? 'var(--success)' : 'var(--error)'
                  }}>
                    {gtvDelta >= 0 ? '+' : ''}{gtvDeltaPercent}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
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
        backgroundColor: 'var(--surface-overlay)',
        opacity: 0.98,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border-default)',
        borderRadius: '14px',
        padding: '14px 18px',
        boxShadow: 'var(--shadow-dropdown)',
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
            color: 'var(--text-primary)'
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
            color: 'var(--text-muted)'
          }}>
            %
          </span>
        </div>
        
        {/* Subtitle */}
        <p style={{ 
          fontSize: '11px', 
          color: 'var(--text-tertiary)',
          margin: '6px 0 0 0',
          fontWeight: 500
        }}>
          of total payments
        </p>
      </div>
    );
  };

  // Premium tooltip for Status Split stacked bar chart
  const PremiumStatusTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint = payload[0]?.payload;
    
    // Get values (handle both count and percentage modes)
    let successValue, pendingValue, failedValue, total;
    
    if (statusViewMode === 'percentage') {
      // In percentage mode, use raw values from payload for display
      successValue = dataPoint?._successRaw || 0;
      pendingValue = dataPoint?._pendingRaw || 0;
      failedValue = dataPoint?._failedRaw || 0;
      total = successValue + pendingValue + failedValue;
    } else {
      // In count mode, use the values directly
      successValue = dataPoint?.SUCCESS || 0;
      pendingValue = dataPoint?.PENDING || 0;
      failedValue = dataPoint?.FAILED || 0;
      total = successValue + pendingValue + failedValue;
    }
    
    const getPercentage = (value: number) => total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

    return (
      <div style={{
        backgroundColor: 'var(--surface-overlay)',
        opacity: 0.98,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border-default)',
        borderRadius: '14px',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-dropdown)',
        minWidth: '200px',
        animation: 'tooltipFadeIn 0.15s ease-out'
      }}>
        {/* Date Header */}
        <p style={{ 
          fontSize: '11px', 
          fontWeight: 600, 
          color: 'var(--text-tertiary)', 
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottom: '1px solid rgba(0, 49, 66, 0.1)',
          paddingBottom: '8px'
        }}>
          {new Date(label).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </p>
        
        {/* Success Metric */}
        {showSuccess && successValue > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: STATUS_COLORS.SUCCESS.main,
                  boxShadow: `0 0 8px ${STATUS_COLORS.SUCCESS.glow}`
                }} />
                <span style={{ fontSize: '12px', color: 'rgba(0, 49, 66, 0.6)', fontWeight: 500 }}>
                  Success
                </span>
              </div>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {formatNumber(successValue)}
              </span>
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: STATUS_COLORS.SUCCESS.main,
              fontWeight: 600,
              textAlign: 'right'
            }}>
              {getPercentage(successValue)}%
            </div>
          </div>
        )}
        
        {/* Pending Metric */}
        {showPending && pendingValue > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: STATUS_COLORS.PENDING.main,
                  boxShadow: `0 0 8px ${STATUS_COLORS.PENDING.glow}`
                }} />
                <span style={{ fontSize: '12px', color: 'rgba(0, 49, 66, 0.6)', fontWeight: 500 }}>
                  Pending
                </span>
              </div>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {formatNumber(pendingValue)}
              </span>
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: STATUS_COLORS.PENDING.main,
              fontWeight: 600,
              textAlign: 'right'
            }}>
              {getPercentage(pendingValue)}%
            </div>
          </div>
        )}
        
        {/* Failed Metric */}
        {showFailed && failedValue > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: STATUS_COLORS.FAILED.main,
                  boxShadow: `0 0 8px ${STATUS_COLORS.FAILED.glow}`
                }} />
                <span style={{ fontSize: '12px', color: 'rgba(0, 49, 66, 0.6)', fontWeight: 500 }}>
                  Failed
                </span>
              </div>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {formatNumber(failedValue)}
              </span>
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: STATUS_COLORS.FAILED.main,
              fontWeight: 600,
              textAlign: 'right'
            }}>
              {getPercentage(failedValue)}%
            </div>
          </div>
        )}
        
        {/* Total */}
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontSize: '12px', 
            fontWeight: 600, 
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em'
          }}>
            Total
          </span>
          <span style={{ 
            fontSize: '16px', 
            fontWeight: 700, 
            color: 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {formatNumber(total)}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div className="skeleton" style={{ height: '20px', width: '200px', borderRadius: '6px', marginBottom: '20px' }} />
          <div className="skeleton" style={{ height: isMobile ? '260px' : '340px', borderRadius: '12px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={cardStyle}>
              <div className="skeleton" style={{ height: '20px', width: '160px', borderRadius: '6px', marginBottom: '20px' }} />
              <div className="skeleton" style={{ height: isMobile ? '220px' : '260px', borderRadius: '12px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Date Range Selector */}
      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center', 
          gap: '16px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
                backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="18" height="18" fill="none" stroke="var(--accent-blue)" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Analysis Period</span>
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
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                flex: isMobile ? 1 : 'none',
                minWidth: 0,
                color: 'var(--text-secondary)'
              }}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '14px', flexShrink: 0 }}>to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              style={{
                padding: '10px 14px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                flex: isMobile ? 1 : 'none',
                minWidth: 0,
                color: 'var(--text-secondary)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Chart 1: Premium Daily Volume vs GTV */}
      <div style={{ 
        ...cardStyle, 
        marginBottom: '20px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Premium Header with Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '20px',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          {/* Left: Title + Subtitle */}
          <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
            <h3 style={{ 
              fontSize: isMobile ? '17px' : '19px', 
              fontWeight: 700, 
              color: 'var(--text-primary)', 
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Daily Volume vs GTV
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '6px 0 0 0', fontWeight: 500 }}>
              Transaction count (bars) and gross transaction value (line)
            </p>
          </div>
          
          {/* Right: Interactive Legend Chips */}
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Volume Toggle */}
            <button
              onClick={() => setShowVolume(!showVolume)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                backgroundColor: showVolume ? 'var(--bg-page)' : 'var(--bg-subtle)',
                border: `1px solid ${showVolume ? COLORS.primary : 'var(--border-default)'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontSize: '13px',
                fontWeight: 600,
                color: showVolume ? COLORS.primary : '#64748b',
                opacity: showVolume ? 1 : 0.6
              }}
            >
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '3px', 
                backgroundColor: COLORS.primary,
                boxShadow: showVolume ? `0 0 8px ${COLORS.primary}40` : 'none',
                transition: 'box-shadow 0.15s ease'
              }} />
              Volume
            </button>
            
            {/* GTV Toggle */}
            <button
              onClick={() => setShowGTV(!showGTV)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                backgroundColor: showGTV ? '#D1FAE5' : '#F0F9F7',
                border: `1px solid ${showGTV ? COLORS.success : '#B8D9D1'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontSize: '13px',
                fontWeight: 600,
                color: showGTV ? COLORS.success : '#64748b',
                opacity: showGTV ? 1 : 0.6
              }}
            >
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '3px', 
                backgroundColor: COLORS.success,
                boxShadow: showGTV ? `0 0 8px ${COLORS.success}40` : 'none',
                transition: 'box-shadow 0.15s ease'
              }} />
              GTV
            </button>
            
            {/* Download Button (UI only) */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                color: 'var(--text-tertiary)'
              }}
              title="Download chart data"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
          </div>
        </div>
        
        {dailyData.length > 0 ? (
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={isMobile ? 300 : 380}>
              <ComposedChart 
                data={dailyData} 
                margin={{ left: isMobile ? -10 : 5, right: isMobile ? -5 : 15, top: 20, bottom: 10 }}
              >
                <defs>
                  {/* Gradient for bars */}
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.9}/>
                    <stop offset="100%" stopColor={COLORS.primaryLight} stopOpacity={0.7}/>
                  </linearGradient>
                  
                  {/* Glow effect for line */}
                  <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Ultra-light gridlines */}
                <CartesianGrid 
                  strokeDasharray="2 4" 
                  stroke="var(--border-subtle)" 
                  vertical={false}
                  strokeWidth={0.8}
                  strokeOpacity={0.5}
                />
                
                {/* X-Axis - Reduced labels */}
                <XAxis
                  dataKey="date"
                  stroke="#B8D9D1"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border-subtle)', strokeWidth: 1 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  interval={dailyData.length > 20 ? Math.floor(dailyData.length / 8) : Math.floor(dailyData.length / 6)}
                  dy={10}
                  tickMargin={8}
                />
                
                {/* Y-Axis Left - Volume */}
                <YAxis
                  yAxisId="left"
                  stroke="var(--border-default)"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatNumber}
                  width={isMobile ? 45 : 55}
                  tickMargin={8}
                  label={{ 
                    value: 'Volume', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { 
                      fill: 'var(--text-muted)', 
                      fontSize: '12px', 
                      fontWeight: 600,
                      textAnchor: 'middle'
                    }
                  }}
                />
                
                {/* Y-Axis Right - GTV */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="var(--border-default)"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                  width={isMobile ? 50 : 60}
                  tickMargin={8}
                  label={{ 
                    value: 'GTV (₹)', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { 
                      fill: 'var(--text-muted)', 
                      fontSize: '12px', 
                      fontWeight: 600,
                      textAnchor: 'middle'
                    }
                  }}
                />
                
                {/* Premium Tooltip */}
                <Tooltip 
                  content={<PremiumDualAxisTooltip />}
                  cursor={{ 
                    stroke: '#cbd5e1', 
                    strokeWidth: 1,
                    strokeDasharray: '4 4'
                  }}
                />
                
                {/* Premium Bars - Volume */}
                {showVolume && (
                  <Bar 
                    yAxisId="left" 
                    dataKey="totalTransactions" 
                    fill="url(#volumeGradient)"
                    radius={[10, 10, 0, 0]} 
                    barSize={dailyData.length > 30 ? 10 : (dailyData.length > 20 ? 14 : 18)}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                )}
                
                {/* Premium Line - GTV */}
                {showGTV && (
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="totalAmount" 
                    stroke={COLORS.success} 
                    strokeWidth={3} 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dot={false}
                    activeDot={{ 
                      r: 6, 
                      fill: COLORS.success, 
                      stroke: 'var(--surface-base)', 
                      strokeWidth: 3,
                      style: { 
                        filter: 'drop-shadow(0 2px 4px rgba(5, 150, 105, 0.3))'
                      }
                    }}
                    style={{ filter: 'url(#lineGlow)' }}
                    animationBegin={200}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ 
            height: '300px', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
                backgroundColor: 'var(--bg-subtle)',
            borderRadius: '16px',
            border: '1px dashed var(--border-default)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
                backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="28" height="28" fill="none" stroke="#94a3b8" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <p style={{ color: 'rgba(0, 49, 66, 0.7)', fontSize: '15px', fontWeight: 600, margin: 0 }}>No data for selected date range</p>
            <p style={{ color: 'rgba(0, 49, 66, 0.5)', fontSize: '13px', marginTop: '6px' }}>Adjust the date range to view chart</p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Chart 2: Premium Payment Method Split */}
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
              color: 'var(--text-primary)', 
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Payment Method Split
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '6px 0 0 0', fontWeight: 500 }}>
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
                      <filter id="donutShadowAdvanced" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.08"/>
                      </filter>
                      {/* Glow effects for each segment */}
                      {paymentMethods.map((method) => (
                        <filter key={`glow-adv-${method.paymentMethod}`} id={`glow-adv-${method.paymentMethod}`} x="-50%" y="-50%" width="200%" height="200%">
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
                      stroke="var(--surface-base)"
                      strokeWidth={3}
                      cornerRadius={6}
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                      onMouseEnter={(_, index) => setActivePaymentIndex(index)}
                      onMouseLeave={() => setActivePaymentIndex(null)}
                      style={{ filter: 'url(#donutShadowAdvanced)', cursor: 'pointer' }}
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
                              filter: isActive ? `url(#glow-adv-${method.paymentMethod})` : 'none',
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
                    color: 'var(--text-tertiary)',
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
                    color: 'var(--text-primary)',
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
                        color: 'var(--text-muted)',
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
                        backgroundColor: isActive ? 'var(--accent-blue-light)' : 'var(--bg-subtle)',
                        borderRadius: '12px',
                        border: `1px solid ${isActive ? colorConfig.main + '30' : 'var(--border-subtle)'}`,
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
                            color: 'var(--text-secondary)'
                          }}>
                            {label}
                          </span>
                        </div>
                        {/* Percentage */}
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: 700, 
                          color: 'var(--text-primary)',
                          fontVariantNumeric: 'tabular-nums'
                        }}>
                          {method.percentage.toFixed(1)}%
                        </span>
                      </div>
                      
                      {/* Mini progress bar */}
                      <div style={{
                        width: '100%',
                        height: '4px',
                        backgroundColor: 'var(--border-subtle)',
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
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '16px',
              border: '1px dashed var(--border-default)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <svg width="24" height="24" fill="none" stroke="var(--text-tertiary)" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, margin: 0 }}>No payment method data</p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '4px' }}>Data will appear when available</p>
            </div>
          )}
        </div>

        {/* Chart 3: Premium Status Split Over Time */}
        <div style={{
          ...cardStyle,
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Premium Header with Interactive Legend */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '20px',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            {/* Left: Title + Subtitle */}
            <div style={{ flex: '1 1 auto', minWidth: '180px' }}>
              <h3 style={{ 
                fontSize: isMobile ? '17px' : '19px', 
                fontWeight: 700, 
                color: 'var(--text-primary)', 
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                Status Split Over Time
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '6px 0 0 0', fontWeight: 500 }}>
                Daily breakdown by status
              </p>
            </div>
            
            {/* Right: View Mode Toggle + Legend Chips */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              alignItems: 'flex-end'
            }}>
              {/* View Mode Toggle */}
              <div style={{
                display: 'flex',
                gap: '6px',
                padding: '4px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)'
              }}>
                <button
                  onClick={() => setStatusViewMode('count')}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: statusViewMode === 'count' ? 600 : 500,
                    color: statusViewMode === 'count' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    backgroundColor: statusViewMode === 'count' ? 'var(--surface-base)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: statusViewMode === 'count' ? 'var(--shadow-xs)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Count
                </button>
                <button
                  onClick={() => setStatusViewMode('percentage')}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: statusViewMode === 'percentage' ? 600 : 500,
                    color: statusViewMode === 'percentage' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                backgroundColor: statusViewMode === 'percentage' ? 'var(--surface-base)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: statusViewMode === 'percentage' ? 'var(--shadow-xs)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  % Share
                </button>
              </div>
              
              {/* Interactive Legend Chips */}
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                justifyContent: 'flex-end'
              }}>
                {/* Success Chip */}
                <button
                  onClick={() => setShowSuccess(!showSuccess)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    backgroundColor: 'var(--surface-base)',
                    border: `1px solid ${showSuccess ? STATUS_COLORS.SUCCESS.border : 'var(--border-subtle)'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: showSuccess ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    boxShadow: showSuccess ? `0 0 0 2px ${STATUS_COLORS.SUCCESS.light}` : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!showSuccess) {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showSuccess) {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.backgroundColor = 'var(--surface-base)';
                    }
                  }}
                >
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: STATUS_COLORS.SUCCESS.main,
                    flexShrink: 0,
                    boxShadow: showSuccess ? `0 0 0 2px ${STATUS_COLORS.SUCCESS.light}` : 'none'
                  }} />
                  Success
                </button>
                
                {/* Pending Chip */}
                <button
                  onClick={() => setShowPending(!showPending)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    backgroundColor: 'var(--surface-base)',
                    border: `1px solid ${showPending ? STATUS_COLORS.PENDING.border : 'var(--border-subtle)'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: showPending ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    boxShadow: showPending ? `0 0 0 2px ${STATUS_COLORS.PENDING.light}` : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!showPending) {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showPending) {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.backgroundColor = 'var(--surface-base)';
                    }
                  }}
                >
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: STATUS_COLORS.PENDING.main,
                    flexShrink: 0,
                    boxShadow: showPending ? `0 0 0 2px ${STATUS_COLORS.PENDING.light}` : 'none'
                  }} />
                  Pending
                </button>
                
                {/* Failed Chip */}
                <button
                  onClick={() => setShowFailed(!showFailed)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    backgroundColor: 'var(--surface-base)',
                    border: `1px solid ${showFailed ? STATUS_COLORS.FAILED.border : 'var(--border-subtle)'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: showFailed ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    boxShadow: showFailed ? `0 0 0 2px ${STATUS_COLORS.FAILED.light}` : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!showFailed) {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showFailed) {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.backgroundColor = 'var(--surface-base)';
                    }
                  }}
                >
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: STATUS_COLORS.FAILED.main,
                    flexShrink: 0,
                    boxShadow: showFailed ? `0 0 0 2px ${STATUS_COLORS.FAILED.light}` : 'none'
                  }} />
                  Failed
                </button>
              </div>
            </div>
          </div>
          
          {stackedStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={isMobile ? 240 : 280}>
              <BarChart 
                data={stackedStatusData} 
                barSize={stackedStatusData.length > 20 ? (isMobile ? 10 : 12) : (isMobile ? 14 : 18)} 
                barCategoryGap="12%" 
                margin={{ left: isMobile ? -15 : 5, right: isMobile ? 5 : 10, top: 20, bottom: 10 }}
              >
                <defs>
                  {/* Track background pattern */}
                  <pattern id="trackPattern" patternUnits="userSpaceOnUse" width="4" height="4">
                    <rect width="4" height="4" fill="var(--bg-subtle)"/>
                  </pattern>
                </defs>
                
                {/* Ultra-light gridlines */}
                <CartesianGrid 
                  strokeDasharray="2 4" 
                  stroke="var(--border-subtle)" 
                  vertical={false}
                  strokeWidth={0.8}
                  strokeOpacity={0.5}
                />
                
                {/* X-Axis - Reduced labels */}
                <XAxis
                  dataKey="date"
                  stroke="#B8D9D1"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border-subtle)', strokeWidth: 1 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  interval={stackedStatusData.length > 15 ? Math.floor(stackedStatusData.length / 6) : Math.floor(stackedStatusData.length / 5)}
                  dy={8}
                  tickMargin={8}
                />
                
                {/* Y-Axis with label */}
                <YAxis
                  stroke="var(--border-subtle)"
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={statusViewMode === 'percentage' ? (v) => `${Math.round(v)}%` : formatNumber}
                  width={isMobile ? 45 : 55}
                  tickMargin={8}
                  domain={statusViewMode === 'percentage' ? [0, 100] : [0, 'auto']}
                  label={{ 
                    value: 'Transactions', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { 
                      fill: 'rgba(0, 49, 66, 0.6)', 
                      fontSize: '12px', 
                      fontWeight: 600,
                      textAnchor: 'middle'
                    }
                  }}
                />
                
                {/* Premium Tooltip */}
                <Tooltip 
                  content={<PremiumStatusTooltip />}
                  cursor={{ 
                    fill: 'rgba(127, 179, 200, 0.08)',
                    stroke: 'rgba(127, 179, 200, 0.15)',
                    strokeWidth: 1
                  }}
                />
                
                {/* Stacked Bars with separators */}
                {showSuccess && (
                  <Bar 
                    dataKey="SUCCESS" 
                    stackId="status" 
                    fill={STATUS_COLORS.SUCCESS.main}
                    radius={statusViewMode === 'percentage' ? [0, 0, 8, 8] : [0, 0, 8, 8]}
                    stroke="var(--surface-base)"
                    strokeWidth={2}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                )}
                {showPending && (
                  <Bar 
                    dataKey="PENDING" 
                    stackId="status" 
                    fill={STATUS_COLORS.PENDING.main}
                    stroke="var(--surface-base)"
                    strokeWidth={2}
                    animationBegin={100}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                )}
                {showFailed && (
                  <Bar 
                    dataKey="FAILED" 
                    stackId="status" 
                    fill={STATUS_COLORS.FAILED.main}
                    radius={statusViewMode === 'percentage' ? [8, 8, 0, 0] : [8, 8, 0, 0]}
                    stroke="var(--surface-base)"
                    strokeWidth={2}
                    animationBegin={200}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              height: '240px', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
                backgroundColor: 'var(--bg-subtle)',
              borderRadius: '16px',
              border: '1px dashed var(--border-default)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-page)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <svg width="24" height="24" fill="none" stroke="#94a3b8" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <p style={{ color: 'rgba(0, 49, 66, 0.7)', fontSize: '14px', fontWeight: 600, margin: 0 }}>No status data available</p>
              <p style={{ color: 'rgba(0, 49, 66, 0.5)', fontSize: '12px', marginTop: '4px' }}>Data will appear when available</p>
            </div>
          )}
        </div>
      </div>

      {/* Chart 4: Premium Hourly Heatmap - Redesigned 2026 */}
      <HourlyHeatmapPremium 
        hourlyData={hourlyData}
        isMobile={isMobile}
        formatHour={formatHour}
        formatNumber={formatNumber}
        formatCurrency={formatCurrency}
        cardStyle={cardStyle}
      />
      
      {/* Animation Styles */}
      <style>{`
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdvancedCharts;
