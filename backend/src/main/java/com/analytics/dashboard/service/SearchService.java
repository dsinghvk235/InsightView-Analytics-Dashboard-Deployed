package com.analytics.dashboard.service;

import com.analytics.dashboard.dto.response.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

/**
 * Service for analytics search functionality.
 * 
 * Design Principles:
 * - Rule-based keyword matching (no AI/ML)
 * - Simple contains() logic for keyword matching
 * - Maps keywords to EXISTING analytics methods
 * - Does NOT return raw database records
 * 
 * Interview-friendly: Clear method names, extensive logging, readable code.
 */
@Service
public class SearchService {
    
    private static final Logger log = LoggerFactory.getLogger(SearchService.class);
    
    private final AnalyticsService analyticsService;
    
    /**
     * Keyword mapping configuration.
     * Maps keywords (lowercase) to AnalyticsQueryType.
     * 
     * Structure: keyword -> QueryType
     * Multiple keywords can map to the same QueryType.
     */
    private static final Map<String, AnalyticsQueryType> KEYWORD_MAPPINGS = new LinkedHashMap<>();
    
    static {
        // Failed transactions keywords
        KEYWORD_MAPPINGS.put("failed", AnalyticsQueryType.FAILED_TRANSACTIONS_SUMMARY);
        KEYWORD_MAPPINGS.put("failure", AnalyticsQueryType.FAILED_TRANSACTIONS_SUMMARY);
        KEYWORD_MAPPINGS.put("failures", AnalyticsQueryType.FAILED_TRANSACTIONS_SUMMARY);
        KEYWORD_MAPPINGS.put("declined", AnalyticsQueryType.FAILED_TRANSACTIONS_SUMMARY);
        KEYWORD_MAPPINGS.put("rejected", AnalyticsQueryType.FAILED_TRANSACTIONS_SUMMARY);
        
        // Revenue/Amount keywords
        KEYWORD_MAPPINGS.put("revenue", AnalyticsQueryType.REVENUE_SUMMARY);
        KEYWORD_MAPPINGS.put("amount", AnalyticsQueryType.REVENUE_SUMMARY);
        KEYWORD_MAPPINGS.put("gtv", AnalyticsQueryType.REVENUE_SUMMARY);
        KEYWORD_MAPPINGS.put("earnings", AnalyticsQueryType.REVENUE_SUMMARY);
        KEYWORD_MAPPINGS.put("income", AnalyticsQueryType.REVENUE_SUMMARY);
        KEYWORD_MAPPINGS.put("money", AnalyticsQueryType.REVENUE_SUMMARY);
        
        // Top users keywords
        KEYWORD_MAPPINGS.put("top users", AnalyticsQueryType.TOP_USERS_BY_REVENUE);
        KEYWORD_MAPPINGS.put("top user", AnalyticsQueryType.TOP_USERS_BY_REVENUE);
        KEYWORD_MAPPINGS.put("best customers", AnalyticsQueryType.TOP_USERS_BY_REVENUE);
        KEYWORD_MAPPINGS.put("vip", AnalyticsQueryType.TOP_USERS_BY_REVENUE);
        KEYWORD_MAPPINGS.put("high value", AnalyticsQueryType.TOP_USERS_BY_REVENUE);
        KEYWORD_MAPPINGS.put("top customers", AnalyticsQueryType.TOP_USERS_BY_REVENUE);
        
        // Payment method keywords
        KEYWORD_MAPPINGS.put("payment method", AnalyticsQueryType.PAYMENT_METHOD_BREAKDOWN);
        KEYWORD_MAPPINGS.put("payment methods", AnalyticsQueryType.PAYMENT_METHOD_BREAKDOWN);
        KEYWORD_MAPPINGS.put("upi", AnalyticsQueryType.PAYMENT_METHOD_BREAKDOWN);
        KEYWORD_MAPPINGS.put("card", AnalyticsQueryType.PAYMENT_METHOD_BREAKDOWN);
        KEYWORD_MAPPINGS.put("cards", AnalyticsQueryType.PAYMENT_METHOD_BREAKDOWN);
        KEYWORD_MAPPINGS.put("wallet", AnalyticsQueryType.PAYMENT_METHOD_BREAKDOWN);
        KEYWORD_MAPPINGS.put("net banking", AnalyticsQueryType.PAYMENT_METHOD_BREAKDOWN);
        KEYWORD_MAPPINGS.put("currency", AnalyticsQueryType.PAYMENT_METHOD_BREAKDOWN);
        
        // Transaction status keywords
        KEYWORD_MAPPINGS.put("status", AnalyticsQueryType.TRANSACTION_STATUS_OVERVIEW);
        KEYWORD_MAPPINGS.put("pending", AnalyticsQueryType.TRANSACTION_STATUS_OVERVIEW);
        KEYWORD_MAPPINGS.put("transaction status", AnalyticsQueryType.TRANSACTION_STATUS_OVERVIEW);
        
        // Success rate keywords
        KEYWORD_MAPPINGS.put("success rate", AnalyticsQueryType.SUCCESS_RATE_ANALYTICS);
        KEYWORD_MAPPINGS.put("conversion", AnalyticsQueryType.SUCCESS_RATE_ANALYTICS);
        KEYWORD_MAPPINGS.put("completion", AnalyticsQueryType.SUCCESS_RATE_ANALYTICS);
        KEYWORD_MAPPINGS.put("success", AnalyticsQueryType.SUCCESS_RATE_ANALYTICS);
        
        // Daily trends keywords
        KEYWORD_MAPPINGS.put("daily", AnalyticsQueryType.DAILY_TRANSACTION_TRENDS);
        KEYWORD_MAPPINGS.put("trend", AnalyticsQueryType.DAILY_TRANSACTION_TRENDS);
        KEYWORD_MAPPINGS.put("trends", AnalyticsQueryType.DAILY_TRANSACTION_TRENDS);
        KEYWORD_MAPPINGS.put("over time", AnalyticsQueryType.DAILY_TRANSACTION_TRENDS);
        KEYWORD_MAPPINGS.put("history", AnalyticsQueryType.DAILY_TRANSACTION_TRENDS);
        
        // Overview keywords
        KEYWORD_MAPPINGS.put("overview", AnalyticsQueryType.ANALYTICS_OVERVIEW);
        KEYWORD_MAPPINGS.put("summary", AnalyticsQueryType.ANALYTICS_OVERVIEW);
        KEYWORD_MAPPINGS.put("dashboard", AnalyticsQueryType.ANALYTICS_OVERVIEW);
        KEYWORD_MAPPINGS.put("all", AnalyticsQueryType.ANALYTICS_OVERVIEW);
    }
    
