package com.project.lwms.model;



import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int reportId;
	private String reportType;
	private LocalDateTime generatedOn;
	private String details;


	public int getReportId() {

		return reportId;
	}
	public void setReportId(int reportId) {

		this.reportId = reportId;
	}
	public String getReportType() {

		return reportType;
	}
	public void setReportType(String reportType) {

		this.reportType = reportType;
	}
	public LocalDateTime getGeneratedOn() {

		return generatedOn;
	}
	public void setGeneratedOn(LocalDateTime generatedOn) {

		this.generatedOn = generatedOn;
	}
	public String getDetails() {

		return details;
	}
	public void setDetails(String details) {

		this.details = details;
	}


	public Report(int reportId, String reportType, LocalDateTime generatedOn, String details) {
		super();
		this.reportId = reportId;
		this.reportType = reportType;
		this.generatedOn = generatedOn;
		this.details = details;
	}

	public Report() {
		super();
	}

	@Override
	public String toString() {
		return "Report [reportId=" + reportId + ", reportType=" + reportType + "," +
				" generatedOn=" + generatedOn + ", details=" + details + "]";
	}

}
