package com.project.lwms.service;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import com.project.lwms.model.MaintenanceSchedule;
import com.project.lwms.model.ReportRequest;
import com.project.lwms.repository.MaintenanceScheduleRepository;

import java.util.List;
import java.util.Optional;

@Service
public class MaintenanceService {
	
	@Autowired
	private ReportService reportService;

    @Autowired
    private MaintenanceScheduleRepository maintenanceScheduleRepository;

    public MaintenanceSchedule scheduleMaintenance(MaintenanceSchedule maintenanceSchedule) {
        maintenanceSchedule.setCompletionStatus("SCHEDULED");
         
        ReportRequest reportRequest = new ReportRequest();
        reportRequest.setReportType("Maintenance");
        reportRequest.setDetails("New maintenance schedule created for task: " + maintenanceSchedule.getTaskDescription());
        reportService.createReport(reportRequest);
        
        return maintenanceScheduleRepository.save(maintenanceSchedule);
    }

    public MaintenanceSchedule updateSchedule(int scheduleId, MaintenanceSchedule updatedSchedule) {
        Optional<MaintenanceSchedule> existingSchedule = maintenanceScheduleRepository.findById(scheduleId);
        if (existingSchedule.isPresent()) {
            MaintenanceSchedule schedule = existingSchedule.get();
            schedule.setEquipmentId(updatedSchedule.getEquipmentId());
            schedule.setTaskDescription(updatedSchedule.getTaskDescription());
            schedule.setScheduledDate(updatedSchedule.getScheduledDate());
            schedule.setCompletionStatus(updatedSchedule.getCompletionStatus());
          
            ReportRequest reportRequest = new ReportRequest();
            reportRequest.setReportType("Maintenance");
            reportRequest.setDetails("Maintenance schedule updated for Schedule ID: " + schedule.getScheduleId());
            reportService.createReport(reportRequest);
            
            return maintenanceScheduleRepository.save(schedule);
        }
        return null;
    }

    public List<MaintenanceSchedule> viewSchedule() {

        return maintenanceScheduleRepository.findAll();
    }
}
