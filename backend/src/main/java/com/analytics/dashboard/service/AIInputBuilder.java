package com.analytics.dashboard.service;

import com.analytics.dashboard.dto.AIInputData;
import com.analytics.dashboard.dto.response.KPIComparisonResponse;
import com.analytics.dashboard.dto.response.PaymentMethodResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * AIInputBuilder - Builds structured input for AI analysis.
 * 
 * IMPORTANT DESIGN PRINCIPLES:
 * 1. This class ONLY aggregates existing analytics data
 * 2. It does NOT access repositories directly
 * 3. It depends on AnalyticsService which has already computed metrics
 * 4. Output is deterministic - same input always produces same output
 * 5. All data is pre-computed, no raw transaction data is exposed
 * 
 * The builder:
 * - Fetches KPI metrics with period comparison (current vs previous)
 * - Fetches top payment method data
 * - Computes percentage changes
 * - Returns a structured AIInputData object
 */
@Component
public class AIInputBuilder {

    private static final Logger log = LoggerFactory.getLogger(AIInputBuilder.class);

    private final AnalyticsService analyticsService;

    public AIInputBuilder(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * Build AI input data for the specified period.
     * 
     * @param periodDays Number of days for analysis (7, 30, or 90)
     * @return AIInputData containing all metrics and deltas for AI consumption
     */
    public AIInputData buildInputData(int periodDays) {
        log.info("Building AI input data for {} day period", periodDays);
        long startTime = System.currentTimeMillis();

        try {
            // Step 1: Get KPI comparison data (already computed by AnalyticsService)
            // This gives us current values AND percentage changes vs previous period
            KPIComparisonResponse kpiComparison = analyticsService.getKPIWithComparison(periodDays);
            log.debug("Fetched KPI comparison data: transactions={}, successRate={}%", 
                    kpiComparison.getTotalTransactions(), 
                    kpiComparison.getSuccessRate());

            // Step 2: Get top payment method (from current period)
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(periodDays);
            List<PaymentMethodResponse> paymentMethods = analyticsService
                    .getTransactionsByPaymentMethod(startDate, endDate);
            
            // Find top payment method by transaction count
            String topPaymentMethod = "N/A";
            Double topPaymentMethodShare = 0.0;
            if (!paymentMethods.isEmpty()) {
                PaymentMethodResponse top = paymentMethods.stream()
                        .max((a, b) -> Long.compare(a.getTransactionCount(), b.getTransactionCount()))
                        .orElse(null);
                if (top != null) {
                    topPaymentMethod = top.getPaymentMethod() != null 
                            ? top.getPaymentMethod().name() 
                            : "UNKNOWN";
                    topPaymentMethodShare = top.getPercentage();
                }
            }
            log.debug("Top payment method: {} ({}%)", topPaymentMethod, topPaymentMethodShare);

            // Step 3: Build the structured input
            String periodDescription = String.format("Last %d days vs previous %d days", periodDays, periodDays);

            AIInputData inputData = AIInputData.builder()
                    // Percentage changes (from KPI comparison)
                    .revenueChangePercent(kpiComparison.getTotalGTVChange())
                    .failedTransactionChangePercent(kpiComparison.getFailedTransactionCountChange())
                    .totalTransactionsChangePercent(kpiComparison.getTotalTransactionsChange())
                    .successRateChangePercent(kpiComparison.getSuccessRateChange())
                    .avgTicketSizeChangePercent(kpiComparison.getAverageTicketSizeChange())
                    .pendingTransactionsChangePercent(kpiComparison.getPendingTransactionsChange())
                    // Current values
                    .currentRevenue(kpiComparison.getTotalGTV())
                    .currentSuccessRate(kpiComparison.getSuccessRate())
                    .currentFailedCount(kpiComparison.getFailedTransactionCount())
                    .currentTotalTransactions(kpiComparison.getTotalTransactions())
                    .currentPendingCount(kpiComparison.getPendingTransactions())
                    .currentAvgTicketSize(kpiComparison.getAverageTicketSize())
                    // Context
                    .topPaymentMethod(topPaymentMethod)
                    .topPaymentMethodShare(topPaymentMethodShare)
                    .periodDays(periodDays)
                    .periodDescription(periodDescription)
                    .build();

            long executionTime = System.currentTimeMillis() - startTime;
            log.info("Built AI input data in {}ms - revenueChange={}%, failedChange={}%, successRate={}%",
                    executionTime,
                    inputData.getRevenueChangePercent(),
                    inputData.getFailedTransactionChangePercent(),
                    inputData.getCurrentSuccessRate());

            return inputData;

        } catch (Exception e) {
            log.error("Error building AI input data for {} day period: {}", periodDays, e.getMessage(), e);
            throw new RuntimeException("Failed to build AI input data", e);
        }
    }

    /**
     * Validate that AI input data contains all required fields.
     * 
     * @param inputData The input data to validate
     * @return true if valid, false otherwise
     */
    public boolean validateInputData(AIInputData inputData) {
        if (inputData == null) {
            log.warn("AI input data is null");
            return false;
        }

        boolean isValid = inputData.isValid();
        
        if (!isValid) {
            log.warn("AI input data validation failed - missing required fields");
        }
        
        return isValid;
    }
}
