package com.analytics.dashboard.dto.response;

import java.math.BigDecimal;

/**
 * Response DTO for top users by revenue analytics.
 * Used for displaying top-performing users in the dashboard.
 */
public class TopUserResponse {
    private Long userId;
    private String userName;
    private String userEmail;
    private Long transactionCount;
    private BigDecimal totalRevenue;

    public TopUserResponse(Long userId, String userName, String userEmail,
                          Long transactionCount, BigDecimal totalRevenue) {
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.transactionCount = transactionCount;
        this.totalRevenue = totalRevenue;
    }

    // Manual getters
    public Long getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getUserEmail() { return userEmail; }
    public Long getTransactionCount() { return transactionCount; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
}
