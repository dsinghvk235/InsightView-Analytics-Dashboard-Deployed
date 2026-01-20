package com.analytics.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Projection for total transaction amount by date range.
 * Used for performance optimization - only selects needed columns.
 */
public interface TransactionAmountByDateRange {
    LocalDate getDate();
    BigDecimal getTotalAmount();
    Long getTransactionCount();
}
