package com.analytics.dashboard.service;

/**
 * Enum representing the different types of analytics insights available for search.
 * 
 * Each query type maps to an existing analytics method in AnalyticsService.
 * This provides a simple, rule-based keyword-to-analytics mapping.
 * 
 * Design: Uses enum for type safety and easy extensibility.
 * No AI/ML - just straightforward keyword matching.
 */
public enum AnalyticsQueryType {
    
    /**
     * Failed transactions summary.
     * Keywords: "failed", "failure", "failures", "declined"
     * Maps to: getTransactionsByStatus() filtered for FAILED
     */
    FAILED_TRANSACTIONS_SUMMARY(
        "Failed Transactions Summary",
        "Summary of failed transactions including count and percentage for the selected period"
    ),
    
    /**
     * Revenue/GTV summary.
     * Keywords: "revenue", "amount", "gtv", "earnings", "income"
     * Maps to: getKPIMetrics() for GTV-related metrics
     */
    REVENUE_SUMMARY(
        "Revenue Summary",
        "Total revenue (GTV) and average transaction amount for the selected period"
    ),
    
    /**
     * Top users by transaction amount.
     * Keywords: "top users", "best customers", "high value", "vip"
     * Maps to: getTopUsersByRevenue()
     */
    TOP_USERS_BY_REVENUE(
        "Top Users by Revenue",
        "Users ranked by total transaction amount in the selected period"
    ),
    
    /**
     * Payment method breakdown.
     * Keywords: "payment", "upi", "card", "wallet", "method"
     * Maps to: getTransactionsByPaymentMethod()
     */
    PAYMENT_METHOD_BREAKDOWN(
        "Payment Method Breakdown",
        "Transaction distribution across different payment methods (UPI, Cards, Wallets, etc.)"
    ),
    
    /**
     * Transaction status overview.
     * Keywords: "status", "pending", "success"
     * Maps to: getTransactionsByStatus()
     */
    TRANSACTION_STATUS_OVERVIEW(
        "Transaction Status Overview",
        "Distribution of transactions by status (Success, Failed, Pending)"
    ),
    
    /**
     * Success rate analytics.
     * Keywords: "success rate", "conversion", "completion"
     * Maps to: getKPIMetrics() for success rate
     */
    SUCCESS_RATE_ANALYTICS(
        "Success Rate Analytics",
        "Transaction success rate percentage and trend for the selected period"
    ),
    
    /**
     * Daily transaction trends.
     * Keywords: "daily", "trend", "over time", "history"
     * Maps to: getTransactionsByDateRange()
     */
    DAILY_TRANSACTION_TRENDS(
        "Daily Transaction Trends",
        "Day-by-day transaction statistics showing volume and performance trends"
    ),
    
    /**
     * Overview/Dashboard summary.
     * Keywords: "overview", "summary", "dashboard", "all"
     * Maps to: getAnalyticsOverview()
     */
    ANALYTICS_OVERVIEW(
        "Analytics Overview",
        "High-level dashboard summary with all key business metrics"
    );
    
    private final String displayName;
    private final String description;
    
    AnalyticsQueryType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}
