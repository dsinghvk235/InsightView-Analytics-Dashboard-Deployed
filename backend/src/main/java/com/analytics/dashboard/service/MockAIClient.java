package com.analytics.dashboard.service;

import com.analytics.dashboard.dto.AIInputData;
import com.analytics.dashboard.dto.response.AIInsightsResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Mock AI Client - Rule-based insight generation for development and testing.
 * 
 * This implementation generates deterministic insights based on the input data
 * using predefined rules. It demonstrates the AI Insights feature without
 * requiring an actual AI service.
 * 
 * BENEFITS:
 * 1. Works offline - no API keys or network required
 * 2. Deterministic - same input always produces same output
 * 3. Fast - no network latency
 * 4. Safe - no risk of unexpected AI behavior
 * 5. Cost-free - no API costs during development
 * 
 * In production, replace with OpenAIClient or similar implementation.
 */
@Component
public class MockAIClient implements AIClient {

    private static final Logger log = LoggerFactory.getLogger(MockAIClient.class);

    // Thresholds for insight generation
    private static final double SIGNIFICANT_CHANGE_THRESHOLD = 10.0; // 10%
    private static final double MODERATE_CHANGE_THRESHOLD = 5.0;     // 5%
    private static final double SUCCESS_RATE_WARNING = 85.0;         // Below 85% is concerning
    private static final double SUCCESS_RATE_CRITICAL = 75.0;        // Below 75% is critical

    @Override
    public AIInsightsResponse generateInsights(AIInputData inputData) {
        log.info("MockAIClient generating insights for {} day period", inputData.getPeriodDays());
        long startTime = System.currentTimeMillis();

        List<String> insights = new ArrayList<>();

        // Analyze revenue changes
        analyzeRevenue(inputData, insights);

        // Analyze failed transactions
        analyzeFailedTransactions(inputData, insights);

        // Analyze success rate
        analyzeSuccessRate(inputData, insights);

        // Analyze transaction volume
        analyzeTransactionVolume(inputData, insights);

        // Analyze payment methods
        analyzePaymentMethods(inputData, insights);

        // Ensure we have at least one insight
        if (insights.isEmpty()) {
            insights.add("Metrics are stable with no significant changes in the analyzed period.");
        }

        // Limit to max 5 insights
        if (insights.size() > 5) {
            insights = insights.subList(0, 5);
        }

        // Generate summary based on key findings
        String summary = generateSummary(inputData);

        long executionTime = System.currentTimeMillis() - startTime;
        log.info("MockAIClient generated {} insights in {}ms", insights.size(), executionTime);

        return AIInsightsResponse.builder()
                .summary(summary)
                .insights(insights)
                .periodAnalyzed(inputData.getPeriodDescription())
                .success(true)
                .build();
    }

    private void analyzeRevenue(AIInputData data, List<String> insights) {
        Double revenueChange = data.getRevenueChangePercent();
        if (revenueChange == null) return;

        if (revenueChange < -SIGNIFICANT_CHANGE_THRESHOLD) {
            insights.add(String.format(
                "Revenue decreased by %.1f%% compared to the previous period. " +
                "Review transaction success rates and payment method performance.",
                Math.abs(revenueChange)));
        } else if (revenueChange > SIGNIFICANT_CHANGE_THRESHOLD) {
            insights.add(String.format(
                "Revenue increased by %.1f%%. " +
                "Consider analyzing which customer segments or payment methods drove this growth.",
                revenueChange));
        }
    }

    private void analyzeFailedTransactions(AIInputData data, List<String> insights) {
        Double failedChange = data.getFailedTransactionChangePercent();
        if (failedChange == null) return;

        if (failedChange > SIGNIFICANT_CHANGE_THRESHOLD) {
            insights.add(String.format(
                "Failed transactions increased by %.1f%%. " +
                "Investigate payment gateway issues or check for specific error patterns.",
                failedChange));
        } else if (failedChange < -SIGNIFICANT_CHANGE_THRESHOLD) {
            insights.add(String.format(
                "Failed transactions decreased by %.1f%%, indicating improved payment reliability.",
                Math.abs(failedChange)));
        }
    }

