package com.project.lwms.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.lwms.model.MaintenanceSchedule;
import com.project.lwms.service.MaintenanceService;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;
    
    private static final Logger logger = LoggerFactory.getLogger(MaintenanceController.class);

    @PostMapping("/add")
    public MaintenanceSchedule scheduleMaintenance(@RequestBody MaintenanceSchedule maintenanceSchedule) {
    	logger.info("Adding a schedule..!");
        return maintenanceService.scheduleMaintenance(maintenanceSchedule);
    }

    @PutMapping("/update/{scheduleId}")
    public ResponseEntity<MaintenanceSchedule> updateSchedule(@PathVariable int scheduleId, @RequestBody MaintenanceSchedule maintenanceSchedule) {
        MaintenanceSchedule updatedSchedule = maintenanceService.updateSchedule(scheduleId, maintenanceSchedule);
        if (updatedSchedule != null) {
            return ResponseEntity.ok(updatedSchedule);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/view")
    public List<MaintenanceSchedule> viewSchedule() {
        return maintenanceService.viewSchedule();
    }
}