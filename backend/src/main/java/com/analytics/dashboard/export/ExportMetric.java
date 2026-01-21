package com.analytics.dashboard.export;

/**
 * Supported metrics for analytics export.
 * Maps to existing analytics service methods.
 */
public enum ExportMetric {
    TRANSACTIONS_SUMMARY("Transactions Summary", "Daily transaction statistics"),
    REVENUE_SUMMARY("Revenue Summary", "Revenue breakdown over time"),
    FAILED_TRANSACTIONS("Failed Transactions", "Failed transaction analysis"),
    CURRENCY_BREAKDOWN("Currency Breakdown", "Transaction breakdown by payment method");

    private final String displayName;
    private final String description;

    ExportMetric(String displayName, String description) {
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
