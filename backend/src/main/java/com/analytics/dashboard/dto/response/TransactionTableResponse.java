package com.analytics.dashboard.dto.response;

import com.analytics.dashboard.model.TransactionStatus;
import com.analytics.dashboard.model.TransactionType;
import com.analytics.dashboard.model.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for individual transaction in paginated table.
 * Contains all fields needed for transaction table display.
 */
public class TransactionTableResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userName;
    private BigDecimal amount;
    private String currency;
    private TransactionType type;
    private TransactionStatus status;
    private PaymentMethod paymentMethod;
    private String paymentProvider;
    private String failureReason;
    private LocalDateTime createdAt;

    public TransactionTableResponse(Long id, Long userId, String userEmail, String userName,
                                   BigDecimal amount, String currency, TransactionType type,
                                   TransactionStatus status, PaymentMethod paymentMethod,
                                   String paymentProvider, String failureReason, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.userName = userName;
        this.amount = amount;
        this.currency = currency;
        this.type = type;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.paymentProvider = paymentProvider;
        this.failureReason = failureReason;
        this.createdAt = createdAt;
    }

    // Getters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getUserEmail() { return userEmail; }
    public String getUserName() { return userName; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public TransactionType getType() { return type; }
    public TransactionStatus getStatus() { return status; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public String getPaymentProvider() { return paymentProvider; }
    public String getFailureReason() { return failureReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
