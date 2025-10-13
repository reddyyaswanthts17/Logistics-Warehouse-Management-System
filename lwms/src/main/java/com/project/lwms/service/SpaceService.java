package com.project.lwms.service;


import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import com.project.lwms.model.ReportRequest;
import com.project.lwms.model.Space;
import com.project.lwms.repository.SpaceRepository;

import java.util.List;
import java.util.Optional;

@Service
public class SpaceService {
	
	@Autowired
	private ReportService reportService;

    @Autowired
    private SpaceRepository spaceRepository;

    public List<Space> viewSpaceUsage() {

        return spaceRepository.findAll();
    }

    public Optional<Space> findById(int id) {
        return spaceRepository.findById(id);
    }

    public Space allocateSpace(Space space) {
    	
    	 ReportRequest reportRequest = new ReportRequest();
         reportRequest.setReportType("Space");
         reportRequest.setDetails("New space zone created: " + space.getZone() + " with total capacity " + space.getTotalCapacity());
         reportService.createReport(reportRequest);

        return spaceRepository.save(space);
    }

    public Space freeSpace(int spaceId,Space updatedSpace) {
        Optional<Space> spaceOptional = spaceRepository.findById(spaceId);
        if (spaceOptional.isPresent()) {
            Space space = spaceOptional.get();
            space.setTotalCapacity(updatedSpace.getTotalCapacity());
            space.setUsedCapacity(updatedSpace.getUsedCapacity());
            space.setAvailableCapacity(updatedSpace.getAvailableCapacity());
            

       	    ReportRequest reportRequest = new ReportRequest();
            reportRequest.setReportType("Space");
            reportRequest.setDetails("Space zone updated at Zone: " + space.getZone() + " with total capacity " + space.getTotalCapacity());
            reportService.createReport(reportRequest);
            
            return spaceRepository.save(space);
        }
        return null;
    }
}
