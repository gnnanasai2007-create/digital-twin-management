package com.dtam.model;

/**
 * Concrete Subclass representing an Induction Electric Motor Asset
 * Inherits from Asset and implements specialized electromagnetic telemetry logic.
 */
public class MotorAsset extends Asset {
    private double powerKw;
    private double ratedRpm;

    public MotorAsset(String assetCode, String name, String manufacturer, double operatingHours, double powerKw, double ratedRpm) {
        super(assetCode, name, "ELECTRIC_MOTOR", manufacturer, operatingHours);
        this.powerKw = powerKw;
        this.ratedRpm = ratedRpm;
    }

    public double getPowerKw() { return powerKw; }
    public double getRatedRpm() { return ratedRpm; }

    @Override
    public double calculateHealthScore() {
        double score = 100.0;
        Sensor temp = getSensorByType("TEMPERATURE");
        Sensor vib = getSensorByType("VIBRATION");
        Sensor energy = getSensorByType("ENERGY");

        if (temp != null) {
            if (temp.isCritical()) score -= 35;
            else if (temp.isWarning()) score -= 15;
        }

        if (vib != null) {
            if (vib.isCritical()) score -= 40;
            else if (vib.isWarning()) score -= 20;
        }

        if (energy != null) {
            if (energy.isCritical()) score -= 25;
            else if (energy.isWarning()) score -= 10;
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
        updateSensorTelemetry("TEMPERATURE", 94.0); // Winding insulation breakdown
        updateSensorTelemetry("VIBRATION", 14.2);   // Rotor eccentricity
        updateSensorTelemetry("ENERGY", 58.0);      // Current overload spike
        calculateHealthScore();
    }

    @Override
    public void resetToNominalState() {
        this.failureMode = false;
        updateSensorTelemetry("TEMPERATURE", 48.0);
        updateSensorTelemetry("VIBRATION", 1.4);
        updateSensorTelemetry("ENERGY", 24.5);
        calculateHealthScore();
    }

    @Override
    public void displayDiagnostics() {
        System.out.println("==================================================");
        System.out.println(" ⚡ DIGITAL TWIN DIAGNOSTICS: " + name + " (" + assetCode + ")");
        System.out.println("==================================================");
        System.out.println(" Type: 3-Phase Induction Motor | Power: " + powerKw + " kW | Rated Speed: " + ratedRpm + " RPM");
        System.out.println(" Health Score: " + healthScore + "% | Operational Status: " + status);
        System.out.println(" Telemetry Transducer Readings:");
        for (Sensor s : sensors) {
            System.out.println("   " + s);
        }
        System.out.println(" Stator & Rotor Failure State: " + (failureMode ? "CRITICAL ALARM ACTIVE" : "NOMINAL BALANCED"));
        System.out.println("==================================================");
    }

    @Override
    public String getOperatingParametersSummary() {
        return "Rated Power: " + powerKw + " kW, Speed: " + ratedRpm + " RPM, Duty Hours: " + operatingHours + " hrs";
    }
}
