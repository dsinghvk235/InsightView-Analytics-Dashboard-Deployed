package com.analytics.dashboard.controller;

import com.analytics.dashboard.dto.request.AIInsightsRequest;
import com.analytics.dashboard.dto.response.*;
import com.analytics.dashboard.model.PaymentMethod;
import com.analytics.dashboard.model.TransactionStatus;
import com.analytics.dashboard.service.AIInsightsService;
import com.analytics.dashboard.service.AnalyticsService;
import com.analytics.dashboard.service.SearchService;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;


/**
 * REST controller for analytics endpoints.
 * Provides read-only APIs for analytics dashboard.
 * 
 * All endpoints are read-only and include comprehensive logging.
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);
    
    private final AnalyticsService analyticsService;
    private final SearchService searchService;
    private final AIInsightsService aiInsightsService;

    // Manual constructor (Lombok @RequiredArgsConstructor not processing)
    public AnalyticsController(AnalyticsService analyticsService, SearchService searchService, AIInsightsService aiInsightsService) {
        this.analyticsService = analyticsService;
        this.searchService = searchService;
        this.aiInsightsService = aiInsightsService;
    }

    /**
     * GET /api/analytics/overview
     * 
     * Returns a comprehensive dashboard overview with key business metrics.
     * This is the main endpoint for dashboard KPIs and provides a high-level summary
     * of the entire system's performance.
     * 
     * <p><b>What it returns:</b>
     * <ul>
     *   <li>Total users count (all users in the system)</li>
     *   <li>Active users count (users with ACTIVE status)</li>
     *   <li>Total transactions count (all transaction types and statuses)</li>
     *   <li>Successful transactions count (status = SUCCESS)</li>
     *   <li>Failed transactions count (status = FAILED)</li>
     *   <li>Total revenue (sum of successful PAYMENT transactions from last 30 days)</li>
     *   <li>Average transaction amount (average of successful transactions from last 30 days)</li>
     *   <li>Success rate (percentage of successful transactions out of total)</li>
     * </ul>
     * 
     * <p><b>How to use:</b>
     * <pre>
     * curl -X GET "http://localhost:8080/api/analytics/overview"
     * </pre>
     * 
     * <p><b>Response example:</b>
     * <pre>
     * {
     *   "totalUsers": 15,
     *   "activeUsers": 12,
     *   "totalTransactions": 132,
     *   "successfulTransactions": 114,
     *   "failedTransactions": 11,
     *   "totalRevenue": 13813.89,
     *   "averageTransactionAmount": 131.79,
     *   "successRate": 86.36
     * }
     * </pre>
     * 
     * <p><b>Performance:</b> Optimized for fast retrieval using indexed queries.
     * Typically executes in &lt;100ms even with large datasets.
     * 
     * <p><b>Note:</b> Revenue and average transaction amount are calculated for the
     * last 30 days only. Total counts include all historical data.
     * 
     * @return ResponseEntity containing AnalyticsOverviewResponse with all key metrics
     * @throws Exception if database query fails (returns 500 Internal Server Error)
     */
    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewResponse> getAnalyticsOverview() {
        log.info("GET /api/analytics/overview - Request received");
        long startTime = System.currentTimeMillis();

        try {
            AnalyticsOverviewResponse response = analyticsService.getAnalyticsOverview();
            
            long executionTime = System.currentTimeMillis() - startTime;
            log.info("GET /api/analytics/overview - Query executed successfully in {}ms. " +
                    "Users: {}, Transactions: {}, Revenue: {}",
                    executionTime,
                    response.getTotalUsers(),
                    response.getTotalTransactions(),
                    response.getTotalRevenue());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("GET /api/analytics/overview - Error after {}ms: {}", executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    /**
     * GET /api/analytics/transactions/by-date
     * 
     * Returns daily transaction statistics grouped by date for the specified date range.
     * This endpoint is ideal for time-series charts showing transaction trends over time.
     * 
     * <p><b>What it returns:</b>
     * <ul>
     *   <li>Date (YYYY-MM-DD format)</li>
     *   <li>Total transactions count for that day</li>
     *   <li>Total amount for that day (all transactions)</li>
     *   <li>Successful transactions count</li>
     *   <li>Successful amount (revenue from successful transactions)</li>
     *   <li>Failed transactions count</li>
     *   <li>Success rate percentage for that day</li>
     * </ul>
     * 
     * <p><b>How to use:</b>
     * <pre>
     * curl -X GET "http://localhost:8080/api/analytics/transactions/by-date?startDate=2025-01-01&endDate=2025-01-31"
     * </pre>
     * 
     * <p><b>Query Parameters:</b>
     * <ul>
     *   <li><b>startDate</b> (required): Start date in YYYY-MM-DD format (inclusive)</li>
     *   <li><b>endDate</b> (required): End date in YYYY-MM-DD format (inclusive)</li>
     * </ul>
     * 
     * <p><b>Response example:</b>
     * <pre>
     * [
     *   {
     *     "date": "2025-01-17",
     *     "totalTransactions": 12,
     *     "totalAmount": 1250.50,
     *     "successfulTransactions": 10,
     *     "successfulAmount": 1100.00,
     *     "failedTransactions": 2,
     *     "successRate": 83.33
     *   },
     *   ...
     * ]
     * </pre>
     * 
     * <p><b>Use cases:</b>
     * <ul>
     *   <li>Daily transaction volume charts</li>
     *   <li>Revenue trends over time</li>
     *   <li>Success rate trends</li>
     *   <li>Identifying peak transaction days</li>
     * </ul>
     * 
     * <p><b>Performance:</b> Uses indexed date range queries. Optimized for time-series analytics.
     * 
     * <p><b>Validation:</b>
     * <ul>
     *   <li>Returns 400 Bad Request if endDate is before startDate</li>
     *   <li>Returns empty array [] if no transactions found in date range</li>
     * </ul>
     * 
     * @param startDate Start date (inclusive) - format: YYYY-MM-DD
     * @param endDate End date (inclusive) - format: YYYY-MM-DD
     * @return ResponseEntity containing List of DailyTransactionResponse objects, one per day
     * @throws Exception if database query fails (returns 500 Internal Server Error)
     */
    @GetMapping("/transactions/by-date")
    public ResponseEntity<List<DailyTransactionResponse>> getTransactionsByDate(
            @RequestParam @NotNull LocalDate startDate,
            @RequestParam @NotNull LocalDate endDate) {
        
        log.info("GET /api/analytics/transactions/by-date - Request received. " +
                "Date range: {} to {}", startDate, endDate);
        long startTime = System.currentTimeMillis();

        // Validate date range
        if (endDate.isBefore(startDate)) {
            log.warn("GET /api/analytics/transactions/by-date - Invalid date range: " +
                    "endDate {} is before startDate {}", endDate, startDate);
            return ResponseEntity.badRequest().build();
        }

        try {
            List<DailyTransactionResponse> response = analyticsService
                    .getTransactionsByDateRange(startDate, endDate);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (response.isEmpty()) {
                log.info("GET /api/analytics/transactions/by-date - Query executed in {}ms. " +
                        "No transactions found for date range: {} to {}",
                        executionTime, startDate, endDate);
            } else {
                log.info("GET /api/analytics/transactions/by-date - Query executed in {}ms. " +
                        "Returned {} days of transaction data",
                        executionTime, response.size());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("GET /api/analytics/transactions/by-date - Error after {}ms: {}",
                    executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/analytics/transactions/by-status
     * 
     * Returns a breakdown of all transactions grouped by their status.
     * This endpoint provides insights into transaction success rates and failure patterns.
     * Useful for understanding payment processing health and identifying issues.
     * 
     * <p><b>What it returns:</b>
     * <ul>
     *   <li>Transaction status (PENDING, SUCCESS, FAILED)</li>
     *   <li>Count of transactions for each status</li>
     *   <li>Percentage of total transactions for each status</li>
     * </ul>
     * 
     * <p><b>How to use:</b>
     * <pre>
     * curl -X GET "http://localhost:8080/api/analytics/transactions/by-status"
     * </pre>
     * 
     * <p><b>No query parameters required</b> - Returns statistics for all transactions in the system.
     * 
     * <p><b>Response example:</b>
     * <pre>
     * [
     *   {
     *     "status": "SUCCESS",
     *     "count": 114,
     *     "percentage": 86.36
     *   },
     *   {
     *     "status": "FAILED",
     *     "count": 11,
     *     "percentage": 8.33
     *   },
     *   {
     *     "status": "PENDING",
     *     "count": 6,
     *     "percentage": 4.55
     *   }
     * ]
     * </pre>
     * 
     * <p><b>Use cases:</b>
     * <ul>
     *   <li>Status distribution pie charts</li>
     *   <li>Success rate monitoring</li>
     *   <li>Failure rate analysis</li>
     *   <li>Payment health dashboards</li>
     * </ul>
     * 
     * <p><b>Performance:</b> Uses indexed status queries. Very fast even with large datasets.
     * 
     * <p><b>Note:</b> Percentages are calculated based on total transaction count.
     * All percentages should sum to 100% (with rounding).
     * 
     * @return ResponseEntity containing List of TransactionStatusResponse objects, one per status
     * @throws Exception if database query fails (returns 500 Internal Server Error)
     */
    @GetMapping("/transactions/by-status")
    public ResponseEntity<List<TransactionStatusResponse>> getTransactionsByStatus(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        log.info("GET /api/analytics/transactions/by-status - Request received. Date range: {} to {}", 
                startDate, endDate);
        long startTime = System.currentTimeMillis();

        try {
            List<TransactionStatusResponse> response;
            
            // If both dates provided, use date-filtered query
            if (startDate != null && endDate != null) {
                response = analyticsService.getTransactionsByStatus(startDate, endDate);
            } else {
                response = analyticsService.getTransactionsByStatus();
            }
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (response.isEmpty()) {
                log.info("GET /api/analytics/transactions/by-status - Query executed in {}ms. " +
                        "No transactions found",
                        executionTime);
            } else {
                log.info("GET /api/analytics/transactions/by-status - Query executed in {}ms. " +
                        "Returned {} status categories",
                        executionTime, response.size());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("GET /api/analytics/transactions/by-status - Error after {}ms: {}",
                    executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/analytics/revenue/over-time
     * 
     * Returns daily revenue data over time for the specified date range.
     * This endpoint is specifically designed for revenue trend line charts.
     * Only includes successful PAYMENT transactions (excludes refunds, fees, failed transactions).
     * 
     * <p><b>What it returns:</b>
     * <ul>
     *   <li>Date (YYYY-MM-DD format)</li>
     *   <li>Revenue amount for that day (sum of successful payment amounts)</li>
     * </ul>
     * 
     * <p><b>How to use:</b>
     * <pre>
     * curl -X GET "http://localhost:8080/api/analytics/revenue/over-time?startDate=2025-01-01&endDate=2025-01-31"
     * </pre>
     * 
     * <p><b>Query Parameters:</b>
     * <ul>
     *   <li><b>startDate</b> (required): Start date in YYYY-MM-DD format (inclusive)</li>
     *   <li><b>endDate</b> (required): End date in YYYY-MM-DD format (inclusive)</li>
     * </ul>
     * 
     * <p><b>Response example:</b>
     * <pre>
     * [
     *   {
     *     "date": "2025-01-17",
     *     "revenue": 1100.50
     *   },
     *   {
     *     "date": "2025-01-16",
     *     "revenue": 850.25
     *   },
     *   ...
     * ]
     * </pre>
     * 
     * <p><b>Use cases:</b>
     * <ul>
     *   <li>Revenue trend line charts</li>
     *   <li>Daily revenue monitoring</li>
     *   <li>Revenue growth analysis</li>
     *   <li>Identifying revenue peaks and valleys</li>
     * </ul>
     * 
     * <p><b>Performance:</b> Uses optimized date-based aggregation queries with indexes.
     * Typically executes in &lt;150ms for 30-day ranges.
     * 
     * <p><b>Important notes:</b>
     * <ul>
     *   <li>Only includes transactions with status = SUCCESS and type = PAYMENT</li>
     *   <li>Excludes refunds, fees, chargebacks, and failed transactions</li>
     *   <li>Returns empty array [] if no successful payments in date range</li>
     *   <li>Days with zero revenue are included in the response</li>
     * </ul>
     * 
     * <p><b>Validation:</b>
     * <ul>
     *   <li>Returns 400 Bad Request if endDate is before startDate</li>
     * </ul>
     * 
     * @param startDate Start date (inclusive) - format: YYYY-MM-DD
     * @param endDate End date (inclusive) - format: YYYY-MM-DD
     * @return ResponseEntity containing List of RevenueOverTimeResponse objects, one per day
     * @throws Exception if database query fails (returns 500 Internal Server Error)
     */
    @GetMapping("/revenue/over-time")
    public ResponseEntity<List<RevenueOverTimeResponse>> getRevenueOverTime(
            @RequestParam @NotNull LocalDate startDate,
            @RequestParam @NotNull LocalDate endDate) {
        
        log.info("GET /api/analytics/revenue/over-time - Request received. " +
                "Date range: {} to {}", startDate, endDate);
        long startTime = System.currentTimeMillis();

        // Validate date range
        if (endDate.isBefore(startDate)) {
            log.warn("GET /api/analytics/revenue/over-time - Invalid date range: " +
                    "endDate {} is before startDate {}", endDate, startDate);
            return ResponseEntity.badRequest().build();
        }

        try {
            List<RevenueOverTimeResponse> response = analyticsService.getRevenueOverTime(startDate, endDate);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (response.isEmpty()) {
                log.info("GET /api/analytics/revenue/over-time - Query executed in {}ms. " +
                        "No revenue data found for date range: {} to {}",
                        executionTime, startDate, endDate);
            } else {
                log.info("GET /api/analytics/revenue/over-time - Query executed in {}ms. " +
                        "Returned {} days of revenue data",
                        executionTime, response.size());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("GET /api/analytics/revenue/over-time - Error after {}ms: {}",
                    executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/analytics/transactions/by-payment-method
     * 
     * Returns transaction breakdown aggregated by payment method for the specified date range.
     * This endpoint is ideal for payment method market share analysis and pie charts.
     * Shows which payment methods are most popular and their contribution to total revenue.
     * 
     * <p><b>What it returns:</b>
     * <ul>
     *   <li>Payment method (UPI, NET_BANKING, DEBIT_CARD, CREDIT_CARD, WALLET, etc.)</li>
     *   <li>Total amount processed through this payment method</li>
     *   <li>Transaction count for this payment method</li>
     *   <li>Average transaction amount for this payment method</li>
     *   <li>Percentage of total revenue from this payment method</li>
     * </ul>
     * 
     * <p><b>How to use:</b>
     * <pre>
     * curl -X GET "http://localhost:8080/api/analytics/transactions/by-payment-method?startDate=2025-01-01&endDate=2025-01-31"
     * </pre>
     * 
     * <p><b>Query Parameters:</b>
     * <ul>
     *   <li><b>startDate</b> (required): Start date in YYYY-MM-DD format (inclusive)</li>
     *   <li><b>endDate</b> (required): End date in YYYY-MM-DD format (inclusive)</li>
     * </ul>
     * 
     * <p><b>Response example:</b>
     * <pre>
     * [
     *   {
     *     "paymentMethod": "UPI",
     *     "totalAmount": 8500.75,
     *     "transactionCount": 45,
     *     "averageAmount": 188.91,
     *     "percentage": 61.5
     *   },
     *   {
     *     "paymentMethod": "CREDIT_CARD",
     *     "totalAmount": 3200.50,
     *     "transactionCount": 28,
     *     "averageAmount": 114.30,
     *     "percentage": 23.2
     *   },
     *   ...
     * ]
     * </pre>
     * 
     * <p><b>Use cases:</b>
     * <ul>
     *   <li>Payment method market share pie charts</li>
     *   <li>Identifying dominant payment methods (e.g., UPI in India)</li>
     *   <li>Payment method performance analysis</li>
     *   <li>Revenue distribution by payment type</li>
     *   <li>Average transaction value by payment method</li>
     * </ul>
     * 
     * <p><b>Performance:</b> Uses indexed payment method queries with date filters.
     * Optimized for aggregation queries. Typically executes in &lt;150ms.
     * 
     * <p><b>Important notes:</b>
     * <ul>
     *   <li>Results are sorted by totalAmount in descending order (highest revenue first)</li>
     *   <li>Includes all transaction types (PAYMENT, REFUND, etc.) and all statuses</li>
     *   <li>Percentage is calculated based on total revenue across all payment methods</li>
     *   <li>Returns empty array [] if no transactions found in date range</li>
     * </ul>
     * 
     * <p><b>Validation:</b>
     * <ul>
     *   <li>Returns 400 Bad Request if endDate is before startDate</li>
     * </ul>
     * 
     * @param startDate Start date (inclusive) - format: YYYY-MM-DD
     * @param endDate End date (inclusive) - format: YYYY-MM-DD
     * @return ResponseEntity containing List of PaymentMethodResponse objects, one per payment method
     * @throws Exception if database query fails (returns 500 Internal Server Error)
     */
    @GetMapping("/transactions/by-payment-method")
    public ResponseEntity<List<PaymentMethodResponse>> getTransactionsByPaymentMethod(
            @RequestParam @NotNull LocalDate startDate,
            @RequestParam @NotNull LocalDate endDate) {
        
        log.info("GET /api/analytics/transactions/by-payment-method - Request received. " +
                "Date range: {} to {}", startDate, endDate);
        long startTime = System.currentTimeMillis();

        // Validate date range
        if (endDate.isBefore(startDate)) {
            log.warn("GET /api/analytics/transactions/by-payment-method - Invalid date range: " +
                    "endDate {} is before startDate {}", endDate, startDate);
            return ResponseEntity.badRequest().build();
        }

        try {
            List<PaymentMethodResponse> response = analyticsService
                    .getTransactionsByPaymentMethod(startDate, endDate);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (response.isEmpty()) {
                log.info("GET /api/analytics/transactions/by-payment-method - Query executed in {}ms. " +
                        "No transactions found for date range: {} to {}",
                        executionTime, startDate, endDate);
            } else {
                log.info("GET /api/analytics/transactions/by-payment-method - Query executed in {}ms. " +
                        "Returned {} payment methods",
                        executionTime, response.size());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("GET /api/analytics/transactions/by-payment-method - Error after {}ms: {}",
                    executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/analytics/users/top-by-revenue
     * 
     * Returns the top users ranked by total revenue generated in the specified date range.
     * This endpoint helps identify VIP customers, high-value users, and top contributors to revenue.
     * Only includes successful PAYMENT transactions (excludes refunds, fees, failed transactions).
     * 
     * <p><b>What it returns:</b>
     * <ul>
     *   <li>User ID</li>
     *   <li>User full name</li>
     *   <li>User email</li>
     *   <li>Transaction count (number of successful payments by this user)</li>
     *   <li>Total revenue (sum of all successful payment amounts)</li>
     * </ul>
     * 
     * <p><b>How to use:</b>
     * <pre>
     * curl -X GET "http://localhost:8080/api/analytics/users/top-by-revenue?startDate=2025-01-01&endDate=2025-01-31&limit=10"
     * </pre>
     * 
     * <p><b>Query Parameters:</b>
     * <ul>
     *   <li><b>startDate</b> (required): Start date in YYYY-MM-DD format (inclusive)</li>
     *   <li><b>endDate</b> (required): End date in YYYY-MM-DD format (inclusive)</li>
     *   <li><b>limit</b> (optional): Maximum number of users to return (default: 10, max: 100)</li>
     * </ul>
     * 
     * <p><b>Response example:</b>
     * <pre>
     * [
     *   {
     *     "userId": 5,
     *     "userName": "David Wilson",
     *     "userEmail": "david.wilson@example.com",
     *     "transactionCount": 15,
     *     "totalRevenue": 2500.75
     *   },
     *   {
     *     "userId": 2,
     *     "userName": "Sarah Johnson",
     *     "userEmail": "sarah.johnson@example.com",
     *     "transactionCount": 12,
     *     "totalRevenue": 2100.50
     *   },
     *   ...
     * ]
     * </pre>
     * 
     * <p><b>Use cases:</b>
     * <ul>
     *   <li>VIP customer identification</li>
     *   <li>Top customer leaderboards</li>
     *   <li>Customer lifetime value analysis</li>
     *   <li>High-value user segmentation</li>
     *   <li>Revenue concentration analysis</li>
     * </ul>
     * 
     * <p><b>Performance:</b> Uses optimized JOIN queries with indexes on user_id and status.
     * Typically executes in &lt;200ms even with large user bases.
     * 
     * <p><b>Important notes:</b>
     * <ul>
     *   <li>Results are sorted by totalRevenue in descending order (highest revenue first)</li>
     *   <li>Only includes transactions with status = SUCCESS and type = PAYMENT</li>
     *   <li>Users with zero successful payments in the date range are excluded</li>
     *   <li>Returns empty array [] if no users have successful payments in date range</li>
     * </ul>
     * 
     * <p><b>Validation:</b>
     * <ul>
     *   <li>Returns 400 Bad Request if endDate is before startDate</li>
     *   <li>Returns 400 Bad Request if limit is &lt;= 0 or &gt; 100</li>
     * </ul>
     * 
     * @param startDate Start date (inclusive) - format: YYYY-MM-DD
     * @param endDate End date (inclusive) - format: YYYY-MM-DD
     * @param limit Maximum number of users to return (default: 10, max: 100)
     * @return ResponseEntity containing List of TopUserResponse objects, sorted by revenue (descending)
     * @throws Exception if database query fails (returns 500 Internal Server Error)
     */
    @GetMapping("/users/top-by-revenue")
    public ResponseEntity<List<TopUserResponse>> getTopUsersByRevenue(
            @RequestParam @NotNull LocalDate startDate,
            @RequestParam @NotNull LocalDate endDate,
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("GET /api/analytics/users/top-by-revenue - Request received. " +
                "Date range: {} to {}, limit: {}", startDate, endDate, limit);
        long startTime = System.currentTimeMillis();

        // Validate date range
        if (endDate.isBefore(startDate)) {
            log.warn("GET /api/analytics/users/top-by-revenue - Invalid date range: " +
                    "endDate {} is before startDate {}", endDate, startDate);
            return ResponseEntity.badRequest().build();
        }

        // Validate limit
        if (limit <= 0 || limit > 100) {
            log.warn("GET /api/analytics/users/top-by-revenue - Invalid limit: {}. " +
                    "Must be between 1 and 100", limit);
            return ResponseEntity.badRequest().build();
        }

        try {
            List<TopUserResponse> response = analyticsService.getTopUsersByRevenue(startDate, endDate, limit);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (response.isEmpty()) {
                log.info("GET /api/analytics/users/top-by-revenue - Query executed in {}ms. " +
                        "No users found for date range: {} to {}",
                        executionTime, startDate, endDate);
            } else {
                log.info("GET /api/analytics/users/top-by-revenue - Query executed in {}ms. " +
                        "Returned {} top users",
                        executionTime, response.size());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("GET /api/analytics/users/top-by-revenue - Error after {}ms: {}",
                    executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/analytics/conversion-funnel
     * 
     * Returns conversion funnel data showing transaction progression through different stages.
     * This endpoint helps identify drop-off points in the payment process and understand
     * how many transactions succeed vs fail at each stage.
     * 
     * <p><b>What it returns:</b>
     * <ul>
     *   <li>Transaction status/stage (PENDING, SUCCESS, FAILED)</li>
     *   <li>Count of transactions at each stage</li>
     *   <li>Percentage of total transactions at each stage</li>
     * </ul>
     * 
     * <p><b>How to use:</b>
     * <pre>
     * curl -X GET "http://localhost:8080/api/analytics/conversion-funnel?startDate=2025-01-01&endDate=2025-01-31"
     * </pre>
     * 
     * <p><b>Query Parameters:</b>
     * <ul>
     *   <li><b>startDate</b> (required): Start date in YYYY-MM-DD format (inclusive)</li>
     *   <li><b>endDate</b> (required): End date in YYYY-MM-DD format (inclusive)</li>
     * </ul>
     * 
     * <p><b>Response example:</b>
     * <pre>
     * [
     *   {
     *     "stage": "PENDING",
     *     "count": 6,
     *     "percentage": 4.55
     *   },
     *   {
     *     "stage": "SUCCESS",
     *     "count": 114,
     *     "percentage": 86.36
     *   },
     *   {
     *     "stage": "FAILED",
     *     "count": 11,
     *     "percentage": 8.33
     *   }
     * ]
     * </pre>
     * 
     * <p><b>Use cases:</b>
     * <ul>
     *   <li>Conversion funnel visualization</li>
     *   <li>Payment success rate analysis</li>
     *   <li>Identifying drop-off points in payment flow</li>
     *   <li>Failure rate monitoring</li>
     *   <li>Payment process optimization</li>
     * </ul>
     * 
     * <p><b>Performance:</b> Uses indexed status and date queries with aggregation.
     * Typically executes in &lt;100ms for date ranges up to 90 days.
     * 
     * <p><b>Important notes:</b>
     * <ul>
     *   <li>Results are ordered by funnel stage: PENDING → SUCCESS → FAILED</li>
     *   <li>Includes all transaction types (PAYIN, PAYOUT, REFUND)</li>
     *   <li>Percentage is calculated based on total transactions in the date range</li>
     *   <li>All percentages should sum to 100% (with rounding)</li>
     *   <li>Returns empty array [] if no transactions found in date range</li>
     * </ul>
     * 
     * <p><b>Conversion Funnel Interpretation:</b>
     * <ul>
     *   <li><b>PENDING:</b> Transactions initiated but not yet completed</li>
     *   <li><b>SUCCESS:</b> Successfully completed transactions (desired outcome)</li>
     *   <li><b>FAILED:</b> Transactions that failed during processing</li>
     * </ul>
     * 
     * <p><b>Validation:</b>
     * <ul>
     *   <li>Returns 400 Bad Request if endDate is before startDate</li>
     * </ul>
     * 
     * @param startDate Start date (inclusive) - format: YYYY-MM-DD
     * @param endDate End date (inclusive) - format: YYYY-MM-DD
     * @return ResponseEntity containing List of ConversionFunnelResponse objects, one per status/stage
     * @throws Exception if database query fails (returns 500 Internal Server Error)
     */
    @GetMapping("/conversion-funnel")
    public ResponseEntity<List<ConversionFunnelResponse>> getConversionFunnel(
            @RequestParam @NotNull LocalDate startDate,
            @RequestParam @NotNull LocalDate endDate) {
        
        log.info("GET /api/analytics/conversion-funnel - Request received. " +
                "Date range: {} to {}", startDate, endDate);
        long startTime = System.currentTimeMillis();

        // Validate date range
        if (endDate.isBefore(startDate)) {
            log.warn("GET /api/analytics/conversion-funnel - Invalid date range: " +
                    "endDate {} is before startDate {}", endDate, startDate);
            return ResponseEntity.badRequest().build();
        }

        try {
            List<ConversionFunnelResponse> response = analyticsService.getConversionFunnel(startDate, endDate);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (response.isEmpty()) {
                log.info("GET /api/analytics/conversion-funnel - Query executed in {}ms. " +
                        "No transactions found for date range: {} to {}",
                        executionTime, startDate, endDate);
            } else {
                log.info("GET /api/analytics/conversion-funnel - Query executed in {}ms. " +
                        "Returned {} funnel stages",
                        executionTime, response.size());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("GET /api/analytics/conversion-funnel - Error after {}ms: {}",
                    executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/analytics/transactions/refund-chargeback
     * 
     * Returns refund and payout analysis for the specified date range.
     * This endpoint helps identify financial risks, refund patterns, and payout trends.
     * Critical for understanding revenue impact from refunds and payouts.
     * 
     * <p><b>What it returns:</b>
     * <ul>
     *   <li>Transaction type (REFUND or PAYOUT)</li>
     *   <li>Transaction count for each type</li>
     *   <li>Total amount for each type</li>
     *   <li>Average transaction amount for each type</li>
     *   <li>Percentage of total transactions for each type</li>
     * </ul>
     * 
     * <p><b>How to use:</b>
     * <pre>
     * curl -X GET "http://localhost:8080/api/analytics/transactions/refund-chargeback?startDate=2025-01-01&endDate=2025-01-31"
     * </pre>
     * 
     * <p><b>Query Parameters:</b>
     * <ul>
     *   <li><b>startDate</b> (required): Start date in YYYY-MM-DD format (inclusive)</li>
     *   <li><b>endDate</b> (required): End date in YYYY-MM-DD format (inclusive)</li>
     * </ul>
     * 
     * <p><b>Response example:</b>
     * <pre>
     * [
     *   {
     *     "transactionType": "PAYOUT",
     *     "transactionCount": 5,
     *     "totalAmount": 450.00,
     *     "averageAmount": 90.00,
     *     "percentageOfTotal": 3.79
     *   },
     *   {
     *     "transactionType": "REFUND",
     *     "transactionCount": 12,
     *     "totalAmount": 1200.50,
     *     "averageAmount": 100.04,
     *     "percentageOfTotal": 9.09
     *   }
     * ]
     * </pre>
     * 
     * <p><b>Use cases:</b>
     * <ul>
     *   <li>Financial risk analysis</li>
     *   <li>Refund trend monitoring</li>
     *   <li>Payout rate tracking</li>
     *   <li>Revenue impact assessment</li>
     *   <li>Fraud pattern identification</li>
     * </ul>
     * 
     * <p><b>Performance:</b> Uses indexed type and date queries with aggregation.
     * Typically executes in &lt;100ms.
     * 
     * <p><b>Important notes:</b>
     * <ul>
     *   <li>Only includes transactions with type = REFUND or PAYOUT</li>
     *   <li>Percentage is calculated based on total transactions in the system (all time)</li>
     *   <li>Results are sorted by transaction type</li>
     *   <li>Returns empty array [] if no refunds or payouts found in date range</li>
     * </ul>
     * 
     * <p><b>Validation:</b>
     * <ul>
     *   <li>Returns 400 Bad Request if endDate is before startDate</li>
     * </ul>
     * 
     * @param startDate Start date (inclusive) - format: YYYY-MM-DD
     * @param endDate End date (inclusive) - format: YYYY-MM-DD
     * @return ResponseEntity containing List of RefundChargebackResponse objects, one per transaction type
     * @throws Exception if database query fails (returns 500 Internal Server Error)
     */
    @GetMapping("/transactions/refund-chargeback")
    public ResponseEntity<List<RefundChargebackResponse>> getRefundChargebackAnalysis(
            @RequestParam @NotNull LocalDate startDate,
            @RequestParam @NotNull LocalDate endDate) {
        
        log.info("GET /api/analytics/transactions/refund-chargeback - Request received. " +
                "Date range: {} to {}", startDate, endDate);
        long startTime = System.currentTimeMillis();

        // Validate date range
        if (endDate.isBefore(startDate)) {
            log.warn("GET /api/analytics/transactions/refund-chargeback - Invalid date range: " +
                    "endDate {} is before startDate {}", endDate, startDate);
            return ResponseEntity.badRequest().build();
        }

        try {
            List<RefundChargebackResponse> response = analyticsService
                    .getRefundChargebackAnalysis(startDate, endDate);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (response.isEmpty()) {
                log.info("GET /api/analytics/transactions/refund-chargeback - Query executed in {}ms. " +
                        "No refunds or chargebacks found for date range: {} to {}",
                        executionTime, startDate, endDate);
            } else {
                log.info("GET /api/analytics/transactions/refund-chargeback - Query executed in {}ms. " +
                        "Returned {} transaction types",
                        executionTime, response.size());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("GET /api/analytics/transactions/refund-chargeback - Error after {}ms: {}",
                    executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/analytics/users/activity-over-time
     * 
     * Returns user activity statistics over time for the specified date range.
     * This endpoint tracks user growth, daily registrations, and active user trends.
     * Essential for understanding user acquisition and engagement patterns.
     * 
     * <p><b>What it returns:</b>
     * <ul>
     *   <li>Date (YYYY-MM-DD format)</li>
     *   <li>New users count (users registered on that day)</li>
     *   <li>Active users count (users with ACTIVE status registered on that day)</li>
     *   <li>Total users count (cumulative total users up to that date)</li>
     * </ul>
     * 
     * <p><b>How to use:</b>
     * <pre>
     * curl -X GET "http://localhost:8080/api/analytics/users/activity-over-time?startDate=2025-01-01&endDate=2025-01-31"
     * </pre>
     * 
     * <p><b>Query Parameters:</b>
     * <ul>
     *   <li><b>startDate</b> (required): Start date in YYYY-MM-DD format (inclusive)</li>
     *   <li><b>endDate</b> (required): End date in YYYY-MM-DD format (inclusive)</li>
     * </ul>
     * 
     * <p><b>Response example:</b>
     * <pre>
     * [
     *   {
     *     "date": "2025-01-01",
     *     "newUsers": 3,
     *     "activeUsers": 2,
     *     "totalUsers": 15
     *   },
     *   {
     *     "date": "2025-01-02",
     *     "newUsers": 5,
     *     "activeUsers": 4,
     *     "totalUsers": 20
     *   },
     *   ...
     * ]
     * </pre>
     * 
     * <p><b>Use cases:</b>
     * <ul>
     *   <li>User growth trend charts</li>
     *   <li>Daily registration monitoring</li>
     *   <li>Active user trend analysis</li>
     *   <li>User acquisition campaigns effectiveness</li>
     *   <li>Cumulative user base tracking</li>
     * </ul>
     * 
     * <p><b>Performance:</b> Uses indexed date queries with aggregation.
     * Typically executes in &lt;150ms for 30-day ranges.
     * 
     * <p><b>Important notes:</b>
     * <ul>
     *   <li>Only includes days where users were registered (days with zero registrations are excluded)</li>
     *   <li>Total users is cumulative (running total up to that date)</li>
     *   <li>Active users count only includes users registered on that specific day with ACTIVE status</li>
     *   <li>Results are sorted by date in ascending order</li>
     *   <li>Returns empty array [] if no user registrations found in date range</li>
     * </ul>
     * 
     * <p><b>Validation:</b>
     * <ul>
     *   <li>Returns 400 Bad Request if endDate is before startDate</li>
     * </ul>
     * 
     * @param startDate Start date (inclusive) - format: YYYY-MM-DD
     * @param endDate End date (inclusive) - format: YYYY-MM-DD
     * @return ResponseEntity containing List of UserActivityResponse objects, one per day
     * @throws Exception if database query fails (returns 500 Internal Server Error)
     */
    @GetMapping("/users/activity-over-time")
    public ResponseEntity<List<UserActivityResponse>> getUserActivityOverTime(
            @RequestParam @NotNull LocalDate startDate,
            @RequestParam @NotNull LocalDate endDate) {
        
        log.info("GET /api/analytics/users/activity-over-time - Request received. " +
                "Date range: {} to {}", startDate, endDate);
        long startTime = System.currentTimeMillis();

        // Validate date range
        if (endDate.isBefore(startDate)) {
            log.warn("GET /api/analytics/users/activity-over-time - Invalid date range: " +
                    "endDate {} is before startDate {}", endDate, startDate);
            return ResponseEntity.badRequest().build();
        }

        try {
            List<UserActivityResponse> response = analyticsService.getUserActivityOverTime(startDate, endDate);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (response.isEmpty()) {
                log.info("GET /api/analytics/users/activity-over-time - Query executed in {}ms. " +
                        "No user activity found for date range: {} to {}",
                        executionTime, startDate, endDate);
            } else {
                log.info("GET /api/analytics/users/activity-over-time - Query executed in {}ms. " +
                        "Returned {} days of user activity data",
                        executionTime, response.size());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("GET /api/analytics/users/activity-over-time - Error after {}ms: {}",
                    executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/analytics/transactions/by-hour
     * 
     * Returns hourly transaction statistics for the specified date range.
     * This endpoint is designed for hour-of-day transaction heatmaps and peak traffic analysis.
     * Critical for infrastructure planning, capacity management, and identifying peak usage hours.
     * 
     * <p><b>What it returns:</b>
     * <ul>
     *   <li>Hour (0-23 in 24-hour format)</li>
     *   <li>Transaction count for that hour</li>
     *   <li>Total amount for that hour (all transactions)</li>
     *   <li>Successful transactions count</li>
     *   <li>Successful amount (revenue from successful transactions)</li>
     *   <li>Success rate percentage for that hour</li>
     * </ul>
     * 
     * <p><b>How to use:</b>
     * <pre>
     * curl -X GET "http://localhost:8080/api/analytics/transactions/by-hour?startDate=2025-01-01&endDate=2025-01-31"
     * </pre>
     * 
     * <p><b>Query Parameters:</b>
     * <ul>
     *   <li><b>startDate</b> (required): Start date in YYYY-MM-DD format (inclusive)</li>
     *   <li><b>endDate</b> (required): End date in YYYY-MM-DD format (inclusive)</li>
     * </ul>
     * 
     * <p><b>Response example:</b>
     * <pre>
     * [
     *   {
     *     "hour": 0,
     *     "transactionCount": 5,
     *     "totalAmount": 450.00,
     *     "successfulTransactions": 4,
     *     "successfulAmount": 400.00,
     *     "successRate": 80.0
     *   },
     *   {
     *     "hour": 1,
     *     "transactionCount": 3,
     *     "totalAmount": 250.50,
     *     "successfulTransactions": 3,
     *     "successfulAmount": 250.50,
     *     "successRate": 100.0
     *   },
     *   ...
     *   {
     *     "hour": 14,
     *     "transactionCount": 45,
     *     "totalAmount": 5500.75,
     *     "successfulTransactions": 42,
     *     "successfulAmount": 5200.00,
     *     "successRate": 93.33
     *   },
     *   ...
     * ]
     * </pre>
     * 
     * <p><b>Use cases:</b>
     * <ul>
     *   <li>Hour-of-day transaction heatmaps</li>
     *   <li>Peak traffic hours identification</li>
     *   <li>Infrastructure planning and capacity management</li>
     *   <li>Load balancing optimization</li>
     *   <li>Identifying low-traffic hours for maintenance</li>
     *   <li>Time-based marketing campaign planning</li>
     *   <li>Success rate patterns by hour</li>
     * </ul>
     * 
     * <p><b>Performance:</b> Uses indexed date queries with hour extraction and aggregation.
     * Typically executes in &lt;150ms for 30-day ranges.
     * 
     * <p><b>Important notes:</b>
     * <ul>
     *   <li>Hours are in 24-hour format (0 = midnight, 23 = 11 PM)</li>
     *   <li>Results are sorted by hour in ascending order (0-23)</li>
     *   <li>Only includes hours that have transactions (hours with zero transactions are excluded)</li>
     *   <li>Data is aggregated across all days in the date range</li>
     *   <li>Success rate is calculated per hour</li>
     *   <li>Returns empty array [] if no transactions found in date range</li>
     * </ul>
     * 
     * <p><b>Infrastructure Planning Insights:</b>
     * <ul>
     *   <li>Identify peak hours for scaling resources</li>
     *   <li>Plan maintenance windows during low-traffic hours</li>
     *   <li>Optimize auto-scaling policies based on hourly patterns</li>
     *   <li>Allocate support resources during high-traffic periods</li>
     * </ul>
     * 
     * <p><b>Validation:</b>
     * <ul>
     *   <li>Returns 400 Bad Request if endDate is before startDate</li>
     * </ul>
     * 
     * @param startDate Start date (inclusive) - format: YYYY-MM-DD
     * @param endDate End date (inclusive) - format: YYYY-MM-DD
     * @return ResponseEntity containing List of HourlyTransactionResponse objects, one per hour (0-23)
     * @throws Exception if database query fails (returns 500 Internal Server Error)
     */
    @GetMapping("/transactions/by-hour")
    public ResponseEntity<List<HourlyTransactionResponse>> getHourlyTransactionStats(
            @RequestParam @NotNull LocalDate startDate,
            @RequestParam @NotNull LocalDate endDate) {
        
        log.info("GET /api/analytics/transactions/by-hour - Request received. " +
                "Date range: {} to {}", startDate, endDate);
        long startTime = System.currentTimeMillis();

        // Validate date range
        if (endDate.isBefore(startDate)) {
            log.warn("GET /api/analytics/transactions/by-hour - Invalid date range: " +
                    "endDate {} is before startDate {}", endDate, startDate);
            return ResponseEntity.badRequest().build();
        }

        try {
            List<HourlyTransactionResponse> response = analyticsService
                    .getHourlyTransactionStats(startDate, endDate);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (response.isEmpty()) {
                log.info("GET /api/analytics/transactions/by-hour - Query executed in {}ms. " +
                        "No transactions found for date range: {} to {}",
                        executionTime, startDate, endDate);
            } else {
                log.info("GET /api/analytics/transactions/by-hour - Query executed in {}ms. " +
                        "Returned {} hours of transaction data",
                        executionTime, response.size());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("GET /api/analytics/transactions/by-hour - Error after {}ms: {}",
                    executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/analytics/kpis
     * 
     * Returns all 8 critical KPI metrics optimized for performance.
     * These queries are designed to execute in <300ms with 500k+ transactions.
     * 
     * <p><b>What it returns:</b>
     * <ul>
     *   <li><b>totalUsers:</b> Total count of all users in the system</li>
     *   <li><b>totalTransactions:</b> Total count of all transactions</li>
     *   <li><b>newUsersToday:</b> Count of users registered today</li>
     *   <li><b>pendingTransactions:</b> Count of transactions with PENDING status</li>
     *   <li><b>totalGTV:</b> Gross Transaction Value (sum of successful PAYMENT transactions)</li>
     *   <li><b>successRate:</b> Percentage of successful transactions (0.0 to 100.0)</li>
     *   <li><b>averageTicketSize:</b> Average transaction amount for successful payments</li>
     *   <li><b>failedTransactionCount:</b> Count of failed transactions</li>
     *   <li><b>failedVolume:</b> Total amount of failed transactions</li>
     * </ul>
     * 
     * <p><b>How to use:</b>
     * <pre>
     * curl -X GET "http://localhost:8080/api/analytics/kpis"
     * </pre>
     * 
     * <p><b>Query Parameters:</b>
     * <ul>
     *   <li><b>startDate</b> (optional): Start date in YYYY-MM-DD format for date-filtered KPIs</li>
     *   <li><b>endDate</b> (optional): End date in YYYY-MM-DD format for date-filtered KPIs</li>
     * </ul>
     * 
     * <p><b>Response example:</b>
     * <pre>
     * {
     *   "totalUsers": 5000,
     *   "totalTransactions": 500000,
     *   "newUsersToday": 25,
     *   "pendingTransactions": 40000,
     *   "totalGTV": 12500000.50,
     *   "successRate": 75.25,
     *   "averageTicketSize": 250.75,
     *   "failedTransactionCount": 75000,
     *   "failedVolume": 1875000.00
     * }
     * </pre>
     * 
     * <p><b>Use cases:</b>
     * <ul>
     *   <li>Dashboard KPI cards</li>
     *   <li>Real-time metrics monitoring</li>
     *   <li>Performance benchmarking</li>
     *   <li>Business health indicators</li>
     * </ul>
     * 
     * <p><b>Performance:</b>
     * <ul>
     *   <li>All queries optimized for <300ms execution</li>
     *   <li>Uses indexed queries for fast retrieval</li>
     *   <li>Designed for 500k+ transaction datasets</li>
     *   <li>Leverages composite indexes for multi-column filters</li>
     * </ul>
     * 
     * <p><b>Query Optimizations:</b>
     * <ul>
     *   <li>Total Users: Primary key index scan (~5ms)</li>
     *   <li>Total Transactions: Primary key index scan (~30ms)</li>
     *   <li>New Users Today: idx_users_created_at (~15ms)</li>
     *   <li>Pending Transactions: idx_transactions_status (~20ms)</li>
     *   <li>Total GTV: idx_transactions_status + type (~80ms)</li>
     *   <li>Success Rate: idx_transactions_status (~60ms)</li>
     *   <li>Average Ticket Size: idx_transactions_status + type (~70ms)</li>
     *   <li>Failed Volume: idx_transactions_status (~35ms)</li>
     * </ul>
     * 
     * <p><b>Important notes:</b>
     * <ul>
     *   <li>Total GTV only includes SUCCESS + PAYMENT transactions (excludes refunds, fees, chargebacks)</li>
     *   <li>Success rate is calculated as: (SUCCESS count / Total count) * 100</li>
     *   <li>Average ticket size is calculated for successful payments only</li>
     *   <li>If date range is provided, metrics are filtered by date (except totalUsers which is all-time)</li>
     * </ul>
     * 
     * @param startDate Optional start date for date-filtered KPIs (YYYY-MM-DD)
     * @param endDate Optional end date for date-filtered KPIs (YYYY-MM-DD)
     * @return ResponseEntity containing KPIResponse with all 8 metrics
     * @throws Exception if database query fails (returns 500 Internal Server Error)
     */
    @GetMapping("/kpis")
    public ResponseEntity<KPIResponse> getKPIMetrics(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        
        log.info("GET /api/analytics/kpis - Request received. " +
                "Date range: {} to {}", 
                startDate != null ? startDate : "all time",
                endDate != null ? endDate : "all time");
        long startTime = System.currentTimeMillis();

        // Validate date range if both provided
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            log.warn("GET /api/analytics/kpis - Invalid date range: " +
                    "endDate {} is before startDate {}", endDate, startDate);
            return ResponseEntity.badRequest().build();
        }

        try {
            KPIResponse response;
            
            if (startDate != null && endDate != null) {
                response = analyticsService.getKPIMetricsByDateRange(startDate, endDate);
            } else {
                response = analyticsService.getKPIMetrics();
            }
            
            long executionTime = System.currentTimeMillis() - startTime;
            log.info("GET /api/analytics/kpis - Query executed successfully in {}ms. " +
                    "Users: {}, Transactions: {}, GTV: {}, Success Rate: {}%",
                    executionTime,
                    response.getTotalUsers(),
                    response.getTotalTransactions(),
                    response.getTotalGTV(),
                    response.getSuccessRate());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("GET /api/analytics/kpis - Error after {}ms: {}",
                    executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/analytics/kpis/comparison
     * 
     * Returns KPI metrics with period-over-period percentage changes.
     * Compares current period vs previous period of same length.
     * 
     * <p><b>What it returns:</b>
     * All KPI metrics plus percentage change for each metric:
     * <ul>
     *   <li><b>totalUsers, totalUsersChange</b>: Total registered users and % change</li>
     *   <li><b>totalTransactions, totalTransactionsChange</b>: Transaction count in period and % change</li>
     *   <li><b>newUsersToday, newUsersTodayChange</b>: New users in period and % change</li>
     *   <li><b>pendingTransactions, pendingTransactionsChange</b>: Pending transactions and % change</li>
     *   <li><b>totalGTV, totalGTVChange</b>: Gross Transaction Value and % change</li>
     *   <li><b>successRate, successRateChange</b>: Success rate and point change</li>
     *   <li><b>averageTicketSize, averageTicketSizeChange</b>: Avg ticket size and % change</li>
     *   <li><b>failedVolume, failedVolumeChange</b>: Failed transaction volume and % change</li>
     *   <li><b>currentPeriod, previousPeriod</b>: Period descriptions</li>
     * </ul>
     * 
     * <p><b>Query Parameters:</b>
     * <ul>
     *   <li><b>periodDays</b> (optional, default: 30): Number of days for comparison period</li>
     * </ul>
     * 
     * <p><b>How to use:</b>
     * <pre>
     * # Default 30-day comparison
     * curl "http://localhost:8080/api/analytics/kpis/comparison"
     * 
     * # 7-day comparison (week over week)
     * curl "http://localhost:8080/api/analytics/kpis/comparison?periodDays=7"
     * </pre>
     * 
     * @param periodDays Number of days for each comparison period (default: 30)
     * @return KPIComparisonResponse with values and percentage changes
     */
    @GetMapping("/kpis/comparison")
    public ResponseEntity<KPIComparisonResponse> getKPIComparison(
            @RequestParam(required = false, defaultValue = "30") Integer periodDays) {
        
        log.info("GET /api/analytics/kpis/comparison - Request received. Period: {} days", periodDays);
        long startTime = System.currentTimeMillis();

        try {
            KPIComparisonResponse response = analyticsService.getKPIWithComparison(periodDays);
            
            long executionTime = System.currentTimeMillis() - startTime;
            log.info("GET /api/analytics/kpis/comparison - Query executed successfully in {}ms", executionTime);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("GET /api/analytics/kpis/comparison - Error after {}ms: {}",
                    executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/analytics/transactions/table
     * 
     * Returns paginated transaction table with filtering support.
     * Designed for transaction table UI with server-side pagination and filtering.
     * 
     * <p><b>What it returns:</b>
     * <ul>
     *   <li><b>transactions:</b> List of transaction objects with user details</li>
     *   <li><b>currentPage:</b> Current page number (0-indexed)</li>
     *   <li><b>pageSize:</b> Number of items per page</li>
     *   <li><b>totalElements:</b> Total number of transactions matching filters</li>
     *   <li><b>totalPages:</b> Total number of pages</li>
     *   <li><b>hasNext:</b> Whether there is a next page</li>
     *   <li><b>hasPrevious:</b> Whether there is a previous page</li>
     * </ul>
     * 
     * <p><b>Query Parameters:</b>
     * <ul>
     *   <li><b>page</b> (optional, default: 0): Page number (0-indexed)</li>
     *   <li><b>size</b> (optional, default: 20): Page size (max: 100)</li>
     *   <li><b>email</b> (optional): Filter by user email (partial match, case-insensitive)</li>
     *   <li><b>status</b> (optional): Filter by transaction status (PENDING, SUCCESS, FAILED)</li>
     *   <li><b>paymentMethod</b> (optional): Filter by payment method (UPI, CREDIT_CARD, WALLETS)</li>
     *   <li><b>minAmount</b> (optional): Minimum transaction amount</li>
     *   <li><b>maxAmount</b> (optional): Maximum transaction amount</li>
     *   <li><b>startDate</b> (optional): Start date filter (YYYY-MM-DD)</li>
     *   <li><b>endDate</b> (optional): End date filter (YYYY-MM-DD)</li>
     *   <li><b>sortBy</b> (optional, default: createdAt): Field to sort by</li>
     *   <li><b>sortDir</b> (optional, default: DESC): Sort direction (ASC/DESC)</li>
     * </ul>
     * 
     * <p><b>How to use:</b>
     * <pre>
     * # Get first page (20 items)
     * curl "http://localhost:8080/api/analytics/transactions/table?page=0&size=20"
     * 
     * # Filter by email and status
     * curl "http://localhost:8080/api/analytics/transactions/table?email=john&status=SUCCESS"
     * 
     * # Filter by amount range
     * curl "http://localhost:8080/api/analytics/transactions/table?minAmount=100&maxAmount=1000"
     * 
     * # Filter by date range
     * curl "http://localhost:8080/api/analytics/transactions/table?startDate=2024-12-18&endDate=2025-01-17"
     * 
     * # Combined filters
     * curl "http://localhost:8080/api/analytics/transactions/table?email=john&status=SUCCESS&minAmount=100&page=0&size=20"
     * </pre>
     * 
     * <p><b>Response example:</b>
     * <pre>
     * {
     *   "transactions": [
     *     {
     *       "id": 1,
     *       "userId": 123,
     *       "userEmail": "user@example.com",
     *       "userName": "John Doe",
     *       "amount": 250.50,
     *       "currency": "INR",
     *       "type": "PAYMENT",
     *       "status": "SUCCESS",
     *       "paymentMethod": "UPI",
     *       "paymentProvider": "PhonePe",
     *       "failureReason": null,
     *       "createdAt": "2025-01-17T10:30:00"
     *     }
     *   ],
     *   "currentPage": 0,
     *   "pageSize": 20,
     *   "totalElements": 500000,
     *   "totalPages": 25000,
     *   "hasNext": true,
     *   "hasPrevious": false
     * }
     * </pre>
     * 
     * <p><b>Use cases:</b>
     * <ul>
     *   <li>Transaction table with pagination</li>
     *   <li>Search transactions by user email</li>
     *   <li>Filter by status (pending, success, failed)</li>
     *   <li>Filter by amount range</li>
     *   <li>Date range filtering</li>
     *   <li>Combined filtering and sorting</li>
     * </ul>
     * 
     * <p><b>Performance:</b>
     * <ul>
     *   <li>Target: <500ms with 500k+ transactions</li>
     *   <li>Uses indexed queries for fast filtering</li>
     *   <li>Server-side pagination (efficient for large datasets)</li>
     *   <li>Leverages database indexes on user_id, status, created_at, amount</li>
     * </ul>
     * 
     * <p><b>Important notes:</b>
     * <ul>
     *   <li>Email filter uses partial match (LIKE) - case-insensitive</li>
     *   <li>Amount filters are inclusive (>= minAmount, <= maxAmount)</li>
     *   <li>Date filters are inclusive (startDate <= date <= endDate)</li>
     *   <li>Default sort is by createdAt DESC (most recent first)</li>
     *   <li>Maximum page size is 100 to prevent performance issues</li>
     * </ul>
     * 
     * @param page Page number (0-indexed, default: 0)
     * @param size Page size (default: 20, max: 100)
     * @param email Optional user email filter (partial match)
     * @param status Optional transaction status filter
     * @param minAmount Optional minimum amount filter
     * @param maxAmount Optional maximum amount filter
     * @param startDate Optional start date filter (YYYY-MM-DD)
     * @param endDate Optional end date filter (YYYY-MM-DD)
     * @param sortBy Optional sort field (default: createdAt)
     * @param sortDir Optional sort direction (ASC/DESC, default: DESC)
     * @return ResponseEntity containing PaginatedTransactionResponse
     */
    @GetMapping("/transactions/table")
    public ResponseEntity<PaginatedTransactionResponse> getPaginatedTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir) {
        
        log.info("GET /api/analytics/transactions/table - Request received. " +
                "Page: {}, Size: {}, Filters: email={}, status={}, paymentMethod={}, amount=[{}, {}], dates=[{}, {}]",
                page, size, email, status, paymentMethod, minAmount, maxAmount, startDate, endDate);
        long startTime = System.currentTimeMillis();

        // Validate amount range
        if (minAmount != null && maxAmount != null && minAmount.compareTo(maxAmount) > 0) {
            log.warn("GET /api/analytics/transactions/table - Invalid amount range: " +
                    "minAmount {} is greater than maxAmount {}", minAmount, maxAmount);
            return ResponseEntity.badRequest().build();
        }

        // Validate date range
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            log.warn("GET /api/analytics/transactions/table - Invalid date range: " +
                    "endDate {} is before startDate {}", endDate, startDate);
            return ResponseEntity.badRequest().build();
        }

        try {
            PaginatedTransactionResponse response = analyticsService.getPaginatedTransactions(
                    email, status, paymentMethod, minAmount, maxAmount,
                    startDate, endDate, page, size, sortBy, sortDir
            );
            
            long executionTime = System.currentTimeMillis() - startTime;
            log.info("GET /api/analytics/transactions/table - Query executed successfully in {}ms. " +
                    "Returned {} transactions (page {} of {}, total: {})",
                    executionTime,
                    response.getTransactions().size(),
                    response.getCurrentPage(),
                    response.getTotalPages(),
                    response.getTotalElements());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("GET /api/analytics/transactions/table - Error after {}ms: {}",
                    executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ==================== Analytics Search ====================

    /**
     * GET /api/analytics/search
     * 
     * Search for analytics insights using keyword-based matching.
     * This is a rule-based search that maps user keywords to predefined analytics queries.
     * NOT a full-text search or NLP-based search.
     * 
     * <p><b>What it returns:</b>
     * <ul>
     *   <li>query: The original search query</li>
     *   <li>matchedInsight: The type of analytics insight that matched</li>
     *   <li>title: Human-readable title of the matched insight</li>
     *   <li>description: Description of what this insight shows</li>
     *   <li>data: The actual analytics data (structure varies by insight type)</li>
     * </ul>
     * 
     * <p><b>Supported Keywords:</b>
     * <ul>
     *   <li>"failed", "failure" → Failed Transactions Summary</li>
     *   <li>"revenue", "amount", "gtv" → Revenue Summary</li>
     *   <li>"top users", "vip", "best customers" → Top Users by Revenue</li>
     *   <li>"payment", "upi", "card", "wallet", "currency" → Payment Method Breakdown</li>
     *   <li>"status", "pending" → Transaction Status Overview</li>
     *   <li>"success rate", "conversion" → Success Rate Analytics</li>
     *   <li>"daily", "trend", "history" → Daily Transaction Trends</li>
     *   <li>"overview", "summary", "dashboard" → Analytics Overview</li>
     * </ul>
     * 
     * <p><b>How to use:</b>
     * <pre>
     * # Search for failed transactions in last 7 days
     * curl "http://localhost:8080/api/analytics/search?q=failed%20transactions&range=7d"
     * 
     * # Search for revenue summary in last 30 days
     * curl "http://localhost:8080/api/analytics/search?q=revenue&range=30d"
     * 
     * # Search with custom period (45 days)
     * curl "http://localhost:8080/api/analytics/search?q=top%20users&range=custom&days=45"
     * </pre>
     * 
     * <p><b>Query Parameters:</b>
     * <ul>
     *   <li><b>q</b> (required): Search query string</li>
     *   <li><b>range</b> (optional, default: 7d): Date range - "7d", "30d", "90d", or "custom"</li>
     *   <li><b>days</b> (optional): Custom number of days when range=custom (default: 30)</li>
     * </ul>
     * 
     * <p><b>Response example (matched):</b>
     * <pre>
     * {
     *   "query": "failed transactions",
     *   "matchedInsight": "FAILED_TRANSACTIONS_SUMMARY",
     *   "title": "Failed Transactions Summary",
     *   "description": "Summary of failed transactions including count and percentage for the selected period",
     *   "data": {
     *     "failedCount": 125,
     *     "failedPercentage": 8.5,
     *     "totalTransactions": 1470,
     *     "periodStart": "2025-01-14",
     *     "periodEnd": "2025-01-21"
     *   }
     * }
     * </pre>
     * 
     * <p><b>Response example (no match):</b>
     * <pre>
     * {
     *   "query": "unknown query",
     *   "matchedInsight": null,
     *   "title": "No Match Found",
     *   "description": "No analytics insight matches your search query. Try keywords like: 'failed', 'revenue', 'top users', 'payment methods', 'success rate'",
     *   "data": null
     * }
     * </pre>
     * 
     * @param query Search query string
     * @param range Date range ("7d", "30d", "90d", "custom")
     * @param days Custom days when range=custom
     * @return SearchResultResponse with matched insight data or no-match response
     */
    @GetMapping("/search")
    public ResponseEntity<SearchResultResponse> searchAnalytics(
            @RequestParam("q") String query,
            @RequestParam(defaultValue = "7d") String range,
            @RequestParam(required = false) Integer days,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        
        log.info("GET /api/analytics/search - Query: '{}', Range: {}, Days: {}, StartDate: {}, EndDate: {}", 
                query, range, days, startDate, endDate);
        long startTime = System.currentTimeMillis();

        // Validate query is not empty
        if (query == null || query.trim().isEmpty()) {
            log.warn("GET /api/analytics/search - Empty query provided");
            return ResponseEntity.badRequest().build();
        }

        try {
            SearchResultResponse response;
            
            // If explicit date range is provided, use it
            if (startDate != null && endDate != null) {
                log.debug("Search using explicit date range: {} to {}", startDate, endDate);
                response = searchService.searchWithDateRange(query, startDate, endDate);
            } else {
                // Determine period days from range parameter
                int periodDays = determinePeriodDays(range, days);
                log.debug("Search period determined: {} days", periodDays);
                response = searchService.search(query, periodDays);
            }
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (response.getMatchedInsight() != null) {
                log.info("GET /api/analytics/search - Query '{}' matched to {} in {}ms",
                        query, response.getMatchedInsight(), executionTime);
            } else {
                log.info("GET /api/analytics/search - Query '{}' had no match in {}ms",
                        query, executionTime);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("GET /api/analytics/search - Error after {}ms: {}",
                    executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ==================== AI Insights ====================

    /**
     * POST /api/analytics/ai-insights
     * 
     * Generates AI-powered insights from analytics data.
     * 
     * <p><b>IMPORTANT PHILOSOPHY:</b>
     * <ul>
     *   <li>AI interprets ONLY existing, pre-aggregated analytics data</li>
     *   <li>AI does NOT query the database directly</li>
     *   <li>AI does NOT generate new metrics or make business decisions</li>
     *   <li>Output is deterministic based on input data</li>
     * </ul>
     * 
     * <p><b>What it returns:</b>
     * <ul>
     *   <li>summary: One-line summary of key findings</li>
     *   <li>insights: List of 1-5 observations (max 2 lines each)</li>
     *   <li>disclaimer: "Insights are generated from aggregated analytics data."</li>
     *   <li>periodAnalyzed: Description of the analyzed period</li>
     *   <li>success: Whether insights were generated successfully</li>
     * </ul>
     * 
     * <p><b>How to use:</b>
     * <pre>
     * curl -X POST "http://localhost:8080/api/analytics/ai-insights" \
     *   -H "Content-Type: application/json" \
     *   -d '{"range": "7d"}'
     * </pre>
     * 
     * <p><b>Request body:</b>
     * <pre>
     * {
     *   "range": "7d"  // Options: "7d", "30d", "90d"
     * }
     * </pre>
     * 
     * <p><b>Response example:</b>
     * <pre>
     * {
     *   "summary": "Revenue declined while failure rates increased.",
     *   "insights": [
     *     "Revenue decreased by 18.5% compared to the previous period.",
     *     "Failed transactions increased by 32%. Investigate payment gateway issues.",
     *     "Success rate is at 82%, below the target of 85%.",
     *     "UPI accounts for 45% of transactions."
     *   ],
     *   "disclaimer": "Insights are generated from aggregated analytics data.",
     *   "periodAnalyzed": "Last 7 days vs previous 7 days",
     *   "success": true
     * }
     * </pre>
     * 
     * <p><b>Insights explain:</b>
     * <ul>
     *   <li>What changed in the analytics</li>
     *   <li>Possible reasons for the changes</li>
     *   <li>What metrics to investigate next</li>
     * </ul>
     * 
     * <p><b>Insights do NOT:</b>
     * <ul>
     *   <li>Make business decisions</li>
     *   <li>Predict future outcomes</li>
     *   <li>Use speculative language like "definitely" or "guaranteed"</li>
     *   <li>Invent numbers not in the input data</li>
     * </ul>
     * 
     * <p><b>Error handling:</b>
     * If AI service is unavailable, returns success=false with an error message.
     * The endpoint never throws exceptions to the client.
     * 
     * @param request AIInsightsRequest containing the time range
     * @return ResponseEntity with AIInsightsResponse
     */
    @PostMapping("/ai-insights")
    public ResponseEntity<AIInsightsResponse> getAIInsights(
            @RequestBody @jakarta.validation.Valid AIInsightsRequest request) {
        
        log.info("POST /api/analytics/ai-insights - Request received. Range: {}", request.getRange());
        long startTime = System.currentTimeMillis();

        try {
            AIInsightsResponse response = aiInsightsService.generateInsights(request);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (response.isSuccess()) {
                log.info("POST /api/analytics/ai-insights - Generated {} insights in {}ms",
                        response.getInsights() != null ? response.getInsights().size() : 0,
                        executionTime);
            } else {
                log.warn("POST /api/analytics/ai-insights - AI service unavailable after {}ms: {}",
                        executionTime, response.getSummary());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("POST /api/analytics/ai-insights - Error after {}ms: {}",
                    executionTime, e.getMessage(), e);
            
            // Return graceful error response instead of 500
            AIInsightsResponse errorResponse = AIInsightsResponse.builder()
                    .summary("An error occurred while generating insights. Please try again.")
                    .insights(java.util.Collections.emptyList())
                    .periodAnalyzed("N/A")
                    .success(false)
                    .build();
            
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * Determine period days from range parameter.
     * Supports: "7d", "30d", "90d", "custom", or "all"
     */
    private int determinePeriodDays(String range, Integer customDays) {
        if (range == null) {
            return 7; // Default to 7 days
        }
        
        switch (range.toLowerCase()) {
            case "7d":
                return 7;
            case "30d":
                return 30;
            case "90d":
                return 90;
            case "all":
                return 0; // 0 means all time
            case "custom":
                return customDays != null && customDays > 0 ? customDays : 30;
            default:
                // Try to parse as number (e.g., "45")
                try {
                    int parsed = Integer.parseInt(range.replaceAll("[^0-9]", ""));
                    return parsed > 0 ? parsed : 7;
                } catch (NumberFormatException e) {
                    return 7; // Default to 7 days
                }
        }
    }
}

