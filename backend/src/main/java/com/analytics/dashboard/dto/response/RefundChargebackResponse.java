package com.analytics.dashboard.dto.response;

import java.math.BigDecimal;

/**
 * Response DTO for refund and payout analysis.
 * Used for analyzing refund and payout patterns and trends.
 */
public class RefundChargebackResponse {
    private String transactionType; // REFUND or PAYOUT
    private Long transactionCount;
    private BigDecimal totalAmount;
    private BigDecimal averageAmount;
    private Double percentageOfTotal;

    public RefundChargebackResponse(String transactionType, Long transactionCount,
                                    BigDecimal totalAmount, BigDecimal averageAmount,
                                    Double percentageOfTotal) {
        this.transactionType = transactionType;
        this.transactionCount = transactionCount;
        this.totalAmount = totalAmount;
        this.averageAmount = averageAmount;
        this.percentageOfTotal = percentageOfTotal;
    }

    // Manual getters
    public String getTransactionType() { return transactionType; }
    public Long getTransactionCount() { return transactionCount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public BigDecimal getAverageAmount() { return averageAmount; }
    public Double getPercentageOfTotal() { return percentageOfTotal; }
}
