package com.analytics.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Projection for daily transaction statistics.
 * Aggregates multiple metrics per day for dashboard display.
 */
public interface DailyTransactionStats {
    LocalDate getDate();
    Long getTotalTransactions();
    BigDecimal getTotalAmount();
    Long getSuccessfulTransactions();
    BigDecimal getSuccessfulAmount();
    Long getFailedTransactions();
}
