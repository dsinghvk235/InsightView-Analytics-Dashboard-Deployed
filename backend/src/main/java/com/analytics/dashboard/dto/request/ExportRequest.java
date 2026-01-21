package com.analytics.dashboard.dto.request;

import com.analytics.dashboard.export.ExportFormat;
import com.analytics.dashboard.export.ExportMetric;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for analytics export.
 * 
 * Example:
 * {
 *   "metric": "TRANSACTIONS_SUMMARY",
 *   "range": "7d",
 *   "format": "CSV"
 * }
 */
public class ExportRequest {
    
    @NotNull(message = "Metric is required")
    private ExportMetric metric;
    
    @NotNull(message = "Range is required")
    private String range; // "7d", "30d", "90d", or custom days
    
    @NotNull(message = "Format is required")
    private ExportFormat format;

    public ExportRequest() {}

    public ExportRequest(ExportMetric metric, String range, ExportFormat format) {
        this.metric = metric;
        this.range = range;
        this.format = format;
    }

    // Getters
    public ExportMetric getMetric() { return metric; }
    public String getRange() { return range; }
    public ExportFormat getFormat() { return format; }

    // Setters
    public void setMetric(ExportMetric metric) { this.metric = metric; }
    public void setRange(String range) { this.range = range; }
    public void setFormat(ExportFormat format) { this.format = format; }

    /**
     * Parse range string to number of days.
     * Supports: "7d", "30d", "90d", or numeric string like "45"
     */
    public int getPeriodDays() {
        if (range == null || range.isEmpty()) {
            return 7; // default
        }
        
        String cleanedRange = range.toLowerCase().trim();
        
        switch (cleanedRange) {
            case "7d": return 7;
            case "30d": return 30;
            case "90d": return 90;
            case "all": return 0;
            default:
                // Try to parse as numeric
                try {
                    return Integer.parseInt(cleanedRange.replaceAll("[^0-9]", ""));
                } catch (NumberFormatException e) {
                    return 7; // default fallback
                }
        }
    }
}
