package com.analytics.dashboard.dto.response;

import com.analytics.dashboard.model.TransactionStatus;

/**
 * Response DTO for transaction status breakdown.
 * Used for status distribution charts.
 */
public class TransactionStatusResponse {
    private TransactionStatus status;
    private Long count;
    private Double percentage;

    public TransactionStatusResponse() {}

    public TransactionStatusResponse(TransactionStatus status, Long count, Double percentage) {
        this.status = status;
        this.count = count;
        this.percentage = percentage;
    }

    // Getters
    public TransactionStatus getStatus() { return status; }
    public Long getCount() { return count; }
    public Double getPercentage() { return percentage; }

    // Setters
    public void setStatus(TransactionStatus status) { this.status = status; }
    public void setCount(Long count) { this.count = count; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
}
