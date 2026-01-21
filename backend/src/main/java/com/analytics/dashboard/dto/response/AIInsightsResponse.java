package com.analytics.dashboard.dto.response;

import java.util.List;

/**
 * Response format for AI Insights endpoint.
 * 
 * Contains a summary and a list of human-readable insights
 * explaining what changed in the analytics data.
 * 
 * Example:
 * {
 *   "summary": "Revenue declined while failure rates increased.",
 *   "insights": [
 *     "Revenue dropped primarily due to increased failed transactions.",
 *     "EUR transactions showed the highest failure increase.",
 *     "Overall transaction volume remained relatively stable.",
 *     "The issue appears concentrated in payment execution rather than demand."
 *   ],
 *   "disclaimer": "Insights are generated from aggregated analytics data.",
 *   "periodAnalyzed": "Last 7 days vs previous 7 days"
 * }
 */
public class AIInsightsResponse {

    /**
     * One-line summary of the key findings.
     */
    private String summary;

    /**
     * List of insights (max 5 bullet points).
     * Each insight is 1-2 lines explaining:
     * - What changed
     * - Possible reasons
     * - What to investigate next
     */
    private List<String> insights;

    /**
     * Disclaimer about the nature of these insights.
     */
    private String disclaimer;

    /**
     * Description of the period analyzed.
     */
    private String periodAnalyzed;

    /**
     * Whether the AI service was available and insights were generated.
     * If false, summary will contain an error message.
     */
    private boolean success;

    // Default constructor
    public AIInsightsResponse() {
        this.disclaimer = "Insights are generated from aggregated analytics data.";
    }

    // Full constructor
    public AIInsightsResponse(String summary, List<String> insights, String periodAnalyzed, boolean success) {
        this.summary = summary;
        this.insights = insights;
        this.periodAnalyzed = periodAnalyzed;
        this.success = success;
        this.disclaimer = "Insights are generated from aggregated analytics data.";
    }

    // Builder pattern for cleaner construction
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String summary;
        private List<String> insights;
        private String disclaimer = "Insights are generated from aggregated analytics data.";
        private String periodAnalyzed;
        private boolean success = true;

        public Builder summary(String summary) {
            this.summary = summary;
            return this;
        }

        public Builder insights(List<String> insights) {
            this.insights = insights;
            return this;
        }

        public Builder disclaimer(String disclaimer) {
            this.disclaimer = disclaimer;
            return this;
        }

        public Builder periodAnalyzed(String periodAnalyzed) {
            this.periodAnalyzed = periodAnalyzed;
            return this;
        }

        public Builder success(boolean success) {
            this.success = success;
            return this;
        }

        public AIInsightsResponse build() {
            AIInsightsResponse response = new AIInsightsResponse();
            response.summary = this.summary;
            response.insights = this.insights;
            response.disclaimer = this.disclaimer;
            response.periodAnalyzed = this.periodAnalyzed;
            response.success = this.success;
            return response;
        }
    }

    // Getters and Setters
    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getInsights() {
        return insights;
    }

    public void setInsights(List<String> insights) {
        this.insights = insights;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }

    public String getPeriodAnalyzed() {
        return periodAnalyzed;
    }

    public void setPeriodAnalyzed(String periodAnalyzed) {
        this.periodAnalyzed = periodAnalyzed;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    @Override
    public String toString() {
        return "AIInsightsResponse{" +
                "summary='" + summary + '\'' +
                ", insights=" + insights +
                ", periodAnalyzed='" + periodAnalyzed + '\'' +
                ", success=" + success +
                '}';
    }
}
