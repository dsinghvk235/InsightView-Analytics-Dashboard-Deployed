import { useState, useEffect } from 'react';
import KPICards from './KPICards';
import Charts from './Charts';
import AdvancedCharts from './AdvancedCharts';
import TransactionTable from './TransactionTable';
import ThemeToggle from './ThemeToggle';

type TabType = 'overview' | 'charts' | 'advanced' | 'transactions';

const validTabs: TabType[] = ['overview', 'charts', 'advanced', 'transactions'];

const getInitialTab = (): TabType => {
  const hash = window.location.hash.replace('#', '');
  return validTabs.includes(hash as TabType) ? (hash as TabType) : 'overview';
};

const PERIOD_OPTIONS = [
  { value: 7, label: '7D' },
  { value: 30, label: '30D' },
  { value: 45, label: '45D' },
  { value: 60, label: '60D' },
  { value: 90, label: '90D' },
  { value: 0, label: 'All' },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [periodDays, setPeriodDays] = useState(7);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

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

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [activeTab]);

  const navItems = [
    { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    )},
    { id: 'charts', label: 'Analytics', shortLabel: 'Analytics', icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    )},
    { id: 'advanced', label: 'Insights', shortLabel: 'Insights', icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    )},
    { id: 'transactions', label: 'Transactions', shortLabel: 'Txns', icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    )},
  ];

  const sidebarWidth = isSidebarCollapsed ? 72 : 260;

  const pageInfo = {
    overview: { title: 'Dashboard', subtitle: 'Track your key metrics and performance' },
    charts: { title: 'Analytics', subtitle: 'Visualize trends and patterns' },
    advanced: { title: 'Insights', subtitle: 'Deep analytics and patterns' },
    transactions: { title: 'Transactions', subtitle: 'View and manage transactions' },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      {/* Mobile Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="animate-fadeIn"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 31, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 45
          }}
        />
      )}

      {/* Sidebar - Floating Premium Light Theme */}
      <aside 
        className="desktop-sidebar sidebar-light"
        style={{
          position: 'fixed',
          left: isMobile ? 0 : 16,
          top: isMobile ? 0 : 16,
          height: isMobile ? '100vh' : 'calc(100vh - 32px)',
          width: isMobile ? 280 : sidebarWidth,
          backgroundColor: 'var(--surface-base)',
          border: 'none',
          borderRadius: isMobile ? 0 : '20px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isMobile ? (isMobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
          boxShadow: isMobile && isMobileSidebarOpen 
            ? '8px 0 32px rgba(0,0,0,0.08)' 
            : '0 4px 24px rgba(0, 49, 66, 0.08), 0 1px 3px rgba(0, 49, 66, 0.04)',
          overflow: 'hidden'
        }}
      >
        {/* Logo Section */}
        <div style={{ 
          padding: isSidebarCollapsed ? '20px 16px' : '20px 20px', 
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
          minHeight: '72px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              background: 'linear-gradient(135deg, #003142 0%, #7FB3C8 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0, 49, 66, 0.15)'
            }}>
              <svg width="20" height="20" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>FinanceHub</h1>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0, fontWeight: 500, letterSpacing: '0.02em' }}>Analytics Platform</p>
              </div>
            )}
          </div>
          {/* Collapse Toggle - Desktop only */}
          {!isMobile && !isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
          {/* Mobile Close */}
          {isMobile && (
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex'
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {!isMobile && isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '14px',
              display: 'flex',
              justifyContent: 'center',
              borderBottom: '1px solid var(--border-subtle)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              e.currentTarget.style.color = '#64748b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: isSidebarCollapsed ? '16px 12px' : '16px', overflowY: 'auto' }}>
          {!isSidebarCollapsed && (
            <p style={{ 
              padding: '0 12px', 
              fontSize: '11px', 
              fontWeight: 600, 
              color: 'var(--text-muted)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.06em', 
              marginBottom: '12px' 
            }}>
              Navigation
            </p>
          )}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} style={{ marginBottom: '4px' }}>
                  <button
                    onClick={() => setActiveTab(item.id as TabType)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                      gap: '12px',
                      padding: isSidebarCollapsed ? '12px' : '10px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
              backgroundColor: isActive ? 'var(--accent-blue-light)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: 500,
                      fontSize: '14px',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    {isActive && (
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '3px',
                        height: '20px',
                        backgroundColor: 'var(--accent-blue)',
                        borderRadius: '0 4px 4px 0'
                      }} />
                    )}
                    <span style={{ 
                      color: isActive ? 'var(--accent-blue)' : 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.15s ease'
                    }}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div style={{ padding: isSidebarCollapsed ? '16px 12px' : '16px', borderTop: '1px solid var(--border-subtle)' }}>
          {/* System Status */}
          {!isSidebarCollapsed && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '12px 14px',
              backgroundColor: 'var(--success-light)',
              borderRadius: '10px',
              marginBottom: '12px',
              border: '1px solid var(--success-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: 'var(--success)', 
                  borderRadius: '50%',
                  boxShadow: '0 0 0 3px rgba(5, 150, 105, 0.15)'
                }} />
                <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 500 }}>All systems operational</span>
              </div>
            </div>
          )}
          
          {/* User Profile */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              gap: '12px',
              padding: isSidebarCollapsed ? '0' : '10px 12px',
              borderRadius: '10px',
              backgroundColor: isSidebarCollapsed ? 'transparent' : 'var(--bg-subtle)',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
              border: isSidebarCollapsed ? 'none' : '1px solid var(--border-subtle)'
            }}
            onMouseEnter={(e) => {
              if (!isSidebarCollapsed) e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
            }}
            onMouseLeave={(e) => {
              if (!isSidebarCollapsed) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #003142 0%, #7FB3C8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: '13px',
              flexShrink: 0
            }}>
              AD
            </div>
            {!isSidebarCollapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Admin User</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>admin@finance.com</p>
                </div>
                <svg width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className="main-content"
        style={{ 
          flex: 1, 
          marginLeft: isMobile ? 0 : sidebarWidth + 32,
          paddingTop: isMobile ? '80px' : '16px',
          paddingBottom: isMobile ? '100px' : '16px',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Top Header - Floating */}
        <header 
          className="page-header"
          style={{
            position: isMobile ? 'fixed' : 'sticky',
            top: isMobile ? 12 : 16,
            left: isMobile ? 12 : 'auto',
            right: isMobile ? 12 : 'auto',
            zIndex: 40,
            backgroundColor: 'var(--surface-overlay)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '16px',
            margin: isMobile ? 0 : '0 16px',
            boxShadow: 'var(--shadow-card-hover)',
            border: '1px solid var(--border-subtle)',
            opacity: 0.95
          }}
        >
          <div style={{ padding: isMobile ? '12px 16px' : '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                {/* Mobile Menu Button */}
                {isMobile && (
                  <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      flexShrink: 0
                    }}
                  >
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  </button>
                )}
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ 
                    fontSize: isMobile ? '18px' : '20px', 
                    fontWeight: 600, 
                    color: 'var(--text-primary)', 
                    margin: 0,
                    letterSpacing: '-0.015em'
                  }}>
                    {pageInfo[activeTab].title}
                  </h2>
                  {!isMobile && (
                    <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {pageInfo[activeTab].subtitle}
                    </p>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '10px', flexShrink: 0 }}>
                {/* Search */}
                {!isMobile && (
                  <div style={{ position: 'relative' }}>
                    <svg style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      width: '18px', 
                      height: '18px', 
                      color: isSearchFocused ? 'var(--accent-blue)' : 'var(--text-muted)',
                      transition: 'color 0.15s ease'
                    }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search..."
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      style={{
                        paddingLeft: '40px',
                        paddingRight: '14px',
                        paddingTop: '9px',
                        paddingBottom: '9px',
                        width: '200px',
                        backgroundColor: isSearchFocused ? 'var(--surface-base)' : 'var(--bg-subtle)',
                        border: isSearchFocused ? '1px solid var(--border-focus)' : '1px solid var(--border-default)',
                        borderRadius: '10px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        color: 'var(--text-primary)',
                        boxShadow: isSearchFocused ? '0 0 0 3px rgba(127, 179, 200, 0.2)' : 'none'
                      }}
                    />
                  </div>
                )}
                
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* Notifications */}
                <button 
                  style={{
                    padding: '9px',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-page)';
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                  }}
                >
                  <svg width="18" height="18" fill="none" stroke="var(--text-tertiary)" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  {/* Notification dot */}
                  <span style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    border: '2px solid white'
                  }} />
                </button>
                
                {/* Profile Avatar */}
                <div 
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #003142 0%, #7FB3C8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 49, 66, 0.15)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 49, 66, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 49, 66, 0.15)';
                  }}
                >
                  AD
                </div>
              </div>
            </div>
            
            {/* Mobile Date */}
            {isMobile && (
              <p style={{ 
                fontSize: '12px', 
                color: 'var(--text-tertiary)', 
                margin: '8px 0 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div 
          className="page-content"
          style={{ padding: isMobile ? '16px' : '24px 28px' }}
        >
          {activeTab === 'overview' && (
            <div className="animate-fadeInUp">
              {/* Filter Bar */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: '16px',
                marginBottom: '24px'
              }}>
                {/* Period Pills */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '12px',
                  flexWrap: 'nowrap',
                  overflowX: 'auto'
                }}>
                  {PERIOD_OPTIONS.map(option => {
                    const isActive = periodDays === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setPeriodDays(option.value)}
                        style={{
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: 500,
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          backgroundColor: isActive ? 'var(--surface-base)' : 'transparent',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                          boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.color = 'var(--text-tertiary)';
                          }
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                
                {/* Quick Actions */}
                {!isMobile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 16px',
                        fontSize: '13px',
                        fontWeight: 500,
                        borderRadius: '10px',
                        border: '1px solid var(--border-default)',
                        backgroundColor: 'var(--surface-base)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                        e.currentTarget.style.borderColor = '#9FC4BB';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--surface-base)';
                        e.currentTarget.style.borderColor = '#B8D9D1';
                      }}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      Export
                    </button>
                    <button 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 16px',
                        fontSize: '13px',
                        fontWeight: 500,
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #003142 0%, #7FB3C8 100%)',
                        color: 'var(--text-inverse)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 49, 66, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 49, 66, 0.15)';
                      }}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                      </svg>
                      AI Insights
                    </button>
                  </div>
                )}
              </div>
              
              <KPICards periodDays={periodDays} />
              <div style={{ marginTop: '24px' }}>
                <Charts periodDays={periodDays} showDatePicker={false} />
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="animate-fadeInUp">
              <Charts />
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="animate-fadeInUp">
              <AdvancedCharts />
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="animate-fadeInUp">
              <TransactionTable />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Floating */}
      {isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 12,
          left: 12,
          right: 12,
                  backgroundColor: 'var(--surface-overlay)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  zIndex: 50,
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  padding: '8px 0',
                  paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
                  boxShadow: 'var(--shadow-card-hover)',
                  border: '1px solid var(--border-subtle)',
                  opacity: 0.95
        }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                  transition: 'color 0.15s ease'
                }}
              >
                <div style={{
                  padding: '6px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? 'var(--accent-blue-light)' : 'transparent',
                  transition: 'background-color 0.15s ease'
                }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 500 }}>{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default Dashboard;
