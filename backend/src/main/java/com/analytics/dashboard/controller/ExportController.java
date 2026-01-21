package com.analytics.dashboard.controller;

import com.analytics.dashboard.dto.request.ExportRequest;
import com.analytics.dashboard.service.ExportService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for analytics export functionality.
 * 
 * Provides a single endpoint for exporting analytics data in CSV or JSON format.
 * Exports aggregated analytics results, NOT raw transactional data.
 */
@RestController
@RequestMapping("/api/analytics")
public class ExportController {

    private static final Logger log = LoggerFactory.getLogger(ExportController.class);

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    /**
     * POST /api/analytics/export
     * 
     * Export analytics data in the requested format (CSV or JSON).
     * Returns the file as an HTTP response with appropriate headers for download.
     * 
     * <p><b>Request Body Example:</b>
     * <pre>
     * {
     *   "metric": "TRANSACTIONS_SUMMARY",
     *   "range": "7d",
     *   "format": "CSV"
     * }
     * </pre>
     * 
     * <p><b>Supported Metrics:</b>
     * <ul>
     *   <li>TRANSACTIONS_SUMMARY - Daily transaction statistics</li>
     *   <li>REVENUE_SUMMARY - Revenue breakdown over time</li>
     *   <li>FAILED_TRANSACTIONS - Transaction status breakdown</li>
     *   <li>CURRENCY_BREAKDOWN - Payment method breakdown</li>
     * </ul>
     * 
     * <p><b>Supported Formats:</b>
     * <ul>
     *   <li>CSV - Flat structure with header row</li>
     *   <li>JSON - Structured with metadata</li>
     * </ul>
     * 
     * <p><b>Range Options:</b>
     * <ul>
     *   <li>"7d" - Last 7 days</li>
     *   <li>"30d" - Last 30 days</li>
     *   <li>"90d" - Last 90 days</li>
     *   <li>"all" - All time</li>
     *   <li>Custom number like "45" - Last 45 days</li>
     * </ul>
     * 
     * <p><b>Response Headers:</b>
     * <ul>
     *   <li>Content-Type: text/csv or application/json</li>
     *   <li>Content-Disposition: attachment; filename="analytics_export_&lt;metric&gt;_&lt;date&gt;.csv"</li>
     * </ul>
     * 
     * @param request Export request containing metric, range, and format
     * @return ResponseEntity with file content and download headers
     */
    @PostMapping("/export")
    public ResponseEntity<byte[]> exportAnalytics(@Valid @RequestBody ExportRequest request) {
        log.info("POST /api/analytics/export - Metric: {}, Range: {}, Format: {}",
                request.getMetric(), request.getRange(), request.getFormat());
        long startTime = System.currentTimeMillis();

        try {
            // Validate request
            if (request.getMetric() == null) {
                log.warn("POST /api/analytics/export - Missing metric");
                return ResponseEntity.badRequest().build();
            }
            if (request.getFormat() == null) {
                log.warn("POST /api/analytics/export - Missing format");
                return ResponseEntity.badRequest().build();
            }
            if (request.getRange() == null || request.getRange().isEmpty()) {
                log.warn("POST /api/analytics/export - Missing range");
                return ResponseEntity.badRequest().build();
            }

            // Generate export
            byte[] exportData = exportService.exportData(request);
            String filename = exportService.generateFilename(request);

            // Build response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(request.getFormat().getContentType()));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(exportData.length);
            
            // Add cache control headers to prevent caching
            headers.setCacheControl("no-cache, no-store, must-revalidate");
            headers.setPragma("no-cache");
            headers.set("Expires", "0");

            long executionTime = System.currentTimeMillis() - startTime;
            log.info("POST /api/analytics/export - Export completed in {}ms. Filename: {}, Size: {} bytes",
                    executionTime, filename, exportData.length);

            return new ResponseEntity<>(exportData, headers, HttpStatus.OK);

        } catch (IllegalArgumentException e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.warn("POST /api/analytics/export - Invalid request after {}ms: {}", 
                    executionTime, e.getMessage());
            return ResponseEntity.badRequest().build();
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("POST /api/analytics/export - Error after {}ms: {}", 
                    executionTime, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/analytics/export/metrics
     * 
     * Returns the list of available export metrics.
     * Useful for frontend to populate export options dropdown.
     * 
     * @return List of available metrics with display names and descriptions
     */
    @GetMapping("/export/metrics")
    public ResponseEntity<Object> getAvailableMetrics() {
        log.info("GET /api/analytics/export/metrics - Request received");
        
        var metrics = java.util.Arrays.stream(com.analytics.dashboard.export.ExportMetric.values())
                .map(metric -> java.util.Map.of(
                        "value", metric.name(),
                        "displayName", metric.getDisplayName(),
                        "description", metric.getDescription()
                ))
                .toList();
        
        return ResponseEntity.ok(java.util.Map.of(
                "metrics", metrics,
                "formats", java.util.List.of("CSV", "JSON"),
                "ranges", java.util.List.of("7d", "30d", "90d", "all")
        ));
    }
}
