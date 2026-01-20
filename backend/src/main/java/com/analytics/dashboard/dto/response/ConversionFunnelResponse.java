package com.analytics.dashboard.dto.response;

/**
 * Response DTO for conversion funnel analytics.
 * Shows how many transactions progress through each stage: initiated -> pending -> success/failed.
 * Used for identifying drop-off points in the payment process.
 */
public class ConversionFunnelResponse {
    private String stage;
    private Long count;
    private Double percentage;

    public ConversionFunnelResponse(String stage, Long count, Double percentage) {
        this.stage = stage;
        this.count = count;
        this.percentage = percentage;
    }

    // Manual getters
    public String getStage() { return stage; }
    public Long getCount() { return count; }
    public Double getPercentage() { return percentage; }
}
