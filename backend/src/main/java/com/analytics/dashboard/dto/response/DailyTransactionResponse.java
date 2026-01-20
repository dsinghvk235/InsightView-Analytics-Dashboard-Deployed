package com.analytics.dashboard.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Response DTO for daily transaction analytics.
 * Used for time-series charts and daily breakdown.
 */
public class DailyTransactionResponse {
    private LocalDate date;
    private Long totalTransactions;
    private BigDecimal totalAmount;
    private Long successfulTransactions;
    private BigDecimal successfulAmount;
    private Long failedTransactions;
    private Double successRate;

    public DailyTransactionResponse() {}

    public DailyTransactionResponse(LocalDate date, Long totalTransactions, BigDecimal totalAmount,
                                   Long successfulTransactions, BigDecimal successfulAmount,
                                   Long failedTransactions, Double successRate) {
        this.date = date;
        this.totalTransactions = totalTransactions;
        this.totalAmount = totalAmount;
        this.successfulTransactions = successfulTransactions;
        this.successfulAmount = successfulAmount;
        this.failedTransactions = failedTransactions;
        this.successRate = successRate;
    }

    // Getters
    public LocalDate getDate() { return date; }
    public Long getTotalTransactions() { return totalTransactions; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public Long getSuccessfulTransactions() { return successfulTransactions; }
    public BigDecimal getSuccessfulAmount() { return successfulAmount; }
    public Long getFailedTransactions() { return failedTransactions; }
    public Double getSuccessRate() { return successRate; }

    // Setters
    public void setDate(LocalDate date) { this.date = date; }
    public void setTotalTransactions(Long totalTransactions) { this.totalTransactions = totalTransactions; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public void setSuccessfulTransactions(Long successfulTransactions) { this.successfulTransactions = successfulTransactions; }
    public void setSuccessfulAmount(BigDecimal successfulAmount) { this.successfulAmount = successfulAmount; }
    public void setFailedTransactions(Long failedTransactions) { this.failedTransactions = failedTransactions; }
    public void setSuccessRate(Double successRate) { this.successRate = successRate; }
}
