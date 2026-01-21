package com.analytics.dashboard.export;

/**
 * Supported export formats for analytics data.
 * Limited to CSV and JSON as per requirements.
 */
public enum ExportFormat {
    CSV("text/csv", ".csv"),
    JSON("application/json", ".json");

    private final String contentType;
    private final String fileExtension;

    ExportFormat(String contentType, String fileExtension) {
        this.contentType = contentType;
        this.fileExtension = fileExtension;
    }

    public String getContentType() {
        return contentType;
    }

    public String getFileExtension() {
        return fileExtension;
    }
}
