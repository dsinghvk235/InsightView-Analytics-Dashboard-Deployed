package com.analytics.dashboard.dto.response;

import java.math.BigDecimal;

/**
 * Response DTO for analytics overview dashboard.
 * Aggregates key metrics for dashboard display.
 */
public class AnalyticsOverviewResponse {
    private Long totalUsers;
    private Long activeUsers;
    private Long totalTransactions;
    private Long successfulTransactions;
    private Long failedTransactions;
    private BigDecimal totalRevenue;
    private BigDecimal averageTransactionAmount;
    private Double successRate;

    // Default constructor
    public AnalyticsOverviewResponse() {}

    // All-args constructor
    public AnalyticsOverviewResponse(Long totalUsers, Long activeUsers, Long totalTransactions,
                                    Long successfulTransactions, Long failedTransactions,
                                    BigDecimal totalRevenue, BigDecimal averageTransactionAmount,
                                    Double successRate) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.totalTransactions = totalTransactions;
        this.successfulTransactions = successfulTransactions;
        this.failedTransactions = failedTransactions;
        this.totalRevenue = totalRevenue;
        this.averageTransactionAmount = averageTransactionAmount;
        this.successRate = successRate;
    }

    // Getters
    public Long getTotalUsers() { return totalUsers; }
    public Long getActiveUsers() { return activeUsers; }
    public Long getTotalTransactions() { return totalTransactions; }
    public Long getSuccessfulTransactions() { return successfulTransactions; }
    public Long getFailedTransactions() { return failedTransactions; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public BigDecimal getAverageTransactionAmount() { return averageTransactionAmount; }
    public Double getSuccessRate() { return successRate; }

    // Setters
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
    public void setActiveUsers(Long activeUsers) { this.activeUsers = activeUsers; }
    public void setTotalTransactions(Long totalTransactions) { this.totalTransactions = totalTransactions; }
    public void setSuccessfulTransactions(Long successfulTransactions) { this.successfulTransactions = successfulTransactions; }
    public void setFailedTransactions(Long failedTransactions) { this.failedTransactions = failedTransactions; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public void setAverageTransactionAmount(BigDecimal averageTransactionAmount) { this.averageTransactionAmount = averageTransactionAmount; }
    public void setSuccessRate(Double successRate) { this.successRate = successRate; }

    // Builder pattern
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final AnalyticsOverviewResponse response = new AnalyticsOverviewResponse();

        public Builder totalUsers(Long val) { response.totalUsers = val; return this; }
        public Builder activeUsers(Long val) { response.activeUsers = val; return this; }
        public Builder totalTransactions(Long val) { response.totalTransactions = val; return this; }
        public Builder successfulTransactions(Long val) { response.successfulTransactions = val; return this; }
        public Builder failedTransactions(Long val) { response.failedTransactions = val; return this; }
        public Builder totalRevenue(BigDecimal val) { response.totalRevenue = val; return this; }
        public Builder averageTransactionAmount(BigDecimal val) { response.averageTransactionAmount = val; return this; }
        public Builder successRate(Double val) { response.successRate = val; return this; }
        public AnalyticsOverviewResponse build() { return response; }
    }
}
