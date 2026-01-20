package com.analytics.dashboard.dto.response;

import java.math.BigDecimal;

/**
 * Response DTO for hourly transaction analytics.
 * Used for hour-of-day transaction heatmaps and peak traffic analysis.
 */
public class HourlyTransactionResponse {
    private Integer hour; // 0-23 (24-hour format)
    private Long transactionCount;
    private BigDecimal totalAmount;
    private Long successfulTransactions;
    private BigDecimal successfulAmount;
    private Double successRate;

    public HourlyTransactionResponse(Integer hour, Long transactionCount, BigDecimal totalAmount,
                                    Long successfulTransactions, BigDecimal successfulAmount,
                                    Double successRate) {
        this.hour = hour;
        this.transactionCount = transactionCount;
        this.totalAmount = totalAmount;
        this.successfulTransactions = successfulTransactions;
        this.successfulAmount = successfulAmount;
        this.successRate = successRate;
    }

    // Manual getters
    public Integer getHour() { return hour; }
    public Long getTransactionCount() { return transactionCount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public Long getSuccessfulTransactions() { return successfulTransactions; }
    public BigDecimal getSuccessfulAmount() { return successfulAmount; }
    public Double getSuccessRate() { return successRate; }
}
