import { useEffect, useState } from 'react';
import { analyticsAPI, KPIComparison } from '../services/api';

const KPICards = () => {
  const [kpis, setKpis] = useState<KPIComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        const data = await analyticsAPI.getKPIComparison(30); // 30 day comparison
        setKpis(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load KPIs';
        setError(errorMessage);
        console.error('KPI Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ height: '48px', width: '48px', backgroundColor: '#e2e8f0', borderRadius: '12px' }}></div>
              <div style={{ height: '24px', width: '64px', backgroundColor: '#e2e8f0', borderRadius: '20px' }}></div>
            </div>
            <div style={{ height: '32px', backgroundColor: '#e2e8f0', borderRadius: '8px', width: '66%', marginBottom: '8px' }}></div>
            <div style={{ height: '16px', backgroundColor: '#e2e8f0', borderRadius: '8px', width: '50%' }}></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #fecaca' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '24px', height: '24px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Error loading KPIs</p>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>{error}</p>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Please check if backend is running on http://localhost:8080</p>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('en-IN').format(value);
  };

  const formatChange = (change: number) => {
    const prefix = change >= 0 ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  };

  // Determine if change is positive (good) based on metric type
  const isPositiveChange = (change: number, metricType: string) => {
    // For failed metrics, negative change is good
    if (metricType === 'failed' || metricType === 'pending') {
      return change <= 0;
    }
    // For other metrics, positive change is good
    return change >= 0;
  };

  const kpiCards = [
    {
      title: 'Total Users',
      value: formatNumber(kpis.totalUsers),
      change: kpis.totalUsersChange,
      metricType: 'positive',
      iconBg: '#e0e7ff',
      iconColor: '#4f46e5',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    },
    {
      title: 'Total Transactions',
      value: formatNumber(kpis.totalTransactions),
      change: kpis.totalTransactionsChange,
      metricType: 'positive',
      iconBg: '#d1fae5',
      iconColor: '#059669',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    },
    {
      title: 'Total GTV',
      value: formatCurrency(kpis.totalGTV),
      change: kpis.totalGTVChange,
      metricType: 'positive',
      iconBg: '#ede9fe',
      iconColor: '#7c3aed',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      title: 'Success Rate',
      value: `${kpis.successRate.toFixed(1)}%`,
      change: kpis.successRateChange,
      metricType: 'positive',
      iconBg: '#ccfbf1',
      iconColor: '#0d9488',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      title: 'New Users (30d)',
      value: formatNumber(kpis.newUsersToday),
      change: kpis.newUsersTodayChange,
      metricType: 'positive',
      iconBg: '#dbeafe',
      iconColor: '#2563eb',
      icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
    },
    {
      title: 'Pending Transactions',
      value: formatNumber(kpis.pendingTransactions),
      change: kpis.pendingTransactionsChange,
      metricType: 'pending',
      iconBg: '#fef3c7',
      iconColor: '#d97706',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      title: 'Avg Ticket Size',
      value: formatCurrency(kpis.averageTicketSize),
      change: kpis.averageTicketSizeChange,
      metricType: 'positive',
      iconBg: '#fce7f3',
      iconColor: '#db2777',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
    {
      title: 'Failed Volume',
      value: formatCurrency(kpis.failedVolume),
      change: kpis.failedVolumeChange,
      metricType: 'failed',
      iconBg: '#fee2e2',
      iconColor: '#dc2626',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
      {kpiCards.map((card, index) => {
        const isGood = isPositiveChange(card.change, card.metricType);
        return (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #f1f5f9',
              transition: 'box-shadow 0.3s',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: card.iconBg,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '24px', height: '24px', color: card.iconColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                </svg>
              </div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: isGood ? '#ecfdf5' : '#fef2f2',
                color: isGood ? '#047857' : '#dc2626'
              }}>
                <svg style={{ width: '12px', height: '12px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.change >= 0 ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
                </svg>
                {formatChange(card.change)}
              </span>
            </div>
            <div>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>{card.value}</p>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>{card.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
