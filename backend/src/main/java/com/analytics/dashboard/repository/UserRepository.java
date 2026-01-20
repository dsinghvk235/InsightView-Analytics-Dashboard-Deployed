package com.analytics.dashboard.repository;

import com.analytics.dashboard.model.User;
import com.analytics.dashboard.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for User entity with read-only analytics queries.
 * Focuses on user statistics and filtering for analytics dashboards.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email (for authentication/lookup).
     * Uses existing idx_users_email index.
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by phone number (India-first identity).
     * Uses idx_users_phone_number index.
     */
    Optional<User> findByPhoneNumber(String phoneNumber);

    /**
     * Count active users.
     * Uses idx_users_status index.
     */
    long countByStatus(UserStatus status);

    /**
     * Find users by status.
     * Uses idx_users_status index.
     */
    List<User> findByStatus(UserStatus status);

    /**
     * Count users created in date range.
     * Uses idx_users_created_at index.
     * Query pattern: User growth analytics over time.
     */
    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find active users created in date range.
     * Uses idx_users_status_created_at composite index.
     * Query pattern: Active users registered in last N days.
     */
    @Query("SELECT u FROM User u WHERE u.status = :status AND u.createdAt >= :startDate AND u.createdAt <= :endDate ORDER BY u.createdAt DESC")
    List<User> findActiveUsersByDateRange(
            @Param("status") UserStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Get total user count.
     * Simple count query for dashboard overview.
     */
    @Query("SELECT COUNT(u) FROM User u")
    long getTotalUserCount();

    /**
     * Get user count by status.
     * Uses idx_users_status index.
     * Returns count grouped by status for analytics.
     */
    @Query("SELECT u.status, COUNT(u) FROM User u GROUP BY u.status")
    List<Object[]> getUserCountByStatus();

    /**
     * User activity over time - daily statistics.
     * Returns daily breakdown of new users, active users, and total users.
     * Query pattern: User growth trends, activity patterns over time.
     * 
     * Performance: Uses idx_users_created_at and idx_users_status indexes.
     * Returns: Date, new users count, active users count, total users count.
     */
    @Query(value = """
            SELECT 
                CAST(created_at AS DATE) as date,
                COUNT(*) as newUsers,
                SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as activeUsers,
                COUNT(*) as totalUsers
            FROM users
            WHERE created_at >= :startDate AND created_at <= :endDate
            GROUP BY CAST(created_at AS DATE)
            ORDER BY date
            """, nativeQuery = true)
    List<Object[]> getUserActivityOverTime(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Get new users registered today.
     * Optimized query for daily user acquisition metric.
     * 
     * Performance: Uses idx_users_created_at index.
     * Target: <20ms with 10k+ users.
     * 
     * @return Count of users created today
     */
    @Query(value = """
            SELECT COUNT(*) 
            FROM users
            WHERE created_at >= CURRENT_DATE
              AND created_at < CURRENT_DATE + INTERVAL '1 day'
            """, nativeQuery = true)
    long getNewUsersToday();

    /**
     * Get total user count as of a specific date.
     * Used for period-over-period comparison.
     */
    @Query(value = """
            SELECT COUNT(*) 
            FROM users
            WHERE created_at < :endDate
            """, nativeQuery = true)
    long getTotalUserCountAsOf(@Param("endDate") LocalDateTime endDate);

    /**
     * Get new users in a specific date range.
     * Used for period-over-period comparison.
     */
    @Query(value = """
            SELECT COUNT(*) 
            FROM users
            WHERE created_at >= :startDate
              AND created_at < :endDate
            """, nativeQuery = true)
    long getNewUsersInPeriod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * OPTIMIZED: Get all user KPI metrics for comparison in a SINGLE query.
     * Uses projection interface for type-safe result mapping.
     */
    @Query(value = """
            SELECT 
                SUM(CASE WHEN created_at < :endDate THEN 1 ELSE 0 END) as totalUsers,
                SUM(CASE WHEN created_at >= :startDate AND created_at < :endDate THEN 1 ELSE 0 END) as newUsers
            FROM users
            """, nativeQuery = true)
    com.analytics.dashboard.dto.UserKPIStats getUserKPIMetricsForPeriod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
