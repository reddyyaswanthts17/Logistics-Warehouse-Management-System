package com.project.lwms.model;



import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
public class MaintenanceSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int scheduleId;
	private int equipmentId;
	private String taskDescription;
	private LocalDateTime scheduledDate;
	private String completionStatus;

    public int getScheduleId() {
		return scheduleId;
	}
	public void setScheduleId(int scheduleId) {
		this.scheduleId = scheduleId;
	}
	public int getEquipmentId() {

		return equipmentId;
	}
	public void setEquipmentId(int equipmentId) {

		this.equipmentId = equipmentId;
	}
	public String getTaskDescription() {

		return taskDescription;
	}
	public void setTaskDescription(String taskDescription) {

		this.taskDescription = taskDescription;
	}
	public LocalDateTime getScheduledDate() {

		return scheduledDate;
	}
	public void setScheduledDate(LocalDateTime scheduledDate) {

		this.scheduledDate = scheduledDate;
	}
	public String getCompletionStatus() {

		return completionStatus;
	}
	public void setCompletionStatus(String completionStatus) {

		this.completionStatus = completionStatus;
	}

	public MaintenanceSchedule(int scheduleId, int equipmentId, String taskDescription, LocalDateTime scheduledDate,
			String completionStatus) {
		super();
		this.scheduleId = scheduleId;
		this.equipmentId = equipmentId;
		this.taskDescription = taskDescription;
		this.scheduledDate = scheduledDate;
		this.completionStatus = completionStatus;
	}

	public MaintenanceSchedule() {
		super();
	}

	@Override
	public String toString() {
		return "MaintenanceSchedule [scheduleId=" + scheduleId + ", equipmentId=" + equipmentId + ", taskDescription="
				+ taskDescription + ", scheduledDate=" + scheduledDate + ", completionStatus=" + completionStatus + "]";
	}
}