    public SearchService(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }
    
    /**
     * Search for analytics insights based on keyword query.
     * 
     * Algorithm:
     * 1. Normalize query (lowercase, trim)
     * 2. Match keywords using contains() logic
     * 3. Execute corresponding analytics method
     * 4. Return formatted response
     * 
     * @param query User's search query
     * @param periodDays Date range in days (7, 30, 90, or 0 for all)
     * @return SearchResultResponse with matched insight data or no-match response
     */
    public SearchResultResponse search(String query, int periodDays) {
        log.info("Search initiated - Query: '{}', Period: {} days", query, periodDays);
        
        // Calculate date range from period days
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = calculateStartDate(periodDays);
        
        return searchWithDateRange(query, startDate, endDate);
    }
    
    /**
     * Search for analytics insights with explicit date range.
     * Used when Analytics section provides custom date range.
     * 
     * @param query User's search query
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return SearchResultResponse with matched insight data or no-match response
     */
    public SearchResultResponse searchWithDateRange(String query, LocalDate startDate, LocalDate endDate) {
        log.info("Search initiated - Query: '{}', Date Range: {} to {}", query, startDate, endDate);
        
        // Step 1: Normalize the query
        String normalizedQuery = normalizeQuery(query);
        log.debug("Normalized query: '{}'", normalizedQuery);
        
        if (normalizedQuery.isEmpty()) {
            log.info("Search result: Empty query provided");
            return SearchResultResponse.noMatch(query);
        }
        
        // Step 2: Match keywords to analytics type
        AnalyticsQueryType matchedType = matchKeywordToQueryType(normalizedQuery);
        
        if (matchedType == null) {
            log.info("Search result: No matching insight found for query '{}'", query);
            return SearchResultResponse.noMatch(query);
        }
        
        log.info("Search match found - Query: '{}' -> Type: {}", query, matchedType.name());
        
        // Step 3: Execute analytics and build response
        Map<String, Object> data = executeAnalyticsQuery(matchedType, startDate, endDate);
        
        log.info("Search completed - Returning {} insight with data for {} to {}", 
                matchedType.name(), startDate, endDate);
        return new SearchResultResponse(query, matchedType, data);
    }
    
