package com.analytics.dashboard.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Response DTO for revenue over time analytics.
 * Used for line charts showing daily revenue trends.
 */
public class RevenueOverTimeResponse {
    private LocalDate date;
    private BigDecimal revenue;

    public RevenueOverTimeResponse(LocalDate date, BigDecimal revenue) {
        this.date = date;
        this.revenue = revenue;
    }

    // Manual getters
    public LocalDate getDate() { return date; }
    public BigDecimal getRevenue() { return revenue; }
}
