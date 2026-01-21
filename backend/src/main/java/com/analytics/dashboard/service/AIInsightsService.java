package com.analytics.dashboard.service;

import com.analytics.dashboard.dto.AIInputData;
import com.analytics.dashboard.dto.request.AIInsightsRequest;
import com.analytics.dashboard.dto.response.AIInsightsResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * AI Insights Service - Orchestrates AI insight generation.
 * 
 * This service is the main entry point for the AI Insights feature.
 * It coordinates:
 * 1. Building structured input from analytics data
 * 2. Validating the input completeness
 * 3. Calling the AI client
 * 4. Post-processing and formatting the response
 * 
 * DESIGN PRINCIPLES:
 * 1. AI never accesses repositories directly - uses AIInputBuilder
 * 2. AI receives only pre-aggregated, deterministic data
 * 3. AI is stateless - no conversation history
 * 4. Graceful degradation if AI is unavailable
 * 5. Output format is strictly controlled
 */
@Service
public class AIInsightsService {

    private static final Logger log = LoggerFactory.getLogger(AIInsightsService.class);

    private final AIInputBuilder aiInputBuilder;
    private final AIClient aiClient;

    public AIInsightsService(AIInputBuilder aiInputBuilder, AIClient aiClient) {
        this.aiInputBuilder = aiInputBuilder;
        this.aiClient = aiClient;
    }

    /**
     * Generate AI insights for the requested time range.
     * 
     * Flow:
     * 1. Parse the time range from the request
     * 2. Build structured input data from analytics
     * 3. Validate input completeness
     * 4. Call AI client to generate insights
     * 5. Post-process and return response
     * 
     * @param request AIInsightsRequest containing the time range
     * @return AIInsightsResponse with summary and insights
     */
    public AIInsightsResponse generateInsights(AIInsightsRequest request) {
        log.info("Generating AI insights for range: {}", request.getRange());
        long startTime = System.currentTimeMillis();

        try {
            // Step 1: Check if AI service is available
            if (!aiClient.isAvailable()) {
                log.warn("AI service is not available");
                return buildUnavailableResponse("AI service is temporarily unavailable. Please try again later.");
            }

            // Step 2: Build input data from analytics
            int periodDays = request.getRangeDays();
            AIInputData inputData = aiInputBuilder.buildInputData(periodDays);

            // Step 3: Validate input completeness
            if (!aiInputBuilder.validateInputData(inputData)) {
                log.warn("AI input data validation failed");
                return buildUnavailableResponse("Insufficient analytics data to generate insights.");
            }

            log.debug("AI input data built successfully: {}", inputData);

            // Step 4: Call AI client
            AIInsightsResponse response = aiClient.generateInsights(inputData);

            // Step 5: Post-process response
            response = postProcessResponse(response, inputData);

            long executionTime = System.currentTimeMillis() - startTime;
            log.info("AI insights generated successfully in {}ms using {} - {} insights",
                    executionTime, aiClient.getClientName(), 
                    response.getInsights() != null ? response.getInsights().size() : 0);

            return response;

        } catch (AIClient.AIServiceException e) {
            log.error("AI service error: {}", e.getMessage());
            return buildUnavailableResponse("AI service error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error generating AI insights: {}", e.getMessage(), e);
            return buildUnavailableResponse("An unexpected error occurred while generating insights.");
        }
    }

    /**
     * Build a graceful response when AI service is unavailable.
     */
    private AIInsightsResponse buildUnavailableResponse(String message) {
        return AIInsightsResponse.builder()
                .summary(message)
                .insights(Collections.emptyList())
                .periodAnalyzed("N/A")
                .success(false)
                .build();
    }

    /**
     * Post-process AI response to ensure format compliance.
     * - Ensure max 5 insights
     * - Trim long insights to 2 lines
     * - Ensure period description is set
     */
    private AIInsightsResponse postProcessResponse(AIInsightsResponse response, AIInputData inputData) {
        // Ensure insights list is not null
        if (response.getInsights() == null) {
            response.setInsights(Collections.emptyList());
        }

        // Limit to max 5 insights
        if (response.getInsights().size() > 5) {
            response.setInsights(response.getInsights().subList(0, 5));
        }

        // Ensure period description is set
        if (response.getPeriodAnalyzed() == null || response.getPeriodAnalyzed().isEmpty()) {
            response.setPeriodAnalyzed(inputData.getPeriodDescription());
        }

        // Ensure summary is not empty
        if (response.getSummary() == null || response.getSummary().isEmpty()) {
            response.setSummary("Analytics review completed for the selected period.");
        }

        return response;
    }

    /**
     * Get the name of the currently configured AI client.
     * Useful for debugging and monitoring.
     * 
     * @return AI client name
     */
    public String getAIClientName() {
        return aiClient.getClientName();
    }

    /**
     * Check if the AI service is currently available.
     * 
     * @return true if AI service is operational
     */
    public boolean isAIServiceAvailable() {
        return aiClient.isAvailable();
    }
}