    /**
     * Normalize the search query.
     * - Convert to lowercase
     * - Trim whitespace
     * - Remove extra spaces
     */
    private String normalizeQuery(String query) {
        if (query == null) {
            return "";
        }
        return query.toLowerCase()
                    .trim()
                    .replaceAll("\\s+", " ");
    }
    
    /**
     * Match normalized query to an AnalyticsQueryType.
     * Uses simple contains() logic for keyword matching.
     * 
     * Priority: Longer keywords are checked first (via LinkedHashMap order).
     * This ensures "top users" matches before "top" would (if "top" was a keyword).
     */
    private AnalyticsQueryType matchKeywordToQueryType(String normalizedQuery) {
        // Sort keywords by length (descending) to match longer keywords first
        List<Map.Entry<String, AnalyticsQueryType>> sortedMappings = new ArrayList<>(KEYWORD_MAPPINGS.entrySet());
        sortedMappings.sort((a, b) -> Integer.compare(b.getKey().length(), a.getKey().length()));
        
        for (Map.Entry<String, AnalyticsQueryType> entry : sortedMappings) {
            String keyword = entry.getKey();
            if (normalizedQuery.contains(keyword)) {
                log.debug("Keyword match: '{}' contains '{}'", normalizedQuery, keyword);
                return entry.getValue();
            }
        }
        
        return null;
    }
    
    /**
     * Calculate start date based on period days.
     * - 0 means all time (use 10 years ago)
     * - Other values: subtract that many days from today
     */
    private LocalDate calculateStartDate(int periodDays) {
        if (periodDays <= 0) {
            // All time - use a very old date
            return LocalDate.of(2020, 1, 1);
        }
        return LocalDate.now().minusDays(periodDays);
    }
    
    /**
     * Execute the appropriate analytics query based on matched type.
     * Delegates to existing AnalyticsService methods.
     * 
     * Returns data in a consistent Map format for the response.
     */
    private Map<String, Object> executeAnalyticsQuery(AnalyticsQueryType queryType, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> data = new LinkedHashMap<>();
        
        switch (queryType) {
            case FAILED_TRANSACTIONS_SUMMARY:
                data = buildFailedTransactionsSummary(startDate, endDate);
                break;
                
            case REVENUE_SUMMARY:
                data = buildRevenueSummary(startDate, endDate);
                break;
                
            case TOP_USERS_BY_REVENUE:
                data = buildTopUsersSummary(startDate, endDate);
                break;
                
            case PAYMENT_METHOD_BREAKDOWN:
                data = buildPaymentMethodBreakdown(startDate, endDate);
                break;
                
            case TRANSACTION_STATUS_OVERVIEW:
                data = buildTransactionStatusOverview(startDate, endDate);
                break;
                
            case SUCCESS_RATE_ANALYTICS:
                data = buildSuccessRateAnalytics(startDate, endDate);
                break;
                
            case DAILY_TRANSACTION_TRENDS:
                data = buildDailyTransactionTrends(startDate, endDate);
                break;
                
            case ANALYTICS_OVERVIEW:
                data = buildAnalyticsOverview();
                break;
                
            default:
                log.warn("Unknown query type: {}", queryType);
        }
        
        return data;
    }
    
