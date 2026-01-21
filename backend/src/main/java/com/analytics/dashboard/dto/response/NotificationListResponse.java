package com.analytics.dashboard.dto.response;

import java.util.List;

/**
 * DTO for notification list response with unread count.
 */
public class NotificationListResponse {
    
    private List<NotificationResponse> notifications;
    private long unreadCount;
    private long totalCount;

    public NotificationListResponse() {}

    public NotificationListResponse(List<NotificationResponse> notifications, long unreadCount, long totalCount) {
        this.notifications = notifications;
        this.unreadCount = unreadCount;
        this.totalCount = totalCount;
    }

    // Getters
    public List<NotificationResponse> getNotifications() { return notifications; }
    public long getUnreadCount() { return unreadCount; }
    public long getTotalCount() { return totalCount; }

    // Setters
    public void setNotifications(List<NotificationResponse> notifications) { this.notifications = notifications; }
    public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }
    public void setTotalCount(long totalCount) { this.totalCount = totalCount; }
}
