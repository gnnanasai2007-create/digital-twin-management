package com.dtam.model;

/**
 * Concrete Subclass representing a Centrifugal Pump Asset
 * Inherits from Asset and overrides diagnostic & calculation logic (Inheritance & Polymorphism)
 */
public class PumpAsset extends Asset {
    private double flowRateGPM;
    private double impellerDiameterMm;

    public PumpAsset(String assetCode, String name, String manufacturer, double operatingHours, double flowRateGPM, double impellerDiameterMm) {
        super(assetCode, name, "CENTRIFUGAL_PUMP", manufacturer, operatingHours);
        this.flowRateGPM = flowRateGPM;
        this.impellerDiameterMm = impellerDiameterMm;
    }

    public double getFlowRateGPM() { return flowRateGPM; }
    public double getImpellerDiameterMm() { return impellerDiameterMm; }

    @Override
    public double calculateHealthScore() {
        double score = 100.0;
        Sensor temp = getSensorByType("TEMPERATURE");
        Sensor vib = getSensorByType("VIBRATION");
        Sensor press = getSensorByType("PRESSURE");

        if (temp != null) {
            if (temp.isCritical()) score -= 35;
            else if (temp.isWarning()) score -= 15;
        }

        if (vib != null) {
            if (vib.isCritical()) score -= 40;
            else if (vib.isWarning()) score -= 20;
        }

        if (press != null) {
            if (press.isCritical()) score -= 20;
            else if (press.isWarning()) score -= 10;
        }

        this.healthScore = Math.max(0, Math.min(100, score));
        if (this.healthScore < 40) {
            this.status = "CRITICAL";
        } else if (this.healthScore < 75) {
            this.status = "WARNING";
        } else {
            this.status = "HEALTHY";
        }

        return this.healthScore;
    }

    @Override
    public void injectFailureSimulation() {
        this.failureMode = true;
        updateSensorTelemetry("TEMPERATURE", 88.5); // Thermal runaway
        updateSensorTelemetry("VIBRATION", 11.8);   // Mechanical bearing seizure
        updateSensorTelemetry("PRESSURE", 12.4);    // Hydraulic cavitation spike
        calculateHealthScore();
    }

    @Override
    public void resetToNominalState() {
        this.failureMode = false;
        updateSensorTelemetry("TEMPERATURE", 45.0);
        updateSensorTelemetry("VIBRATION", 1.8);
        updateSensorTelemetry("PRESSURE", 5.2);
        calculateHealthScore();
    }

    @Override
    public void displayDiagnostics() {
        System.out.println("==================================================");
        System.out.println(" 🏭 DIGITAL TWIN DIAGNOSTICS: " + name + " (" + assetCode + ")");
        System.out.println("==================================================");
        System.out.println(" Type: Centrifugal Slurry Pump | Flow Rate: " + flowRateGPM + " GPM | Impeller: " + impellerDiameterMm + " mm");
        System.out.println(" Health Score: " + healthScore + "% | Operational Status: " + status);
        System.out.println(" Telemetry Transducer Readings:");
        for (Sensor s : sensors) {
            System.out.println("   " + s);
        }
        System.out.println(" Failure Mode Injected: " + (failureMode ? "YES (CRITICAL HAZARD)" : "NO (NOMINAL)"));
        System.out.println("==================================================");
    }

    @Override
    public String getOperatingParametersSummary() {
        return "Rated Flow: " + flowRateGPM + " GPM, Impeller: " + impellerDiameterMm + "mm, Duty Hours: " + operatingHours + " hrs";
    }
}