    /**
     * Build failed transactions summary data.
     * Extracts FAILED status from transaction status breakdown.
     */
    private Map<String, Object> buildFailedTransactionsSummary(LocalDate startDate, LocalDate endDate) {
        log.debug("Building failed transactions summary for {} to {}", startDate, endDate);
        
        List<TransactionStatusResponse> statusData = analyticsService.getTransactionsByStatus(startDate, endDate);
        
        Map<String, Object> data = new LinkedHashMap<>();
        long failedCount = 0;
        double failedPercentage = 0.0;
        long totalTransactions = 0;
        
        for (TransactionStatusResponse status : statusData) {
            totalTransactions += status.getCount();
            if ("FAILED".equals(status.getStatus().name())) {
                failedCount = status.getCount();
                failedPercentage = status.getPercentage();
            }
        }
        
        data.put("failedCount", failedCount);
        data.put("failedPercentage", failedPercentage);
        data.put("totalTransactions", totalTransactions);
        data.put("periodStart", startDate.toString());
        data.put("periodEnd", endDate.toString());
        
        return data;
    }
    
    /**
     * Build revenue summary data.
     * Uses KPI metrics for GTV and average values.
     */
    private Map<String, Object> buildRevenueSummary(LocalDate startDate, LocalDate endDate) {
        log.debug("Building revenue summary for {} to {}", startDate, endDate);
        
        KPIResponse kpis = analyticsService.getKPIMetricsByDateRange(startDate, endDate);
        
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalGTV", kpis.getTotalGTV());
        data.put("averageTicketSize", kpis.getAverageTicketSize());
        data.put("totalTransactions", kpis.getTotalTransactions());
        data.put("successfulTransactions", kpis.getTotalTransactions() - kpis.getFailedTransactionCount() - kpis.getPendingTransactions());
        data.put("periodStart", startDate.toString());
        data.put("periodEnd", endDate.toString());
        
        return data;
    }
    
    /**
     * Build top users summary data.
     * Returns top 5 users by revenue.
     */
    private Map<String, Object> buildTopUsersSummary(LocalDate startDate, LocalDate endDate) {
        log.debug("Building top users summary for {} to {}", startDate, endDate);
        
        List<TopUserResponse> topUsers = analyticsService.getTopUsersByRevenue(startDate, endDate, 5);
        
        Map<String, Object> data = new LinkedHashMap<>();
        List<Map<String, Object>> usersList = new ArrayList<>();
        
        for (TopUserResponse user : topUsers) {
            Map<String, Object> userMap = new LinkedHashMap<>();
            userMap.put("userId", user.getUserId());
            userMap.put("userName", user.getUserName());
            userMap.put("userEmail", user.getUserEmail());
            userMap.put("transactionCount", user.getTransactionCount());
            userMap.put("totalRevenue", user.getTotalRevenue());
            usersList.add(userMap);
        }
        
        data.put("topUsers", usersList);
        data.put("totalUsersReturned", topUsers.size());
        data.put("periodStart", startDate.toString());
        data.put("periodEnd", endDate.toString());
        
        return data;
    }
    
    /**
     * Build payment method breakdown data.
     */
    private Map<String, Object> buildPaymentMethodBreakdown(LocalDate startDate, LocalDate endDate) {
        log.debug("Building payment method breakdown for {} to {}", startDate, endDate);
        
        List<PaymentMethodResponse> methods = analyticsService.getTransactionsByPaymentMethod(startDate, endDate);
        
        Map<String, Object> data = new LinkedHashMap<>();
        List<Map<String, Object>> methodsList = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        for (PaymentMethodResponse method : methods) {
            Map<String, Object> methodMap = new LinkedHashMap<>();
            methodMap.put("paymentMethod", method.getPaymentMethod().name());
            methodMap.put("totalAmount", method.getTotalAmount());
            methodMap.put("transactionCount", method.getTransactionCount());
            methodMap.put("percentage", method.getPercentage());
            methodsList.add(methodMap);
            totalAmount = totalAmount.add(method.getTotalAmount());
        }
        
        data.put("paymentMethods", methodsList);
        data.put("totalAmount", totalAmount);
        data.put("periodStart", startDate.toString());
        data.put("periodEnd", endDate.toString());
        
        return data;
    }
    
