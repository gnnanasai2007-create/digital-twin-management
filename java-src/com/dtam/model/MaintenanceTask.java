package com.dtam.model;

import java.time.LocalDate;

/**
 * Encapsulates a Prescriptive Maintenance Work Order
 */
public class MaintenanceTask {
    private String taskId;
    private String assetCode;
    private String title;
    private String priority; // LOW, MEDIUM, HIGH, URGENT
    private String status;   // SCHEDULED, IN_PROGRESS, COMPLETED, OVERDUE
    private LocalDate scheduledDate;
    private double estimatedCost;
    private String assignedTechnician;

    public MaintenanceTask(String taskId, String assetCode, String title, String priority, String status, LocalDate scheduledDate, double estimatedCost, String assignedTechnician) {
        this.taskId = taskId;
        this.assetCode = assetCode;
        this.title = title;
        this.priority = priority;
        this.status = status;
        this.scheduledDate = scheduledDate;
        this.estimatedCost = estimatedCost;
        this.assignedTechnician = assignedTechnician;
    }

    public String getTaskId() { return taskId; }
    public String getAssetCode() { return assetCode; }
    public String getTitle() { return title; }
    public String getPriority() { return priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getScheduledDate() { return scheduledDate; }
    public double getEstimatedCost() { return estimatedCost; }
    public String getAssignedTechnician() { return assignedTechnician; }

    @Override
    public String toString() {
        return String.format("[%s] %-10s | %-25s | Priority: %-6s | Status: %-11s | Tech: %-12s | Cost: $%.2f",
                taskId, assetCode, title, priority, status, assignedTechnician, estimatedCost);
    }
}
