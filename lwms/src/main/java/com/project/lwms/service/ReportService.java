package com.project.lwms.service;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import com.project.lwms.model.Report;
import com.project.lwms.model.ReportRequest;
import com.project.lwms.repository.ReportRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    public Report generateReport(String reportType, String details) {
        Report report = new Report();
        report.setReportType(reportType);
        report.setDetails(details);
        report.setGeneratedOn(LocalDateTime.now());
        return reportRepository.save(report);
    }

    public List<Report> getAllReports() {

        return reportRepository.findAll();
    }
    
    public Report createReport(ReportRequest reportRequest) {
        Report report = new Report();
        report.setGeneratedOn(LocalDateTime.now());
        report.setReportType(reportRequest.getReportType());
        report.setDetails(reportRequest.getDetails());
        return reportRepository.save(report);
    }


}
