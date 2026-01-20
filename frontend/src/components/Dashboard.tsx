import { useState, useEffect } from 'react';
import KPICards from './KPICards';
import Charts from './Charts';
import AdvancedCharts from './AdvancedCharts';
import TransactionTable from './TransactionTable';

type TabType = 'overview' | 'charts' | 'advanced' | 'transactions';

const validTabs: TabType[] = ['overview', 'charts', 'advanced', 'transactions'];

// Get initial tab from URL hash or default to 'overview'
const getInitialTab = (): TabType => {
  const hash = window.location.hash.replace('#', '');
  return validTabs.includes(hash as TabType) ? (hash as TabType) : 'overview';
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);

  // Sync tab state with URL hash
  useEffect(() => {
    // Update URL hash when tab changes
    window.location.hash = activeTab;
  }, [activeTab]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (validTabs.includes(hash as TabType)) {
        setActiveTab(hash as TabType);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: (
      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { id: 'charts', label: 'Analytics', icon: (
      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: 'advanced', label: 'Advanced Analytics', icon: (
      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    )},
    { id: 'transactions', label: 'Transactions', icon: (
      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )},
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '256px',
        backgroundColor: '#0f172a',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50
      }}>
        {/* Logo */}
        <div style={{ padding: '24px', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>FinanceHub</h1>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Analytics Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {navItems.map((item) => (
              <li key={item.id} style={{ marginBottom: '8px' }}>
                <button
                  onClick={() => setActiveTab(item.id as TabType)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: activeTab === item.id ? '#4f46e5' : 'transparent',
                    color: activeTab === item.id ? 'white' : '#94a3b8',
                    fontWeight: 500,
                    fontSize: '14px'
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #334155' }}>
            <p style={{ padding: '0 16px', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Quick Stats</p>
            <div style={{ padding: '0 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>System Status</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
                  <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 500 }}>Online</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>Last Updated</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Just now</span>
              </div>
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div style={{ padding: '16px', borderTop: '1px solid #334155' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(30, 41, 59, 0.5)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #818cf8 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              AD
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Admin User</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>admin@finance.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '256px' }}>
        {/* Top Header */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ padding: '16px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                  {activeTab === 'overview' && 'Dashboard Overview'}
                  {activeTab === 'charts' && 'Analytics & Charts'}
                  {activeTab === 'advanced' && 'Advanced Analytics'}
                  {activeTab === 'transactions' && 'Transaction History'}
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  {activeTab === 'overview' && 'Monitor your key performance metrics'}
                  {activeTab === 'charts' && 'Visualize trends and patterns in your data'}
                  {activeTab === 'advanced' && 'Deep dive into volume, payment methods, and hourly patterns'}
                  {activeTab === 'transactions' && 'Browse and filter all transactions'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search..."
                    style={{
                      paddingLeft: '40px',
                      paddingRight: '16px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      width: '256px',
                      backgroundColor: '#f1f5f9',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                {/* Date */}
                <div style={{ padding: '10px 16px', backgroundColor: '#f1f5f9', borderRadius: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#475569', margin: 0 }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '32px' }}>
          {activeTab === 'overview' && (
            <div>
              <KPICards />
              <div style={{ marginTop: '32px' }}>
                <Charts />
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <Charts />
          )}

          {activeTab === 'advanced' && (
            <AdvancedCharts />
          )}

          {activeTab === 'transactions' && (
            <TransactionTable />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
