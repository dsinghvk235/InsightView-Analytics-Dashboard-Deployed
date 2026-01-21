package com.analytics.dashboard.dto.response;

import com.analytics.dashboard.model.Notification;
import com.analytics.dashboard.model.NotificationSeverity;
import com.analytics.dashboard.model.NotificationType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for notification responses.
 */
public class NotificationResponse {
    
    private Long id;
    private String type;
    private String typeDisplayName;
    private String title;
    private String description;
    private String severity;
    private String severityColor;
    private boolean read;
    private BigDecimal metricValue;
    private BigDecimal thresholdValue;
    private String comparisonPeriod;
    private LocalDateTime createdAt;
    private String relativeTime;

    public NotificationResponse() {}

    public NotificationResponse(Notification notification) {
        this.id = notification.getId();
        this.type = notification.getType().name();
        this.typeDisplayName = notification.getType().getDisplayName();
        this.title = notification.getTitle();
        this.description = notification.getDescription();
        this.severity = notification.getSeverity().name();
        this.severityColor = notification.getSeverity().getColor();
        this.read = notification.isRead();
        this.metricValue = notification.getMetricValue();
        this.thresholdValue = notification.getThresholdValue();
        this.comparisonPeriod = notification.getComparisonPeriod();
        this.createdAt = notification.getCreatedAt();
        this.relativeTime = calculateRelativeTime(notification.getCreatedAt());
    }

    /**
     * Calculate human-readable relative time (e.g., "5 minutes ago", "2 hours ago").
     */
    private String calculateRelativeTime(LocalDateTime createdAt) {
        if (createdAt == null) return "Unknown";
        
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(createdAt, now).toMinutes();
        
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " minute" + (minutes == 1 ? "" : "s") + " ago";
        
        long hours = minutes / 60;
        if (hours < 24) return hours + " hour" + (hours == 1 ? "" : "s") + " ago";
        
        long days = hours / 24;
        if (days < 7) return days + " day" + (days == 1 ? "" : "s") + " ago";
        
        long weeks = days / 7;
        if (weeks < 4) return weeks + " week" + (weeks == 1 ? "" : "s") + " ago";
        
        long months = days / 30;
        return months + " month" + (months == 1 ? "" : "s") + " ago";
    }

    // Getters
    public Long getId() { return id; }
    public String getType() { return type; }
    public String getTypeDisplayName() { return typeDisplayName; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getSeverity() { return severity; }
    public String getSeverityColor() { return severityColor; }
    public boolean isRead() { return read; }
    public BigDecimal getMetricValue() { return metricValue; }
    public BigDecimal getThresholdValue() { return thresholdValue; }
    public String getComparisonPeriod() { return comparisonPeriod; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getRelativeTime() { return relativeTime; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setType(String type) { this.type = type; }
    public void setTypeDisplayName(String typeDisplayName) { this.typeDisplayName = typeDisplayName; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setSeverity(String severity) { this.severity = severity; }
    public void setSeverityColor(String severityColor) { this.severityColor = severityColor; }
    public void setRead(boolean read) { this.read = read; }
    public void setMetricValue(BigDecimal metricValue) { this.metricValue = metricValue; }
    public void setThresholdValue(BigDecimal thresholdValue) { this.thresholdValue = thresholdValue; }
    public void setComparisonPeriod(String comparisonPeriod) { this.comparisonPeriod = comparisonPeriod; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setRelativeTime(String relativeTime) { this.relativeTime = relativeTime; }
}
