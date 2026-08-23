package com.dtam.model;

import com.dtam.interfaces.Monitorable;
import com.dtam.interfaces.Simulatable;
import java.util.ArrayList;
import java.util.List;

/**
 * Abstract Base Class representing an Industrial Asset in the Digital Twin System
 * Demonstrates Abstraction, Encapsulation, and Polymorphism.
 */
public abstract class Asset implements Monitorable, Simulatable {
    protected String assetCode;
    protected String name;
    protected String type;
    protected String manufacturer;
    protected double operatingHours;
    protected String status; // HEALTHY, WARNING, CRITICAL
    protected double healthScore;
    protected List<Sensor> sensors;
    protected boolean failureMode;

    public Asset(String assetCode, String name, String type, String manufacturer, double operatingHours) {
        this.assetCode = assetCode;
        this.name = name;
        this.type = type;
        this.manufacturer = manufacturer;
        this.operatingHours = operatingHours;
        this.status = "HEALTHY";
        this.healthScore = 100.0;
        this.sensors = new ArrayList<>();
        this.failureMode = false;
    }

    public String getAssetCode() { return assetCode; }
    public String getName() { return name; }
    public String getType() { return type; }
    public String getManufacturer() { return manufacturer; }
    public double getOperatingHours() { return operatingHours; }
    public void setOperatingHours(double operatingHours) { this.operatingHours = operatingHours; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public double getHealthScore() { return healthScore; }
    public List<Sensor> getSensors() { return sensors; }

    public void addSensor(Sensor sensor) {
        this.sensors.add(sensor);
    }

    public Sensor getSensorByType(String type) {
        for (Sensor s : sensors) {
            if (s.getType().equalsIgnoreCase(type)) {
                return s;
            }
        }
        return null;
    }

    @Override
    public void updateSensorTelemetry(String sensorType, double value) {
        Sensor s = getSensorByType(sensorType);
        if (s != null) {
            s.setCurrentReading(value);
        }
    }

    @Override
    public boolean isInFailureMode() {
        return failureMode;
    }

    /**
     * Abstract method implemented differently by specific asset types (Polymorphism)
     */
    public abstract String getOperatingParametersSummary();

    @Override
    public String toString() {
        return String.format("[%s] %-28s | Type: %-15s | Health: %5.1f%% | Status: %-8s | Hours: %.0f hrs",
                assetCode, name, type, healthScore, status, operatingHours);
    }
}
