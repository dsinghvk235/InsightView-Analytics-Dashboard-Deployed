package com.analytics.dashboard.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Request DTO for date range parameters.
 * Used for analytics queries that require start and end dates.
 */
public class DateRangeRequest {
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;

    public DateRangeRequest() {}

    public DateRangeRequest(LocalDate startDate, LocalDate endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }

    // Setters
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
