package com.analytics.dashboard.service;

import com.analytics.dashboard.dto.*;
import com.analytics.dashboard.dto.response.*;
import com.analytics.dashboard.model.PaymentMethod;
import com.analytics.dashboard.model.TransactionStatus;
import com.analytics.dashboard.model.TransactionType;
import com.analytics.dashboard.model.UserStatus;
import com.analytics.dashboard.repository.TransactionRepository;
import com.analytics.dashboard.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service layer for analytics operations.
 * Aggregates and formats data from repositories for dashboard display.
 * 
 * Design principles:
 * - Read-only and stateless
 * - Handles empty datasets gracefully
 * - Formats data for dashboard consumption
 * - No HTTP/controller logic
 */
@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsService.class);
    
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    // Manual constructor (Lombok @RequiredArgsConstructor not processing)
    public AnalyticsService(UserRepository userRepository, TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

    // ==================== Overview Analytics ====================

    /**
     * Get analytics overview for dashboard.
     * Aggregates key metrics: users, transactions, revenue, success rate.
     * 
     * @return AnalyticsOverviewResponse with all key metrics
     */
    public AnalyticsOverviewResponse getAnalyticsOverview() {
        log.debug("Fetching analytics overview");

        // User metrics
        long totalUsers = userRepository.getTotalUserCount();
        long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);

        // Transaction metrics
        long totalTransactions = transactionRepository.count();
        long successfulTransactions = transactionRepository.countByStatus(TransactionStatus.SUCCESS);
        long failedTransactions = transactionRepository.countByStatus(TransactionStatus.FAILED);

        // Revenue metrics (last 30 days)
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(30);
        BigDecimal totalRevenue = getTotalRevenue(startDate, endDate);
        BigDecimal averageTransactionAmount = getAverageTransactionAmount(startDate, endDate);

        // Success rate calculation
        Double successRate = calculateSuccessRate(totalTransactions, successfulTransactions);

        return new AnalyticsOverviewResponse(
                totalUsers,
                activeUsers,
                totalTransactions,
                successfulTransactions,
                failedTransactions,
                totalRevenue,
                averageTransactionAmount,
                successRate
        );
    }

    // ==================== Transaction Analytics by Date ====================

    /**
     * Get daily transaction statistics for date range.
     * Returns formatted data for time-series charts.
     * 
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of daily transaction statistics
     */
    public List<DailyTransactionResponse> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching transactions by date range: {} to {}", startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<DailyTransactionStats> stats = transactionRepository.getDailyTransactionStats(startDateTime, endDateTime);

        // Handle empty dataset
        if (stats.isEmpty()) {
            log.debug("No transactions found for date range: {} to {}", startDate, endDate);
            return new ArrayList<>();
        }

        // Format and calculate success rate for each day
        return stats.stream()
                .map(stat -> {
                    Double successRate = calculateSuccessRate(
                            stat.getTotalTransactions(),
                            stat.getSuccessfulTransactions()
                    );

                    return new DailyTransactionResponse(
                            stat.getDate(),
                            stat.getTotalTransactions(),
                            stat.getTotalAmount() != null ? stat.getTotalAmount() : ZERO,
                            stat.getSuccessfulTransactions(),
                            stat.getSuccessfulAmount() != null ? stat.getSuccessfulAmount() : ZERO,
                            stat.getFailedTransactions(),
                            successRate
                    );
                })
                .collect(Collectors.toList());
    }

    // ==================== Transaction Analytics by Status ====================

    /**
     * Get transaction count breakdown by status.
     * Returns formatted data for status distribution charts.
     * 
     * @return List of transaction status statistics with percentages
     */
    public List<TransactionStatusResponse> getTransactionsByStatus() {
        log.debug("Fetching transactions by status");

        List<TransactionCountByStatus> statusCounts = transactionRepository.getTransactionCountByStatus();

        // Handle empty dataset
        if (statusCounts.isEmpty()) {
            log.debug("No transactions found");
            return new ArrayList<>();
        }

        // Calculate total for percentage calculation
        long totalCount = statusCounts.stream()
                .mapToLong(TransactionCountByStatus::getCount)
                .sum();

        // Format with percentages
        return statusCounts.stream()
                .map(statusCount -> {
                    Double percentage = totalCount > 0
                            ? (statusCount.getCount() * 100.0) / totalCount
                            : 0.0;

                    return new TransactionStatusResponse(
                            statusCount.getStatus(),
                            statusCount.getCount(),
                            roundPercentage(percentage)
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * Get transaction count breakdown by status for a specific date range.
     * Returns formatted data for status distribution charts with date filtering.
     * 
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of transaction status statistics with percentages
     */
    public List<TransactionStatusResponse> getTransactionsByStatus(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching transactions by status: {} to {}", startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<TransactionCountByStatus> statusCounts = transactionRepository
                .getTransactionCountByStatusInDateRange(startDateTime, endDateTime);

        // Handle empty dataset
        if (statusCounts.isEmpty()) {
            log.debug("No transactions found for date range: {} to {}", startDate, endDate);
            return new ArrayList<>();
        }

        // Calculate total for percentage calculation
        long totalCount = statusCounts.stream()
                .mapToLong(TransactionCountByStatus::getCount)
                .sum();

        // Format with percentages
        return statusCounts.stream()
                .map(statusCount -> {
                    Double percentage = totalCount > 0
                            ? (statusCount.getCount() * 100.0) / totalCount
                            : 0.0;

                    return new TransactionStatusResponse(
                            statusCount.getStatus(),
                            statusCount.getCount(),
                            roundPercentage(percentage)
                    );
                })
                .collect(Collectors.toList());
    }

    // ==================== Payment Method Analytics ====================

    /**
     * Get transaction amount breakdown by payment method.
     * Returns formatted data for payment method analytics and market share.
     * 
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of payment method statistics with percentages
     */
    public List<PaymentMethodResponse> getTransactionsByPaymentMethod(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching transactions by payment method: {} to {}", startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<TransactionAmountByPaymentMethod> methodStats = transactionRepository
                .getTransactionAmountByPaymentMethod(startDateTime, endDateTime);

        // Handle empty dataset
        if (methodStats.isEmpty()) {
            log.debug("No transactions found for payment method analysis: {} to {}", startDate, endDate);
            return new ArrayList<>();
        }

        // Calculate total amount for percentage calculation
        BigDecimal totalAmount = methodStats.stream()
                .map(TransactionAmountByPaymentMethod::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Format with percentages
        return methodStats.stream()
                .map(methodStat -> {
                    BigDecimal total = methodStat.getTotalAmount() != null ? methodStat.getTotalAmount() : ZERO;
                    BigDecimal average = methodStat.getAverageAmount() != null ? methodStat.getAverageAmount() : ZERO;
                    
                    Double percentage = totalAmount.compareTo(ZERO) > 0
                            ? total.divide(totalAmount, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100))
                                    .doubleValue()
                            : 0.0;

                    return new PaymentMethodResponse(
                            methodStat.getPaymentMethod(),
                            total,
                            methodStat.getTransactionCount(),
                            average,
                            roundPercentage(percentage)
                    );
                })
                .collect(Collectors.toList());
    }

    // ==================== Revenue Over Time Analytics ====================

    /**
     * Get revenue over time for date range.
     * Returns daily revenue data for line charts.
     * Only includes successful payment transactions.
     * 
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of daily revenue data
     */
    public List<RevenueOverTimeResponse> getRevenueOverTime(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching revenue over time: {} to {}", startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // Get daily transaction stats and filter for successful payments only
        List<DailyTransactionStats> stats = transactionRepository.getDailyTransactionStats(startDateTime, endDateTime);

        // Handle empty dataset
        if (stats.isEmpty()) {
            log.debug("No transactions found for revenue over time: {} to {}", startDate, endDate);
            return new ArrayList<>();
        }

        // Format for line chart - only successful revenue
        return stats.stream()
                .map(stat -> {
                    BigDecimal revenue = stat.getSuccessfulAmount() != null 
                            ? stat.getSuccessfulAmount() 
                            : ZERO;
                    return new RevenueOverTimeResponse(stat.getDate(), revenue);
                })
                .collect(Collectors.toList());
    }

    // ==================== Top Users Analytics ====================

    /**
     * Get top users by revenue for date range.
     * Returns users ranked by total revenue from successful payments.
     * 
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @param limit Maximum number of users to return (default: 10)
     * @return List of top users with revenue data
     */
    public List<TopUserResponse> getTopUsersByRevenue(LocalDate startDate, LocalDate endDate, int limit) {
        log.debug("Fetching top {} users by revenue: {} to {}", limit, startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<TopUserByRevenue> topUsers = transactionRepository.getTopUsersByRevenue(
                startDateTime, endDateTime, limit);

        // Handle empty dataset
        if (topUsers.isEmpty()) {
            log.debug("No users found for top users by revenue: {} to {}", startDate, endDate);
            return new ArrayList<>();
        }

        // Format response
        return topUsers.stream()
                .map(user -> new TopUserResponse(
                        user.getUserId(),
                        user.getUserName(),
                        user.getUserEmail(),
                        user.getTransactionCount(),
                        user.getTotalRevenue() != null ? user.getTotalRevenue() : ZERO
                ))
                .collect(Collectors.toList());
    }

    // ==================== Conversion Funnel Analytics ====================

    /**
     * Get conversion funnel data for date range.
     * Shows transaction progression: PENDING -> SUCCESS/FAILED.
     * Used to identify drop-off points in the payment process.
     * 
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of conversion funnel stages with counts and percentages
     */
    public List<ConversionFunnelResponse> getConversionFunnel(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching conversion funnel: {} to {}", startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Object[]> funnelData = transactionRepository.getConversionFunnelData(startDateTime, endDateTime);

        // Handle empty dataset
        if (funnelData.isEmpty()) {
            log.debug("No transactions found for conversion funnel: {} to {}", startDate, endDate);
            return new ArrayList<>();
        }

        // Calculate total for percentage calculation
        long totalCount = funnelData.stream()
                .mapToLong(row -> ((Number) row[1]).longValue())
                .sum();

        // Format with percentages
        return funnelData.stream()
                .map(row -> {
                    String stage = (String) row[0];
                    Long count = ((Number) row[1]).longValue();
                    Double percentage = totalCount > 0
                            ? (count * 100.0) / totalCount
                            : 0.0;

                    return new ConversionFunnelResponse(
                            stage,
                            count,
                            roundPercentage(percentage)
                    );
                })
                .collect(Collectors.toList());
    }

    // ==================== Refund & Payout Analytics ====================

    /**
     * Get refund and payout analysis for date range.
     * Returns aggregated statistics for REFUND and PAYOUT transaction types.
     * 
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of refund and payout statistics
     */
    public List<RefundChargebackResponse> getRefundChargebackAnalysis(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching refund and payout analysis: {} to {}", startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Object[]> analysisData = transactionRepository.getRefundChargebackAnalysis(startDateTime, endDateTime);

        // Handle empty dataset
        if (analysisData.isEmpty()) {
            log.debug("No refunds or payouts found for date range: {} to {}", startDate, endDate);
            return new ArrayList<>();
        }

        // Calculate total transactions for percentage calculation
        long totalTransactionsCount = transactionRepository.count();
        final long totalTransactions = totalTransactionsCount == 0 ? 1 : totalTransactionsCount; // Avoid division by zero

        // Format response
        return analysisData.stream()
                .map(row -> {
                    String transactionType = (String) row[0];
                    Long count = ((Number) row[1]).longValue();
                    BigDecimal totalAmount = (BigDecimal) row[2];
                    BigDecimal averageAmount = (BigDecimal) row[3];
                    
                    BigDecimal total = totalAmount != null ? totalAmount : ZERO;
                    BigDecimal average = averageAmount != null ? averageAmount : ZERO;
                    
                    Double percentage = (count * 100.0) / totalTransactions;

                    return new RefundChargebackResponse(
                            transactionType,
                            count,
                            total,
                            average,
                            roundPercentage(percentage)
                    );
                })
                .collect(Collectors.toList());
    }

    // ==================== User Activity Analytics ====================

    /**
     * Get user activity over time for date range.
     * Returns daily statistics showing new users, active users, and total users.
     * 
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of daily user activity statistics
     */
    public List<UserActivityResponse> getUserActivityOverTime(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching user activity over time: {} to {}", startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Object[]> activityData = userRepository.getUserActivityOverTime(startDateTime, endDateTime);

        // Handle empty dataset
        if (activityData.isEmpty()) {
            log.debug("No user activity found for date range: {} to {}", startDate, endDate);
            return new ArrayList<>();
        }

        // Get initial total users count before the date range
        long initialTotalUsers = userRepository.getTotalUserCount() - 
                userRepository.countByCreatedAtBetween(startDateTime, endDateTime);

        // Format response with cumulative total users calculation
        final long[] runningTotal = {initialTotalUsers};
        return activityData.stream()
                .map(row -> {
                    LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
                    Long newUsers = ((Number) row[1]).longValue();
                    Long activeUsers = ((Number) row[2]).longValue();
                    
                    // Calculate cumulative total users
                    runningTotal[0] += newUsers;
                    Long totalUsers = runningTotal[0];

                    return new UserActivityResponse(date, newUsers, activeUsers, totalUsers);
                })
                .collect(Collectors.toList());
    }

    // ==================== Hourly Transaction Analytics ====================

    /**
     * Get hourly transaction statistics for date range.
     * Returns transaction data grouped by hour of day (0-23).
     * 
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of hourly transaction statistics
     */
    public List<HourlyTransactionResponse> getHourlyTransactionStats(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching hourly transaction stats: {} to {}", startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Object[]> hourlyData = transactionRepository.getHourlyTransactionStats(startDateTime, endDateTime);

        // Handle empty dataset
        if (hourlyData.isEmpty()) {
            log.debug("No transactions found for hourly analysis: {} to {}", startDate, endDate);
            return new ArrayList<>();
        }

        // Format response with success rate calculation
        return hourlyData.stream()
                .map(row -> {
                    Integer hour = ((Number) row[0]).intValue();
                    Long transactionCount = ((Number) row[1]).longValue();
                    BigDecimal totalAmount = (BigDecimal) row[2];
                    Long successfulTransactions = ((Number) row[3]).longValue();
                    BigDecimal successfulAmount = (BigDecimal) row[4];
                    
                    BigDecimal total = totalAmount != null ? totalAmount : ZERO;
                    BigDecimal successful = successfulAmount != null ? successfulAmount : ZERO;
                    
                    Double successRate = calculateSuccessRate(transactionCount, successfulTransactions);

                    return new HourlyTransactionResponse(
                            hour,
                            transactionCount,
                            total,
                            successfulTransactions,
                            successful,
                            successRate
                    );
                })
                .collect(Collectors.toList());
    }

    // ==================== Helper Methods ====================

    /**
     * Get total revenue (successful payments only) for date range.
     * Handles empty datasets gracefully.
     */
    private BigDecimal getTotalRevenue(LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal revenue = transactionRepository.getTotalRevenue(startDate, endDate);
        return revenue != null ? revenue : ZERO;
    }

    /**
     * Get average transaction amount for date range.
     * Handles empty datasets gracefully.
     */
    private BigDecimal getAverageTransactionAmount(LocalDateTime startDate, LocalDateTime endDate) {
        Optional<BigDecimal> average = transactionRepository.getAverageTransactionAmount(startDate, endDate);
        return average.orElse(ZERO);
    }

    /**
     * Calculate success rate percentage.
     * Handles division by zero gracefully.
     */
    private Double calculateSuccessRate(long total, long successful) {
        if (total == 0) {
            return 0.0;
        }
        return roundPercentage((successful * 100.0) / total);
    }

    /**
     * Round percentage to 2 decimal places.
     */
    private Double roundPercentage(Double percentage) {
        if (percentage == null) {
            return 0.0;
        }
        return BigDecimal.valueOf(percentage)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    // ==================== Optimized KPI Queries (Day 4) ====================

    /**
     * Get all 8 critical KPI metrics.
     * Optimized queries designed for <300ms execution with 500k+ transactions.
     * 
     * KPIs:
     * 1. Total Users
     * 2. Total Transactions
     * 3. New Users Today
     * 4. Pending Transactions
     * 5. Total GTV (Gross Transaction Value - SUCCESS payments only)
     * 6. Success Rate
     * 7. Average Ticket Size
     * 8. Failed Volume
     * 
     * @return KPIResponse with all 8 metrics
     */
    public KPIResponse getKPIMetrics() {
        log.debug("Fetching all KPI metrics");

        // 1. Total Users
        long totalUsers = userRepository.getTotalUserCount();

        // 2. Total Transactions
        long totalTransactions = transactionRepository.getTotalTransactionCount();

        // 3. New Users Today
        long newUsersToday = userRepository.getNewUsersToday();

        // 4. Pending Transactions
        long pendingTransactions = transactionRepository.getPendingTransactionCount();

        // 5. Total GTV (SUCCESS payments only)
        BigDecimal totalGTV = transactionRepository.getTotalGTV();
        if (totalGTV == null) {
            totalGTV = ZERO;
        }

        // 6. Success Rate
        Double successRate = transactionRepository.getSuccessRate()
                .orElse(0.0);

        // 7. Average Ticket Size
        BigDecimal averageTicketSize = transactionRepository.getAverageTicketSize()
                .orElse(ZERO);

        // 8. Failed Volume
        long failedTransactionCount = 0;
        BigDecimal failedVolume = ZERO;
        try {
            Optional<Object[]> failedVolumeData = transactionRepository.getFailedVolume();
            if (failedVolumeData.isPresent()) {
                Object[] data = failedVolumeData.get();
                if (data != null && data.length >= 2) {
                    if (data[0] != null) {
                        failedTransactionCount = ((Number) data[0]).longValue();
                    }
                    if (data[1] != null) {
                        if (data[1] instanceof BigDecimal) {
                            failedVolume = (BigDecimal) data[1];
                        } else if (data[1] instanceof Number) {
                            failedVolume = BigDecimal.valueOf(((Number) data[1]).doubleValue());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Error fetching failed volume, using defaults: {}", e.getMessage());
        }

        return new KPIResponse(
                totalUsers,
                totalTransactions,
                newUsersToday,
                pendingTransactions,
                totalGTV,
                roundPercentage(successRate),
                averageTicketSize,
                failedTransactionCount,
                failedVolume
        );
    }

    /**
     * Get KPI metrics for a specific date range.
     * 
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return KPIResponse with date-filtered metrics
     */
    public KPIResponse getKPIMetricsByDateRange(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching KPI metrics for date range: {} to {}", startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // 1. Total Users (all time, not date-filtered)
        long totalUsers = userRepository.getTotalUserCount();

        // 2. Total Transactions (date-filtered) - use optimized count query
        long totalTransactions = transactionRepository
                .getTotalTransactionCountByDateRange(startDateTime, endDateTime);

        // 3. New Users Today (if today is in range)
        long newUsersToday = 0;
        LocalDate today = LocalDate.now();
        if (!today.isBefore(startDate) && !today.isAfter(endDate)) {
            newUsersToday = userRepository.getNewUsersToday();
        }

        // 4. Pending Transactions (date-filtered) - use optimized native query
        long pendingTransactions = transactionRepository
                .getPendingTransactionCountByDateRange(startDateTime, endDateTime);

        // 5. Total GTV (date-filtered)
        BigDecimal totalGTV = transactionRepository.getTotalGTVByDateRange(startDateTime, endDateTime);
        if (totalGTV == null) {
            totalGTV = ZERO;
        }

        // 6. Success Rate (date-filtered)
        Double successRate = transactionRepository.getSuccessRateByDateRange(startDateTime, endDateTime)
                .orElse(0.0);

        // 7. Average Ticket Size (date-filtered)
        BigDecimal averageTicketSize = transactionRepository.getAverageTicketSizeByDateRange(startDateTime, endDateTime)
                .orElse(ZERO);

        // 8. Failed Volume (date-filtered)
        long failedTransactionCount = 0;
        BigDecimal failedVolume = ZERO;
        try {
            Optional<Object[]> failedVolumeData = transactionRepository.getFailedVolumeByDateRange(startDateTime, endDateTime);
            if (failedVolumeData.isPresent()) {
                Object[] data = failedVolumeData.get();
                if (data != null && data.length >= 2) {
                    if (data[0] != null) {
                        failedTransactionCount = ((Number) data[0]).longValue();
                    }
                    if (data[1] != null) {
                        if (data[1] instanceof BigDecimal) {
                            failedVolume = (BigDecimal) data[1];
                        } else if (data[1] instanceof Number) {
                            failedVolume = BigDecimal.valueOf(((Number) data[1]).doubleValue());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Error fetching failed volume for date range, using defaults: {}", e.getMessage());
        }

        return new KPIResponse(
                totalUsers,
                totalTransactions,
                newUsersToday,
                pendingTransactions,
                totalGTV,
                roundPercentage(successRate),
                averageTicketSize,
                failedTransactionCount,
                failedVolume
        );
    }

    // ==================== Paginated Transaction Table (Day 5) ====================

    /**
     * Get paginated transactions with filters.
     * Supports filtering by user email, status, amount range, and date range.
     * 
     * @param userEmail Optional filter by user email (partial match, case-insensitive)
     * @param status Optional filter by transaction status
     * @param minAmount Optional minimum amount filter
     * @param maxAmount Optional maximum amount filter
     * @param startDate Optional start date filter
     * @param endDate Optional end date filter
     * @param page Page number (0-indexed)
     * @param size Page size
     * @param sortBy Sort field (default: createdAt)
     * @param sortDir Sort direction (ASC/DESC, default: DESC)
     * @return PaginatedTransactionResponse with transactions and metadata
     */
    public PaginatedTransactionResponse getPaginatedTransactions(
            String userEmail,
            TransactionStatus status,
            PaymentMethod paymentMethod,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            LocalDate startDate,
            LocalDate endDate,
            int page,
            int size,
            String sortBy,
            String sortDir) {
        
        log.debug("Fetching paginated transactions - page: {}, size: {}, filters: email={}, status={}, paymentMethod={}, amount=[{}, {}], dates=[{}, {}]",
                page, size, userEmail, status, paymentMethod, minAmount, maxAmount, startDate, endDate);

        // Validate and set defaults
        if (page < 0) page = 0;
        if (size < 1) size = 20;
        if (size > 100) size = 100; // Max page size
        if (sortBy == null || sortBy.isEmpty()) sortBy = "createdAt";
        if (sortDir == null || sortDir.isEmpty()) sortDir = "DESC";

        // Convert status and paymentMethod to string for native query
        String statusStr = status != null ? status.name() : null;
        String paymentMethodStr = paymentMethod != null ? paymentMethod.name() : null;

        // Convert dates to LocalDateTime
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

        // Create Pageable (native query doesn't use Pageable for sorting, but we'll handle it)
        Pageable pageable = PageRequest.of(page, size);

        // Execute query
        Page<Object[]> pageResult = transactionRepository.findTransactionsWithFilters(
                userEmail,
                statusStr,
                paymentMethodStr,
                minAmount,
                maxAmount,
                startDateTime,
                endDateTime,
                pageable
        );

        // Convert results to DTOs
        List<TransactionTableResponse> transactions = pageResult.getContent().stream()
                .map(row -> {
                    Long id = ((Number) row[0]).longValue();
                    Long userId = ((Number) row[1]).longValue();
                    String email = (String) row[2];
                    String userName = (String) row[3];
                    BigDecimal amount = (BigDecimal) row[4];
                    String currency = (String) row[5];
                    TransactionType type = TransactionType.valueOf((String) row[6]);
                    TransactionStatus transStatus = TransactionStatus.valueOf((String) row[7]);
                    PaymentMethod txnPaymentMethod = PaymentMethod.valueOf((String) row[8]);
                    String paymentProvider = (String) row[9];
                    String failureReason = (String) row[10];
                    LocalDateTime createdAt = ((java.sql.Timestamp) row[11]).toLocalDateTime();

                    return new TransactionTableResponse(
                            id, userId, email, userName,
                            amount, currency, type, transStatus,
                            txnPaymentMethod, paymentProvider, failureReason, createdAt
                    );
                })
                .collect(Collectors.toList());

        // Build response
        return new PaginatedTransactionResponse(
                transactions,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.hasNext(),
                pageResult.hasPrevious()
        );
    }

    // ==================== KPI with Period Comparison ====================

    /**
     * Get KPI metrics with period-over-period comparison.
     * Compares current period (last N days) vs previous period (N to 2N days ago).
     * 
     * @param periodDays Number of days for each period (default: 30)
     * @return KPIComparisonResponse with current values and percentage changes
     */
    public KPIComparisonResponse getKPIWithComparison(int periodDays) {
        log.debug("Fetching KPI metrics with {} day comparison (OPTIMIZED)", periodDays);
        
        if (periodDays < 1) periodDays = 30;
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentPeriodStart = now.minusDays(periodDays);
        LocalDateTime previousPeriodStart = now.minusDays(periodDays * 2);
        LocalDateTime previousPeriodEnd = currentPeriodStart;
        
        // OPTIMIZED: Only 4 database queries total instead of 14+
        // Query 1: All transaction KPIs for current period
        com.analytics.dashboard.dto.TransactionKPIStats currentTxn = transactionRepository.getAllKPIMetricsForPeriod(currentPeriodStart, now);
        
        // Query 2: All transaction KPIs for previous period
        com.analytics.dashboard.dto.TransactionKPIStats previousTxn = transactionRepository.getAllKPIMetricsForPeriod(previousPeriodStart, previousPeriodEnd);
        
        // Query 3: User metrics for current period (total users + new users)
        com.analytics.dashboard.dto.UserKPIStats currentUser = userRepository.getUserKPIMetricsForPeriod(currentPeriodStart, now);
        
        // Query 4: User metrics for previous period
        com.analytics.dashboard.dto.UserKPIStats previousUser = userRepository.getUserKPIMetricsForPeriod(previousPeriodStart, previousPeriodEnd);
        
        // Extract current transaction metrics with null safety
        long currentTransactions = safeGetLong(currentTxn != null ? currentTxn.getTotalTransactions() : null);
        long currentPending = safeGetLong(currentTxn != null ? currentTxn.getPendingCount() : null);
        long currentFailedCount = safeGetLong(currentTxn != null ? currentTxn.getFailedCount() : null);
        BigDecimal currentGTV = safeGetBigDecimal(currentTxn != null ? currentTxn.getTotalGtv() : null);
        BigDecimal currentAvgTicket = safeGetBigDecimal(currentTxn != null ? currentTxn.getAvgTicketSize() : null);
        BigDecimal currentFailedVolume = safeGetBigDecimal(currentTxn != null ? currentTxn.getFailedVolume() : null);
        Double currentSuccessRate = safeGetDouble(currentTxn != null ? currentTxn.getSuccessRate() : null);
        
        // Extract previous transaction metrics
        long previousTransactions = safeGetLong(previousTxn != null ? previousTxn.getTotalTransactions() : null);
        long previousPending = safeGetLong(previousTxn != null ? previousTxn.getPendingCount() : null);
        long previousFailedCount = safeGetLong(previousTxn != null ? previousTxn.getFailedCount() : null);
        BigDecimal previousGTV = safeGetBigDecimal(previousTxn != null ? previousTxn.getTotalGtv() : null);
        BigDecimal previousAvgTicket = safeGetBigDecimal(previousTxn != null ? previousTxn.getAvgTicketSize() : null);
        BigDecimal previousFailedVolume = safeGetBigDecimal(previousTxn != null ? previousTxn.getFailedVolume() : null);
        Double previousSuccessRate = safeGetDouble(previousTxn != null ? previousTxn.getSuccessRate() : null);
        
        // Extract user metrics
        long currentTotalUsers = safeGetLong(currentUser != null ? currentUser.getTotalUsers() : null);
        long currentNewUsers = safeGetLong(currentUser != null ? currentUser.getNewUsers() : null);
        long previousTotalUsers = safeGetLong(previousUser != null ? previousUser.getTotalUsers() : null);
        long previousNewUsers = safeGetLong(previousUser != null ? previousUser.getNewUsers() : null);
        
        // Calculate percentage changes
        Double totalUsersChange = calculatePercentageChange(previousTotalUsers, currentTotalUsers);
        Double transactionsChange = calculatePercentageChange(previousTransactions, currentTransactions);
        Double newUsersChange = calculatePercentageChange(previousNewUsers, currentNewUsers);
        Double pendingChange = calculatePercentageChange(previousPending, currentPending);
        Double gtvChange = calculatePercentageChange(previousGTV, currentGTV);
        Double successRateChange = roundPercentage(currentSuccessRate - previousSuccessRate);
        Double avgTicketChange = calculatePercentageChange(previousAvgTicket, currentAvgTicket);
        Double failedCountChange = calculatePercentageChange(previousFailedCount, currentFailedCount);
        Double failedVolumeChange = calculatePercentageChange(previousFailedVolume, currentFailedVolume);
        
        String currentPeriodStr = String.format("Last %d days", periodDays);
        String previousPeriodStr = String.format("%d-%d days ago", periodDays, periodDays * 2);
        
        return KPIComparisonResponse.builder()
                .totalUsers(currentTotalUsers)
                .totalTransactions(currentTransactions)
                .newUsersToday(currentNewUsers)
                .pendingTransactions(currentPending)
                .totalGTV(currentGTV)
                .successRate(roundPercentage(currentSuccessRate))
                .averageTicketSize(currentAvgTicket)
                .failedTransactionCount(currentFailedCount)
                .failedVolume(currentFailedVolume)
                .totalUsersChange(totalUsersChange)
                .totalTransactionsChange(transactionsChange)
                .newUsersTodayChange(newUsersChange)
                .pendingTransactionsChange(pendingChange)
                .totalGTVChange(gtvChange)
                .successRateChange(successRateChange)
                .averageTicketSizeChange(avgTicketChange)
                .failedTransactionCountChange(failedCountChange)
                .failedVolumeChange(failedVolumeChange)
                .currentPeriod(currentPeriodStr)
                .previousPeriod(previousPeriodStr)
                .build();
    }
    
    // Helper methods for null-safe value extraction
    private long safeGetLong(Long value) {
        return value != null ? value : 0L;
    }
    
    private BigDecimal safeGetBigDecimal(BigDecimal value) {
        return value != null ? value : ZERO;
    }
    
    private Double safeGetDouble(Double value) {
        return value != null ? value : 0.0;
    }
    
    /**
     * Calculate percentage change between two values.
     */
    private Double calculatePercentageChange(long previous, long current) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        double change = ((double) (current - previous) / previous) * 100;
        return roundPercentage(change);
    }
    
    /**
     * Calculate percentage change between two BigDecimal values.
     */
    private Double calculatePercentageChange(BigDecimal previous, BigDecimal current) {
        if (previous == null || previous.compareTo(ZERO) == 0) {
            return current != null && current.compareTo(ZERO) > 0 ? 100.0 : 0.0;
        }
        BigDecimal change = current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
        return roundPercentage(change.doubleValue());
    }
}
