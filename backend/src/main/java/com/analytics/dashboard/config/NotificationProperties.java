package com.analytics.dashboard.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for the notification system.
 * Allows external configuration of thresholds and scheduling.
 * Registered via @EnableConfigurationProperties in main application class.
 */
@ConfigurationProperties(prefix = "app.notifications")
public class NotificationProperties {

    /**
     * Whether the notification scheduler is enabled.
     */
    private boolean enabled = true;

    /**
     * Cron expression for the notification scheduler.
     * Default: Every hour at minute 0 (0 0 * * * *)
     */
    private String cron = "0 0 * * * *";

    /**
     * Minimum hours between duplicate notifications of the same type.
     * Prevents spam for the same condition.
     */
    private int duplicatePreventionHours = 6;

    /**
     * Maximum number of notifications to return in API responses.
     */
    private int maxNotificationsReturned = 50;

    /**
     * Days to retain read notifications before cleanup.
     */
    private int retentionDays = 30;

    /**
     * Threshold configuration for each notification type.
     */
    private Thresholds thresholds = new Thresholds();

    public static class Thresholds {
        /**
         * Revenue drop percentage to trigger WARNING (e.g., 20 means 20% drop).
         */
        private double revenueDropWarning = 20.0;

        /**
         * Revenue drop percentage to trigger CRITICAL.
         */
        private double revenueDropCritical = 40.0;

        /**
         * Failed transaction increase percentage to trigger WARNING.
         */
        private double failedTransactionWarning = 30.0;

        /**
         * Failed transaction increase percentage to trigger CRITICAL.
         */
        private double failedTransactionCritical = 50.0;

        /**
         * Minimum success rate before triggering WARNING.
         */
        private double successRateWarning = 80.0;

        /**
         * Minimum success rate before triggering CRITICAL.
         */
        private double successRateCritical = 70.0;

        /**
         * Pending transaction count threshold for WARNING.
         */
        private long pendingTransactionsWarning = 100;

        /**
         * Pending transaction count threshold for CRITICAL.
         */
        private long pendingTransactionsCritical = 500;

        // Getters and Setters
        public double getRevenueDropWarning() { return revenueDropWarning; }
        public void setRevenueDropWarning(double revenueDropWarning) { this.revenueDropWarning = revenueDropWarning; }

        public double getRevenueDropCritical() { return revenueDropCritical; }
        public void setRevenueDropCritical(double revenueDropCritical) { this.revenueDropCritical = revenueDropCritical; }

        public double getFailedTransactionWarning() { return failedTransactionWarning; }
        public void setFailedTransactionWarning(double failedTransactionWarning) { this.failedTransactionWarning = failedTransactionWarning; }

        public double getFailedTransactionCritical() { return failedTransactionCritical; }
        public void setFailedTransactionCritical(double failedTransactionCritical) { this.failedTransactionCritical = failedTransactionCritical; }

        public double getSuccessRateWarning() { return successRateWarning; }
        public void setSuccessRateWarning(double successRateWarning) { this.successRateWarning = successRateWarning; }

        public double getSuccessRateCritical() { return successRateCritical; }
        public void setSuccessRateCritical(double successRateCritical) { this.successRateCritical = successRateCritical; }

        public long getPendingTransactionsWarning() { return pendingTransactionsWarning; }
        public void setPendingTransactionsWarning(long pendingTransactionsWarning) { this.pendingTransactionsWarning = pendingTransactionsWarning; }

        public long getPendingTransactionsCritical() { return pendingTransactionsCritical; }
        public void setPendingTransactionsCritical(long pendingTransactionsCritical) { this.pendingTransactionsCritical = pendingTransactionsCritical; }
    }

    // Getters and Setters
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getCron() { return cron; }
    public void setCron(String cron) { this.cron = cron; }

    public int getDuplicatePreventionHours() { return duplicatePreventionHours; }
    public void setDuplicatePreventionHours(int duplicatePreventionHours) { this.duplicatePreventionHours = duplicatePreventionHours; }

    public int getMaxNotificationsReturned() { return maxNotificationsReturned; }
    public void setMaxNotificationsReturned(int maxNotificationsReturned) { this.maxNotificationsReturned = maxNotificationsReturned; }

    public int getRetentionDays() { return retentionDays; }
    public void setRetentionDays(int retentionDays) { this.retentionDays = retentionDays; }

    public Thresholds getThresholds() { return thresholds; }
    public void setThresholds(Thresholds thresholds) { this.thresholds = thresholds; }
}
