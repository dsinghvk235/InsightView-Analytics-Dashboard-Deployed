import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();

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
      return <Moon size={18} strokeWidth={1.5} />;
    }
    // Light mode icon
    return <Sun size={18} strokeWidth={1.5} />;
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
