package com.analytics.dashboard.service;

import com.analytics.dashboard.dto.AIInputData;
import com.analytics.dashboard.dto.response.AIInsightsResponse;

/**
 * AI Client Interface - Abstraction for AI service calls.
 * 
 * This interface defines the contract for generating AI insights.
 * Implementations may include:
 * - MockAIClient (deterministic rule-based insights for development/testing)
 * - OpenAIClient (production implementation using OpenAI API)
 * - Other AI providers
 * 
 * DESIGN PRINCIPLES:
 * 1. AI receives ONLY structured, pre-aggregated data (AIInputData)
 * 2. AI never accesses database or raw data
 * 3. AI is stateless - no conversation history
 * 4. Output format is strictly controlled (max 5 insights, 2 lines each)
 * 5. No predictions or business decisions - only observations and investigation suggestions
 */
public interface AIClient {

    /**
     * Generate insights from analytics data.
     * 
     * @param inputData Structured analytics data with metrics and deltas
     * @return AIInsightsResponse containing summary and insights
     * @throws AIServiceException if the AI service is unavailable or fails
     */
    AIInsightsResponse generateInsights(AIInputData inputData) throws AIServiceException;

    /**
     * Check if the AI service is available.
     * 
     * @return true if service is operational, false otherwise
     */
    boolean isAvailable();

    /**
     * Get the name/identifier of this AI client implementation.
     * 
     * @return Name of the AI client (e.g., "MockAI", "OpenAI-GPT4")
     */
    String getClientName();

    /**
     * Custom exception for AI service errors.
     */
    class AIServiceException extends RuntimeException {
        private final boolean retryable;

        public AIServiceException(String message) {
            super(message);
            this.retryable = false;
        }

        public AIServiceException(String message, boolean retryable) {
            super(message);
            this.retryable = retryable;
        }

        public AIServiceException(String message, Throwable cause) {
            super(message, cause);
            this.retryable = false;
        }

        public AIServiceException(String message, Throwable cause, boolean retryable) {
            super(message, cause);
            this.retryable = retryable;
        }

        public boolean isRetryable() {
            return retryable;
        }
    }
}
