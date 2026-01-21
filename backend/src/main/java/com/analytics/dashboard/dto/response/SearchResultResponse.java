package com.analytics.dashboard.dto.response;

import com.analytics.dashboard.service.AnalyticsQueryType;
import java.util.Map;

/**
 * Response DTO for analytics search results.
 * 
 * Structure:
 * - query: The original search query submitted by the user
 * - matchedInsight: The analytics type that matched the query
 * - title: Human-readable title for the matched insight
 * - description: Description of what this insight shows
 * - data: Map containing the actual analytics data (flexible structure)
 * 
 * The data field is a Map to accommodate different response shapes
 * from various analytics methods without creating multiple DTOs.
 */
public class SearchResultResponse {
    
    private String query;
    private String matchedInsight;
    private String title;
    private String description;
    private Map<String, Object> data;
    
    // Default constructor for Jackson
    public SearchResultResponse() {
    }
    
    // Full constructor
    public SearchResultResponse(String query, AnalyticsQueryType queryType, Map<String, Object> data) {
        this.query = query;
        this.matchedInsight = queryType.name();
        this.title = queryType.getDisplayName();
        this.description = queryType.getDescription();
        this.data = data;
    }
    
    // Static factory for no match scenario
    public static SearchResultResponse noMatch(String query) {
        SearchResultResponse response = new SearchResultResponse();
        response.query = query;
        response.matchedInsight = null;
        response.title = "No Match Found";
        response.description = "No analytics insight matches your search query. Try keywords like: 'failed', 'revenue', 'top users', 'payment methods', 'success rate'";
        response.data = null;
        return response;
    }
    
    // Getters and Setters
    public String getQuery() {
        return query;
    }
    
    public void setQuery(String query) {
        this.query = query;
    }
    
    public String getMatchedInsight() {
        return matchedInsight;
    }
    
    public void setMatchedInsight(String matchedInsight) {
        this.matchedInsight = matchedInsight;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Map<String, Object> getData() {
        return data;
    }
    
    public void setData(Map<String, Object> data) {
        this.data = data;
    }
    
    @Override
    public String toString() {
        return "SearchResultResponse{" +
                "query='" + query + '\'' +
                ", matchedInsight='" + matchedInsight + '\'' +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", data=" + data +
                '}';
    }
}
