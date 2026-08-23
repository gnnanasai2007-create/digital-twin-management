package com.dtam.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Encapsulates an Industrial Anomaly / Failure Alert
 */
public class Alert {
    private String alertId;
    private String assetCode;
    private String severity; // INFO, WARNING, CRITICAL
    private String message;
    private LocalDateTime timestamp;
    private boolean acknowledged;

    public Alert(String alertId, String assetCode, String severity, String message) {
        this.alertId = alertId;
        this.assetCode = assetCode;
        this.severity = severity;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.acknowledged = false;
    }

    public String getAlertId() { return alertId; }
    public String getAssetCode() { return assetCode; }
    public String getSeverity() { return severity; }
    public String getMessage() { return message; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public boolean isAcknowledged() { return acknowledged; }
    public void setAcknowledged(boolean acknowledged) { this.acknowledged = acknowledged; }

    @Override
    public String toString() {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm:ss");
        return String.format("[%s] [%-8s] [%s] %-10s : %s (Ack: %s)",
                timestamp.format(dtf), severity, alertId, assetCode, message, acknowledged ? "YES" : "NO");
    }
}
