import { useState, useEffect } from 'react';
import { analyticsAPI, AIInsightsResponse } from '../services/api';

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodDays: number;
}

/**
 * AIInsightsModal - Displays AI-generated insights from analytics data.
 * 
 * IMPORTANT: This component displays read-only insights.
 * - No chat interface
 * - No follow-up questions
 * - No predictions or business decisions
 * 
 * The AI interprets ONLY existing aggregated analytics data.
 */
const AIInsightsModal = ({ isOpen, onClose, periodDays }: AIInsightsModalProps) => {
  const [insights, setInsights] = useState<AIInsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine range based on periodDays
  const getRange = (): '7d' | '30d' | '90d' => {
    if (periodDays <= 7) return '7d';
    if (periodDays <= 30) return '30d';
    return '90d';
  };

  // Fetch insights when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInsights();
    }
  }, [isOpen, periodDays]);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    setInsights(null);

    try {
      const range = getRange();
      console.log(`[AIInsights] Fetching insights for range: ${range}`);
      
      const response = await analyticsAPI.getAIInsights(range);
      
      console.log(`[AIInsights] Received response:`, response);
      setInsights(response);
      
      if (!response.success) {
        setError(response.summary);
      }
    } catch (err: any) {
      console.error('[AIInsights] Error:', err);
      setError(err.response?.data?.summary || err.message || 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 31, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 100,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Modal */}
      <div 
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '560px',
          maxHeight: '85vh',
          backgroundColor: 'var(--surface-base)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 31, 42, 0.25)',
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* AI Icon */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #003142 0%, #7FB3C8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 49, 66, 0.2)'
            }}>
              <svg width="20" height="20" fill="none" stroke="white" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>
            <div>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 600, 
                color: 'var(--text-primary)', 
                margin: 0,
                letterSpacing: '-0.015em'
              }}>
                AI Insights
              </h2>
              <p style={{ 
                fontSize: '13px', 
                color: 'var(--text-tertiary)', 
                margin: 0,
                marginTop: '2px'
              }}>
                {insights?.periodAnalyzed || `Analyzing last ${getRange().replace('d', ' days')}`}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-muted)',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--border-default)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {/* Loading State */}
          {loading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '3px solid var(--border-subtle)',
                borderTopColor: 'var(--accent-blue)',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ 
                  fontSize: '15px', 
                  fontWeight: 500, 
                  color: 'var(--text-primary)', 
                  margin: 0 
                }}>
                  Analyzing analytics data...
                </p>
                <p style={{ 
                  fontSize: '13px', 
                  color: 'var(--text-tertiary)', 
                  margin: '4px 0 0' 
                }}>
                  This typically takes a few seconds
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div style={{
              padding: '20px',
              backgroundColor: 'var(--error-light)',
              border: '1px solid var(--error-border)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <svg width="20" height="20" fill="none" stroke="var(--error)" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--error)', margin: 0 }}>
                  Unable to Generate Insights
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  {error}
                </p>
                <button
                  onClick={fetchInsights}
                  style={{
                    marginTop: '12px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 500,
                    borderRadius: '8px',
                    border: '1px solid var(--error)',
                    backgroundColor: 'transparent',
                    color: 'var(--error)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--error)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--error)';
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Success State */}
          {insights && insights.success && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Summary */}
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--accent-blue-light)',
                borderRadius: '12px',
                border: '1px solid var(--accent-blue)',
                borderLeftWidth: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <svg width="20" height="20" fill="none" stroke="var(--accent-blue)" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p style={{ 
                    fontSize: '15px', 
                    fontWeight: 500, 
                    color: 'var(--text-primary)', 
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {insights.summary}
                  </p>
                </div>
              </div>

              {/* Insights List */}
              {insights.insights && insights.insights.length > 0 && (
                <div>
                  <h3 style={{ 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: 'var(--text-secondary)', 
                    margin: '0 0 12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Key Observations
                  </h3>
                  <ul style={{ 
                    margin: 0, 
                    padding: 0, 
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {insights.insights.map((insight, index) => (
                      <li 
                        key={index}
                        style={{
                          padding: '14px 16px',
                          backgroundColor: 'var(--bg-subtle)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          border: '1px solid var(--border-subtle)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                          e.currentTarget.style.borderColor = 'var(--border-default)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        }}
                      >
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--accent-blue)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 600,
                          flexShrink: 0
                        }}>
                          {index + 1}
                        </span>
                        <p style={{ 
                          fontSize: '14px', 
                          color: 'var(--text-primary)', 
                          margin: 0,
                          lineHeight: 1.5
                        }}>
                          {insight}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Disclaimer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p style={{ 
            fontSize: '12px', 
            color: 'var(--text-muted)', 
            margin: 0 
          }}>
            {insights?.disclaimer || 'Insights are generated from aggregated analytics data.'}
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translate(-50%, -45%);
          }
          to { 
            opacity: 1; 
            transform: translate(-50%, -50%);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default AIInsightsModal;
