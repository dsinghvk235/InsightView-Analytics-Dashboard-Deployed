package com.analytics.dashboard.model;

/**
 * Enum representing severity levels for notifications.
 */
public enum NotificationSeverity {
    /**
     * Informational notification - positive or neutral events.
     * Examples: High volume day, new records achieved.
     */
    INFO("Info", "#3b82f6"),
    
    /**
     * Warning notification - attention needed but not critical.
     * Examples: Revenue drop > 20%, success rate declining.
     */
    WARNING("Warning", "#f59e0b"),
    
    /**
     * Critical notification - immediate attention required.
     * Examples: Failed transactions spike > 30%, success rate < 70%.
     */
    CRITICAL("Critical", "#ef4444");
    
    private final String displayName;
    private final String color;
    
    NotificationSeverity(String displayName, String color) {
        this.displayName = displayName;
        this.color = color;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getColor() {
        return color;
    }
}
