package com.dtam.interfaces;

/**
 * Interface defining monitoring capabilities for digital twin assets
 */
public interface Monitorable {
    double calculateHealthScore();
    void updateSensorTelemetry(String sensorType, double value);
    void displayDiagnostics();
}
