package com.dtam.model;

/**
 * Encapsulates an IoT Sensor connected to an industrial asset
 */
public class Sensor {
    private String sensorCode;
    private String type; // TEMPERATURE, VIBRATION, PRESSURE, RPM
    private String unit;
    private double currentReading;
    private double warningThreshold;
    private double criticalThreshold;

    public Sensor(String sensorCode, String type, String unit, double currentReading, double warningThreshold, double criticalThreshold) {
        this.sensorCode = sensorCode;
        this.type = type;
        this.unit = unit;
        this.currentReading = currentReading;
        this.warningThreshold = warningThreshold;
        this.criticalThreshold = criticalThreshold;
    }

    public String getSensorCode() { return sensorCode; }
    public String getType() { return type; }
    public String getUnit() { return unit; }
    public double getCurrentReading() { return currentReading; }
    public void setCurrentReading(double currentReading) { this.currentReading = currentReading; }
    public double getWarningThreshold() { return warningThreshold; }
    public double getCriticalThreshold() { return criticalThreshold; }

    public boolean isWarning() {
        return currentReading >= warningThreshold && currentReading < criticalThreshold;
    }

    public boolean isCritical() {
        return currentReading >= criticalThreshold;
    }

    @Override
    public String toString() {
        String status = isCritical() ? "CRITICAL" : (isWarning() ? "WARNING" : "NORMAL");
        return String.format("[%s] %-12s : %6.2f %-5s (Status: %s)", sensorCode, type, currentReading, unit, status);
    }
}
