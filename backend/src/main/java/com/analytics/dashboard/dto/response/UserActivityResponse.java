package com.analytics.dashboard.dto.response;

import java.time.LocalDate;

/**
 * Response DTO for user activity over time analytics.
 * Used for tracking user growth and activity trends.
 */
public class UserActivityResponse {
    private LocalDate date;
    private Long newUsers;
    private Long activeUsers;
    private Long totalUsers;

    public UserActivityResponse(LocalDate date, Long newUsers, Long activeUsers, Long totalUsers) {
        this.date = date;
        this.newUsers = newUsers;
        this.activeUsers = activeUsers;
        this.totalUsers = totalUsers;
    }

    // Manual getters
    public LocalDate getDate() { return date; }
    public Long getNewUsers() { return newUsers; }
    public Long getActiveUsers() { return activeUsers; }
    public Long getTotalUsers() { return totalUsers; }
}
