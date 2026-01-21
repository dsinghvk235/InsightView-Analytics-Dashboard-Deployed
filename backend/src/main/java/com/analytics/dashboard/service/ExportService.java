package com.analytics.dashboard.service;

import com.analytics.dashboard.dto.request.ExportRequest;
import com.analytics.dashboard.dto.response.*;
import com.analytics.dashboard.export.ExportFormat;
import com.analytics.dashboard.export.ExportMetric;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for exporting analytics data to CSV or JSON format.
 * 
 * Responsibilities:
 * - Validate metric & format
 * - Call existing AnalyticsService methods
 * - Transform analytics DTOs into export-friendly structures
 * - Generate CSV or JSON output
 * 
 * Design principles:
 * - Reuses existing AnalyticsService (no direct repository calls)
 * - Synchronous processing (no background jobs)
 * - Clean, readable code for interview discussions
 */
@Service
public class ExportService {

    private static final Logger log = LoggerFactory.getLogger(ExportService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    private final AnalyticsService analyticsService;
    private final ObjectMapper objectMapper;

    public ExportService(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    /**
     * Export analytics data based on the request.
     * 
     * @param request Export request containing metric, range, and format
     * @return Byte array of the exported content (CSV or JSON)
     */
    public byte[] exportData(ExportRequest request) {
        log.info("Exporting analytics data - Metric: {}, Range: {}, Format: {}",
                request.getMetric(), request.getRange(), request.getFormat());

        long startTime = System.currentTimeMillis();

        // Calculate date range from period days
        int periodDays = request.getPeriodDays();
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = periodDays > 0 ? endDate.minusDays(periodDays) : LocalDate.of(2000, 1, 1);

        // Fetch data from analytics service based on metric type
        Object data = fetchAnalyticsData(request.getMetric(), startDate, endDate);

        // Generate output based on format
        byte[] result;
        if (request.getFormat() == ExportFormat.CSV) {
            result = generateCsv(request.getMetric(), data, startDate, endDate);
        } else {
            result = generateJson(request.getMetric(), data, startDate, endDate);
        }

        long executionTime = System.currentTimeMillis() - startTime;
        log.info("Export completed in {}ms - Size: {} bytes", executionTime, result.length);

        return result;
    }

    /**
     * Fetch analytics data from AnalyticsService based on metric type.
     */
    private Object fetchAnalyticsData(ExportMetric metric, LocalDate startDate, LocalDate endDate) {
        switch (metric) {
            case TRANSACTIONS_SUMMARY:
                return analyticsService.getTransactionsByDateRange(startDate, endDate);
            case REVENUE_SUMMARY:
                return analyticsService.getRevenueOverTime(startDate, endDate);
            case FAILED_TRANSACTIONS:
                return analyticsService.getTransactionsByStatus(startDate, endDate);
            case CURRENCY_BREAKDOWN:
                return analyticsService.getTransactionsByPaymentMethod(startDate, endDate);
            default:
                throw new IllegalArgumentException("Unsupported metric: " + metric);
        }
    }

    /**
     * Generate CSV output for the given metric and data.
     */
    @SuppressWarnings("unchecked")
    private byte[] generateCsv(ExportMetric metric, Object data, LocalDate startDate, LocalDate endDate) {
        StringBuilder csv = new StringBuilder();

        switch (metric) {
            case TRANSACTIONS_SUMMARY:
                csv.append(generateTransactionsSummaryCsv((List<DailyTransactionResponse>) data));
                break;
            case REVENUE_SUMMARY:
                csv.append(generateRevenueSummaryCsv((List<RevenueOverTimeResponse>) data));
                break;
            case FAILED_TRANSACTIONS:
                csv.append(generateFailedTransactionsCsv((List<TransactionStatusResponse>) data));
                break;
            case CURRENCY_BREAKDOWN:
                csv.append(generateCurrencyBreakdownCsv((List<PaymentMethodResponse>) data));
                break;
            default:
                throw new IllegalArgumentException("Unsupported metric for CSV: " + metric);
        }

        return csv.toString().getBytes();
    }

    /**
     * Generate JSON output for the given metric and data.
     */
    @SuppressWarnings("unchecked")
    private byte[] generateJson(ExportMetric metric, Object data, LocalDate startDate, LocalDate endDate) {
        try {
            Map<String, Object> exportData = new LinkedHashMap<>();
            exportData.put("metric", metric.name());
            exportData.put("metricDisplayName", metric.getDisplayName());
            exportData.put("description", metric.getDescription());
            exportData.put("dateRange", Map.of(
                    "startDate", startDate.format(DATE_FORMATTER),
                    "endDate", endDate.format(DATE_FORMATTER)
            ));
            exportData.put("exportedAt", LocalDate.now().format(DATE_FORMATTER));

            switch (metric) {
                case TRANSACTIONS_SUMMARY:
                    exportData.put("data", transformTransactionsSummaryForJson((List<DailyTransactionResponse>) data));
                    break;
                case REVENUE_SUMMARY:
                    exportData.put("data", transformRevenueSummaryForJson((List<RevenueOverTimeResponse>) data));
                    break;
                case FAILED_TRANSACTIONS:
                    exportData.put("data", transformFailedTransactionsForJson((List<TransactionStatusResponse>) data));
                    break;
                case CURRENCY_BREAKDOWN:
                    exportData.put("data", transformCurrencyBreakdownForJson((List<PaymentMethodResponse>) data));
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported metric for JSON: " + metric);
            }

            return objectMapper.writeValueAsBytes(exportData);
        } catch (Exception e) {
            log.error("Error generating JSON export", e);
            throw new RuntimeException("Failed to generate JSON export", e);
        }
    }

    // ==================== CSV Generation Methods ====================

    private String generateTransactionsSummaryCsv(List<DailyTransactionResponse> data) {
        StringBuilder csv = new StringBuilder();
        
        // Header row
        csv.append("Date,Total Transactions,Total Amount,Successful Transactions,");
        csv.append("Successful Amount,Failed Transactions,Success Rate (%)\n");

        // Data rows
        for (DailyTransactionResponse row : data) {
            csv.append(formatDate(row.getDate())).append(",");
            csv.append(row.getTotalTransactions()).append(",");
            csv.append(formatAmount(row.getTotalAmount())).append(",");
            csv.append(row.getSuccessfulTransactions()).append(",");
            csv.append(formatAmount(row.getSuccessfulAmount())).append(",");
            csv.append(row.getFailedTransactions()).append(",");
            csv.append(formatPercentage(row.getSuccessRate())).append("\n");
        }

        return csv.toString();
    }

    private String generateRevenueSummaryCsv(List<RevenueOverTimeResponse> data) {
        StringBuilder csv = new StringBuilder();
        
        // Header row
        csv.append("Date,Revenue\n");

        // Data rows
        for (RevenueOverTimeResponse row : data) {
            csv.append(formatDate(row.getDate())).append(",");
            csv.append(formatAmount(row.getRevenue())).append("\n");
        }

        return csv.toString();
    }

    private String generateFailedTransactionsCsv(List<TransactionStatusResponse> data) {
        StringBuilder csv = new StringBuilder();
        
        // Header row
        csv.append("Status,Count,Percentage (%)\n");

        // Data rows
        for (TransactionStatusResponse row : data) {
            csv.append(row.getStatus()).append(",");
            csv.append(row.getCount()).append(",");
            csv.append(formatPercentage(row.getPercentage())).append("\n");
        }

        return csv.toString();
    }

    private String generateCurrencyBreakdownCsv(List<PaymentMethodResponse> data) {
        StringBuilder csv = new StringBuilder();
        
        // Header row
        csv.append("Payment Method,Total Amount,Transaction Count,Average Amount,Percentage (%)\n");

        // Data rows
        for (PaymentMethodResponse row : data) {
            csv.append(row.getPaymentMethod()).append(",");
            csv.append(formatAmount(row.getTotalAmount())).append(",");
            csv.append(row.getTransactionCount()).append(",");
            csv.append(formatAmount(row.getAverageAmount())).append(",");
            csv.append(formatPercentage(row.getPercentage())).append("\n");
        }

        return csv.toString();
    }

    // ==================== JSON Transformation Methods ====================

    private List<Map<String, Object>> transformTransactionsSummaryForJson(List<DailyTransactionResponse> data) {
        return data.stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("date", formatDate(row.getDate()));
            item.put("totalTransactions", row.getTotalTransactions());
            item.put("totalAmount", row.getTotalAmount());
            item.put("successfulTransactions", row.getSuccessfulTransactions());
            item.put("successfulAmount", row.getSuccessfulAmount());
            item.put("failedTransactions", row.getFailedTransactions());
            item.put("successRate", row.getSuccessRate());
            return item;
        }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> transformRevenueSummaryForJson(List<RevenueOverTimeResponse> data) {
        return data.stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("date", formatDate(row.getDate()));
            item.put("revenue", row.getRevenue());
            return item;
        }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> transformFailedTransactionsForJson(List<TransactionStatusResponse> data) {
        return data.stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("status", row.getStatus().name());
            item.put("count", row.getCount());
            item.put("percentage", row.getPercentage());
            return item;
        }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> transformCurrencyBreakdownForJson(List<PaymentMethodResponse> data) {
        return data.stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("paymentMethod", row.getPaymentMethod().name());
            item.put("totalAmount", row.getTotalAmount());
            item.put("transactionCount", row.getTransactionCount());
            item.put("averageAmount", row.getAverageAmount());
            item.put("percentage", row.getPercentage());
            return item;
        }).collect(Collectors.toList());
    }

    // ==================== Helper Methods ====================

    private String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : "";
    }

    private String formatAmount(BigDecimal amount) {
        return amount != null ? amount.toPlainString() : "0.00";
    }

    private String formatPercentage(Double percentage) {
        return percentage != null ? String.format("%.2f", percentage) : "0.00";
    }

    /**
     * Generate filename for the export.
     * Format: analytics_export_<metric>_<date>.<extension>
     */
    public String generateFilename(ExportRequest request) {
        String metricName = request.getMetric().name().toLowerCase();
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String extension = request.getFormat().getFileExtension();
        return String.format("analytics_export_%s_%s%s", metricName, date, extension);
    }
}
