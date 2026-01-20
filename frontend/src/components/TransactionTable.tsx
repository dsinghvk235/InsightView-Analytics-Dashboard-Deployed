import { useEffect, useState } from 'react';
import { analyticsAPI, PaginatedTransactions } from '../services/api';

const TransactionTable = () => {
  const [data, setData] = useState<PaginatedTransactions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  
  // Separate state for input fields (not applied yet) and applied filters
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

  // Count active filters
  const activeFilterCount = Object.values(appliedFilters).filter(v => v !== '').length;

  // Fetch only when page, pageSize, or appliedFilters change
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
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFilterInputs({ ...filterInputs, [key]: value });
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filterInputs });
    setPage(0);
  };

  const clearFilters = () => {
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
  };

  // Handle Enter key to apply filters
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

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

  const getStatusStyle = (status: string): { bg: string; text: string; dot: string } => {
    switch (status) {
      case 'SUCCESS':
        return { bg: '#ecfdf5', text: '#047857', dot: '#10b981' };
      case 'FAILED':
        return { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444' };
      case 'PENDING':
        return { bg: '#fffbeb', text: '#b45309', dot: '#f59e0b' };
      default:
        return { bg: '#f8fafc', text: '#475569', dot: '#64748b' };
    }
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #f1f5f9'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none'
  };

  if (loading && !data) {
    return (
      <div style={cardStyle}>
        <div style={{ padding: '24px' }}>
          <div style={{ height: '24px', backgroundColor: '#e2e8f0', borderRadius: '8px', width: '25%', marginBottom: '16px' }}></div>
          <div style={{ height: '48px', backgroundColor: '#f1f5f9', borderRadius: '12px', marginBottom: '16px' }}></div>
          <div style={{ height: '400px', backgroundColor: '#f1f5f9', borderRadius: '12px' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...cardStyle, padding: '32px', border: '1px solid #fecaca' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '24px', height: '24px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Error loading transactions</p>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper to get filter label for badges
  const getFilterLabel = (key: string, value: string): string => {
    if (key === 'status') {
      return value.charAt(0) + value.slice(1).toLowerCase();
    }
    if (key === 'paymentMethod') {
      if (value === 'CREDIT_CARD') return 'Credit Card';
      if (value === 'UPI') return 'UPI';
      if (value === 'WALLETS') return 'Wallets';
    }
    if (key === 'minAmount') return `Min: ₹${value}`;
    if (key === 'maxAmount') return `Max: ₹${value}`;
    if (key === 'startDate') return `From: ${value}`;
    if (key === 'endDate') return `To: ${value}`;
    if (key === 'email') return `Email: ${value}`;
    return value;
  };

  // Remove a specific filter
  const removeFilter = (key: string) => {
    const newFilters = { ...appliedFilters, [key]: '' };
    setAppliedFilters(newFilters);
    setFilterInputs({ ...filterInputs, [key]: '' });
    setPage(0);
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ 
        ...cardStyle, 
        marginBottom: '24px',
        overflow: 'hidden'
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '22px', height: '22px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                Filter Transactions
                {activeFilterCount > 0 && (
                  <span style={{
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '2px 10px',
                    borderRadius: '20px'
                  }}>
                    {activeFilterCount} active
                  </span>
                )}
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0' }}>
                {isFilterExpanded ? 'Click to collapse' : 'Click to expand filters'}
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
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear all
              </button>
            )}
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              transform: isFilterExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && !isFilterExpanded && (
          <div style={{ 
            padding: '12px 24px', 
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {Object.entries(appliedFilters).map(([key, value]) => {
              if (!value) return null;
              return (
                <span
                  key={key}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    fontSize: '13px',
                    fontWeight: 500,
                    borderRadius: '20px'
                  }}
                >
                  {getFilterLabel(key, value)}
                  <button
                    onClick={() => removeFilter(key)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <svg style={{ width: '14px', height: '14px', color: '#4338ca' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Filter Content */}
        {isFilterExpanded && (
          <div style={{ padding: '24px' }}>
            {/* Quick Filters */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Quick Status Filter
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { value: '', label: 'All', color: '#64748b', bg: '#f1f5f9' },
                  { value: 'SUCCESS', label: 'Success', color: '#047857', bg: '#ecfdf5' },
                  { value: 'PENDING', label: 'Pending', color: '#b45309', bg: '#fffbeb' },
                  { value: 'FAILED', label: 'Failed', color: '#b91c1c', bg: '#fef2f2' }
                ].map(status => (
                  <button
                    key={status.value}
                    onClick={() => {
                      handleInputChange('status', status.value);
                      setAppliedFilters({ ...appliedFilters, status: status.value });
                      setPage(0);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: appliedFilters.status === status.value ? '2px solid ' + status.color : '1px solid #e2e8f0',
                      backgroundColor: appliedFilters.status === status.value ? status.bg : 'white',
                      color: appliedFilters.status === status.value ? status.color : '#64748b',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '20px 0' }} />

            {/* Filter Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {/* Search & Identity */}
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <svg style={{ width: '16px', height: '16px', color: '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Search</span>
                </div>
                <input
                  type="text"
                  value={filterInputs.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search by email address..."
                  style={{
                    ...inputStyle,
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0'
                  }}
                />
              </div>

              {/* Payment Method */}
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <svg style={{ width: '16px', height: '16px', color: '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Payment Method</span>
                </div>
                <select
                  value={filterInputs.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  style={{
                    ...inputStyle,
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">All Payment Methods</option>
                  <option value="UPI">UPI</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="WALLETS">Wallets</option>
                </select>
              </div>

              {/* Amount Range */}
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <svg style={{ width: '16px', height: '16px', color: '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Amount Range</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={filterInputs.minAmount}
                    onChange={(e) => handleInputChange('minAmount', e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Min"
                    style={{
                      ...inputStyle,
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      flex: 1
                    }}
                  />
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>to</span>
                  <input
                    type="number"
                    value={filterInputs.maxAmount}
                    onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Max"
                    style={{
                      ...inputStyle,
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      flex: 1
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Date Range Row */}
            <div style={{ 
              marginTop: '16px',
              padding: '16px', 
              backgroundColor: '#f8fafc', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <svg style={{ width: '16px', height: '16px', color: '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Date Range</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>From</label>
                  <input
                    type="date"
                    value={filterInputs.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    style={{
                      ...inputStyle,
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                </div>
                <div style={{ 
                  width: '40px', 
                  height: '2px', 
                  backgroundColor: '#cbd5e1',
                  marginTop: '20px'
                }} />
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>To</label>
                  <input
                    type="date"
                    value={filterInputs.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    style={{
                      ...inputStyle,
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px', 
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button
                onClick={clearFilters}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </button>
              <button
                onClick={applyFilters}
                style={{
                  padding: '12px 32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transaction</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Method</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.transactions.map((transaction) => {
                const statusStyle = getStatusStyle(transaction.status);
                return (
                  <tr key={transaction.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#e0e7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg style={{ width: '20px', height: '20px', color: '#4f46e5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>#{transaction.id}</p>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{transaction.type}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: 0 }}>{transaction.userName}</p>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{transaction.userEmail}</p>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusStyle.dot }}></span>
                        {transaction.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontSize: '14px', color: '#0f172a', margin: 0 }}>{transaction.paymentMethod}</p>
                      {transaction.paymentProvider && (
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{transaction.paymentProvider}</p>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>{formatDate(transaction.createdAt)}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && (
          <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                Showing <span style={{ fontWeight: 500, color: '#0f172a' }}>{data.currentPage * data.pageSize + 1}</span> to{' '}
                <span style={{ fontWeight: 500, color: '#0f172a' }}>{Math.min((data.currentPage + 1) * data.pageSize, data.totalElements)}</span> of{' '}
                <span style={{ fontWeight: 500, color: '#0f172a' }}>{data.totalElements}</span> results
              </p>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                style={{ padding: '6px 12px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setPage(page - 1)}
                disabled={!data.hasPrevious}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  color: '#64748b',
                  cursor: data.hasPrevious ? 'pointer' : 'not-allowed',
                  opacity: data.hasPrevious ? 1 : 0.5
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '14px', color: '#64748b', padding: '0 8px' }}>
                Page {data.currentPage + 1} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!data.hasNext}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  color: '#64748b',
                  cursor: data.hasNext ? 'pointer' : 'not-allowed',
                  opacity: data.hasNext ? 1 : 0.5
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionTable;
