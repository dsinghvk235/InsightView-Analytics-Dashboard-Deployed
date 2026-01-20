# JPA Entity Updates for India-First Enhancements

## Quick Reference: Required Entity Changes

### 1. User Entity - Add phone_number

```java
package com.analytics.dashboard.model;

// Add this field to User.java
@Column(name = "phone_number", unique = true, length = 15)
private String phoneNumber;  // Nullable - no @NotNull annotation
```

**Notes:**
- Field is nullable (existing users don't have phone numbers)
- Unique constraint enforced at database level
- No validation annotation needed (optional field)

### 2. Transaction Entity - Add new fields

```java
package com.analytics.dashboard.model;

// Update currency with default
@Column(name = "currency", nullable = false, length = 3)
@Builder.Default
private String currency = "INR";

// Add payment_provider
@Column(name = "payment_provider", length = 100)
private String paymentProvider;  // Nullable

// Add failure_reason
@Column(name = "failure_reason", length = 100)
private String failureReason;  // Nullable - use String or enum
```

### 3. Update PaymentMethod Enum

```java
package com.analytics.dashboard.model;

public enum PaymentMethod {
    // Existing (backward compatible)
    CREDIT_CARD,
    DEBIT_CARD,
    BANK_TRANSFER,
    DIGITAL_WALLET,
    OTHER,
    
    // Indian payment methods (new)
    UPI,
    NET_BANKING,
    WALLET
}
```

### 4. Create FailureReason Enum (Optional but Recommended)

```java
package com.analytics.dashboard.model;

public enum FailureReason {
    INSUFFICIENT_FUNDS,
    BANK_SERVER_DOWN,
    NPCI_TIMEOUT,
    USER_ABORTED,
    INVALID_UPI_ID,
    UNKNOWN_ERROR
}
```

**In Transaction entity:**
```java
@Enumerated(EnumType.STRING)
@Column(name = "failure_reason", length = 100)
private FailureReason failureReason;  // Nullable
```

### 5. Complete Updated Transaction Entity (Reference)

```java
@Entity
@Table(name = "transactions")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;
    
    @NotBlank
    @Column(name = "currency", nullable = false, length = 3)
    @Builder.Default
    private String currency = "INR";  // NEW: Default to INR
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private TransactionType type;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.PENDING;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 50)
    private PaymentMethod paymentMethod;  // Updated enum with UPI, NET_BANKING, WALLET
    
    @Column(name = "payment_provider", length = 100)  // NEW: Nullable
    private String paymentProvider;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "failure_reason", length = 100)  // NEW: Nullable
    private FailureReason failureReason;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

## Migration Checklist

- [ ] Run Flyway migrations (V4, V5)
- [ ] Update User entity (add phoneNumber field)
- [ ] Update Transaction entity (add paymentProvider, failureReason)
- [ ] Update PaymentMethod enum (add UPI, NET_BANKING, WALLET)
- [ ] Create FailureReason enum (optional)
- [ ] Update currency default to "INR"
- [ ] Test with existing data (backward compatibility)
- [ ] Test with new Indian payment data

## Backward Compatibility Notes

1. **Existing transactions:** Keep their currency (USD, EUR, GBP) - no migration needed
2. **Existing users:** Can have NULL phone_number - no breaking changes
3. **Old payment methods:** CREDIT_CARD, DEBIT_CARD still work - CHECK constraint allows them
4. **New fields:** All nullable - existing code continues to work
