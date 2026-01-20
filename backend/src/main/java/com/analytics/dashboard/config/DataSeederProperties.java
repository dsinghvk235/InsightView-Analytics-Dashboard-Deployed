package com.analytics.dashboard.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for data seeder.
 * Controls whether large-scale data seeding is enabled.
 */
@Component
@ConfigurationProperties(prefix = "app.data-seeder")
public class DataSeederProperties {
    
    /**
     * Enable/disable large-scale data seeding.
     * Set to true to generate 5,000+ users and 500,000+ transactions.
     * Default: false (disabled)
     */
    private boolean enabled = false;
    
    /**
     * Number of users to generate.
     * Default: 5000
     */
    private int userCount = 5000;
    
    /**
     * Number of transactions to generate.
     * Default: 500000
     */
    private int transactionCount = 500000;
    
    /**
     * Batch size for JPA inserts.
     * Default: 1000
     */
    private int batchSize = 1000;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getUserCount() {
        return userCount;
    }

    public void setUserCount(int userCount) {
        this.userCount = userCount;
    }

    public int getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(int transactionCount) {
        this.transactionCount = transactionCount;
    }

    public int getBatchSize() {
        return batchSize;
    }

    public void setBatchSize(int batchSize) {
        this.batchSize = batchSize;
    }
}
