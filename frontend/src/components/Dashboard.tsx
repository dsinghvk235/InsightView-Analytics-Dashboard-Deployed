import { useState, useEffect, useCallback, useRef } from 'react';
import KPICards from './KPICards';
import Charts from './Charts';
import AdvancedCharts from './AdvancedCharts';
import TransactionTable from './TransactionTable';
import ThemeToggle from './ThemeToggle';
import SearchResults from './SearchResults';
import NotificationBell from './NotificationBell';
import AIInsightsModal from './AIInsightsModal';
import { analyticsAPI, SearchResult, SearchRange, ExportMetric, ExportFormat } from '../services/api';

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
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [lastSearchedPeriod, setLastSearchedPeriod] = useState<string>('');
  const [lastSearchedTab, setLastSearchedTab] = useState<TabType>(activeTab);

  // Export state
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [selectedExportMetric, setSelectedExportMetric] = useState<ExportMetric>('TRANSACTIONS_SUMMARY');
  const [selectedExportFormat, setSelectedExportFormat] = useState<ExportFormat>('CSV');
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // AI Insights state
  const [showAIInsightsModal, setShowAIInsightsModal] = useState(false);

  // Date range state for Analytics/Charts section (custom date picker)
  const [analyticsDateRange, setAnalyticsDateRange] = useState(() => {
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Default to last 30 days
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  });

  // Get period label for display based on tab context
  const getPeriodLabel = (forTab?: TabType): string => {
    const tab = forTab || activeTab;
    
    // For charts and advanced tabs, use the custom date range
    if (tab === 'charts' || tab === 'advanced') {
      const startDate = new Date(analyticsDateRange.startDate);
      const endDate = new Date(analyticsDateRange.endDate);
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      const yearOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', yearOptions)}`;
    }
    
    // For overview and transactions, use period days
    const option = PERIOD_OPTIONS.find(opt => opt.value === periodDays);
    if (option) {
      if (periodDays === 0) return 'All Time';
      return `Last ${periodDays} Days`;
    }
    return `Last ${periodDays} Days`;
  };

  // Get tab-specific search hints based on current page
  const getSearchHints = (): string[] => {
    switch (activeTab) {
      case 'overview':
        return ['revenue', 'success rate', 'failed', 'overview', 'top users'];
      case 'charts':
        return ['trends', 'daily', 'payment methods', 'status', 'revenue'];
      case 'advanced':
        return ['top users', 'conversion', 'payment', 'trends', 'failed'];
      case 'transactions':
        return ['failed', 'pending', 'status', 'success', 'payment'];
      default:
        return ['revenue', 'failed', 'top users', 'payment', 'success rate'];
    }
  };

  // Search handler
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setShowSearchResults(false);
      setSearchResult(null);
      return;
    }

    console.log(`[Search] Initiating search for: "${query}" on ${activeTab} page`);
    
    setSearchLoading(true);
    setSearchError(null);
    setShowSearchResults(true);
    setLastSearchedPeriod(getPeriodLabel(activeTab));
    setLastSearchedTab(activeTab);

    try {
      let result: SearchResult;
      
      // For charts and advanced tabs, use explicit date range
      if (activeTab === 'charts' || activeTab === 'advanced') {
        console.log(`[Search] Using custom date range: ${analyticsDateRange.startDate} to ${analyticsDateRange.endDate}`);
        result = await analyticsAPI.search(
          query, 
          'custom', 
          undefined, 
          analyticsDateRange.startDate, 
          analyticsDateRange.endDate
        );
      } else {
        // For overview and transactions, use period days
        let range: SearchRange;
        let customDays: number | undefined;
        
        switch (periodDays) {
          case 7: range = '7d'; break;
          case 30: range = '30d'; break;
          case 0: range = 'all'; break;
          default: 
            range = 'custom';
            customDays = periodDays;
        }
        
        console.log(`[Search] Using period: ${range}, Days: ${customDays || 'N/A'}`);
        result = await analyticsAPI.search(query, range, customDays);
      }
      
      console.log(`[Search] Result received - Matched: ${result.matchedInsight || 'NO_MATCH'}`);
      setSearchResult(result);
    } catch (err: any) {
      console.error('[Search] Error:', err);
      setSearchError(err.response?.data?.message || err.message || 'Search failed');
    } finally {
      setSearchLoading(false);
    }
  }, [periodDays, activeTab, analyticsDateRange]);

  // Re-run search when period changes for overview/transactions tabs
  useEffect(() => {
    if (showSearchResults && searchQuery.trim() && !searchLoading) {
      if (activeTab === 'overview' || activeTab === 'transactions') {
        console.log(`[Search] Period changed to ${periodDays} days, re-running search...`);
        handleSearch(searchQuery);
      }
    }
  }, [periodDays]);

  // Re-run search when analytics date range changes for charts/advanced tabs
  useEffect(() => {
    if (showSearchResults && searchQuery.trim() && !searchLoading) {
      if (activeTab === 'charts' || activeTab === 'advanced') {
        console.log(`[Search] Analytics date range changed, re-running search...`);
        handleSearch(searchQuery);
      }
    }
  }, [analyticsDateRange]);

  // Update search context when switching tabs
  useEffect(() => {
    if (showSearchResults && searchQuery.trim() && lastSearchedTab !== activeTab && !searchLoading) {
      console.log(`[Search] Tab changed from ${lastSearchedTab} to ${activeTab}, re-running search with new context...`);
      // Re-run search with new tab's date context
      handleSearch(searchQuery);
    }
  }, [activeTab]);

  // Handle search input keydown
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    } else if (e.key === 'Escape') {
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  // Close search results
  const closeSearchResults = () => {
    setShowSearchResults(false);
    setSearchResult(null);
    setSearchError(null);
  };

  // Export handler
  const handleExport = async () => {
    console.log(`[Export] Starting export - Metric: ${selectedExportMetric}, Format: ${selectedExportFormat}`);
    
    setExportLoading(true);
    setExportError(null);

    try {
      // Determine range based on current tab context
      let range: string;
      if (activeTab === 'charts' || activeTab === 'advanced') {
        // Calculate days from date range
        const startDate = new Date(analyticsDateRange.startDate);
        const endDate = new Date(analyticsDateRange.endDate);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        range = String(diffDays);
      } else {
        // Use period days
        range = periodDays === 0 ? 'all' : `${periodDays}d`;
      }

      console.log(`[Export] Using range: ${range}`);

      const blob = await analyticsAPI.exportData({
        metric: selectedExportMetric,
        range: range,
        format: selectedExportFormat,
      });

      // Generate filename
      const extension = selectedExportFormat === 'CSV' ? 'csv' : 'json';
      const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `analytics_export_${selectedExportMetric.toLowerCase()}_${date}.${extension}`;

      // Trigger browser download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`[Export] Download triggered: ${filename}`);
      setShowExportDropdown(false);

    } catch (err: any) {
      console.error('[Export] Error:', err);
      setExportError(err.response?.data?.message || err.message || 'Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    if (showExportDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

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
          paddingTop: isMobile ? '145px' : '16px',
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
                      transition: 'color 0.15s ease',
                      pointerEvents: 'none'
                    }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search insights... (e.g., revenue, failed)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      style={{
                        paddingLeft: '40px',
                        paddingRight: searchQuery ? '36px' : '14px',
                        paddingTop: '9px',
                        paddingBottom: '9px',
                        width: '280px',
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
                    {/* Clear button */}
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          closeSearchResults();
                        }}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'var(--bg-muted)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          padding: 0
                        }}
                      >
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    {/* Search hint tooltip */}
                    {isSearchFocused && !searchQuery && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '8px',
                        padding: '10px 14px',
                        backgroundColor: 'var(--surface-base)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        boxShadow: 'var(--shadow-card)',
                        zIndex: 100,
                        fontSize: '12px',
                        color: 'var(--text-tertiary)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-secondary)' }}>
                            Suggested for {pageInfo[activeTab].title}:
                          </p>
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            backgroundColor: 'var(--accent-blue-light)',
                            color: 'var(--accent-blue)',
                            borderRadius: '4px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {getPeriodLabel()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {getSearchHints().map(hint => (
                            <span
                              key={hint}
                              onClick={() => {
                                setSearchQuery(hint);
                                handleSearch(hint);
                              }}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: 'var(--bg-subtle)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: 500,
                                color: 'var(--accent-blue)',
                                border: '1px solid var(--border-subtle)',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--accent-blue-light)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                              }}
                            >
                              {hint}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* Notifications Bell */}
                <NotificationBell pollingInterval={60000} />
                
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
            
            {/* Mobile Search */}
            {isMobile && (
              <div style={{ marginTop: '12px', position: 'relative' }}>
                <svg style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  width: '16px', 
                  height: '16px', 
                  color: 'var(--text-muted)',
                  pointerEvents: 'none'
                }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  style={{
                    width: '100%',
                    paddingLeft: '36px',
                    paddingRight: searchQuery ? '36px' : '12px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    color: 'var(--text-primary)'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      closeSearchResults();
                    }}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'var(--bg-muted)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: 0
                    }}
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div 
          className="page-content"
          style={{ padding: isMobile ? '16px' : '24px 28px' }}
        >
          {/* Search Results - appears at top when active */}
          {showSearchResults && (
            <div className="animate-fadeInUp" style={{ marginBottom: '24px' }}>
              <SearchResults 
                result={searchResult}
                loading={searchLoading}
                error={searchError}
                onClose={closeSearchResults}
                periodLabel={lastSearchedPeriod}
                activeTab={lastSearchedTab}
              />
            </div>
          )}

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
                
                {/* Quick Actions - Visible on both mobile and desktop */}
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px' }}>
                  {/* Export Button with Dropdown */}
                  <div style={{ position: 'relative' }} ref={exportDropdownRef}>
                    <button 
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      disabled={exportLoading}
                      title="Export Analytics"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '0' : '8px',
                        padding: isMobile ? '8px 10px' : '9px 16px',
                        fontSize: '13px',
                        fontWeight: 500,
                        borderRadius: '10px',
                        border: '1px solid var(--border-default)',
                        backgroundColor: exportLoading ? 'var(--bg-muted)' : 'var(--surface-base)',
                        color: exportLoading ? 'var(--text-muted)' : 'var(--text-secondary)',
                        cursor: exportLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                        opacity: exportLoading ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!exportLoading) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                          e.currentTarget.style.borderColor = '#9FC4BB';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!exportLoading) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-base)';
                          e.currentTarget.style.borderColor = 'var(--border-default)';
                        }
                      }}
                    >
                      {exportLoading ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }}>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      )}
                      {!isMobile && (exportLoading ? 'Exporting...' : 'Export')}
                      {!exportLoading && !isMobile && (
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ marginLeft: '2px' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {/* Export Dropdown */}
                    {showExportDropdown && (
                      <div style={{
                        position: isMobile ? 'fixed' : 'absolute',
                        top: isMobile ? '50%' : '100%',
                        left: isMobile ? '50%' : 'auto',
                        right: isMobile ? 'auto' : 0,
                        transform: isMobile ? 'translate(-50%, -50%)' : 'none',
                        marginTop: isMobile ? 0 : '8px',
                        width: isMobile ? 'calc(100vw - 32px)' : '280px',
                        maxWidth: '320px',
                        backgroundColor: 'var(--surface-base)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-card-hover)',
                        zIndex: 100,
                        padding: '16px'
                      }}>
                        {/* Close button for mobile */}
                        {isMobile && (
                          <button
                            onClick={() => setShowExportDropdown(false)}
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              background: 'var(--bg-subtle)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '28px',
                              height: '28px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: 'var(--text-muted)'
                            }}
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        
                        <div style={{ marginBottom: '16px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            Export Analytics
                          </h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>
                            Download data for the current period
                          </p>
                        </div>

                        {/* Metric Selection */}
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                            Data Type
                          </label>
                          <select
                            value={selectedExportMetric}
                            onChange={(e) => setSelectedExportMetric(e.target.value as ExportMetric)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              fontSize: '13px',
                              border: '1px solid var(--border-default)',
                              borderRadius: '8px',
                              backgroundColor: 'var(--bg-subtle)',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="TRANSACTIONS_SUMMARY">Transactions Summary</option>
                            <option value="REVENUE_SUMMARY">Revenue Summary</option>
                            <option value="FAILED_TRANSACTIONS">Failed Transactions</option>
                            <option value="CURRENCY_BREAKDOWN">Payment Methods</option>
                          </select>
                        </div>

                        {/* Format Selection */}
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                            Format
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {(['CSV', 'JSON'] as ExportFormat[]).map(format => (
                              <button
                                key={format}
                                onClick={() => setSelectedExportFormat(format)}
                                style={{
                                  flex: 1,
                                  padding: '8px 12px',
                                  fontSize: '13px',
                                  fontWeight: 500,
                                  border: selectedExportFormat === format 
                                    ? '2px solid var(--accent-blue)' 
                                    : '1px solid var(--border-default)',
                                  borderRadius: '8px',
                                  backgroundColor: selectedExportFormat === format 
                                    ? 'var(--accent-blue-light)' 
                                    : 'var(--bg-subtle)',
                                  color: selectedExportFormat === format 
                                    ? 'var(--accent-blue)' 
                                    : 'var(--text-secondary)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {format}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Period Info */}
                        <div style={{ 
                          padding: '10px 12px', 
                          backgroundColor: 'var(--bg-subtle)', 
                          borderRadius: '8px',
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                            Period: <strong style={{ color: 'var(--text-secondary)' }}>{getPeriodLabel()}</strong>
                          </span>
                        </div>

                        {/* Error Message */}
                        {exportError && (
                          <div style={{
                            padding: '10px 12px',
                            backgroundColor: 'var(--error-light)',
                            border: '1px solid var(--error-border)',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <svg width="14" height="14" fill="none" stroke="var(--error)" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span style={{ fontSize: '12px', color: 'var(--error)' }}>{exportError}</span>
                          </div>
                        )}

                        {/* Export Button */}
                        <button
                          onClick={handleExport}
                          disabled={exportLoading}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            fontSize: '13px',
                            fontWeight: 600,
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #003142 0%, #7FB3C8 100%)',
                            color: 'white',
                            cursor: exportLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: exportLoading ? 0.7 : 1
                          }}
                        >
                          {exportLoading ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }}>
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeLinecap="round" />
                              </svg>
                              Generating...
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                              </svg>
                              Download {selectedExportFormat}
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Mobile overlay backdrop for export dropdown */}
                    {isMobile && showExportDropdown && (
                      <div 
                        onClick={() => setShowExportDropdown(false)}
                        style={{
                          position: 'fixed',
                          inset: 0,
                          backgroundColor: 'rgba(0, 31, 42, 0.5)',
                          backdropFilter: 'blur(4px)',
                          WebkitBackdropFilter: 'blur(4px)',
                          zIndex: 99
                        }}
                      />
                    )}
                  </div>
                  
                  {/* AI Insights Button */}
                  <button 
                    title="AI Insights"
                    onClick={() => setShowAIInsightsModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '0' : '8px',
                      padding: isMobile ? '8px 10px' : '9px 16px',
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
                    {!isMobile && 'AI Insights'}
                  </button>
                </div>
              </div>
              
              <KPICards periodDays={periodDays} />
              <div style={{ marginTop: '24px' }}>
                <Charts periodDays={periodDays} showDatePicker={false} />
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="animate-fadeInUp">
              <Charts 
                dateRange={analyticsDateRange}
                onDateRangeChange={setAnalyticsDateRange}
              />
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

      {/* AI Insights Modal */}
      <AIInsightsModal 
        isOpen={showAIInsightsModal}
        onClose={() => setShowAIInsightsModal(false)}
        periodDays={periodDays}
      />
    </div>
  );
};

export default Dashboard;
