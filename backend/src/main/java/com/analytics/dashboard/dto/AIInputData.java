package com.analytics.dashboard.dto;

import java.math.BigDecimal;

/**
 * Structured input data for AI analysis.
 * 
 * IMPORTANT: This object contains ONLY:
 * - Pre-computed metrics
 * - Percentage changes
 * - Labels for context
 * 
 * The AI receives ONLY this deterministic, aggregated data.
 * The AI never accesses raw transaction data or database directly.
 * 
 * Example JSON that would be sent to AI:
 * {
 *   "revenueChangePercent": -18.5,
 *   "failedTransactionChangePercent": 32.0,
 *   "totalTransactionsChangePercent": -5.2,
 *   "successRateChangePercent": -4.1,
 *   "avgTicketSizeChangePercent": 2.3,
 *   "pendingTransactionsChangePercent": 15.0,
 *   "currentRevenue": 125000.00,
 *   "currentSuccessRate": 85.5,
 *   "currentFailedCount": 1250,
 *   "currentTotalTransactions": 8500,
 *   "topPaymentMethod": "UPI",
 *   "topPaymentMethodShare": 45.2,
 *   "periodDays": 7
 * }
 */
public class AIInputData {

    // ========== PERCENTAGE CHANGES (vs previous period) ==========
    
    /**
     * Revenue change percentage.
     * Negative = revenue decreased, Positive = revenue increased.
     */
    private Double revenueChangePercent;

    /**
     * Failed transaction count change percentage.
     * Positive = more failures (bad), Negative = fewer failures (good).
     */
    private Double failedTransactionChangePercent;

    /**
     * Total transaction count change percentage.
     */
    private Double totalTransactionsChangePercent;

    /**
     * Success rate change (absolute percentage points).
     * Example: -4.1 means success rate dropped from 89.6% to 85.5%
     */
    private Double successRateChangePercent;

    /**
     * Average ticket size change percentage.
     */
    private Double avgTicketSizeChangePercent;

    /**
     * Pending transactions count change percentage.
     */
    private Double pendingTransactionsChangePercent;

    // ========== CURRENT PERIOD VALUES (for context) ==========

    /**
     * Current period total revenue.
     */
    private BigDecimal currentRevenue;

    /**
     * Current period success rate (0-100).
     */
    private Double currentSuccessRate;

    /**
     * Current period failed transaction count.
     */
    private Long currentFailedCount;

    /**
     * Current period total transaction count.
     */
    private Long currentTotalTransactions;

    /**
     * Current period pending transaction count.
     */
    private Long currentPendingCount;

    /**
     * Current period average ticket size.
     */
    private BigDecimal currentAvgTicketSize;

    // ========== CONTEXTUAL LABELS ==========

    /**
     * Top payment method by volume.
     */
    private String topPaymentMethod;

    /**
     * Top payment method's share of total volume (percentage).
     */
    private Double topPaymentMethodShare;

    /**
     * Number of days in the analysis period.
     */
    private Integer periodDays;

    /**
     * Period description (e.g., "Last 7 days vs previous 7 days")
     */
    private String periodDescription;

    // Default constructor
    public AIInputData() {
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final AIInputData data = new AIInputData();

        public Builder revenueChangePercent(Double value) {
            data.revenueChangePercent = value;
            return this;
        }

        public Builder failedTransactionChangePercent(Double value) {
            data.failedTransactionChangePercent = value;
            return this;
        }

        public Builder totalTransactionsChangePercent(Double value) {
            data.totalTransactionsChangePercent = value;
            return this;
        }

        public Builder successRateChangePercent(Double value) {
            data.successRateChangePercent = value;
            return this;
        }

        public Builder avgTicketSizeChangePercent(Double value) {
            data.avgTicketSizeChangePercent = value;
            return this;
        }

        public Builder pendingTransactionsChangePercent(Double value) {
            data.pendingTransactionsChangePercent = value;
            return this;
        }

        public Builder currentRevenue(BigDecimal value) {
            data.currentRevenue = value;
            return this;
        }

        public Builder currentSuccessRate(Double value) {
            data.currentSuccessRate = value;
            return this;
        }

        public Builder currentFailedCount(Long value) {
            data.currentFailedCount = value;
            return this;
        }

        public Builder currentTotalTransactions(Long value) {
            data.currentTotalTransactions = value;
            return this;
        }

        public Builder currentPendingCount(Long value) {
            data.currentPendingCount = value;
            return this;
        }

        public Builder currentAvgTicketSize(BigDecimal value) {
            data.currentAvgTicketSize = value;
            return this;
        }

        public Builder topPaymentMethod(String value) {
            data.topPaymentMethod = value;
            return this;
        }

        public Builder topPaymentMethodShare(Double value) {
            data.topPaymentMethodShare = value;
            return this;
        }

        public Builder periodDays(Integer value) {
            data.periodDays = value;
            return this;
        }

        public Builder periodDescription(String value) {
            data.periodDescription = value;
            return this;
        }

        public AIInputData build() {
            return data;
        }
    }

