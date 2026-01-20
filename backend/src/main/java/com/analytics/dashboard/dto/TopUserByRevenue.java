package com.analytics.dashboard.dto;

import java.math.BigDecimal;

/**
 * Projection for top users by revenue.
 * Used for performance optimization - only selects needed columns.
 */
public interface TopUserByRevenue {
    Long getUserId();
    String getUserName();
    String getUserEmail();
    Long getTransactionCount();
    BigDecimal getTotalRevenue();
}
