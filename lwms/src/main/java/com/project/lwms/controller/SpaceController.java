package com.project.lwms.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.lwms.model.Space;
import com.project.lwms.service.SpaceService;

import java.util.List;

@RestController
@RequestMapping("/api/space")
public class SpaceController {

    @Autowired
    private SpaceService spaceService;
    
    private static final Logger logger = LoggerFactory.getLogger(SpaceController.class);

    @GetMapping("/view")
    public List<Space> viewSpaceUsage() {
    	logger.info("Viewing the rows in the Space Table!");
        return spaceService.viewSpaceUsage();
    }

    @PostMapping("/allocate")
    public Space allocateSpace(@RequestBody Space space) {
    	logger.info("Allocating a new Zone in the database!");
        return spaceService.allocateSpace(space);
    }

    @PutMapping("/free/{spaceId}")
    public ResponseEntity<Space> freeSpace(@PathVariable int spaceId, @RequestBody Space updatedSpace) {
    	logger.info("Updating the capacities in the zone!");
        Space space = spaceService.freeSpace(spaceId, updatedSpace);
        if (space != null) {
            return ResponseEntity.ok(space);
        }
        return ResponseEntity.notFound().build();
    }
}