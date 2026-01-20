package com.analytics.dashboard.dto;

/**
 * Projection for aggregated user KPI statistics.
 * Used for optimized single-query KPI retrieval.
 */
public interface UserKPIStats {
    Long getTotalUsers();
    Long getNewUsers();
}
