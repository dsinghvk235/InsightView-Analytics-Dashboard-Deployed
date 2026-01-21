package com.analytics.dashboard.model;

/**
 * Enum representing types of analytics notifications.
 * Each type corresponds to a specific analytics condition being monitored.
 */
public enum NotificationType {
    /**
     * Revenue has dropped significantly compared to previous period.
     * Typically triggered when revenue drops by more than 20%.
     */
    REVENUE_DROP("Revenue Drop", "Revenue has decreased compared to the previous period"),
    
    /**
     * Failed transactions have increased significantly.
     * Typically triggered when failure rate increases by more than 30%.
     */
    FAILED_TRANSACTION_SPIKE("Failed Transaction Spike", "Failed transaction count has increased significantly"),
    
    /**
     * Transaction volume is at a high point.
     * Triggered when daily volume is the highest in the last 30 days.
     */
    HIGH_VOLUME_DAY("High Volume Day", "Transaction volume reached a peak"),
    
    /**
     * Success rate has dropped below acceptable threshold.
     * Triggered when success rate drops below 70%.
     */
    LOW_SUCCESS_RATE("Low Success Rate", "Transaction success rate has dropped"),
    
    /**
     * Too many pending transactions.
     * Triggered when pending transactions exceed a threshold.
     */
    HIGH_PENDING_TRANSACTIONS("High Pending Transactions", "Pending transaction count is unusually high");
    
    private final String displayName;
    private final String description;
    
    NotificationType(String displayName, String description) {
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
