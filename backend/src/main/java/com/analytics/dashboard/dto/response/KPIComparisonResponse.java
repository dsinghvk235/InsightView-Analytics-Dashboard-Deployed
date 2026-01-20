package com.analytics.dashboard.dto.response;

import java.math.BigDecimal;

/**
 * Response DTO for KPI metrics with period-over-period comparison.
 * Compares current period vs previous period and calculates percentage changes.
 */
public class KPIComparisonResponse {
    
    // Current period values
    private Long totalUsers;
    private Long totalTransactions;
    private Long newUsersToday;
    private Long pendingTransactions;
    private BigDecimal totalGTV;
    private Double successRate;
    private BigDecimal averageTicketSize;
    private Long failedTransactionCount;
    private BigDecimal failedVolume;
    
    // Percentage changes compared to previous period
    private Double totalUsersChange;
    private Double totalTransactionsChange;
    private Double newUsersTodayChange;
    private Double pendingTransactionsChange;
    private Double totalGTVChange;
    private Double successRateChange;
    private Double averageTicketSizeChange;
    private Double failedTransactionCountChange;
    private Double failedVolumeChange;
    
    // Period info
    private String currentPeriod;
    private String previousPeriod;

    public KPIComparisonResponse() {}

    // Getters
    public Long getTotalUsers() { return totalUsers; }
    public Long getTotalTransactions() { return totalTransactions; }
    public Long getNewUsersToday() { return newUsersToday; }
    public Long getPendingTransactions() { return pendingTransactions; }
    public BigDecimal getTotalGTV() { return totalGTV; }
    public Double getSuccessRate() { return successRate; }
    public BigDecimal getAverageTicketSize() { return averageTicketSize; }
    public Long getFailedTransactionCount() { return failedTransactionCount; }
    public BigDecimal getFailedVolume() { return failedVolume; }
    public Double getTotalUsersChange() { return totalUsersChange; }
    public Double getTotalTransactionsChange() { return totalTransactionsChange; }
    public Double getNewUsersTodayChange() { return newUsersTodayChange; }
    public Double getPendingTransactionsChange() { return pendingTransactionsChange; }
    public Double getTotalGTVChange() { return totalGTVChange; }
    public Double getSuccessRateChange() { return successRateChange; }
    public Double getAverageTicketSizeChange() { return averageTicketSizeChange; }
    public Double getFailedTransactionCountChange() { return failedTransactionCountChange; }
    public Double getFailedVolumeChange() { return failedVolumeChange; }
    public String getCurrentPeriod() { return currentPeriod; }
    public String getPreviousPeriod() { return previousPeriod; }

    // Setters
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
    public void setTotalTransactions(Long totalTransactions) { this.totalTransactions = totalTransactions; }
    public void setNewUsersToday(Long newUsersToday) { this.newUsersToday = newUsersToday; }
    public void setPendingTransactions(Long pendingTransactions) { this.pendingTransactions = pendingTransactions; }
    public void setTotalGTV(BigDecimal totalGTV) { this.totalGTV = totalGTV; }
    public void setSuccessRate(Double successRate) { this.successRate = successRate; }
    public void setAverageTicketSize(BigDecimal averageTicketSize) { this.averageTicketSize = averageTicketSize; }
    public void setFailedTransactionCount(Long failedTransactionCount) { this.failedTransactionCount = failedTransactionCount; }
    public void setFailedVolume(BigDecimal failedVolume) { this.failedVolume = failedVolume; }
    public void setTotalUsersChange(Double totalUsersChange) { this.totalUsersChange = totalUsersChange; }
    public void setTotalTransactionsChange(Double totalTransactionsChange) { this.totalTransactionsChange = totalTransactionsChange; }
    public void setNewUsersTodayChange(Double newUsersTodayChange) { this.newUsersTodayChange = newUsersTodayChange; }
    public void setPendingTransactionsChange(Double pendingTransactionsChange) { this.pendingTransactionsChange = pendingTransactionsChange; }
    public void setTotalGTVChange(Double totalGTVChange) { this.totalGTVChange = totalGTVChange; }
    public void setSuccessRateChange(Double successRateChange) { this.successRateChange = successRateChange; }
    public void setAverageTicketSizeChange(Double averageTicketSizeChange) { this.averageTicketSizeChange = averageTicketSizeChange; }
    public void setFailedTransactionCountChange(Double failedTransactionCountChange) { this.failedTransactionCountChange = failedTransactionCountChange; }
    public void setFailedVolumeChange(Double failedVolumeChange) { this.failedVolumeChange = failedVolumeChange; }
    public void setCurrentPeriod(String currentPeriod) { this.currentPeriod = currentPeriod; }
    public void setPreviousPeriod(String previousPeriod) { this.previousPeriod = previousPeriod; }

    // Builder pattern
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final KPIComparisonResponse response = new KPIComparisonResponse();

        public Builder totalUsers(Long val) { response.totalUsers = val; return this; }
        public Builder totalTransactions(Long val) { response.totalTransactions = val; return this; }
        public Builder newUsersToday(Long val) { response.newUsersToday = val; return this; }
        public Builder pendingTransactions(Long val) { response.pendingTransactions = val; return this; }
        public Builder totalGTV(BigDecimal val) { response.totalGTV = val; return this; }
        public Builder successRate(Double val) { response.successRate = val; return this; }
        public Builder averageTicketSize(BigDecimal val) { response.averageTicketSize = val; return this; }
        public Builder failedTransactionCount(Long val) { response.failedTransactionCount = val; return this; }
        public Builder failedVolume(BigDecimal val) { response.failedVolume = val; return this; }
        public Builder totalUsersChange(Double val) { response.totalUsersChange = val; return this; }
        public Builder totalTransactionsChange(Double val) { response.totalTransactionsChange = val; return this; }
        public Builder newUsersTodayChange(Double val) { response.newUsersTodayChange = val; return this; }
        public Builder pendingTransactionsChange(Double val) { response.pendingTransactionsChange = val; return this; }
        public Builder totalGTVChange(Double val) { response.totalGTVChange = val; return this; }
        public Builder successRateChange(Double val) { response.successRateChange = val; return this; }
        public Builder averageTicketSizeChange(Double val) { response.averageTicketSizeChange = val; return this; }
        public Builder failedTransactionCountChange(Double val) { response.failedTransactionCountChange = val; return this; }
        public Builder failedVolumeChange(Double val) { response.failedVolumeChange = val; return this; }
        public Builder currentPeriod(String val) { response.currentPeriod = val; return this; }
        public Builder previousPeriod(String val) { response.previousPeriod = val; return this; }
        public KPIComparisonResponse build() { return response; }
    }
}
