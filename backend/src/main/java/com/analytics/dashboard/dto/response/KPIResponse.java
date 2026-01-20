package com.analytics.dashboard.dto.response;

import java.math.BigDecimal;

/**
 * Response DTO for KPI metrics.
 * Contains all 8 critical analytics KPIs for dashboard.
 */
public class KPIResponse {
    private Long totalUsers;
    private Long totalTransactions;
    private Long newUsersToday;
    private Long pendingTransactions;
    private BigDecimal totalGTV;
    private Double successRate;
    private BigDecimal averageTicketSize;
    private Long failedTransactionCount;
    private BigDecimal failedVolume;

    public KPIResponse(Long totalUsers, Long totalTransactions, Long newUsersToday,
                      Long pendingTransactions, BigDecimal totalGTV, Double successRate,
                      BigDecimal averageTicketSize, Long failedTransactionCount, BigDecimal failedVolume) {
        this.totalUsers = totalUsers;
        this.totalTransactions = totalTransactions;
        this.newUsersToday = newUsersToday;
        this.pendingTransactions = pendingTransactions;
        this.totalGTV = totalGTV;
        this.successRate = successRate;
        this.averageTicketSize = averageTicketSize;
        this.failedTransactionCount = failedTransactionCount;
        this.failedVolume = failedVolume;
    }

    // Manual getters
    public Long getTotalUsers() { return totalUsers; }
    public Long getTotalTransactions() { return totalTransactions; }
    public Long getNewUsersToday() { return newUsersToday; }
    public Long getPendingTransactions() { return pendingTransactions; }
    public BigDecimal getTotalGTV() { return totalGTV; }
    public Double getSuccessRate() { return successRate; }
    public BigDecimal getAverageTicketSize() { return averageTicketSize; }
    public Long getFailedTransactionCount() { return failedTransactionCount; }
    public BigDecimal getFailedVolume() { return failedVolume; }
}
