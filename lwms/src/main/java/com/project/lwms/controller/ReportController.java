package com.project.lwms.controller;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.*;

import com.project.lwms.model.Report;
import com.project.lwms.service.ReportService;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping("/generate")
    public Report generateReport(@RequestBody Report report) {
        return reportService.generateReport(report.getReportType(), report.getDetails());
    }

    @GetMapping("/view")
    public List<Report> getAllReports() {
        return reportService.getAllReports();
    }

    // You would add more specific endpoints for different report types
}


