package com.dtam.service;

import com.dtam.model.Alert;
import com.dtam.model.Asset;
import com.dtam.model.MaintenanceTask;
import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service demonstrating File Handling (FileWriter, BufferedWriter, BufferedReader)
 * for saving and exporting Asset Management Reports and Audit Logs to persistent disk storage.
 */
public class FilePersistenceService {
    private static final String REPORT_FILE = "digital_twin_compliance_report.txt";
    private static final String LOG_FILE = "system_telemetry_audit.log";

    public static void saveComplianceReport(List<Asset> assets, List<MaintenanceTask> tasks, List<Alert> alerts) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(REPORT_FILE))) {
            writer.write("========================================================================\n");
            writer.write("        PRATHYUSHA ENGINEERING COLLEGE - (AN AUTONOMOUS INSTITUTION)     \n");
            writer.write("           DIGITAL TWIN-BASED ASSET MANAGEMENT SYSTEM (DTAM)             \n");
            writer.write("                  ISO-13374 ENGINEERING COMPLIANCE REPORT                \n");
            writer.write("========================================================================\n");
            writer.write("Generated Timestamp: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "\n\n");

            writer.write("--- 1. INDUSTRIAL ASSET FLEET HEALTH AUDIT ---\n");
            for (Asset a : assets) {
                writer.write(String.format("Asset: %-10s | %-25s | Health: %5.1f%% | Status: %-8s\n",
                        a.getAssetCode(), a.getName(), a.getHealthScore(), a.getStatus()));
                writer.write("  Specs: " + a.getOperatingParametersSummary() + "\n");
            }

            writer.write("\n--- 2. PRESCRIPTIVE MAINTENANCE WORK ORDERS ---\n");
            for (MaintenanceTask t : tasks) {
                writer.write(t.toString() + "\n");
            }

            writer.write("\n--- 3. ACTIVE TELEMETRY ALERTS & ANOMALIES ---\n");
            for (Alert al : alerts) {
                writer.write(al.toString() + "\n");
            }

            writer.write("\n========================================================================\n");
            writer.write("Report compiled successfully and verified by DTAM Core Engine.\n");
            System.out.println("📄 Compliance report saved successfully to: " + REPORT_FILE);
        } catch (IOException e) {
            System.err.println("❌ File Writing Error: " + e.getMessage());
        }
    }

    public static void logSystemEvent(String event) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(LOG_FILE, true))) {
            String logEntry = String.format("[%s] %s\n",
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), event);
            writer.write(logEntry);
        } catch (IOException e) {
            System.err.println("❌ Audit Logging Error: " + e.getMessage());
        }
    }

    public static void printSavedReport() {
        File file = new File(REPORT_FILE);
        if (!file.exists()) {
            System.out.println("⚠️ No saved report file found on disk. Generate one first.");
            return;
        }

        System.out.println("\n--- READING REPORT FILE FROM DISK (" + REPORT_FILE + ") ---");
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            System.err.println("❌ File Reading Error: " + e.getMessage());
        }
    }
}
