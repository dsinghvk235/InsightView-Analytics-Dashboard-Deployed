package com.analytics.dashboard.service;

import com.analytics.dashboard.config.NotificationProperties;
import com.analytics.dashboard.dto.TransactionKPIStats;
import com.analytics.dashboard.dto.response.NotificationListResponse;
import com.analytics.dashboard.dto.response.NotificationResponse;
import com.analytics.dashboard.model.Notification;
import com.analytics.dashboard.model.NotificationSeverity;
import com.analytics.dashboard.model.NotificationType;
import com.analytics.dashboard.repository.NotificationRepository;
import com.analytics.dashboard.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing analytics notifications.
 * Handles notification generation based on analytics thresholds,
 * and provides CRUD operations for notifications.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationProperties properties;

    public NotificationService(
            NotificationRepository notificationRepository,
            TransactionRepository transactionRepository,
            NotificationProperties properties) {
        this.notificationRepository = notificationRepository;
        this.transactionRepository = transactionRepository;
        this.properties = properties;
    }

    // ==================== Read Operations ====================

    /**
     * Get recent notifications with unread count.
     */
    @Transactional(readOnly = true)
    public NotificationListResponse getNotifications() {
        log.debug("Fetching recent notifications");
        
        int limit = properties.getMaxNotificationsReturned();
        List<Notification> notifications = notificationRepository.findRecentNotifications(PageRequest.of(0, limit));
        long unreadCount = notificationRepository.countByReadFalse();
        long totalCount = notificationRepository.count();

        List<NotificationResponse> responses = notifications.stream()
                .map(NotificationResponse::new)
                .collect(Collectors.toList());

        return new NotificationListResponse(responses, unreadCount, totalCount);
    }

    /**
     * Get unread notification count only.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByReadFalse();
    }

    // ==================== Write Operations ====================

    /**
     * Mark a notification as read.
     */
    @Transactional
    public boolean markAsRead(Long id) {
        log.debug("Marking notification {} as read", id);
        int updated = notificationRepository.markAsRead(id);
        return updated > 0;
    }

    /**
     * Mark all notifications as read.
     */
    @Transactional
    public int markAllAsRead() {
        log.debug("Marking all notifications as read");
        return notificationRepository.markAllAsRead();
    }

    // ==================== Notification Generation ====================

    /**
     * Generate notifications based on current analytics metrics.
     * This is called by the scheduled job.
     */
    @Transactional
    public void generateNotifications() {
        if (!properties.isEnabled()) {
            log.debug("Notification generation is disabled");
            return;
        }

        log.info("Starting notification generation...");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentPeriodStart = now.minusDays(1);
        LocalDateTime previousPeriodStart = now.minusDays(2);
        LocalDateTime previousPeriodEnd = currentPeriodStart;

        // Get KPI stats for current and previous periods
        TransactionKPIStats currentStats = transactionRepository.getAllKPIMetricsForPeriod(currentPeriodStart, now);
        TransactionKPIStats previousStats = transactionRepository.getAllKPIMetricsForPeriod(previousPeriodStart, previousPeriodEnd);

        // Check each condition
        checkRevenueCondition(currentStats, previousStats);
        checkFailedTransactionCondition(currentStats, previousStats);
        checkSuccessRateCondition(currentStats);
        checkPendingTransactionsCondition(currentStats);
        checkHighVolumeDay(currentStats, now);

        log.info("Notification generation completed");
    }

    /**
     * Check for revenue drop and create notification if threshold crossed.
     */
    private void checkRevenueCondition(TransactionKPIStats current, TransactionKPIStats previous) {
        BigDecimal currentGTV = safeGetBigDecimal(current != null ? current.getTotalGtv() : null);
        BigDecimal previousGTV = safeGetBigDecimal(previous != null ? previous.getTotalGtv() : null);

        if (previousGTV.compareTo(BigDecimal.ZERO) <= 0) {
            log.debug("Skipping revenue check - no previous revenue data");
            return;
        }

        double changePercent = currentGTV.subtract(previousGTV)
                .divide(previousGTV, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();

        // Check for revenue drop (negative change)
        if (changePercent < 0) {
            double dropPercent = Math.abs(changePercent);
            NotificationSeverity severity = null;
            String reason = null;

            if (dropPercent >= properties.getThresholds().getRevenueDropCritical()) {
                severity = NotificationSeverity.CRITICAL;
                reason = String.format("Revenue dropped by %.1f%% (critical threshold: %.1f%%)", 
                        dropPercent, properties.getThresholds().getRevenueDropCritical());
            } else if (dropPercent >= properties.getThresholds().getRevenueDropWarning()) {
                severity = NotificationSeverity.WARNING;
                reason = String.format("Revenue dropped by %.1f%% (warning threshold: %.1f%%)", 
                        dropPercent, properties.getThresholds().getRevenueDropWarning());
            }

            if (severity != null && !isDuplicateNotification(NotificationType.REVENUE_DROP)) {
                createNotification(
                        NotificationType.REVENUE_DROP,
                        "Revenue Drop Alert",
                        reason + String.format(". Current: ₹%.2f, Previous: ₹%.2f", currentGTV, previousGTV),
                        severity,
                        BigDecimal.valueOf(dropPercent),
                        BigDecimal.valueOf(properties.getThresholds().getRevenueDropWarning()),
                        "Today vs Yesterday"
                );
                log.info("Created REVENUE_DROP notification: {}", reason);
            }
        }
    }

    /**
     * Check for failed transaction spike and create notification if threshold crossed.
     */
    private void checkFailedTransactionCondition(TransactionKPIStats current, TransactionKPIStats previous) {
        long currentFailed = safeGetLong(current != null ? current.getFailedCount() : null);
        long previousFailed = safeGetLong(previous != null ? previous.getFailedCount() : null);

        if (previousFailed <= 0 && currentFailed <= 0) {
            log.debug("Skipping failed transaction check - no failed transactions");
            return;
        }

        double changePercent;
        if (previousFailed == 0) {
            changePercent = currentFailed > 0 ? 100.0 : 0.0;
        } else {
            changePercent = ((double) (currentFailed - previousFailed) / previousFailed) * 100;
        }

        // Check for increase in failed transactions
        if (changePercent > 0) {
            NotificationSeverity severity = null;
            String reason = null;

            if (changePercent >= properties.getThresholds().getFailedTransactionCritical()) {
                severity = NotificationSeverity.CRITICAL;
                reason = String.format("Failed transactions increased by %.1f%% (critical threshold: %.1f%%)", 
                        changePercent, properties.getThresholds().getFailedTransactionCritical());
            } else if (changePercent >= properties.getThresholds().getFailedTransactionWarning()) {
                severity = NotificationSeverity.WARNING;
                reason = String.format("Failed transactions increased by %.1f%% (warning threshold: %.1f%%)", 
                        changePercent, properties.getThresholds().getFailedTransactionWarning());
            }

            if (severity != null && !isDuplicateNotification(NotificationType.FAILED_TRANSACTION_SPIKE)) {
                createNotification(
                        NotificationType.FAILED_TRANSACTION_SPIKE,
                        "Failed Transaction Spike",
                        reason + String.format(". Current: %d, Previous: %d", currentFailed, previousFailed),
                        severity,
                        BigDecimal.valueOf(changePercent),
                        BigDecimal.valueOf(properties.getThresholds().getFailedTransactionWarning()),
                        "Today vs Yesterday"
                );
                log.info("Created FAILED_TRANSACTION_SPIKE notification: {}", reason);
            }
        }
    }

    /**
     * Check success rate and create notification if below threshold.
     */
    private void checkSuccessRateCondition(TransactionKPIStats current) {
        Double successRate = safeGetDouble(current != null ? current.getSuccessRate() : null);
        
        if (successRate == null || successRate == 0.0) {
            log.debug("Skipping success rate check - no success rate data");
            return;
        }

        NotificationSeverity severity = null;
        String reason = null;

        if (successRate < properties.getThresholds().getSuccessRateCritical()) {
            severity = NotificationSeverity.CRITICAL;
            reason = String.format("Success rate is %.1f%% (critical threshold: %.1f%%)", 
                    successRate, properties.getThresholds().getSuccessRateCritical());
        } else if (successRate < properties.getThresholds().getSuccessRateWarning()) {
            severity = NotificationSeverity.WARNING;
            reason = String.format("Success rate is %.1f%% (warning threshold: %.1f%%)", 
                    successRate, properties.getThresholds().getSuccessRateWarning());
        }

        if (severity != null && !isDuplicateNotification(NotificationType.LOW_SUCCESS_RATE)) {
            createNotification(
                    NotificationType.LOW_SUCCESS_RATE,
                    "Low Success Rate Alert",
                    reason,
                    severity,
                    BigDecimal.valueOf(successRate),
                    BigDecimal.valueOf(properties.getThresholds().getSuccessRateWarning()),
                    "Last 24 hours"
            );
            log.info("Created LOW_SUCCESS_RATE notification: {}", reason);
        }
    }

    /**
     * Check pending transactions and create notification if too many.
     */
    private void checkPendingTransactionsCondition(TransactionKPIStats current) {
        long pendingCount = safeGetLong(current != null ? current.getPendingCount() : null);

        NotificationSeverity severity = null;
        String reason = null;

        if (pendingCount >= properties.getThresholds().getPendingTransactionsCritical()) {
            severity = NotificationSeverity.CRITICAL;
            reason = String.format("Pending transactions: %d (critical threshold: %d)", 
                    pendingCount, properties.getThresholds().getPendingTransactionsCritical());
        } else if (pendingCount >= properties.getThresholds().getPendingTransactionsWarning()) {
            severity = NotificationSeverity.WARNING;
            reason = String.format("Pending transactions: %d (warning threshold: %d)", 
                    pendingCount, properties.getThresholds().getPendingTransactionsWarning());
        }

        if (severity != null && !isDuplicateNotification(NotificationType.HIGH_PENDING_TRANSACTIONS)) {
            createNotification(
                    NotificationType.HIGH_PENDING_TRANSACTIONS,
                    "High Pending Transactions",
                    reason,
                    severity,
                    BigDecimal.valueOf(pendingCount),
                    BigDecimal.valueOf(properties.getThresholds().getPendingTransactionsWarning()),
                    "Current"
            );
            log.info("Created HIGH_PENDING_TRANSACTIONS notification: {}", reason);
        }
    }

    /**
     * Check for high volume day (highest in last 30 days).
     */
    private void checkHighVolumeDay(TransactionKPIStats current, LocalDateTime now) {
        long currentVolume = safeGetLong(current != null ? current.getTotalTransactions() : null);
        
        if (currentVolume == 0) {
            return;
        }

        // Get max daily volume in last 30 days (excluding today)
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        LocalDateTime yesterdayEnd = now.minusDays(1);
        
        TransactionKPIStats last30Days = transactionRepository.getAllKPIMetricsForPeriod(thirtyDaysAgo, yesterdayEnd);
        long maxPreviousVolume = safeGetLong(last30Days != null ? last30Days.getTotalTransactions() : null);

        // Calculate average daily volume
        long avgDailyVolume = maxPreviousVolume > 0 ? maxPreviousVolume / 30 : 0;

        // If current volume is significantly higher than average (>50% more)
        if (avgDailyVolume > 0 && currentVolume > avgDailyVolume * 1.5 && !isDuplicateNotification(NotificationType.HIGH_VOLUME_DAY)) {
            String reason = String.format("Today's transaction volume (%d) is %.1f%% higher than the 30-day average (%d)", 
                    currentVolume, 
                    ((double)(currentVolume - avgDailyVolume) / avgDailyVolume) * 100,
                    avgDailyVolume);
            
            createNotification(
                    NotificationType.HIGH_VOLUME_DAY,
                    "High Volume Day",
                    reason,
                    NotificationSeverity.INFO,
                    BigDecimal.valueOf(currentVolume),
                    BigDecimal.valueOf(avgDailyVolume),
                    "Today vs 30-day average"
            );
            log.info("Created HIGH_VOLUME_DAY notification: {}", reason);
        }
    }

    // ==================== Helper Methods ====================

    /**
     * Check if a notification of the same type was recently created.
     */
    private boolean isDuplicateNotification(NotificationType type) {
        int hours = properties.getDuplicatePreventionHours();
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        boolean exists = notificationRepository.existsByTypeAndCreatedAtAfter(type, since);
        
        if (exists) {
            log.debug("Skipping duplicate notification for type {} (within {} hours)", type, hours);
        }
        
        return exists;
    }

    /**
     * Create and save a notification.
     */
    private void createNotification(
            NotificationType type,
            String title,
            String description,
            NotificationSeverity severity,
            BigDecimal metricValue,
            BigDecimal thresholdValue,
            String comparisonPeriod) {
        
        Notification notification = Notification.builder()
                .type(type)
                .title(title)
                .description(description)
                .severity(severity)
                .metricValue(metricValue)
                .thresholdValue(thresholdValue)
                .comparisonPeriod(comparisonPeriod)
                .read(false)
                .build();

        notificationRepository.save(notification);
    }

    /**
     * Cleanup old notifications.
     */
    @Transactional
    public int cleanupOldNotifications() {
        int days = properties.getRetentionDays();
        LocalDateTime before = LocalDateTime.now().minusDays(days);
        int deleted = notificationRepository.deleteReadOlderThan(before);
        
        if (deleted > 0) {
            log.info("Cleaned up {} old read notifications (older than {} days)", deleted, days);
        }
        
        return deleted;
    }

    // Null-safe helpers
    private long safeGetLong(Long value) {
        return value != null ? value : 0L;
    }

    private BigDecimal safeGetBigDecimal(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private Double safeGetDouble(Double value) {
        return value != null ? value : 0.0;
    }
}
