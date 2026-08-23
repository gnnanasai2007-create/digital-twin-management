package com.dtam.exception;

/**
 * Custom Exception thrown when critical sensor threshold is breached
 */
public class SensorThresholdException extends Exception {
    private final String sensorType;
    private final double value;
    private final double criticalThreshold;

    public SensorThresholdException(String message, String sensorType, double value, double criticalThreshold) {
        super(message);
        this.sensorType = sensorType;
        this.value = value;
        this.criticalThreshold = criticalThreshold;
    }

    public String getSensorType() {
        return sensorType;
    }

    public double getValue() {
        return value;
    }

    public double getCriticalThreshold() {
        return criticalThreshold;
    }
}
