import { SearchResult } from '../services/api';

interface SearchResultsProps {
  result: SearchResult | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  periodLabel?: string;
  activeTab?: string;
}

/**
 * SearchResults Component
 * 
 * Displays analytics search results in a clean, card-based format.
 * Handles three states: loading, error, and results (matched/no-match).
 * 
 * Reuses the existing card styling from KPICards for visual consistency.
 */
const SearchResults = ({ result, loading, error, onClose, periodLabel, activeTab }: SearchResultsProps) => {
  // Get tab display name
  const getTabDisplayName = (tab?: string): string => {
    switch (tab) {
      case 'overview': return 'Overview';
      case 'charts': return 'Analytics';
      case 'advanced': return 'Insights';
      case 'transactions': return 'Transactions';
      default: return '';
    }
  };

  // Loading State
  if (loading) {
    return (
      <div style={{
        backgroundColor: 'var(--surface-base)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '60%', height: '20px', borderRadius: '6px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '40%', height: '14px', borderRadius: '4px' }} />
          </div>
        </div>
        <div className="skeleton" style={{ width: '100%', height: '120px', borderRadius: '8px', marginTop: '16px' }} />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div style={{
        backgroundColor: 'var(--surface-base)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid var(--error-border)',
        boxShadow: 'var(--shadow-card)',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
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
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Search Error</p>
              <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>{error}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px'
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // No result yet
  if (!result) {
    return null;
  }

  // No Match State
  if (!result.matchedInsight) {
    return (
      <div style={{
        backgroundColor: 'var(--surface-base)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" fill="none" stroke="#D97706" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {result.title}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                  Search: "{result.query}"
                </span>
                {periodLabel && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    padding: '2px 8px',
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-tertiary)',
                    borderRadius: '6px'
                  }}>
                    {periodLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px'
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p style={{ 
          fontSize: '14px', 
          color: 'var(--text-secondary)', 
          margin: '16px 0 0 0',
          lineHeight: 1.6
        }}>
          {result.description}
        </p>
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: '10px',
          fontSize: '13px',
          color: 'var(--text-tertiary)'
        }}>
          <span style={{ fontWeight: 500 }}>Try:</span> failed, revenue, top users, payment methods, success rate, daily trends, overview
        </div>
      </div>
    );
  }

  // Matched Result State
  return (
    <div style={{
      backgroundColor: 'var(--surface-base)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--accent-blue)',
      boxShadow: 'var(--shadow-card-hover)',
      marginTop: '16px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #E6F4F1 0%, #D1E8E3 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="24" height="24" fill="none" stroke="#7FB3C8" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {result.title}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                Search: "{result.query}"
              </span>
              {/* Period badge */}
              {periodLabel && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '2px 8px',
                  backgroundColor: 'var(--accent-blue-light)',
                  color: 'var(--accent-blue)',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {periodLabel}
                </span>
              )}
              {/* Page badge */}
              {activeTab && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '2px 8px',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-secondary)',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
                  </svg>
                  {getTabDisplayName(activeTab)}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Description */}
      <p style={{ 
        fontSize: '14px', 
        color: 'var(--text-secondary)', 
        margin: '0 0 20px 0',
        lineHeight: 1.5
      }}>
        {result.description}
      </p>

      {/* Data Display */}
      {result.data && <SearchDataDisplay data={result.data} insightType={result.matchedInsight} />}
    </div>
  );
};

/**
 * SearchDataDisplay Component
 * 
 * Renders the analytics data based on the insight type.
 * Uses appropriate formatting for different data structures.
 */
interface SearchDataDisplayProps {
  data: Record<string, any>;
  insightType: string;
}

const SearchDataDisplay = ({ data, insightType }: SearchDataDisplayProps) => {
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

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const formatDateRange = (start?: string, end?: string): string | null => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
  };

  // Period info banner (if data includes period)
  const PeriodBanner = () => {
    const dateRange = formatDateRange(data.periodStart, data.periodEnd);
    if (!dateRange) return null;
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '16px',
        padding: '8px 12px',
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: '8px',
        fontSize: '12px',
        color: 'var(--text-tertiary)'
      }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <span>Data from: <strong style={{ color: 'var(--text-secondary)' }}>{dateRange}</strong></span>
      </div>
    );
  };

  // Render based on insight type
  switch (insightType) {
    case 'FAILED_TRANSACTIONS_SUMMARY':
      return (
        <div>
          <PeriodBanner />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <MetricCard 
              label="Failed Count" 
              value={formatNumber(data.failedCount)} 
              isNegative 
            />
            <MetricCard 
              label="Failed %" 
              value={formatPercentage(data.failedPercentage)} 
              isNegative 
            />
            <MetricCard 
              label="Total Transactions" 
              value={formatNumber(data.totalTransactions)} 
            />
          </div>
        </div>
      );

    case 'REVENUE_SUMMARY':
      return (
        <div>
          <PeriodBanner />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <MetricCard 
              label="Total GTV" 
              value={formatCurrency(data.totalGTV)} 
              isPositive 
            />
            <MetricCard 
              label="Avg Ticket Size" 
              value={formatCurrency(data.averageTicketSize)} 
            />
            <MetricCard 
              label="Total Transactions" 
              value={formatNumber(data.totalTransactions)} 
            />
          </div>
        </div>
      );

    case 'SUCCESS_RATE_ANALYTICS':
      return (
        <div>
          <PeriodBanner />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <MetricCard 
              label="Success Rate" 
              value={formatPercentage(data.successRate)} 
              isPositive={data.successRate >= 90}
              isNegative={data.successRate < 80}
            />
            <MetricCard 
              label="Total Transactions" 
              value={formatNumber(data.totalTransactions)} 
            />
            <MetricCard 
              label="Failed" 
              value={formatNumber(data.failedTransactions)} 
              isNegative 
            />
            <MetricCard 
              label="Pending" 
              value={formatNumber(data.pendingTransactions)} 
            />
          </div>
        </div>
      );

    case 'TOP_USERS_BY_REVENUE':
      return (
        <div>
          <PeriodBanner />
          <p style={{ 
            fontSize: '12px', 
            color: 'var(--text-muted)', 
            marginBottom: '12px', 
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Top {data.totalUsersReturned} Users by Revenue
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.topUsers?.map((user: any, index: number) => (
              <div 
                key={user.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: index < 3 ? 'var(--accent-blue-light)' : 'var(--bg-muted)',
                    color: index < 3 ? 'var(--accent-blue)' : 'var(--text-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {index + 1}
                  </span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                      {user.userName}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                      {user.transactionCount} transactions
                    </p>
                  </div>
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: 'var(--success)',
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {formatCurrency(user.totalRevenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'PAYMENT_METHOD_BREAKDOWN':
      return (
        <div>
          <PeriodBanner />
          <p style={{ 
            fontSize: '12px', 
            color: 'var(--text-muted)', 
            marginBottom: '12px', 
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Payment Method Distribution
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.paymentMethods?.map((method: any) => (
              <div 
                key={method.paymentMethod}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: 500, 
                    color: 'var(--text-primary)',
                    minWidth: '100px'
                  }}>
                    {method.paymentMethod.replace(/_/g, ' ')}
                  </span>
                  <div style={{
                    flex: 1,
                    height: '6px',
                    backgroundColor: 'var(--bg-muted)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${method.percentage}%`,
                      height: '100%',
                      backgroundColor: 'var(--accent-blue)',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums'
                  }}>
                    {formatPercentage(method.percentage)}
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                    {formatCurrency(method.totalAmount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'TRANSACTION_STATUS_OVERVIEW':
      return (
        <div>
          <PeriodBanner />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            {data.statuses?.map((status: any) => (
              <MetricCard 
                key={status.status}
                label={status.status}
                value={formatNumber(status.count)}
                subtitle={formatPercentage(status.percentage)}
                isPositive={status.status === 'SUCCESS'}
                isNegative={status.status === 'FAILED'}
              />
            ))}
          </div>
        </div>
      );

    case 'ANALYTICS_OVERVIEW':
      return (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '16px',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--text-tertiary)'
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <span>Overall system metrics (revenue is from last 30 days)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <MetricCard label="Total Users" value={formatNumber(data.totalUsers)} />
            <MetricCard label="Active Users" value={formatNumber(data.activeUsers)} />
            <MetricCard label="Transactions" value={formatNumber(data.totalTransactions)} />
            <MetricCard label="Revenue" value={formatCurrency(data.totalRevenue)} isPositive />
            <MetricCard label="Successful" value={formatNumber(data.successfulTransactions)} isPositive />
            <MetricCard label="Failed" value={formatNumber(data.failedTransactions)} isNegative />
            <MetricCard label="Success Rate" value={formatPercentage(data.successRate)} isPositive={data.successRate >= 90} />
            <MetricCard label="Avg Amount" value={formatCurrency(data.averageTransactionAmount)} />
          </div>
        </div>
      );

    case 'DAILY_TRANSACTION_TRENDS':
      // Show last few days as mini cards
      const recentDays = data.dailyTrends?.slice(-5) || [];
      return (
        <div>
          <PeriodBanner />
          <p style={{ 
            fontSize: '12px', 
            color: 'var(--text-muted)', 
            marginBottom: '12px', 
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Recent {recentDays.length} Days (of {data.totalDays} total)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentDays.map((day: any) => (
              <div 
                key={day.date}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                    {formatNumber(day.totalTransactions)} txns
                  </span>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums'
                  }}>
                    {formatCurrency(day.totalAmount)}
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: 500, 
                    color: day.successRate >= 90 ? 'var(--success)' : day.successRate >= 80 ? 'var(--text-secondary)' : 'var(--error)'
                  }}>
                    {formatPercentage(day.successRate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      // Generic display for unknown types
      return (
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: '10px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflow: 'auto',
          maxHeight: '300px'
        }}>
          {JSON.stringify(data, null, 2)}
        </div>
      );
  }
};

/**
 * MetricCard Component
 * 
 * Simple card for displaying a single metric value.
 */
interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  isPositive?: boolean;
  isNegative?: boolean;
}

const MetricCard = ({ label, value, subtitle, isPositive, isNegative }: MetricCardProps) => (
  <div style={{
    padding: '16px',
    backgroundColor: 'var(--bg-subtle)',
    borderRadius: '12px',
    border: '1px solid var(--border-subtle)'
  }}>
    <p style={{ 
      fontSize: '12px', 
      color: 'var(--text-muted)', 
      margin: '0 0 6px 0',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.03em'
    }}>
      {label}
    </p>
    <p style={{ 
      fontSize: '22px', 
      fontWeight: 700, 
      color: isPositive ? 'var(--success)' : isNegative ? 'var(--error)' : 'var(--text-primary)',
      margin: 0,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '-0.02em'
    }}>
      {value}
    </p>
    {subtitle && (
      <p style={{ 
        fontSize: '12px', 
        color: 'var(--text-tertiary)', 
        margin: '4px 0 0 0'
      }}>
        {subtitle}
      </p>
    )}
  </div>
);

export default SearchResults;
