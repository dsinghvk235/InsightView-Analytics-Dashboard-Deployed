package com.analytics.dashboard.dto.response;

import com.analytics.dashboard.model.PaymentMethod;
import java.math.BigDecimal;

/**
 * Response DTO for payment method analytics.
 * Used for payment method performance and market share analysis.
 */
public class PaymentMethodResponse {
    private PaymentMethod paymentMethod;
    private BigDecimal totalAmount;
    private Long transactionCount;
    private BigDecimal averageAmount;
    private Double percentage;

    public PaymentMethodResponse() {}

    public PaymentMethodResponse(PaymentMethod paymentMethod, BigDecimal totalAmount, 
                                Long transactionCount, BigDecimal averageAmount, Double percentage) {
        this.paymentMethod = paymentMethod;
        this.totalAmount = totalAmount;
        this.transactionCount = transactionCount;
        this.averageAmount = averageAmount;
        this.percentage = percentage;
    }

    // Getters
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public Long getTransactionCount() { return transactionCount; }
    public BigDecimal getAverageAmount() { return averageAmount; }
    public Double getPercentage() { return percentage; }

    // Setters
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public void setTransactionCount(Long transactionCount) { this.transactionCount = transactionCount; }
    public void setAverageAmount(BigDecimal averageAmount) { this.averageAmount = averageAmount; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
}
