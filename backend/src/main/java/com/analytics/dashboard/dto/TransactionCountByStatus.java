package com.analytics.dashboard.dto;

import com.analytics.dashboard.model.TransactionStatus;

/**
 * Projection for transaction count grouped by status.
 * Used for success rate calculations and status breakdown.
 */
public interface TransactionCountByStatus {
    TransactionStatus getStatus();
    Long getCount();
}
