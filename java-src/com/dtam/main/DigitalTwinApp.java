package com.dtam.main;

import com.dtam.exception.AssetNotFoundException;
import com.dtam.exception.SensorThresholdException;
import com.dtam.model.*;
import com.dtam.service.FilePersistenceService;

import java.time.LocalDate;
import java.util.*;

/**
 * Main Executable Menu-Driven Application for:
 * DIGITAL TWIN-BASED ASSET MANAGEMENT SYSTEM (DTAM)
 * Prathyusha Engineering College - Object Oriented Programming in Java Micro Project
 */
public class DigitalTwinApp {
    private static final Map<String, Asset> assetRegistry = new LinkedHashMap<>();
    private static final List<MaintenanceTask> maintenanceList = new ArrayList<>();
    private static final List<Alert> alertList = new ArrayList<>();
    private static final Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        initializeSampleData();
        FilePersistenceService.logSystemEvent("Digital Twin Management System Initialized");

        System.out.println("=================================================================");
        System.out.println("   PRATHYUSHA ENGINEERING COLLEGE - (AN AUTONOMOUS INSTITUTION)  ");
        System.out.println("                 OBJECT ORIENTED PROGRAMMING USING JAVA          ");
        System.out.println("           DIGITAL TWIN-BASED ASSET MANAGEMENT SYSTEM (DTAM)     ");
        System.out.println("     Batch 5: Dilli Kumar J, Dineshkumar K, Gayathri G, Gnnanasai R");
        System.out.println("=================================================================");

