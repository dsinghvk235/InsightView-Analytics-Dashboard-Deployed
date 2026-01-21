package com.analytics.dashboard.repository;

import com.analytics.dashboard.model.Notification;
import com.analytics.dashboard.model.NotificationSeverity;
import com.analytics.dashboard.model.NotificationType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Notification entity.
 * Provides read and write operations for analytics notifications.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // ==================== Basic Queries ====================

    /**
     * Find all notifications ordered by creation date (most recent first).
     */
    List<Notification> findAllByOrderByCreatedAtDesc();

    /**
     * Find recent notifications with limit.
     * Uses native query for efficient limiting.
     */
    @Query("SELECT n FROM Notification n ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(Pageable pageable);

    /**
     * Find unread notifications ordered by creation date.
     */
    List<Notification> findByReadFalseOrderByCreatedAtDesc();

    /**
     * Find notifications by type.
     */
    List<Notification> findByTypeOrderByCreatedAtDesc(NotificationType type);

    /**
     * Find notifications by severity.
     */
    List<Notification> findBySeverityOrderByCreatedAtDesc(NotificationSeverity severity);

    // ==================== Count Queries ====================

    /**
     * Count unread notifications.
     */
    long countByReadFalse();

    /**
     * Count notifications by type.
     */
    long countByType(NotificationType type);

    /**
     * Count notifications by severity.
     */
    long countBySeverity(NotificationSeverity severity);

    // ==================== Duplicate Prevention Queries ====================

    /**
     * Check if a notification of the same type exists within a time window.
     * Used to prevent duplicate notifications for the same condition.
     */
    @Query("SELECT COUNT(n) > 0 FROM Notification n WHERE n.type = :type AND n.createdAt > :since")
    boolean existsByTypeAndCreatedAtAfter(
            @Param("type") NotificationType type,
            @Param("since") LocalDateTime since
    );

    /**
     * Find the most recent notification of a specific type.
     */
    Optional<Notification> findFirstByTypeOrderByCreatedAtDesc(NotificationType type);

    /**
     * Find notifications created within a time window.
     */
    List<Notification> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime since);

    // ==================== Update Queries ====================

    /**
     * Mark a notification as read.
     */
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.id = :id")
    int markAsRead(@Param("id") Long id);

    /**
     * Mark all notifications as read.
     */
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.read = false")
    int markAllAsRead();

    // ==================== Cleanup Queries ====================

    /**
     * Delete notifications older than a given date.
     * Used for cleanup of old notifications.
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :before")
    int deleteOlderThan(@Param("before") LocalDateTime before);

    /**
     * Delete read notifications older than a given date.
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.read = true AND n.createdAt < :before")
    int deleteReadOlderThan(@Param("before") LocalDateTime before);
}
