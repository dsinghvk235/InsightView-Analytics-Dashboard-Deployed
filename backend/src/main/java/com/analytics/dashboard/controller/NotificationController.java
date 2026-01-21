package com.analytics.dashboard.controller;

import com.analytics.dashboard.dto.response.NotificationListResponse;
import com.analytics.dashboard.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for notification endpoints.
 * Provides APIs for retrieving and managing analytics notifications.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * GET /api/notifications
     * 
     * Returns recent notifications sorted by created_at desc, along with unread count.
     * Limited to the configured maximum (default: 50 notifications).
     * 
     * <p><b>Response:</b>
     * <pre>
     * {
     *   "notifications": [
     *     {
     *       "id": 1,
     *       "type": "REVENUE_DROP",
     *       "typeDisplayName": "Revenue Drop",
     *       "title": "Revenue Drop Alert",
     *       "description": "Revenue dropped by 25%...",
     *       "severity": "WARNING",
     *       "severityColor": "#f59e0b",
     *       "read": false,
     *       "metricValue": 25.0,
     *       "thresholdValue": 20.0,
     *       "comparisonPeriod": "Today vs Yesterday",
     *       "createdAt": "2025-01-21T10:30:00",
     *       "relativeTime": "2 hours ago"
     *     },
     *     ...
     *   ],
     *   "unreadCount": 3,
     *   "totalCount": 15
     * }
     * </pre>
     * 
     * @return NotificationListResponse with notifications and counts
     */
    @GetMapping
    public ResponseEntity<NotificationListResponse> getNotifications() {
        log.info("GET /api/notifications - Request received");
        long startTime = System.currentTimeMillis();

        try {
            NotificationListResponse response = notificationService.getNotifications();
            
            long executionTime = System.currentTimeMillis() - startTime;
            log.info("GET /api/notifications - Returned {} notifications, {} unread in {}ms",
                    response.getNotifications().size(), response.getUnreadCount(), executionTime);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("GET /api/notifications - Error after {}ms: {}", executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/notifications/unread-count
     * 
     * Returns only the unread notification count.
     * Useful for polling to update badge without fetching all notifications.
     * 
     * @return Map with "unreadCount" key
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        log.debug("GET /api/notifications/unread-count - Request received");

        try {
            long count = notificationService.getUnreadCount();
            return ResponseEntity.ok(Map.of("unreadCount", count));
        } catch (Exception e) {
            log.error("GET /api/notifications/unread-count - Error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /api/notifications/{id}/read
     * 
     * Marks a specific notification as read.
     * 
     * @param id Notification ID
     * @return Success message or 404 if not found
     */
    @PostMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id) {
        log.info("POST /api/notifications/{}/read - Request received", id);

        try {
            boolean success = notificationService.markAsRead(id);
            
            if (success) {
                log.info("POST /api/notifications/{}/read - Notification marked as read", id);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Notification marked as read"
                ));
            } else {
                log.warn("POST /api/notifications/{}/read - Notification not found", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "message", "Notification not found"
                ));
            }
        } catch (Exception e) {
            log.error("POST /api/notifications/{}/read - Error: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to mark notification as read"
            ));
        }
    }

    /**
     * POST /api/notifications/read-all
     * 
     * Marks all notifications as read.
     * 
     * @return Number of notifications marked as read
     */
    @PostMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        log.info("POST /api/notifications/read-all - Request received");

        try {
            int count = notificationService.markAllAsRead();
            
            log.info("POST /api/notifications/read-all - Marked {} notifications as read", count);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "All notifications marked as read",
                    "count", count
            ));
        } catch (Exception e) {
            log.error("POST /api/notifications/read-all - Error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to mark notifications as read"
            ));
        }
    }

    /**
     * POST /api/notifications/generate
     * 
     * Manually triggers notification generation (for testing purposes).
     * In production, notifications are generated by the scheduled job.
     * 
     * @return Success message
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateNotifications() {
        log.info("POST /api/notifications/generate - Manual trigger requested");
        long startTime = System.currentTimeMillis();

        try {
            notificationService.generateNotifications();
            
            long executionTime = System.currentTimeMillis() - startTime;
            log.info("POST /api/notifications/generate - Generation completed in {}ms", executionTime);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Notification generation completed",
                    "executionTimeMs", executionTime
            ));
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("POST /api/notifications/generate - Error after {}ms: {}", 
                    executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to generate notifications: " + e.getMessage()
            ));
        }
    }
}
