import { useEffect, useState, useCallback, useMemo } from 'react';
import { analyticsAPI, PaginatedTransactions } from '../services/api';

// ==================== PREMIUM DESIGN SYSTEM CONSTANTS ====================
const DESIGN_TOKENS = {
  // Spacing - 8pt grid system
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
  },
  // Border radius
  radius: {
    sm: '8px',
    md: '10px',
    lg: '12px',
    xl: '14px',
    '2xl': '16px',
    full: '9999px',
  },
  // Typography
  fontSize: {
    xs: '11px',
    sm: '12px',
    md: '13px',
    base: '14px',
    lg: '15px',
    xl: '16px',
    '2xl': '18px',
  },
  // Transitions
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  // Shadows
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 2px 4px -1px rgba(0, 0, 0, 0.04), 0 4px 6px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 4px 6px -2px rgba(0, 0, 0, 0.03), 0 10px 15px -3px rgba(0, 0, 0, 0.06)',
    xl: '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 20px 25px -5px rgba(0, 0, 0, 0.04)',
    card: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03)',
    cardHover: '0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
    input: '0 0 0 3px rgba(79, 70, 229, 0.12)',
    button: '0 2px 8px rgba(79, 70, 229, 0.25)',
  },
  // Colors
  colors: {
    primary: '#003142',
    primaryHover: '#001F2A',
    primaryLight: '#F0F9F7',
    primarySoft: '#E6F4F1',
    success: '#059669',
    successLight: '#ecfdf5',
    successSoft: '#d1fae5',
    successBorder: '#6ee7b7',
    warning: '#d97706',
    warningLight: '#fffbeb',
    warningSoft: '#fef3c7',
    warningBorder: '#fcd34d',
    error: '#dc2626',
    errorLight: '#fef2f2',
    errorSoft: '#fee2e2',
    errorBorder: '#fca5a5',
    neutral50: '#E6F4F1',
    neutral100: '#F0F9F7',
    neutral200: '#D1E8E3',
    neutral300: '#B8D9D1',
    neutral400: 'rgba(0, 49, 66, 0.5)',
    neutral500: 'rgba(0, 49, 66, 0.6)',
    neutral600: 'rgba(0, 49, 66, 0.7)',
    neutral700: 'rgba(0, 49, 66, 0.8)',
    neutral800: '#003142',
    neutral900: '#003142',
  }
};

// ==================== STATUS CONFIGURATION ====================
const STATUS_CONFIG = {
  SUCCESS: {
    bg: DESIGN_TOKENS.colors.successLight,
    text: DESIGN_TOKENS.colors.success,
    border: DESIGN_TOKENS.colors.successSoft,
    dot: '#10b981',
    glow: 'rgba(16, 185, 129, 0.2)',
    label: 'Success'
  },
  FAILED: {
    bg: DESIGN_TOKENS.colors.errorLight,
    text: DESIGN_TOKENS.colors.error,
    border: DESIGN_TOKENS.colors.errorSoft,
    dot: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.2)',
    label: 'Failed'
  },
  PENDING: {
    bg: DESIGN_TOKENS.colors.warningLight,
    text: DESIGN_TOKENS.colors.warning,
    border: DESIGN_TOKENS.colors.warningSoft,
    dot: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.2)',
    label: 'Pending'
  },
  DEFAULT: {
    bg: DESIGN_TOKENS.colors.neutral50,
    text: DESIGN_TOKENS.colors.neutral600,
    border: DESIGN_TOKENS.colors.neutral200,
    dot: DESIGN_TOKENS.colors.neutral500,
    glow: 'rgba(100, 116, 139, 0.15)',
    label: 'All'
  }
};