    private void analyzeSuccessRate(AIInputData data, List<String> insights) {
        Double successRate = data.getCurrentSuccessRate();
        Double successRateChange = data.getSuccessRateChangePercent();
        
        if (successRate == null) return;

        if (successRate < SUCCESS_RATE_CRITICAL) {
            insights.add(String.format(
                "Success rate is at %.1f%%, which is below the critical threshold. " +
                "This requires immediate investigation into payment processing issues.",
                successRate));
        } else if (successRate < SUCCESS_RATE_WARNING) {
            insights.add(String.format(
                "Success rate is at %.1f%%, below the target of 85%%. " +
                "Monitor payment gateway performance and user checkout behavior.",
                successRate));
        } else if (successRateChange != null && successRateChange < -MODERATE_CHANGE_THRESHOLD) {
            insights.add(String.format(
                "Success rate dropped by %.1f percentage points to %.1f%%. " +
                "Check for recent changes in payment configurations or provider issues.",
                Math.abs(successRateChange), successRate));
        }
    }

    private void analyzeTransactionVolume(AIInputData data, List<String> insights) {
        Double volumeChange = data.getTotalTransactionsChangePercent();
        if (volumeChange == null) return;

        if (volumeChange < -SIGNIFICANT_CHANGE_THRESHOLD) {
            insights.add(String.format(
                "Transaction volume decreased by %.1f%%. " +
                "This may indicate reduced user activity or checkout friction.",
                Math.abs(volumeChange)));
        } else if (volumeChange > SIGNIFICANT_CHANGE_THRESHOLD * 2) {
            insights.add(String.format(
                "Transaction volume increased by %.1f%%. " +
                "Verify system capacity and monitor for any performance degradation.",
                volumeChange));
        }
    }

    private void analyzePaymentMethods(AIInputData data, List<String> insights) {
        String topMethod = data.getTopPaymentMethod();
        Double methodShare = data.getTopPaymentMethodShare();
        
        if (topMethod == null || methodShare == null) return;

        // Only add insight if there's a dominant payment method
        if (methodShare > 50.0) {
            insights.add(String.format(
                "%s accounts for %.1f%% of transactions. " +
                "Consider reviewing %s-specific metrics for more detailed analysis.",
                topMethod, methodShare, topMethod));
        }
    }

    private String generateSummary(AIInputData data) {
        List<String> observations = new ArrayList<>();

        Double revenueChange = data.getRevenueChangePercent();
        Double failedChange = data.getFailedTransactionChangePercent();
        Double successRate = data.getCurrentSuccessRate();

        // Revenue observation
        if (revenueChange != null) {
            if (revenueChange < -MODERATE_CHANGE_THRESHOLD) {
                observations.add("revenue declined");
            } else if (revenueChange > MODERATE_CHANGE_THRESHOLD) {
                observations.add("revenue increased");
            } else {
                observations.add("revenue remained stable");
            }
        }

        // Failure observation
        if (failedChange != null && failedChange > MODERATE_CHANGE_THRESHOLD) {
            observations.add("failure rates increased");
        }

        // Success rate observation
        if (successRate != null && successRate < SUCCESS_RATE_WARNING) {
            observations.add("success rate needs attention");
        }

        if (observations.isEmpty()) {
            return "Analytics metrics are within normal ranges for the analyzed period.";
        }

        // Capitalize first letter and join
        String firstObs = observations.get(0);
        firstObs = firstObs.substring(0, 1).toUpperCase() + firstObs.substring(1);
        
        if (observations.size() == 1) {
            return firstObs + " during this period.";
        }

        StringBuilder summary = new StringBuilder(firstObs);
        for (int i = 1; i < observations.size(); i++) {
            if (i == observations.size() - 1) {
                summary.append(" while ").append(observations.get(i));
            } else {
                summary.append(", ").append(observations.get(i));
            }
        }
        summary.append(".");

        return summary.toString();
    }

    @Override
    public boolean isAvailable() {
        // Mock client is always available
        return true;
    }

    @Override
    public String getClientName() {
        return "MockAI-RuleBased";
    }
}
