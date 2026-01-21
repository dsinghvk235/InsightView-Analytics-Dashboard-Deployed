package com.analytics.dashboard.scheduler;

import com.analytics.dashboard.config.NotificationProperties;
import com.analytics.dashboard.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler for generating analytics notifications.
 * Runs periodically based on configured cron expression.
 */
@Component
public class NotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificationScheduler.class);

    private final NotificationService notificationService;
    private final NotificationProperties properties;

    public NotificationScheduler(NotificationService notificationService, NotificationProperties properties) {
        this.notificationService = notificationService;
        this.properties = properties;
    }

    /**
     * Scheduled task to generate notifications based on analytics metrics.
     * Default: Runs every hour at minute 0.
     * Can be configured via app.notifications.cron property.
     */
    @Scheduled(cron = "${app.notifications.cron:0 0 * * * *}")
    public void generateNotifications() {
        if (!properties.isEnabled()) {
            log.debug("Notification scheduler is disabled, skipping notification generation");
            return;
        }

        log.info("=== Starting scheduled notification generation ===");
        long startTime = System.currentTimeMillis();

        try {
            notificationService.generateNotifications();
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("=== Notification generation completed in {}ms ===", duration);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("=== Notification generation failed after {}ms: {} ===", duration, e.getMessage(), e);
        }
    }

    /**
     * Scheduled task to cleanup old notifications.
     * Runs daily at 2 AM.
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupOldNotifications() {
        if (!properties.isEnabled()) {
            return;
        }

        log.info("Starting scheduled notification cleanup");
        
        try {
            int deleted = notificationService.cleanupOldNotifications();
            log.info("Notification cleanup completed, deleted {} old notifications", deleted);
        } catch (Exception e) {
            log.error("Notification cleanup failed: {}", e.getMessage(), e);
        }
    }
}