const TransactionTable = () => {
  const [data, setData] = useState<PaginatedTransactions | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [filterInputs, setFilterInputs] = useState({
    email: '',
    status: '',
    paymentMethod: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    email: '',
    status: '',
    paymentMethod: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
  });

  const activeFilterCount = useMemo(() => 
    Object.values(appliedFilters).filter(v => v !== '').length,
    [appliedFilters]
  );

  const hasUnappliedChanges = useMemo(() => 
    JSON.stringify(filterInputs) !== JSON.stringify(appliedFilters),
    [filterInputs, appliedFilters]
  );

  useEffect(() => {
    fetchTransactions();
  }, [page, pageSize, appliedFilters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      
      if (appliedFilters.email) filterParams.email = appliedFilters.email;
      if (appliedFilters.status) filterParams.status = appliedFilters.status;
      if (appliedFilters.paymentMethod) filterParams.paymentMethod = appliedFilters.paymentMethod;
      if (appliedFilters.minAmount) filterParams.minAmount = parseFloat(appliedFilters.minAmount);
      if (appliedFilters.maxAmount) filterParams.maxAmount = parseFloat(appliedFilters.maxAmount);
      if (appliedFilters.startDate) filterParams.startDate = appliedFilters.startDate;
      if (appliedFilters.endDate) filterParams.endDate = appliedFilters.endDate;

      const result = await analyticsAPI.getTransactions(page, pageSize, filterParams);
      setData(result);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
      setIsApplying(false);
    }
  };

  const handleInputChange = useCallback((key: string, value: string) => {
    setFilterInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = useCallback(async () => {
    setIsApplying(true);
    setAppliedFilters({ ...filterInputs });
    setPage(0);
  }, [filterInputs]);

  const clearFilters = useCallback(() => {
    const emptyFilters = {
      email: '',
      status: '',
      paymentMethod: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: '',
    };
    setFilterInputs(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(0);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  }, [applyFilters]);

  const formatCurrency = (value: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD': return 'Credit Card';
      case 'UPI': return 'UPI';
      case 'WALLETS': return 'Wallets';
      case 'NET_BANKING': return 'Net Banking';
      case 'DEBIT_CARD': return 'Debit Card';
      default: return method.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    }
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.DEFAULT;
  };

  // ==================== PREMIUM STYLES ====================
  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: DESIGN_TOKENS.radius['2xl'],
    border: `1px solid ${DESIGN_TOKENS.colors.neutral100}`,
    boxShadow: DESIGN_TOKENS.shadow.card,
    transition: `box-shadow ${DESIGN_TOKENS.transition.normal}`,
  };

  const premiumInputStyle = (isFocused: boolean): React.CSSProperties => ({
    width: '100%',
    height: '46px',
    padding: '0 14px 0 42px',
    backgroundColor: '#ffffff',
    border: `1.5px solid ${isFocused ? '#7FB3C8' : DESIGN_TOKENS.colors.neutral200}`,
    borderRadius: DESIGN_TOKENS.radius.lg,
    fontSize: DESIGN_TOKENS.fontSize.base,
    fontWeight: 450,
    outline: 'none',
    color: DESIGN_TOKENS.colors.neutral900,
    transition: `all ${DESIGN_TOKENS.transition.fast}`,
    boxShadow: isFocused ? '0 0 0 3px rgba(127, 179, 200, 0.2)' : 'none',
  });

  const inputWrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputIconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
    color: DESIGN_TOKENS.colors.neutral400,
    transition: `color ${DESIGN_TOKENS.transition.fast}`,
  };

  // ==================== SKELETON LOADER ====================
  const SkeletonRow = () => (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} style={{ padding: '20px 24px' }}>
          <div 
            className="skeleton" 
            style={{ 
              height: i === 0 ? '44px' : '20px', 
              width: i === 0 ? '180px' : i === 2 ? '100px' : '140px',
              borderRadius: DESIGN_TOKENS.radius.md,
            }} 
          />
        </td>
      ))}
    </tr>
  );

  // ==================== EMPTY STATE ====================
  const EmptyState = () => (
    <div style={{
      padding: '80px 32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        background: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.neutral50} 0%, ${DESIGN_TOKENS.colors.neutral100} 100%)`,
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <svg width="36" height="36" fill="none" stroke={DESIGN_TOKENS.colors.neutral400} strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      <h3 style={{
        fontSize: DESIGN_TOKENS.fontSize.xl,
        fontWeight: 600,
        color: DESIGN_TOKENS.colors.neutral900,
        margin: '0 0 8px 0',
      }}>
        No transactions found
      </h3>
      <p style={{
        fontSize: DESIGN_TOKENS.fontSize.base,
        color: DESIGN_TOKENS.colors.neutral500,
        margin: '0 0 24px 0',
        maxWidth: '320px',
        lineHeight: 1.5,
      }}>
        Try adjusting your search or filter criteria to find what you're looking for.
      </p>
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: DESIGN_TOKENS.colors.primary,
            color: '#ffffff',
            border: 'none',
            borderRadius: DESIGN_TOKENS.radius.lg,
            fontSize: DESIGN_TOKENS.fontSize.base,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: DESIGN_TOKENS.shadow.button,
            transition: `all ${DESIGN_TOKENS.transition.fast}`,
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Reset All Filters
        </button>
      )}
    </div>
  );

  // ==================== LOADING STATE ====================
  if (loading && !data) {
    return (
      <div>
        {/* Filter Skeleton */}
        <div style={{ ...cardStyle, marginBottom: '24px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: DESIGN_TOKENS.radius.lg }} />
            <div>
              <div className="skeleton" style={{ height: '20px', width: '180px', borderRadius: '6px', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '14px', width: '120px', borderRadius: '6px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '40px', width: '100px', borderRadius: DESIGN_TOKENS.radius.full }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '46px', borderRadius: DESIGN_TOKENS.radius.lg }} />
            ))}
          </div>
        </div>
        {/* Table Skeleton */}
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: DESIGN_TOKENS.colors.neutral50 }}>
                {['Transaction', 'Customer', 'Amount', 'Status', 'Payment', 'Date'].map(col => (
                  <th key={col} style={{ padding: '16px 24px', textAlign: 'left' }}>
                    <div className="skeleton" style={{ height: '12px', width: '80px', borderRadius: '4px' }} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (error) {
    return (
      <div style={{ 
        ...cardStyle, 
        padding: '32px', 
        border: `1px solid ${DESIGN_TOKENS.colors.errorSoft}`,
        background: `linear-gradient(135deg, #ffffff 0%, ${DESIGN_TOKENS.colors.errorLight} 100%)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            background: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.errorLight} 0%, ${DESIGN_TOKENS.colors.errorSoft} 100%)`, 
            borderRadius: DESIGN_TOKENS.radius.xl, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="28" height="28" fill="none" stroke={DESIGN_TOKENS.colors.error} strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: DESIGN_TOKENS.fontSize.lg, fontWeight: 600, color: DESIGN_TOKENS.colors.neutral900, margin: 0 }}>
              Error loading transactions
            </p>
            <p style={{ fontSize: DESIGN_TOKENS.fontSize.base, color: DESIGN_TOKENS.colors.neutral500, margin: '6px 0 0 0' }}>
              {error}. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getFilterLabel = (key: string, value: string): string => {
    if (key === 'status') return value.charAt(0) + value.slice(1).toLowerCase();
    if (key === 'paymentMethod') return formatPaymentMethod(value);
    if (key === 'minAmount') return `Min: ₹${value}`;
    if (key === 'maxAmount') return `Max: ₹${value}`;
    if (key === 'startDate') return `From: ${value}`;
    if (key === 'endDate') return `To: ${value}`;
    if (key === 'email') return `Email: ${value}`;
    return value;
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...appliedFilters, [key]: '' };
    setAppliedFilters(newFilters);
    setFilterInputs({ ...filterInputs, [key]: '' });
    setPage(0);
  };

  // ==================== QUICK STATUS CHIP COMPONENT ====================
  const StatusChip = ({ 
    value, 
    label, 
    config, 
    isActive 
  }: { 
    value: string; 
    label: string; 
    config: typeof STATUS_CONFIG.SUCCESS; 
    isActive: boolean;
  }) => (
    <button
      onClick={() => {
        handleInputChange('status', value);
        setAppliedFilters({ ...appliedFilters, status: value });
        setPage(0);
      }}
      style={{
        padding: '10px 18px',
        borderRadius: DESIGN_TOKENS.radius.full,
        border: `1.5px solid ${isActive ? config.text : DESIGN_TOKENS.colors.neutral200}`,
        backgroundColor: isActive ? config.bg : '#ffffff',
        color: isActive ? config.text : DESIGN_TOKENS.colors.neutral500,
        fontSize: DESIGN_TOKENS.fontSize.md,
        fontWeight: 550,
        cursor: 'pointer',
        transition: `all ${DESIGN_TOKENS.transition.fast}`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: isActive ? `0 0 0 3px ${config.glow}` : 'none',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.neutral50;
          e.currentTarget.style.borderColor = DESIGN_TOKENS.colors.neutral300;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = DESIGN_TOKENS.colors.neutral200;
        }
      }}
    >
      {value && (
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: config.dot,
          boxShadow: isActive ? `0 0 6px ${config.dot}` : 'none',
          transition: `box-shadow ${DESIGN_TOKENS.transition.fast}`,
        }} />
      )}
      {label}
    </button>
  );

  // ==================== TABLE HEADER CELL ====================
  const TableHeaderCell = ({ children }: { children: React.ReactNode }) => (
    <th style={{
      padding: '14px 24px',
      textAlign: 'left',
      fontSize: DESIGN_TOKENS.fontSize.xs,
      fontWeight: 600,
      color: DESIGN_TOKENS.colors.neutral500,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      borderBottom: `1px solid ${DESIGN_TOKENS.colors.neutral100}`,
      backgroundColor: DESIGN_TOKENS.colors.neutral50,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </th>
  );

  return (
    <div>
      {/* ==================== PREMIUM FILTER PANEL ==================== */}
      <div style={{ 
        ...cardStyle, 
        marginBottom: '24px',
        overflow: 'hidden',
        backgroundColor: isFilterExpanded ? '#ffffff' : 'rgba(255, 255, 255, 0.95)',
        border: isFilterExpanded ? `1px solid ${DESIGN_TOKENS.colors.neutral100}` : 'none',
        boxShadow: isFilterExpanded ? DESIGN_TOKENS.shadow.card : '0 2px 12px rgba(0, 49, 66, 0.06)',
        transition: `all ${DESIGN_TOKENS.transition.normal}`,
      }}>
        {/* Filter Header */}
        <div 
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          style={{ 
            padding: '20px 24px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer',
            background: isFilterExpanded 
              ? `linear-gradient(135deg, ${DESIGN_TOKENS.colors.primarySoft} 0%, #D1E8E3 50%, ${DESIGN_TOKENS.colors.primarySoft} 100%)`
              : 'transparent',
            borderBottom: isFilterExpanded ? `1px solid ${DESIGN_TOKENS.colors.primarySoft}` : 'none',
            transition: `all ${DESIGN_TOKENS.transition.fast}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: isFilterExpanded 
                ? `linear-gradient(135deg, #ffffff 0%, ${DESIGN_TOKENS.colors.primaryLight} 100%)`
                : '#E6F4F1',
              borderRadius: DESIGN_TOKENS.radius.lg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isFilterExpanded ? '0 2px 8px rgba(0, 49, 66, 0.15)' : 'none',
              border: isFilterExpanded ? `1px solid ${DESIGN_TOKENS.colors.primarySoft}` : 'none',
              transition: `all ${DESIGN_TOKENS.transition.fast}`,
            }}>
              <svg width="22" height="22" fill="none" stroke="#7FB3C8" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
            </div>
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                flexWrap: 'wrap',
              }}>
                <h3 style={{ 
                  fontSize: DESIGN_TOKENS.fontSize['2xl'], 
                  fontWeight: 700, 
                  color: DESIGN_TOKENS.colors.neutral900, 
                  margin: 0, 
                  letterSpacing: '-0.02em',
                }}>
                  Filter Transactions
                </h3>
                {activeFilterCount > 0 && (
                  <span style={{
                    background: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.primary} 0%, ${DESIGN_TOKENS.colors.primaryHover} 100%)`,
                    color: '#ffffff',
                    fontSize: DESIGN_TOKENS.fontSize.xs,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: DESIGN_TOKENS.radius.full,
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <p style={{ 
                fontSize: DESIGN_TOKENS.fontSize.md, 
                color: DESIGN_TOKENS.colors.neutral600, 
                margin: '4px 0 0 0',
                fontWeight: 450,
              }}>
                Refine your transaction search
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {activeFilterCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilters();
                }}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#ffffff',
                  color: DESIGN_TOKENS.colors.neutral600,
                  border: `1.5px solid ${isFilterExpanded ? DESIGN_TOKENS.colors.neutral200 : DESIGN_TOKENS.colors.neutral300}`,
                  borderRadius: DESIGN_TOKENS.radius.lg,
                  fontSize: DESIGN_TOKENS.fontSize.md,
                  fontWeight: 550,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: `all ${DESIGN_TOKENS.transition.fast}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isFilterExpanded ? DESIGN_TOKENS.colors.neutral50 : '#ffffff';
                  e.currentTarget.style.borderColor = DESIGN_TOKENS.colors.neutral300;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = isFilterExpanded ? DESIGN_TOKENS.colors.neutral200 : DESIGN_TOKENS.colors.neutral300;
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear all
              </button>
            )}
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: isFilterExpanded ? '#ffffff' : '#E6F4F1',
              borderRadius: DESIGN_TOKENS.radius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: `transform ${DESIGN_TOKENS.transition.normal}, all ${DESIGN_TOKENS.transition.fast}`,
              transform: isFilterExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              border: isFilterExpanded ? `1.5px solid ${DESIGN_TOKENS.colors.neutral200}` : 'none',
              boxShadow: isFilterExpanded ? DESIGN_TOKENS.shadow.sm : 'none',
            }}>
              <svg width="18" height="18" fill="none" stroke={DESIGN_TOKENS.colors.neutral500} strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Filter Badges - Collapsed view */}
        {activeFilterCount > 0 && !isFilterExpanded && (
          <div style={{ 
            padding: '16px 24px', 
            paddingTop: '0',
            backgroundColor: 'transparent',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            {Object.entries(appliedFilters).map(([key, value]) => {
              if (!value) return null;
              return (
                <span
                  key={key}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    backgroundColor: '#ffffff',
                    color: DESIGN_TOKENS.colors.primary,
                    fontSize: DESIGN_TOKENS.fontSize.sm,
                    fontWeight: 550,
                    borderRadius: DESIGN_TOKENS.radius.full,
                    border: `1px solid ${DESIGN_TOKENS.colors.neutral200}`,
                    transition: `all ${DESIGN_TOKENS.transition.fast}`,
                  }}
                >
                  {getFilterLabel(key, value)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFilter(key);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: DESIGN_TOKENS.colors.primary,
                      opacity: 0.6,
                      transition: `opacity ${DESIGN_TOKENS.transition.fast}`,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Filter Content - Expanded view */}
        {isFilterExpanded && (
          <div style={{ padding: '24px' }}>
            {/* Quick Status Filters */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ 
                fontSize: DESIGN_TOKENS.fontSize.xs, 
                fontWeight: 650, 
                color: DESIGN_TOKENS.colors.neutral500, 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em', 
                marginBottom: '14px',
              }}>
                Quick Status Filter
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <StatusChip 
                  value="" 
                  label="All" 
                  config={STATUS_CONFIG.DEFAULT} 
                  isActive={appliedFilters.status === ''} 
                />
                <StatusChip 
                  value="SUCCESS" 
                  label="Success" 
                  config={STATUS_CONFIG.SUCCESS} 
                  isActive={appliedFilters.status === 'SUCCESS'} 
                />
                <StatusChip 
                  value="PENDING" 
                  label="Pending" 
                  config={STATUS_CONFIG.PENDING} 
                  isActive={appliedFilters.status === 'PENDING'} 
                />
                <StatusChip 
                  value="FAILED" 
                  label="Failed" 
                  config={STATUS_CONFIG.FAILED} 
                  isActive={appliedFilters.status === 'FAILED'} 
                />
              </div>
            </div>

            {/* Subtle Divider */}
            <div style={{ 
              height: '1px', 
              background: `linear-gradient(to right, transparent, ${DESIGN_TOKENS.colors.neutral200}, transparent)`,
              margin: '24px 0',
            }} />

            {/* Filter Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
              gap: '20px',
            }}>
              {/* Email Search */}
              <div>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: DESIGN_TOKENS.fontSize.md, 
                  fontWeight: 550, 
                  color: DESIGN_TOKENS.colors.neutral700, 
                  marginBottom: '10px',
                }}>
                  Email Search
                </label>
                <div style={inputWrapperStyle}>
                  <span style={{
                    ...inputIconStyle,
                    color: focusedInput === 'email' ? DESIGN_TOKENS.colors.primary : DESIGN_TOKENS.colors.neutral400,
                  }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={filterInputs.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="Search by email..."
                    style={premiumInputStyle(focusedInput === 'email')}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: DESIGN_TOKENS.fontSize.md, 
                  fontWeight: 550, 
                  color: DESIGN_TOKENS.colors.neutral700, 
                  marginBottom: '10px',
                }}>
                  Payment Method
                </label>
                <div style={inputWrapperStyle}>
                  <span style={{
                    ...inputIconStyle,
                    color: focusedInput === 'payment' ? '#7FB3C8' : DESIGN_TOKENS.colors.neutral400,
                  }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                  </span>
                  <select
                    value={filterInputs.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    onFocus={() => setFocusedInput('payment')}
                    onBlur={() => setFocusedInput(null)}
                    style={{
                      ...premiumInputStyle(focusedInput === 'payment'),
                      cursor: 'pointer',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 14px center',
                      backgroundSize: '18px',
                      paddingRight: '44px',
                    }}
                  >
                    <option value="">All Methods</option>
                    <option value="UPI">UPI</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="WALLETS">Wallets</option>
                  </select>
                </div>
              </div>

              {/* Amount Range */}
              <div>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: DESIGN_TOKENS.fontSize.md, 
                  fontWeight: 550, 
                  color: DESIGN_TOKENS.colors.neutral700, 
                  marginBottom: '10px',
                }}>
                  Amount Range
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ ...inputWrapperStyle, flex: 1 }}>
                    <span style={{
                      ...inputIconStyle,
                      color: focusedInput === 'minAmount' ? '#7FB3C8' : DESIGN_TOKENS.colors.neutral400,
                      fontWeight: 600,
                      fontSize: DESIGN_TOKENS.fontSize.lg,
                    }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      value={filterInputs.minAmount}
                      onChange={(e) => handleInputChange('minAmount', e.target.value)}
                      onKeyPress={handleKeyPress}
                      onFocus={() => setFocusedInput('minAmount')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Min"
                      style={{
                        ...premiumInputStyle(focusedInput === 'minAmount'),
                        paddingLeft: '36px',
                      }}
                    />
                  </div>
                  <span style={{ 
                    color: DESIGN_TOKENS.colors.neutral400, 
                    fontSize: DESIGN_TOKENS.fontSize.lg,
                    fontWeight: 500,
                  }}>–</span>
                  <div style={{ ...inputWrapperStyle, flex: 1 }}>
                    <span style={{
                      ...inputIconStyle,
                      color: focusedInput === 'maxAmount' ? '#7FB3C8' : DESIGN_TOKENS.colors.neutral400,
                      fontWeight: 600,
                      fontSize: DESIGN_TOKENS.fontSize.lg,
                    }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      value={filterInputs.maxAmount}
                      onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                      onKeyPress={handleKeyPress}
                      onFocus={() => setFocusedInput('maxAmount')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Max"
                      style={{
                        ...premiumInputStyle(focusedInput === 'maxAmount'),
                        paddingLeft: '36px',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date Range Row */}
            <div style={{ marginTop: '20px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontSize: DESIGN_TOKENS.fontSize.md, 
                fontWeight: 550, 
                color: DESIGN_TOKENS.colors.neutral700, 
                marginBottom: '10px',
              }}>
                Date Range
              </label>
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                alignItems: 'center',
                flexDirection: isMobile ? 'column' : 'row',
              }}>
                <div style={{ ...inputWrapperStyle, flex: 1, width: isMobile ? '100%' : 'auto' }}>
                  <span style={{
                    ...inputIconStyle,
                    color: focusedInput === 'startDate' ? '#7FB3C8' : DESIGN_TOKENS.colors.neutral400,
                  }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </span>
                  <input
                    type="date"
                    value={filterInputs.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    onFocus={() => setFocusedInput('startDate')}
                    onBlur={() => setFocusedInput(null)}
                    style={premiumInputStyle(focusedInput === 'startDate')}
                  />
                </div>
                <span style={{ 
                  color: DESIGN_TOKENS.colors.neutral400, 
                  fontSize: DESIGN_TOKENS.fontSize.md,
                  fontWeight: 500,
                  display: isMobile ? 'none' : 'block',
                }}>to</span>
                <div style={{ ...inputWrapperStyle, flex: 1, width: isMobile ? '100%' : 'auto' }}>
                  <span style={{
                    ...inputIconStyle,
                    color: focusedInput === 'endDate' ? '#7FB3C8' : DESIGN_TOKENS.colors.neutral400,
                  }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </span>
                  <input
                    type="date"
                    value={filterInputs.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    onFocus={() => setFocusedInput('endDate')}
                    onBlur={() => setFocusedInput(null)}
                    style={premiumInputStyle(focusedInput === 'endDate')}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px', 
              marginTop: '28px',
              paddingTop: '24px',
              borderTop: `1px solid ${DESIGN_TOKENS.colors.neutral100}`,
            }}>
              <button
                onClick={clearFilters}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: DESIGN_TOKENS.colors.neutral600,
                  border: `1.5px solid ${DESIGN_TOKENS.colors.neutral200}`,
                  borderRadius: DESIGN_TOKENS.radius.lg,
                  fontSize: DESIGN_TOKENS.fontSize.base,
                  fontWeight: 550,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: `all ${DESIGN_TOKENS.transition.fast}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.neutral50;
                  e.currentTarget.style.borderColor = DESIGN_TOKENS.colors.neutral300;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = DESIGN_TOKENS.colors.neutral200;
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Reset
              </button>
              <button
                onClick={applyFilters}
                disabled={!hasUnappliedChanges && !isApplying}
                style={{
                  padding: '12px 28px',
                  background: hasUnappliedChanges 
                    ? `linear-gradient(135deg, ${DESIGN_TOKENS.colors.primary} 0%, ${DESIGN_TOKENS.colors.primaryHover} 100%)`
                    : DESIGN_TOKENS.colors.neutral200,
                  color: hasUnappliedChanges ? '#ffffff' : DESIGN_TOKENS.colors.neutral500,
                  border: 'none',
                  borderRadius: DESIGN_TOKENS.radius.lg,
                  fontSize: DESIGN_TOKENS.fontSize.base,
                  fontWeight: 650,
                  cursor: hasUnappliedChanges ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: hasUnappliedChanges ? DESIGN_TOKENS.shadow.button : 'none',
                  transition: `all ${DESIGN_TOKENS.transition.fast}`,
                  opacity: isApplying ? 0.8 : 1,
                }}
              >
                {isApplying ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="40 60" />
                    </svg>
                    Applying...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    Apply Filters
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== PREMIUM TABLE - DESKTOP ==================== */}
      {!isMobile && (
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          {data?.transactions.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <TableHeaderCell>Transaction</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Payment</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                  ) : (
                    data?.transactions.map((transaction, index) => {
                      const statusConfig = getStatusConfig(transaction.status);
                      const isHovered = hoveredRow === index;
                      const isEven = index % 2 === 1;
                      
                      return (
                        <tr 
                          key={transaction.id} 
                          style={{ 
                            borderBottom: index === (data?.transactions.length ?? 0) - 1 ? 'none' : `1px solid ${DESIGN_TOKENS.colors.neutral100}`,
                            backgroundColor: isHovered 
                              ? DESIGN_TOKENS.colors.neutral50 
                              : isEven 
                                ? 'rgba(248, 250, 252, 0.5)' 
                                : 'transparent',
                            transition: `background-color ${DESIGN_TOKENS.transition.fast}`,
                            cursor: 'pointer',
                          }}
                          onMouseEnter={() => setHoveredRow(index)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <td style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{ 
                                width: '44px', 
                                height: '44px', 
                                background: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.primaryLight} 0%, #D1E8E3 100%)`,
                                borderRadius: DESIGN_TOKENS.radius.lg, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                flexShrink: 0,
                                transition: `transform ${DESIGN_TOKENS.transition.fast}`,
                                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                              }}>
                                <svg width="20" height="20" fill="none" stroke={DESIGN_TOKENS.colors.primary} strokeWidth={1.75} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                                </svg>
                              </div>
                              <div>
                                <p style={{ 
                                  fontSize: DESIGN_TOKENS.fontSize.base, 
                                  fontWeight: 650, 
                                  color: DESIGN_TOKENS.colors.neutral900, 
                                  margin: 0,
                                  fontVariantNumeric: 'tabular-nums',
                                }}>
                                  #{transaction.id}
                                </p>
                                <p style={{ 
                                  fontSize: DESIGN_TOKENS.fontSize.sm, 
                                  color: DESIGN_TOKENS.colors.neutral500, 
                                  margin: '3px 0 0 0',
                                  fontWeight: 450,
                                }}>
                                  {transaction.type}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '20px 24px' }}>
                            <p style={{ 
                              fontSize: DESIGN_TOKENS.fontSize.base, 
                              fontWeight: 600, 
                              color: DESIGN_TOKENS.colors.neutral900, 
                              margin: 0,
                            }}>
                              {transaction.userName}
                            </p>
                            <p style={{ 
                              fontSize: DESIGN_TOKENS.fontSize.sm, 
                              color: DESIGN_TOKENS.colors.neutral500, 
                              margin: '3px 0 0 0',
                              fontWeight: 450,
                            }}>
                              {transaction.userEmail}
                            </p>
                          </td>
                          <td style={{ padding: '20px 24px' }}>
                            <p style={{ 
                              fontSize: DESIGN_TOKENS.fontSize.lg, 
                              fontWeight: 700, 
                              color: DESIGN_TOKENS.colors.neutral900, 
                              margin: 0,
                              fontVariantNumeric: 'tabular-nums',
                              letterSpacing: '-0.01em',
                            }}>
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </p>
                          </td>
                          <td style={{ padding: '20px 24px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 14px',
                              borderRadius: DESIGN_TOKENS.radius.full,
                              fontSize: DESIGN_TOKENS.fontSize.sm,
                              fontWeight: 600,
                              backgroundColor: statusConfig.bg,
                              color: statusConfig.text,
                              border: `1px solid ${statusConfig.border}`,
                              boxShadow: isHovered ? `0 0 0 3px ${statusConfig.glow}` : 'none',
                              transition: `box-shadow ${DESIGN_TOKENS.transition.fast}`,
                            }}>
                              <span style={{ 
                                width: '7px', 
                                height: '7px', 
                                borderRadius: '50%', 
                                backgroundColor: statusConfig.dot,
                                boxShadow: `0 0 4px ${statusConfig.dot}`,
                              }} />
                              {statusConfig.label}
                            </span>
                          </td>
                          <td style={{ padding: '20px 24px' }}>
                            <p style={{ 
                              fontSize: DESIGN_TOKENS.fontSize.base, 
                              fontWeight: 550, 
                              color: DESIGN_TOKENS.colors.neutral900, 
                              margin: 0,
                            }}>
                              {formatPaymentMethod(transaction.paymentMethod)}
                            </p>
                            {transaction.paymentProvider && (
                              <p style={{ 
                                fontSize: DESIGN_TOKENS.fontSize.sm, 
                                color: DESIGN_TOKENS.colors.neutral500, 
                                margin: '3px 0 0 0',
                                fontWeight: 450,
                              }}>
                                {transaction.paymentProvider}
                              </p>
                            )}
                          </td>
                          <td style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <p style={{ 
                                fontSize: DESIGN_TOKENS.fontSize.md, 
                                color: DESIGN_TOKENS.colors.neutral600, 
                                margin: 0,
                                fontWeight: 450,
                              }}>
                                {formatDate(transaction.createdAt)}
                              </p>
                              <svg 
                                width="16" 
                                height="16" 
                                fill="none" 
                                stroke={DESIGN_TOKENS.colors.neutral400} 
                                strokeWidth={2} 
                                viewBox="0 0 24 24"
                                style={{
                                  opacity: isHovered ? 1 : 0,
                                  transform: isHovered ? 'translateX(0)' : 'translateX(-4px)',
                                  transition: `all ${DESIGN_TOKENS.transition.fast}`,
                                }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                              </svg>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== MOBILE CARD VIEW ==================== */}
      {isMobile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data?.transactions.length === 0 ? (
            <div style={cardStyle}>
              <EmptyState />
            </div>
          ) : (
            data?.transactions.map((transaction) => {
              const statusConfig = getStatusConfig(transaction.status);
              return (
                <div 
                  key={transaction.id} 
                  style={{ 
                    ...cardStyle, 
                    padding: '20px',
                    transition: `all ${DESIGN_TOKENS.transition.fast}`,
                  }}
                >
                  {/* Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '44px', 
                        height: '44px', 
                        background: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.primaryLight} 0%, #D1E8E3 100%)`,
                        borderRadius: DESIGN_TOKENS.radius.lg, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg width="20" height="20" fill="none" stroke={DESIGN_TOKENS.colors.primary} strokeWidth={1.75} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ 
                          fontSize: DESIGN_TOKENS.fontSize.lg, 
                          fontWeight: 650, 
                          color: DESIGN_TOKENS.colors.neutral900, 
                          margin: 0,
                        }}>
                          #{transaction.id}
                        </p>
                        <p style={{ 
                          fontSize: DESIGN_TOKENS.fontSize.sm, 
                          color: DESIGN_TOKENS.colors.neutral500, 
                          margin: 0,
                          fontWeight: 450,
                        }}>
                          {transaction.type}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ 
                        fontSize: DESIGN_TOKENS.fontSize.xl, 
                        fontWeight: 700, 
                        color: DESIGN_TOKENS.colors.neutral900, 
                        margin: '0 0 6px 0',
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.01em',
                      }}>
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: DESIGN_TOKENS.radius.full,
                        fontSize: DESIGN_TOKENS.fontSize.xs,
                        fontWeight: 600,
                        backgroundColor: statusConfig.bg,
                        color: statusConfig.text,
                        border: `1px solid ${statusConfig.border}`,
                      }}>
                        <span style={{ 
                          width: '6px', 
                          height: '6px', 
                          borderRadius: '50%', 
                          backgroundColor: statusConfig.dot,
                        }} />
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '16px',
                    paddingTop: '16px',
                    borderTop: `1px solid ${DESIGN_TOKENS.colors.neutral100}`,
                  }}>
                    <div>
                      <p style={{ 
                        fontSize: DESIGN_TOKENS.fontSize.xs, 
                        color: DESIGN_TOKENS.colors.neutral400, 
                        margin: '0 0 4px 0', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.06em', 
                        fontWeight: 600,
                      }}>
                        Customer
                      </p>
                      <p style={{ 
                        fontSize: DESIGN_TOKENS.fontSize.md, 
                        fontWeight: 600, 
                        color: DESIGN_TOKENS.colors.neutral900, 
                        margin: 0,
                      }}>
                        {transaction.userName}
                      </p>
                      <p style={{ 
                        fontSize: DESIGN_TOKENS.fontSize.sm, 
                        color: DESIGN_TOKENS.colors.neutral500, 
                        margin: '2px 0 0 0', 
                        wordBreak: 'break-all',
                        fontWeight: 450,
                      }}>
                        {transaction.userEmail}
                      </p>
                    </div>
                    <div>
                      <p style={{ 
                        fontSize: DESIGN_TOKENS.fontSize.xs, 
                        color: DESIGN_TOKENS.colors.neutral400, 
                        margin: '0 0 4px 0', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.06em', 
                        fontWeight: 600,
                      }}>
                        Payment
                      </p>
                      <p style={{ 
                        fontSize: DESIGN_TOKENS.fontSize.md, 
                        fontWeight: 600, 
                        color: DESIGN_TOKENS.colors.neutral900, 
                        margin: 0,
                      }}>
                        {formatPaymentMethod(transaction.paymentMethod)}
                      </p>
                      {transaction.paymentProvider && (
                        <p style={{ 
                          fontSize: DESIGN_TOKENS.fontSize.sm, 
                          color: DESIGN_TOKENS.colors.neutral500, 
                          margin: '2px 0 0 0',
                          fontWeight: 450,
                        }}>
                          {transaction.paymentProvider}
                        </p>
                      )}
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <p style={{ 
                        fontSize: DESIGN_TOKENS.fontSize.xs, 
                        color: DESIGN_TOKENS.colors.neutral400, 
                        margin: '0 0 4px 0', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.06em', 
                        fontWeight: 600,
                      }}>
                        Date
                      </p>
                      <p style={{ 
                        fontSize: DESIGN_TOKENS.fontSize.md, 
                        color: DESIGN_TOKENS.colors.neutral600, 
                        margin: 0,
                        fontWeight: 450,
                      }}>
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ==================== PREMIUM PAGINATION ==================== */}
      {data && data.transactions.length > 0 && (
        <div style={{ 
          ...cardStyle,
          marginTop: '20px',
          padding: '18px 24px', 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center', 
          justifyContent: 'space-between',
          gap: '20px',
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: '16px',
          }}>
            <p style={{ 
              fontSize: DESIGN_TOKENS.fontSize.md, 
              color: DESIGN_TOKENS.colors.neutral500, 
              margin: 0, 
              textAlign: isMobile ? 'center' : 'left',
              fontWeight: 450,
            }}>
              Showing{' '}
              <span style={{ fontWeight: 650, color: DESIGN_TOKENS.colors.neutral900 }}>
                {data.currentPage * data.pageSize + 1}
              </span>
              {' '}to{' '}
              <span style={{ fontWeight: 650, color: DESIGN_TOKENS.colors.neutral900 }}>
                {Math.min((data.currentPage + 1) * data.pageSize, data.totalElements)}
              </span>
              {' '}of{' '}
              <span style={{ fontWeight: 650, color: DESIGN_TOKENS.colors.neutral900 }}>
                {data.totalElements}
              </span>
            </p>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              style={{ 
                padding: '10px 14px', 
                backgroundColor: DESIGN_TOKENS.colors.neutral50, 
                border: `1.5px solid ${DESIGN_TOKENS.colors.neutral200}`, 
                borderRadius: DESIGN_TOKENS.radius.md, 
                fontSize: DESIGN_TOKENS.fontSize.md, 
                fontWeight: 550,
                outline: 'none',
                color: DESIGN_TOKENS.colors.neutral700,
                cursor: 'pointer',
                transition: `all ${DESIGN_TOKENS.transition.fast}`,
              }}
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            gap: '10px',
          }}>
            <button
              onClick={() => setPage(page - 1)}
              disabled={!data.hasPrevious}
              style={{
                padding: '11px 20px',
                borderRadius: DESIGN_TOKENS.radius.md,
                border: `1.5px solid ${data.hasPrevious ? DESIGN_TOKENS.colors.neutral200 : DESIGN_TOKENS.colors.neutral100}`,
                backgroundColor: '#ffffff',
                color: data.hasPrevious ? DESIGN_TOKENS.colors.neutral700 : DESIGN_TOKENS.colors.neutral300,
                cursor: data.hasPrevious ? 'pointer' : 'not-allowed',
                fontSize: DESIGN_TOKENS.fontSize.md,
                fontWeight: 550,
                flex: isMobile ? 1 : 'none',
                transition: `all ${DESIGN_TOKENS.transition.fast}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Previous
            </button>
            <span style={{ 
              fontSize: DESIGN_TOKENS.fontSize.md, 
              color: DESIGN_TOKENS.colors.neutral600, 
              padding: '0 16px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {data.currentPage + 1} / {data.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data.hasNext}
              style={{
                padding: '11px 20px',
                borderRadius: DESIGN_TOKENS.radius.md,
                border: `1.5px solid ${data.hasNext ? DESIGN_TOKENS.colors.neutral200 : DESIGN_TOKENS.colors.neutral100}`,
                backgroundColor: '#ffffff',
                color: data.hasNext ? DESIGN_TOKENS.colors.neutral700 : DESIGN_TOKENS.colors.neutral300,
                cursor: data.hasNext ? 'pointer' : 'not-allowed',
                fontSize: DESIGN_TOKENS.fontSize.md,
                fontWeight: 550,
                flex: isMobile ? 1 : 'none',
                transition: `all ${DESIGN_TOKENS.transition.fast}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              Next
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Animation Keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TransactionTable;