    /**
     * Build transaction status overview data.
     */
    private Map<String, Object> buildTransactionStatusOverview(LocalDate startDate, LocalDate endDate) {
        log.debug("Building transaction status overview for {} to {}", startDate, endDate);
        
        List<TransactionStatusResponse> statuses = analyticsService.getTransactionsByStatus(startDate, endDate);
        
        Map<String, Object> data = new LinkedHashMap<>();
        List<Map<String, Object>> statusList = new ArrayList<>();
        long totalTransactions = 0;
        
        for (TransactionStatusResponse status : statuses) {
            Map<String, Object> statusMap = new LinkedHashMap<>();
            statusMap.put("status", status.getStatus().name());
            statusMap.put("count", status.getCount());
            statusMap.put("percentage", status.getPercentage());
            statusList.add(statusMap);
            totalTransactions += status.getCount();
        }
        
        data.put("statuses", statusList);
        data.put("totalTransactions", totalTransactions);
        data.put("periodStart", startDate.toString());
        data.put("periodEnd", endDate.toString());
        
        return data;
    }
    
    /**
     * Build success rate analytics data.
     */
    private Map<String, Object> buildSuccessRateAnalytics(LocalDate startDate, LocalDate endDate) {
        log.debug("Building success rate analytics for {} to {}", startDate, endDate);
        
        KPIResponse kpis = analyticsService.getKPIMetricsByDateRange(startDate, endDate);
        
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("successRate", kpis.getSuccessRate());
        data.put("totalTransactions", kpis.getTotalTransactions());
        data.put("failedTransactions", kpis.getFailedTransactionCount());
        data.put("pendingTransactions", kpis.getPendingTransactions());
        data.put("periodStart", startDate.toString());
        data.put("periodEnd", endDate.toString());
        
        return data;
    }
    
    /**
     * Build daily transaction trends data.
     */
    private Map<String, Object> buildDailyTransactionTrends(LocalDate startDate, LocalDate endDate) {
        log.debug("Building daily transaction trends for {} to {}", startDate, endDate);
        
        List<DailyTransactionResponse> dailyStats = analyticsService.getTransactionsByDateRange(startDate, endDate);
        
        Map<String, Object> data = new LinkedHashMap<>();
        List<Map<String, Object>> trendsList = new ArrayList<>();
        
        for (DailyTransactionResponse day : dailyStats) {
            Map<String, Object> dayMap = new LinkedHashMap<>();
            dayMap.put("date", day.getDate().toString());
            dayMap.put("totalTransactions", day.getTotalTransactions());
            dayMap.put("totalAmount", day.getTotalAmount());
            dayMap.put("successRate", day.getSuccessRate());
            trendsList.add(dayMap);
        }
        
        data.put("dailyTrends", trendsList);
        data.put("totalDays", dailyStats.size());
        data.put("periodStart", startDate.toString());
        data.put("periodEnd", endDate.toString());
        
        return data;
    }
    
    /**
     * Build analytics overview data.
     */
    private Map<String, Object> buildAnalyticsOverview() {
        log.debug("Building analytics overview");
        
        AnalyticsOverviewResponse overview = analyticsService.getAnalyticsOverview();
        
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalUsers", overview.getTotalUsers());
        data.put("activeUsers", overview.getActiveUsers());
        data.put("totalTransactions", overview.getTotalTransactions());
        data.put("successfulTransactions", overview.getSuccessfulTransactions());
        data.put("failedTransactions", overview.getFailedTransactions());
        data.put("totalRevenue", overview.getTotalRevenue());
        data.put("averageTransactionAmount", overview.getAverageTransactionAmount());
        data.put("successRate", overview.getSuccessRate());
        
        return data;
    }
    
    /**
     * Get list of available search keywords for help/suggestions.
     */
    public List<String> getAvailableKeywords() {
        return new ArrayList<>(KEYWORD_MAPPINGS.keySet());
    }
}
