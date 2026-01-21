package com.analytics.dashboard.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing an analytics notification/alert.
 * Notifications are generated when analytics metrics cross defined thresholds.
 */
@Entity
@Table(name = "notifications")
@EntityListeners(AuditingEntityListener.class)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private NotificationType type;

    @NotBlank
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private NotificationSeverity severity = NotificationSeverity.INFO;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    /**
     * The actual metric value that triggered the notification.
     */
    @Column(name = "metric_value", precision = 15, scale = 2)
    private BigDecimal metricValue;

    /**
     * The threshold value that was crossed.
     */
    @Column(name = "threshold_value", precision = 15, scale = 2)
    private BigDecimal thresholdValue;

    /**
     * Description of the comparison period (e.g., "today vs yesterday", "last 7d vs previous 7d").
     */
    @Column(name = "comparison_period", length = 50)
    private String comparisonPeriod;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Notification() {}

    // Getters
    public Long getId() { return id; }
    public NotificationType getType() { return type; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public NotificationSeverity getSeverity() { return severity; }
    public boolean isRead() { return read; }
    public BigDecimal getMetricValue() { return metricValue; }
    public BigDecimal getThresholdValue() { return thresholdValue; }
    public String getComparisonPeriod() { return comparisonPeriod; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setType(NotificationType type) { this.type = type; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setSeverity(NotificationSeverity severity) { this.severity = severity; }
    public void setRead(boolean read) { this.read = read; }
    public void setMetricValue(BigDecimal metricValue) { this.metricValue = metricValue; }
    public void setThresholdValue(BigDecimal thresholdValue) { this.thresholdValue = thresholdValue; }
    public void setComparisonPeriod(String comparisonPeriod) { this.comparisonPeriod = comparisonPeriod; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder pattern
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Notification notification = new Notification();

        public Builder id(Long val) { notification.id = val; return this; }
        public Builder type(NotificationType val) { notification.type = val; return this; }
        public Builder title(String val) { notification.title = val; return this; }
        public Builder description(String val) { notification.description = val; return this; }
        public Builder severity(NotificationSeverity val) { notification.severity = val; return this; }
        public Builder read(boolean val) { notification.read = val; return this; }
        public Builder metricValue(BigDecimal val) { notification.metricValue = val; return this; }
        public Builder thresholdValue(BigDecimal val) { notification.thresholdValue = val; return this; }
        public Builder comparisonPeriod(String val) { notification.comparisonPeriod = val; return this; }
        public Builder createdAt(LocalDateTime val) { notification.createdAt = val; return this; }
        public Notification build() { return notification; }
    }

    @Override
    public String toString() {
        return "Notification{" +
                "id=" + id +
                ", type=" + type +
                ", title='" + title + '\'' +
                ", severity=" + severity +
                ", read=" + read +
                ", createdAt=" + createdAt +
                '}';
    }
}