        boolean running = true;
        while (running) {
            printMainMenu();
            System.out.print("👉 Enter choice (1-8): ");
            String input = scanner.nextLine().trim();

            switch (input) {
                case "1":
                    viewAllAssets();
                    break;
                case "2":
                    viewAssetDiagnostics();
                    break;
                case "3":
                    simulateFailure();
                    break;
                case "4":
                    resetAssetSimulation();
                    break;
                case "5":
                    viewMaintenanceWorkOrders();
                    break;
                case "6":
                    createNewWorkOrder();
                    break;
                case "7":
                    generateAndSaveComplianceReport();
                    break;
                case "8":
                    System.out.println("\n👋 Exiting Digital Twin Management System. Goodbye!");
                    FilePersistenceService.logSystemEvent("System Terminated Safely");
                    running = false;
                    break;
                default:
                    System.out.println("⚠️ Invalid selection. Please enter a number between 1 and 8.\n");
            }
        }
    }

    private static void printMainMenu() {
        System.out.println("\n================ MAIN OPERATIONS COCKPIT ================");
        System.out.println(" [1] 🏭 View All Digital Twin Assets (Fleet Overview)");
        System.out.println(" [2] 🔍 Inspect Specific Asset Diagnostics & Live Sensors");
        System.out.println(" [3] ⚡ Inject Failure Simulation (Thermal / Bearing Breakdown)");
        System.out.println(" [4] 🔄 Reset Asset to Nominal Baseline Condition");
        System.out.println(" [5] 🛠️  View Prescriptive Maintenance Work Orders");
        System.out.println(" [6] ➕ Create New Maintenance Task");
        System.out.println(" [7] 📄 Export & View ISO-13374 Compliance Report (File I/O)");
        System.out.println(" [8] 🚪 Exit Application");
        System.out.println("=========================================================");
    }

    private static void initializeSampleData() {
        // 1. Centrifugal Pump Asset
        PumpAsset pump = new PumpAsset("PUMP-001", "Primary Coolant Slurry Pump", "Sulzer Industrial", 3420, 450.0, 320.0);
        pump.addSensor(new Sensor("S-TEMP-01", "TEMPERATURE", "°C", 42.5, 75.0, 85.0));
        pump.addSensor(new Sensor("S-VIB-01", "VIBRATION", "mm/s", 1.8, 5.0, 8.0));
        pump.addSensor(new Sensor("S-PRESS-01", "PRESSURE", "bar", 5.2, 8.0, 10.0));
        pump.calculateHealthScore();
        assetRegistry.put(pump.getAssetCode(), pump);

        // 2. Heavy Induction Motor Asset
        MotorAsset motor = new MotorAsset("MOT-002", "High-Torque Drive Motor", "ABB Heavy Power", 6850, 75.0, 1480.0);
        motor.addSensor(new Sensor("S-TEMP-02", "TEMPERATURE", "°C", 48.0, 75.0, 90.0));
        motor.addSensor(new Sensor("S-VIB-02", "VIBRATION", "mm/s", 2.1, 4.5, 7.5));
        motor.addSensor(new Sensor("S-ENG-02", "ENERGY", "kW", 28.4, 45.0, 55.0));
        motor.calculateHealthScore();
        assetRegistry.put(motor.getAssetCode(), motor);

        // Maintenance Work Orders
        maintenanceList.add(new MaintenanceTask("WO-101", "PUMP-001", "Routine Seal Lubrication", "MEDIUM", "SCHEDULED", LocalDate.now().plusDays(5), 450.00, "Alex Rivera"));
        maintenanceList.add(new MaintenanceTask("WO-102", "MOT-002", "Stator Winding Thermal Inspection", "HIGH", "IN_PROGRESS", LocalDate.now().plusDays(2), 1200.00, "Sarah Chen"));
    }

    private static void viewAllAssets() {
        System.out.println("\n--- FLEET-WIDE INDUSTRIAL DIGITAL TWIN OVERVIEW ---");
        for (Asset a : assetRegistry.values()) {
            a.calculateHealthScore();
            System.out.println(a);
        }
        System.out.println("Total Machines Managed: " + assetRegistry.size());
    }

    private static void viewAssetDiagnostics() {
        System.out.print("Enter Asset Code to Inspect (e.g., PUMP-001, MOT-002): ");
        String code = scanner.nextLine().trim().toUpperCase();

        try {
            Asset asset = findAssetOrThrow(code);
            asset.displayDiagnostics();
        } catch (AssetNotFoundException e) {
            System.err.println("❌ Error: " + e.getMessage());
        }
    }

    private static void simulateFailure() {
        System.out.print("Select Asset Code to Inject Failure (PUMP-001 / MOT-002): ");
        String code = scanner.nextLine().trim().toUpperCase();

        try {
            Asset asset = findAssetOrThrow(code);
            System.out.println("\n⚠️ Injecting Thermal Runaway & Mechanical Vibration Spikes into " + code + "...");
            asset.injectFailureSimulation();

            // Evaluate sensor critical thresholds with custom exception handling
            for (Sensor s : asset.getSensors()) {
                if (s.isCritical()) {
                    try {
                        throw new SensorThresholdException(
                                "CRITICAL ALARM: Sensor " + s.getType() + " breached safety limit!",
                                s.getType(), s.getCurrentReading(), s.getCriticalThreshold()
                        );
                    } catch (SensorThresholdException ex) {
                        System.err.println("🚨 EXCEPTION CAUGHT: " + ex.getMessage() + " (Reading: " + ex.getValue() + ", Limit: " + ex.getCriticalThreshold() + ")");
                        Alert alert = new Alert("ALT-" + (alertList.size() + 1), code, "CRITICAL", ex.getMessage());
                        alertList.add(alert);
                    }
                }
            }

            asset.displayDiagnostics();
            FilePersistenceService.logSystemEvent("Failure Simulation Injected on " + code);
            System.out.println("✅ Failure simulation active. Notice health score dropped to " + asset.getHealthScore() + "%!");
        } catch (AssetNotFoundException e) {
            System.err.println("❌ Error: " + e.getMessage());
        }
    }

    private static void resetAssetSimulation() {
        System.out.print("Enter Asset Code to Reset (PUMP-001 / MOT-002): ");
        String code = scanner.nextLine().trim().toUpperCase();

        try {
            Asset asset = findAssetOrThrow(code);
            asset.resetToNominalState();
            System.out.println("✅ Asset " + code + " restored to nominal baseline. Health Score: " + asset.getHealthScore() + "%");
            FilePersistenceService.logSystemEvent("Simulation Reset on " + code);
        } catch (AssetNotFoundException e) {
            System.err.println("❌ Error: " + e.getMessage());
        }
    }

    private static void viewMaintenanceWorkOrders() {
        System.out.println("\n--- PRESCRIPTIVE MAINTENANCE WORK ORDER HUB ---");
        if (maintenanceList.isEmpty()) {
            System.out.println("No work orders registered.");
            return;
        }
        for (MaintenanceTask t : maintenanceList) {
            System.out.println(t);
        }
    }

    private static void createNewWorkOrder() {
        System.out.print("Enter Asset Code: ");
        String code = scanner.nextLine().trim().toUpperCase();
        System.out.print("Enter Task Title: ");
        String title = scanner.nextLine().trim();
        System.out.print("Enter Priority (LOW, MEDIUM, HIGH, URGENT): ");
        String priority = scanner.nextLine().trim().toUpperCase();
        System.out.print("Enter Assigned Technician Name: ");
        String tech = scanner.nextLine().trim();
        System.out.print("Enter Estimated Cost ($): ");
        double cost = 500.0;
        try {
            cost = Double.parseDouble(scanner.nextLine().trim());
        } catch (Exception ignored) {}

        String id = "WO-" + (100 + maintenanceList.size() + 1);
        MaintenanceTask task = new MaintenanceTask(id, code, title, priority, "SCHEDULED", LocalDate.now().plusDays(7), cost, tech);
        maintenanceList.add(task);

        System.out.println("✅ Created Work Order: " + task);
        FilePersistenceService.logSystemEvent("Created Maintenance Task " + id + " for " + code);
    }

    private static void generateAndSaveComplianceReport() {
        System.out.println("\nGenerating ISO-13374 Compliance Report using Java File I/O...");
        FilePersistenceService.saveComplianceReport(
                new ArrayList<>(assetRegistry.values()),
                maintenanceList,
                alertList
        );
        FilePersistenceService.printSavedReport();
    }

    private static Asset findAssetOrThrow(String code) throws AssetNotFoundException {
        Asset asset = assetRegistry.get(code);
        if (asset == null) {
            throw new AssetNotFoundException(code);
        }
        return asset;
    }
}