    /**
     * Validate that all required fields are present.
     * @return true if input data is complete and valid
     */
    public boolean isValid() {
        return revenueChangePercent != null &&
               failedTransactionChangePercent != null &&
               totalTransactionsChangePercent != null &&
               successRateChangePercent != null &&
               currentSuccessRate != null &&
               currentTotalTransactions != null &&
               periodDays != null;
    }

    // Getters and Setters
    public Double getRevenueChangePercent() {
        return revenueChangePercent;
    }

    public void setRevenueChangePercent(Double revenueChangePercent) {
        this.revenueChangePercent = revenueChangePercent;
    }

    public Double getFailedTransactionChangePercent() {
        return failedTransactionChangePercent;
    }

    public void setFailedTransactionChangePercent(Double failedTransactionChangePercent) {
        this.failedTransactionChangePercent = failedTransactionChangePercent;
    }

    public Double getTotalTransactionsChangePercent() {
        return totalTransactionsChangePercent;
    }

    public void setTotalTransactionsChangePercent(Double totalTransactionsChangePercent) {
        this.totalTransactionsChangePercent = totalTransactionsChangePercent;
    }

    public Double getSuccessRateChangePercent() {
        return successRateChangePercent;
    }

    public void setSuccessRateChangePercent(Double successRateChangePercent) {
        this.successRateChangePercent = successRateChangePercent;
    }

    public Double getAvgTicketSizeChangePercent() {
        return avgTicketSizeChangePercent;
    }

    public void setAvgTicketSizeChangePercent(Double avgTicketSizeChangePercent) {
        this.avgTicketSizeChangePercent = avgTicketSizeChangePercent;
    }

    public Double getPendingTransactionsChangePercent() {
        return pendingTransactionsChangePercent;
    }

    public void setPendingTransactionsChangePercent(Double pendingTransactionsChangePercent) {
        this.pendingTransactionsChangePercent = pendingTransactionsChangePercent;
    }

    public BigDecimal getCurrentRevenue() {
        return currentRevenue;
    }

    public void setCurrentRevenue(BigDecimal currentRevenue) {
        this.currentRevenue = currentRevenue;
    }

    public Double getCurrentSuccessRate() {
        return currentSuccessRate;
    }

    public void setCurrentSuccessRate(Double currentSuccessRate) {
        this.currentSuccessRate = currentSuccessRate;
    }

    public Long getCurrentFailedCount() {
        return currentFailedCount;
    }

    public void setCurrentFailedCount(Long currentFailedCount) {
        this.currentFailedCount = currentFailedCount;
    }

    public Long getCurrentTotalTransactions() {
        return currentTotalTransactions;
    }

    public void setCurrentTotalTransactions(Long currentTotalTransactions) {
        this.currentTotalTransactions = currentTotalTransactions;
    }

    public Long getCurrentPendingCount() {
        return currentPendingCount;
    }

    public void setCurrentPendingCount(Long currentPendingCount) {
        this.currentPendingCount = currentPendingCount;
    }

    public BigDecimal getCurrentAvgTicketSize() {
        return currentAvgTicketSize;
    }

    public void setCurrentAvgTicketSize(BigDecimal currentAvgTicketSize) {
        this.currentAvgTicketSize = currentAvgTicketSize;
    }

    public String getTopPaymentMethod() {
        return topPaymentMethod;
    }

    public void setTopPaymentMethod(String topPaymentMethod) {
        this.topPaymentMethod = topPaymentMethod;
    }

    public Double getTopPaymentMethodShare() {
        return topPaymentMethodShare;
    }

    public void setTopPaymentMethodShare(Double topPaymentMethodShare) {
        this.topPaymentMethodShare = topPaymentMethodShare;
    }

    public Integer getPeriodDays() {
        return periodDays;
    }

    public void setPeriodDays(Integer periodDays) {
        this.periodDays = periodDays;
    }

    public String getPeriodDescription() {
        return periodDescription;
    }

    public void setPeriodDescription(String periodDescription) {
        this.periodDescription = periodDescription;
    }

    @Override
    public String toString() {
        return "AIInputData{" +
                "revenueChangePercent=" + revenueChangePercent +
                ", failedTransactionChangePercent=" + failedTransactionChangePercent +
                ", totalTransactionsChangePercent=" + totalTransactionsChangePercent +
                ", successRateChangePercent=" + successRateChangePercent +
                ", currentSuccessRate=" + currentSuccessRate +
                ", topPaymentMethod='" + topPaymentMethod + '\'' +
                ", periodDays=" + periodDays +
                '}';
    }
}
