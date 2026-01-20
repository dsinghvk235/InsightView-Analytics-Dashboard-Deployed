package com.analytics.dashboard.repository;

import com.analytics.dashboard.dto.*;
import com.analytics.dashboard.model.PaymentMethod;
import com.analytics.dashboard.model.Transaction;
import com.analytics.dashboard.model.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Transaction entity with read-only analytics queries.
 * Optimized for analytics dashboards with projections and native queries.
 * All queries are read-only and leverage database indexes.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // ==================== Basic Queries ====================

    /**
     * Find transactions by user ID.
     * Uses idx_transactions_user_id index.
     * Query pattern: User transaction history.
     */
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Count transactions by status.
     * Uses idx_transactions_status index.
     * Query pattern: Success rate calculations.
     */
    long countByStatus(TransactionStatus status);

    /**
     * Find transactions by status.
     * Uses idx_transactions_status index.
     */
    List<Transaction> findByStatus(TransactionStatus status);

    /**
     * Find transactions by payment method.
     * Uses idx_transactions_payment_method index.
     */
    List<Transaction> findByPaymentMethod(PaymentMethod paymentMethod);

    // ==================== Date Range Queries ====================

    /**
     * Find transactions in date range.
     * Uses idx_transactions_created_at index (most critical for analytics).
     * Query pattern: Time-series analysis, date range filters.
     */
    List<Transaction> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    /**
     * Find successful transactions in date range.
     * Uses idx_transactions_status_created_at composite index.
     * Query pattern: Revenue calculations with date filters.
     */
    @Query("SELECT t FROM Transaction t WHERE t.status = :status AND t.createdAt >= :startDate AND t.createdAt <= :endDate ORDER BY t.createdAt DESC")
    List<Transaction> findSuccessfulTransactionsByDateRange(
            @Param("status") TransactionStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Find transactions by user and date range.
     * Uses idx_transactions_user_created_at composite index.
     * Query pattern: User transaction history with date filters.
     */
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.createdAt >= :startDate AND t.createdAt <= :endDate ORDER BY t.createdAt DESC")
    List<Transaction> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // ==================== Aggregation Queries (Projections) ====================

    /**
     * Total transaction amount by date range.
     * Uses native query for performance with SUM aggregation.
     * Query pattern: Revenue calculations over time period.
     * 
     * Performance: Uses idx_transactions_created_at index.
     * Returns: Total amount and count for the date range.
     */
    @Query(value = """
            SELECT 
                SUM(amount) as totalAmount,
                COUNT(*) as transactionCount
            FROM transactions
            WHERE created_at >= :startDate AND created_at <= :endDate
            """, nativeQuery = true)
    Optional<Object[]> getTotalAmountByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Total transaction amount by date range (grouped by day).
     * Uses projection for performance - only selects date, amount, count.
     * Query pattern: Daily revenue trends for charts.
     * 
     * Performance: Uses idx_transactions_created_at index.
     * Returns: Daily breakdown with date, total amount, transaction count.
     */
    @Query(value = """
            SELECT 
                CAST(created_at AS DATE) as date,
                SUM(amount) as totalAmount,
                COUNT(*) as transactionCount
            FROM transactions
            WHERE created_at >= :startDate AND created_at <= :endDate
            GROUP BY CAST(created_at AS DATE)
            ORDER BY date DESC
            """, nativeQuery = true)
    List<TransactionAmountByDateRange> getTransactionAmountByDateRangeGrouped(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Count of transactions by status.
     * Uses projection for performance.
     * Query pattern: Success rate calculations, status breakdown.
     * 
     * Performance: Uses idx_transactions_status index.
     * Returns: Status and count pairs.
     */
    @Query("SELECT t.status as status, COUNT(t) as count FROM Transaction t GROUP BY t.status")
    List<TransactionCountByStatus> getTransactionCountByStatus();

    /**
     * Count of transactions by status within date range.
     * Uses projection for performance with date filtering.
     * Query pattern: Success rate calculations, status breakdown for specific period.
     * 
     * Performance: Uses idx_transactions_status and idx_transactions_created_at indexes.
     * Returns: Status and count pairs for the specified date range.
     */
    @Query("SELECT t.status as status, COUNT(t) as count FROM Transaction t WHERE t.createdAt >= :startDate AND t.createdAt <= :endDate GROUP BY t.status")
    List<TransactionCountByStatus> getTransactionCountByStatusInDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Total amount by payment method.
     * Uses projection for performance - aggregates by payment method.
     * Query pattern: Payment method analytics, market share.
     * 
     * Performance: Uses idx_transactions_payment_method index.
     * Returns: Payment method, total amount, count, average amount.
     */
    @Query(value = """
            SELECT 
                payment_method as paymentMethod,
                SUM(amount) as totalAmount,
                COUNT(*) as transactionCount,
                AVG(amount) as averageAmount
            FROM transactions
            WHERE created_at >= :startDate AND created_at <= :endDate
            GROUP BY payment_method
            ORDER BY totalAmount DESC
            """, nativeQuery = true)
    List<TransactionAmountByPaymentMethod> getTransactionAmountByPaymentMethod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Daily transaction statistics.
     * Comprehensive daily metrics for dashboard.
     * Query pattern: Daily analytics with success/failure breakdown.
     * 
     * Performance: Uses idx_transactions_created_at and idx_transactions_status indexes.
     * Returns: Daily stats with total, successful, and failed transactions.
     */
    @Query(value = """
            SELECT 
                CAST(created_at AS DATE) as date,
                COUNT(*) as totalTransactions,
                SUM(amount) as totalAmount,
                SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as successfulTransactions,
                SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END) as successfulAmount,
                SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failedTransactions
            FROM transactions
            WHERE created_at >= :startDate AND created_at <= :endDate
            GROUP BY CAST(created_at AS DATE)
            ORDER BY date DESC
            """, nativeQuery = true)
    List<DailyTransactionStats> getDailyTransactionStats(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // ==================== Advanced Analytics Queries ====================

    /**
     * Total revenue (successful payments only).
     * Excludes refunds, failed transactions, and fees.
     * Query pattern: Revenue calculations for dashboard.
     * 
     * Performance: Uses idx_transactions_status_created_at index.
     */
    @Query(value = """
            SELECT COALESCE(SUM(amount), 0)
            FROM transactions
            WHERE status = 'SUCCESS' 
            AND type = 'PAYMENT'
            AND created_at >= :startDate AND created_at <= :endDate
            """, nativeQuery = true)
    BigDecimal getTotalRevenue(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Success rate calculation.
     * Percentage of successful transactions.
     * Query pattern: Payment success rate analytics.
     * 
     * Performance: Uses idx_transactions_status index.
     */
    @Query(value = """
            SELECT 
                COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) * 100.0 / COUNT(*) as successRate
            FROM transactions
            WHERE created_at >= :startDate AND created_at <= :endDate
            """, nativeQuery = true)
    Optional<Double> getSuccessRate(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Average transaction amount.
     * Query pattern: Average order value analytics.
     * 
     * Performance: Uses idx_transactions_created_at index.
     */
    @Query(value = """
            SELECT AVG(amount)
            FROM transactions
            WHERE created_at >= :startDate AND created_at <= :endDate
            AND status = 'SUCCESS'
            """, nativeQuery = true)
    Optional<BigDecimal> getAverageTransactionAmount(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Transaction count by payment method and status.
     * Detailed breakdown for analytics.
     * Query pattern: Payment method performance analysis.
     * 
     * Performance: Uses idx_transactions_payment_method and idx_transactions_status indexes.
     */
    @Query(value = """
            SELECT 
                payment_method as paymentMethod,
                status,
                COUNT(*) as count,
                SUM(amount) as totalAmount
            FROM transactions
            WHERE created_at >= :startDate AND created_at <= :endDate
            GROUP BY payment_method, status
            ORDER BY payment_method, status
            """, nativeQuery = true)
    List<Object[]> getTransactionCountByPaymentMethodAndStatus(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Top users by revenue (successful transactions only).
     * Returns users ranked by total revenue in descending order.
     * Query pattern: Top customer analytics, VIP user identification.
     * 
     * Performance: Uses idx_transactions_user_id and idx_transactions_status indexes.
     * Returns: Top N users with their revenue and transaction count.
     */
    @Query(value = """
            SELECT 
                u.id as userId,
                u.full_name as userName,
                u.email as userEmail,
                COUNT(t.id) as transactionCount,
                COALESCE(SUM(t.amount), 0) as totalRevenue
            FROM users u
            INNER JOIN transactions t ON u.id = t.user_id
            WHERE t.status = 'SUCCESS'
            AND t.type = 'PAYMENT'
            AND t.created_at >= :startDate AND t.created_at <= :endDate
            GROUP BY u.id, u.full_name, u.email
            ORDER BY totalRevenue DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<TopUserByRevenue> getTopUsersByRevenue(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("limit") int limit
    );

    /**
     * Conversion funnel data - transaction status breakdown.
     * Shows progression: INITIATED -> PENDING -> SUCCESS/FAILED.
     * Query pattern: Payment conversion analytics, drop-off analysis.
     * 
     * Performance: Uses idx_transactions_status and idx_transactions_created_at indexes.
     * Returns: Count of transactions at each stage of the funnel.
     */
    @Query(value = """
            SELECT 
                status,
                COUNT(*) as count
            FROM transactions
            WHERE created_at >= :startDate AND created_at <= :endDate
            GROUP BY status
            ORDER BY 
                CASE status
                    WHEN 'PENDING' THEN 1
                    WHEN 'SUCCESS' THEN 2
                    WHEN 'FAILED' THEN 3
                    ELSE 4
                END
            """, nativeQuery = true)
    List<Object[]> getConversionFunnelData(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Refund and payout analysis.
     * Returns aggregated data for REFUND and PAYOUT transaction types.
     * Query pattern: Financial risk analysis, refund trends.
     * 
     * Performance: Uses idx_transactions_type and idx_transactions_created_at indexes.
     * Returns: Transaction type, count, total amount, average amount.
     */
    @Query(value = """
            SELECT 
                type as transactionType,
                COUNT(*) as transactionCount,
                COALESCE(SUM(amount), 0) as totalAmount,
                COALESCE(AVG(amount), 0) as averageAmount
            FROM transactions
            WHERE type IN ('REFUND', 'PAYOUT')
            AND created_at >= :startDate AND created_at <= :endDate
            GROUP BY type
            ORDER BY type
            """, nativeQuery = true)
    List<Object[]> getRefundChargebackAnalysis(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Hourly transaction statistics.
     * Returns transaction data grouped by hour of day (0-23).
     * Query pattern: Peak traffic analysis, infrastructure planning, hour-of-day heatmaps.
     * 
     * Performance: Uses idx_transactions_created_at index.
     * Returns: Hour, transaction count, total amount, successful transactions, success rate.
     */
    @Query(value = """
            SELECT 
                EXTRACT(HOUR FROM created_at) as hour,
                COUNT(*) as transactionCount,
                COALESCE(SUM(amount), 0) as totalAmount,
                SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as successfulTransactions,
                COALESCE(SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END), 0) as successfulAmount
            FROM transactions
            WHERE created_at >= :startDate AND created_at <= :endDate
            GROUP BY EXTRACT(HOUR FROM created_at)
            ORDER BY hour
            """, nativeQuery = true)
    List<Object[]> getHourlyTransactionStats(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // ==================== Optimized KPI Queries (Day 4) ====================

    /**
     * Get total transaction count.
     * Optimized for large datasets (500k+ transactions).
     * 
     * Performance: Uses primary key index scan.
     * Target: <50ms with 500k+ transactions.
     * 
     * @return Total count of all transactions
     */
    @Query(value = "SELECT COUNT(*) FROM transactions", nativeQuery = true)
    long getTotalTransactionCount();

    /**
     * Get total transaction count for date range.
     * 
     * Performance: Uses idx_transactions_created_at index.
     */
    @Query(value = """
            SELECT COUNT(*) 
            FROM transactions
            WHERE created_at >= :startDate 
              AND created_at <= :endDate
            """, nativeQuery = true)
    long getTotalTransactionCountByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Get count of pending transactions.
     * Optimized query for pending transaction metric.
     * 
     * Performance: Uses idx_transactions_status index.
     * Target: <30ms with 500k+ transactions.
     * 
     * @return Count of transactions with PENDING status
     */
    @Query(value = """
            SELECT COUNT(*) 
            FROM transactions
            WHERE status = 'PENDING'
            """, nativeQuery = true)
    long getPendingTransactionCount();

    /**
     * Get count of pending transactions for date range.
     * 
     * Performance: Uses idx_transactions_status_created_at composite index.
     */
    @Query(value = """
            SELECT COUNT(*) 
            FROM transactions
            WHERE status = 'PENDING'
              AND created_at >= :startDate 
              AND created_at <= :endDate
            """, nativeQuery = true)
    long getPendingTransactionCountByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Get Total GTV (Gross Transaction Value) - SUCCESS payments only.
     * Excludes refunds, fees, chargebacks, and failed transactions.
     * 
     * Performance: Uses idx_transactions_status and idx_transactions_type indexes.
     * Target: <100ms with 500k+ transactions.
     * 
     * @return Total amount of successful payment transactions
     */
    @Query(value = """
            SELECT COALESCE(SUM(amount), 0)
            FROM transactions
            WHERE status = 'SUCCESS'
              AND type = 'PAYMENT'
            """, nativeQuery = true)
    BigDecimal getTotalGTV();

    /**
     * Get Total GTV for date range.
     * 
     * Performance: Uses idx_transactions_status_created_at composite index.
     * Target: <100ms with 500k+ transactions.
     */
    @Query(value = """
            SELECT COALESCE(SUM(amount), 0)
            FROM transactions
            WHERE status = 'SUCCESS'
              AND type = 'PAYMENT'
              AND created_at >= :startDate 
              AND created_at <= :endDate
            """, nativeQuery = true)
    BigDecimal getTotalGTVByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Get success rate percentage.
     * Calculates percentage of successful transactions out of total.
     * 
     * Performance: Uses idx_transactions_status index.
     * Target: <80ms with 500k+ transactions.
     * 
     * @return Success rate as percentage (0.0 to 100.0)
     */
    @Query(value = """
            SELECT 
                ROUND(
                    COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) * 100.0 / 
                    NULLIF(COUNT(*), 0), 
                    2
                ) as success_rate
            FROM transactions
            """, nativeQuery = true)
    Optional<Double> getSuccessRate();

    /**
     * Get success rate for date range.
     * 
     * Performance: Uses idx_transactions_status and idx_transactions_created_at indexes.
     */
    @Query(value = """
            SELECT 
                ROUND(
                    COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) * 100.0 / 
                    NULLIF(COUNT(*), 0), 
                    2
                ) as success_rate
            FROM transactions
            WHERE created_at >= :startDate 
              AND created_at <= :endDate
            """, nativeQuery = true)
    Optional<Double> getSuccessRateByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Get average ticket size (average transaction amount).
     * Only includes successful payment transactions.
     * 
     * Performance: Uses idx_transactions_status and idx_transactions_type indexes.
     * Target: <100ms with 500k+ transactions.
     * 
     * @return Average transaction amount for successful payments
     */
    @Query(value = """
            SELECT COALESCE(AVG(amount), 0)
            FROM transactions
            WHERE status = 'SUCCESS'
              AND type = 'PAYMENT'
            """, nativeQuery = true)
    Optional<BigDecimal> getAverageTicketSize();

    /**
     * Get average ticket size for date range.
     * 
     * Performance: Uses idx_transactions_status_created_at composite index.
     */
    @Query(value = """
            SELECT COALESCE(AVG(amount), 0)
            FROM transactions
            WHERE status = 'SUCCESS'
              AND type = 'PAYMENT'
              AND created_at >= :startDate 
              AND created_at <= :endDate
            """, nativeQuery = true)
    Optional<BigDecimal> getAverageTicketSizeByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Get failed transaction volume.
     * Returns both count and total amount of failed transactions.
     * 
     * Performance: Uses idx_transactions_status index.
     * Target: <50ms with 500k+ transactions.
     * 
     * @return Object array: [count, totalAmount]
     */
    @Query(value = """
            SELECT 
                COUNT(*) as failed_count,
                COALESCE(SUM(amount), 0) as failed_volume
            FROM transactions
            WHERE status = 'FAILED'
            """, nativeQuery = true)
    Optional<Object[]> getFailedVolume();

    /**
     * Get failed volume for date range.
     * 
     * Performance: Uses idx_transactions_status_created_at composite index.
     */
    @Query(value = """
            SELECT 
                COUNT(*) as failed_count,
                COALESCE(SUM(amount), 0) as failed_volume
            FROM transactions
            WHERE status = 'FAILED'
              AND created_at >= :startDate 
              AND created_at <= :endDate
            """, nativeQuery = true)
    Optional<Object[]> getFailedVolumeByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // ==================== Paginated Transaction Table Queries (Day 5) ====================

    /**
     * Get paginated transactions with filters.
     * Supports filtering by user email, status, and amount range.
     * 
     * Performance: Uses indexes on user_id, status, created_at, amount.
     * Target: <500ms with 500k+ transactions.
     * 
     * @param userEmail Optional filter by user email (case-insensitive partial match)
     * @param status Optional filter by transaction status
     * @param minAmount Optional minimum amount filter
     * @param maxAmount Optional maximum amount filter
     * @param startDate Optional start date filter
     * @param endDate Optional end date filter
     * @param pageable Pagination and sorting parameters
     * @return Page of transactions with user details
     */
    @Query(value = """
            SELECT 
                t.id,
                t.user_id,
                u.email as user_email,
                u.full_name as user_name,
                t.amount,
                t.currency,
                t.type,
                t.status,
                t.payment_method,
                t.payment_provider,
                t.failure_reason,
                t.created_at
            FROM transactions t
            INNER JOIN users u ON t.user_id = u.id
            WHERE 
                (CAST(:userEmail AS VARCHAR) IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:userEmail AS VARCHAR), '%')))
                AND (CAST(:status AS VARCHAR) IS NULL OR t.status = CAST(:status AS VARCHAR))
                AND (CAST(:paymentMethod AS VARCHAR) IS NULL OR t.payment_method = CAST(:paymentMethod AS VARCHAR))
                AND (CAST(:minAmount AS NUMERIC) IS NULL OR t.amount >= CAST(:minAmount AS NUMERIC))
                AND (CAST(:maxAmount AS NUMERIC) IS NULL OR t.amount <= CAST(:maxAmount AS NUMERIC))
                AND (CAST(:startDate AS TIMESTAMP) IS NULL OR t.created_at >= CAST(:startDate AS TIMESTAMP))
                AND (CAST(:endDate AS TIMESTAMP) IS NULL OR t.created_at <= CAST(:endDate AS TIMESTAMP))
            ORDER BY t.created_at DESC
            """,
            countQuery = """
            SELECT COUNT(*)
            FROM transactions t
            INNER JOIN users u ON t.user_id = u.id
            WHERE 
                (CAST(:userEmail AS VARCHAR) IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:userEmail AS VARCHAR), '%')))
                AND (CAST(:status AS VARCHAR) IS NULL OR t.status = CAST(:status AS VARCHAR))
                AND (CAST(:paymentMethod AS VARCHAR) IS NULL OR t.payment_method = CAST(:paymentMethod AS VARCHAR))
                AND (CAST(:minAmount AS NUMERIC) IS NULL OR t.amount >= CAST(:minAmount AS NUMERIC))
                AND (CAST(:maxAmount AS NUMERIC) IS NULL OR t.amount <= CAST(:maxAmount AS NUMERIC))
                AND (CAST(:startDate AS TIMESTAMP) IS NULL OR t.created_at >= CAST(:startDate AS TIMESTAMP))
                AND (CAST(:endDate AS TIMESTAMP) IS NULL OR t.created_at <= CAST(:endDate AS TIMESTAMP))
            """,
            nativeQuery = true)
    Page<Object[]> findTransactionsWithFilters(
            @Param("userEmail") String userEmail,
            @Param("status") String status,
            @Param("paymentMethod") String paymentMethod,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    // ==================== Period Comparison Queries ====================

    /**
     * Get total transaction count for a specific period.
     */
    @Query(value = """
            SELECT COUNT(*)
            FROM transactions
            WHERE created_at >= :startDate 
              AND created_at < :endDate
            """, nativeQuery = true)
    long getTransactionCountInPeriod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Get pending transaction count for a specific period.
     */
    @Query(value = """
            SELECT COUNT(*)
            FROM transactions
            WHERE status = 'PENDING'
              AND created_at >= :startDate 
              AND created_at < :endDate
            """, nativeQuery = true)
    long getPendingCountInPeriod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Get total GTV for a specific period.
     */
    @Query(value = """
            SELECT COALESCE(SUM(amount), 0)
            FROM transactions
            WHERE status = 'SUCCESS'
              AND type = 'PAYMENT'
              AND created_at >= :startDate 
              AND created_at < :endDate
            """, nativeQuery = true)
    BigDecimal getGTVInPeriod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Get success rate for a specific period.
     */
    @Query(value = """
            SELECT 
                CASE 
                    WHEN COUNT(*) = 0 THEN 0.0
                    ELSE (COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) * 100.0 / COUNT(*))
                END
            FROM transactions
            WHERE created_at >= :startDate 
              AND created_at < :endDate
            """, nativeQuery = true)
    Double getSuccessRateInPeriod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Get average ticket size for a specific period.
     */
    @Query(value = """
            SELECT COALESCE(AVG(amount), 0)
            FROM transactions
            WHERE status = 'SUCCESS'
              AND type = 'PAYMENT'
              AND created_at >= :startDate 
              AND created_at < :endDate
            """, nativeQuery = true)
    BigDecimal getAverageTicketSizeInPeriod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Get failed volume for a specific period.
     */
    @Query(value = """
            SELECT 
                COUNT(*) as failed_count,
                COALESCE(SUM(amount), 0) as failed_volume
            FROM transactions
            WHERE status = 'FAILED'
              AND created_at >= :startDate 
              AND created_at < :endDate
            """, nativeQuery = true)
    Object[] getFailedVolumeInPeriod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * OPTIMIZED: Get all KPI metrics for a period in a SINGLE query.
     * This replaces 6 separate queries with one aggregated query.
     * Uses projection interface for type-safe result mapping.
     */
    @Query(value = """
            SELECT 
                COUNT(*) as totalTransactions,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pendingCount,
                SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as successCount,
                SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failedCount,
                COALESCE(SUM(CASE WHEN status = 'SUCCESS' AND type = 'PAYIN' THEN amount ELSE 0 END), 0) as totalGtv,
                COALESCE(AVG(CASE WHEN status = 'SUCCESS' AND type = 'PAYIN' THEN amount END), 0) as avgTicketSize,
                COALESCE(SUM(CASE WHEN status = 'FAILED' THEN amount ELSE 0 END), 0) as failedVolume,
                CASE 
                    WHEN COUNT(*) = 0 THEN 0.0
                    ELSE (SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
                END as successRate
            FROM transactions
            WHERE created_at >= :startDate 
              AND created_at < :endDate
            """, nativeQuery = true)
    com.analytics.dashboard.dto.TransactionKPIStats getAllKPIMetricsForPeriod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
