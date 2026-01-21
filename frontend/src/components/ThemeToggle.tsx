import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    // Direct toggle between light and dark, ignoring system mode
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const getIcon = () => {
    // Always show sun/moon based on resolved theme, not the theme setting
    if (resolvedTheme === 'dark') {
      return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      );
    }
    // Light mode icon - complete sun with circle and rays
    return (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={1.5} fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    );
  };

  const getLabel = () => {
    if (resolvedTheme === 'dark') return 'Switch to Light Mode';
    return 'Switch to Dark Mode';
  };

  return (
    <button
      onClick={toggleTheme}
      title={`Theme: ${getLabel()}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '9px',
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border-default)',
        borderRadius: '10px',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        transition: 'all 0.15s ease',
        minWidth: '38px',
        height: '38px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
      aria-label={getLabel()}
    >
      {getIcon()}
    </button>
  );
};

export default ThemeToggle;
