package com.analytics.dashboard.dto;

import com.analytics.dashboard.model.PaymentMethod;
import java.math.BigDecimal;

/**
 * Projection for total transaction amount grouped by payment method.
 * Used for payment method analytics and market share calculations.
 */
public interface TransactionAmountByPaymentMethod {
    PaymentMethod getPaymentMethod();
    BigDecimal getTotalAmount();
    Long getTransactionCount();
    BigDecimal getAverageAmount();
}
