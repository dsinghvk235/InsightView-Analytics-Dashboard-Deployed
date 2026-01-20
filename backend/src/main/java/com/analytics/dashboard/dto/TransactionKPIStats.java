package com.analytics.dashboard.dto;

import java.math.BigDecimal;

/**
 * Projection for aggregated transaction KPI statistics.
 * Used for optimized single-query KPI retrieval.
 */
public interface TransactionKPIStats {
    Long getTotalTransactions();
    Long getPendingCount();
    Long getSuccessCount();
    Long getFailedCount();
    BigDecimal getTotalGtv();
    BigDecimal getAvgTicketSize();
    BigDecimal getFailedVolume();
    Double getSuccessRate();
}
