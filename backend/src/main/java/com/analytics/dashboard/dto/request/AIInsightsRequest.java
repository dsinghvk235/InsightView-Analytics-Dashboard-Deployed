package com.analytics.dashboard.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * Request payload for AI Insights endpoint.
 * 
 * Contains the time range for which to generate insights.
 * The AI will analyze analytics data for this period and compare
 * against the previous period of the same length.
 * 
 * Example:
 * {
 *   "range": "7d"
 * }
 */
public class AIInsightsRequest {

    /**
     * Time range for analysis.
     * Supported values: "7d", "30d", "90d"
     * 
     * The AI will:
     * 1. Fetch analytics for this period
     * 2. Fetch analytics for the previous period (same length)
     * 3. Compute deltas and generate insights
     */
    @NotNull(message = "Range is required")
    @Pattern(regexp = "^(7d|30d|90d)$", message = "Range must be one of: 7d, 30d, 90d")
    private String range;

    // Default constructor for JSON deserialization
    public AIInsightsRequest() {
    }

    public AIInsightsRequest(String range) {
        this.range = range;
    }

    public String getRange() {
        return range;
    }

    public void setRange(String range) {
        this.range = range;
    }

    /**
     * Convert range string to number of days.
     * @return Number of days for the selected range
     */
    public int getRangeDays() {
        if (range == null) {
            return 7; // Default
        }
        return switch (range) {
            case "7d" -> 7;
            case "30d" -> 30;
            case "90d" -> 90;
            default -> 7;
        };
    }

    @Override
    public String toString() {
        return "AIInsightsRequest{" +
                "range='" + range + '\'' +
                '}';
    }
}
