package com.analytics.dashboard.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Transaction entity representing a payment transaction.
 * Supports auditing with automatic timestamp management.
 */
@Entity
@Table(name = "transactions")
@EntityListeners(AuditingEntityListener.class)
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_transaction_user"))
    private User user;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @NotBlank
    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private TransactionType type;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private TransactionStatus status = TransactionStatus.PENDING;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 50)
    private PaymentMethod paymentMethod;

    /**
     * Payment provider name (e.g., PhonePe, GooglePay, Paytm, Visa, Mastercard).
     * Nullable - only relevant for certain payment methods (UPI, WALLETS, CREDIT_CARD).
     */
    @Column(name = "payment_provider", length = 100)
    private String paymentProvider;

    /**
     * Failure reason for FAILED transactions.
     * Indian-specific failure reasons: INSUFFICIENT_FUNDS, BANK_SERVER_DOWN, NPCI_TIMEOUT,
     * USER_ABORTED, INVALID_UPI_ID, UNKNOWN_ERROR.
     * Must be NULL for non-FAILED transactions (enforced by CHECK constraint).
     */
    @Column(name = "failure_reason", length = 100)
    private String failureReason;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Transaction() {}

    public Transaction(Long id, User user, BigDecimal amount, String currency, TransactionType type,
                      TransactionStatus status, PaymentMethod paymentMethod, String paymentProvider,
                      String failureReason, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.amount = amount;
        this.currency = currency;
        this.type = type;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.paymentProvider = paymentProvider;
        this.failureReason = failureReason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public TransactionType getType() { return type; }
    public TransactionStatus getStatus() { return status; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public String getPaymentProvider() { return paymentProvider; }
    public String getFailureReason() { return failureReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setCurrency(String currency) { this.currency = currency; }
    public void setType(TransactionType type) { this.type = type; }
    public void setStatus(TransactionStatus status) { this.status = status; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public void setPaymentProvider(String paymentProvider) { this.paymentProvider = paymentProvider; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder pattern
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Transaction transaction = new Transaction();

        public Builder id(Long val) { transaction.id = val; return this; }
        public Builder user(User val) { transaction.user = val; return this; }
        public Builder amount(BigDecimal val) { transaction.amount = val; return this; }
        public Builder currency(String val) { transaction.currency = val; return this; }
        public Builder type(TransactionType val) { transaction.type = val; return this; }
        public Builder status(TransactionStatus val) { transaction.status = val; return this; }
        public Builder paymentMethod(PaymentMethod val) { transaction.paymentMethod = val; return this; }
        public Builder paymentProvider(String val) { transaction.paymentProvider = val; return this; }
        public Builder failureReason(String val) { transaction.failureReason = val; return this; }
        public Builder createdAt(LocalDateTime val) { transaction.createdAt = val; return this; }
        public Builder updatedAt(LocalDateTime val) { transaction.updatedAt = val; return this; }
        public Transaction build() { return transaction; }
    }
}
