package com.project.lwms.service;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.lwms.model.Inventory;
import com.project.lwms.model.ReportRequest;
import com.project.lwms.model.Space;
import com.project.lwms.repository.InventoryRepository;
import com.project.lwms.repository.SpaceRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {
	
	@Autowired
	private ReportService reportService;

    @Autowired
    private SpaceRepository spaceRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    public List<Inventory> viewInventory(){

        return inventoryRepository.findAll();
    }

    public Optional<Inventory> findById(int id) {

        return inventoryRepository.findById(id);
    }
    
    public Inventory addItem(Inventory inventory,int q) {
        
        inventory.setLastUpdated(LocalDateTime.now());
        
        int i = inventory.getSpace().getSpaceId();
        Optional<Space> spc = spaceRepository.findById(i);
        
        if(spc.isPresent()) {
            Space spcc = spc.get();
            
            inventory.setLocation(spcc.getZone());
            
            if (spcc.getAvailableCapacity() >= q) {
                spcc.setAvailableCapacity(spcc.getAvailableCapacity() - q);
                spcc.setUsedCapacity(spcc.getUsedCapacity() + q);
                spaceRepository.save(spcc);
                
                ReportRequest reportRequest = new ReportRequest();
                reportRequest.setReportType("Inventory");
                reportRequest.setDetails("New item added: " + inventory.getItemName() + " (ID: " + inventory.getItemId() + ")");
                reportService.createReport(reportRequest);
                
                return inventoryRepository.save(inventory);
            }
        }
        return null;
    }
    
    @Transactional
    public Inventory updateItem(int id, Inventory updatedItem) {
        Optional<Inventory> optionalInventory = inventoryRepository.findById(id);

        if (optionalInventory.isPresent()) {
            Inventory existingItem = optionalInventory.get();

            int oldQuantity = existingItem.getQuantity();
            int oldSpaceId = existingItem.getSpace().getSpaceId();

            existingItem.setItemName(updatedItem.getItemName());
            existingItem.setCategory(updatedItem.getCategory());
            existingItem.setLastUpdated(LocalDateTime.now());

            int newQuantity = updatedItem.getQuantity();
            int newSpaceId = updatedItem.getSpace().getSpaceId();

            // Case 1: Quantity changes within the same space
            if (oldSpaceId == newSpaceId) {
                int quantityChange = newQuantity - oldQuantity;
                if (quantityChange != 0) {
                    Optional<Space> optionalSpace = spaceRepository.findById(oldSpaceId);
                    if (optionalSpace.isPresent()) {
                        Space space = optionalSpace.get();
                        if (space.getAvailableCapacity() >= quantityChange) {
                            space.setAvailableCapacity(space.getAvailableCapacity() - quantityChange);
                            space.setUsedCapacity(space.getUsedCapacity() + quantityChange);
                            spaceRepository.save(space);
                            existingItem.setQuantity(newQuantity);
                            
                               ReportRequest reportRequest = new ReportRequest();
                               reportRequest.setReportType("Inventory");
                               reportRequest.setDetails("Item updated: " + existingItem.getItemName() + " (ID: " + existingItem.getItemId() + ")");
                               reportService.createReport(reportRequest);
                            
                            return inventoryRepository.save(existingItem);
                        } else {
                            return null;
                        }
                    }
                } 
                else {
                       ReportRequest reportRequest = new ReportRequest();
                       reportRequest.setReportType("Inventory");
                       reportRequest.setDetails("Item "+existingItem.getItemId() +" details updated.");
                       reportService.createReport(reportRequest);
                	
                    return inventoryRepository.save(existingItem);
                }
            }
            // Case 2: Space changes (and possibly quantity)
            else {
                Optional<Space> oldSpaceOptional = spaceRepository.findById(oldSpaceId);
                Optional<Space> newSpaceOptional = spaceRepository.findById(newSpaceId);

                if (oldSpaceOptional.isPresent() && newSpaceOptional.isPresent()) {
                    Space oldSpace = oldSpaceOptional.get();
                    Space newSpace = newSpaceOptional.get();

                    // Check if new space has enough capacity
                    if (newSpace.getAvailableCapacity() >= newQuantity) {
                
                        oldSpace.setAvailableCapacity(oldSpace.getAvailableCapacity() + oldQuantity);
                        oldSpace.setUsedCapacity(oldSpace.getUsedCapacity() - oldQuantity);
                        spaceRepository.save(oldSpace);

                        newSpace.setAvailableCapacity(newSpace.getAvailableCapacity() - newQuantity);
                        newSpace.setUsedCapacity(newSpace.getUsedCapacity() + newQuantity);
                        spaceRepository.save(newSpace);

                        existingItem.setQuantity(newQuantity);
                        existingItem.setSpace(newSpace);
                     
                           ReportRequest reportRequest = new ReportRequest();
                           reportRequest.setReportType("Inventory");
                           reportRequest.setDetails("Updated Space at space Id linked to Item ID: " +existingItem.getItemId());
                           reportService.createReport(reportRequest);
                        
                        
                        return inventoryRepository.save(existingItem);
                    }
                }
            }
        }
        return null;
    }

    @Transactional
    public Inventory updateInventoryQuantity(int itemId, int quantityChange) {
        Optional<Inventory> existingItemOptional = inventoryRepository.findById(itemId);
        if (existingItemOptional.isPresent()) {
            Inventory existingItem = existingItemOptional.get();

            int currentQuantity = existingItem.getQuantity();
            int newQuantity = currentQuantity + quantityChange;

            if (newQuantity < 0) {
                return null;
            }

            int spaceId = existingItem.getSpace().getSpaceId();
            Optional<Space> spaceOptional = spaceRepository.findById(spaceId);

            if (spaceOptional.isPresent()) {
                Space space = spaceOptional.get();

                int newAvailableCapacity = space.getAvailableCapacity() - quantityChange;
                int newUsedCapacity = space.getUsedCapacity() + quantityChange;

                if (newAvailableCapacity < 0) {
                    return null;
                }

                space.setAvailableCapacity(newAvailableCapacity);
                space.setUsedCapacity(newUsedCapacity);

                spaceRepository.save(space);

                existingItem.setQuantity(newQuantity);
                existingItem.setLastUpdated(LocalDateTime.now());
 
                   ReportRequest reportRequest = new ReportRequest();
                   reportRequest.setReportType("Inventory");
                   reportRequest.setDetails("Updated Space at space Id linked to Item ID: " +existingItem.getItemId());                   reportService.createReport(reportRequest);

                return inventoryRepository.save(existingItem);
            }
        }
        return null;
    }
    
public void removeItem(int itemId) {
    	
    	Optional<Inventory> inventory = inventoryRepository.findById(itemId);
        
        if(inventory.isPresent()) {
        	Inventory existingItem = inventory.get();
        	int spcid = existingItem.getSpace().getSpaceId();
        	Optional<Space> spaceOptional = spaceRepository.findById(spcid);
        	if(spaceOptional.isPresent()) {
        		
        		Space space = spaceOptional.get();
        		space.setAvailableCapacity(space.getAvailableCapacity()+existingItem.getQuantity());
        		space.setUsedCapacity(space.getUsedCapacity()-existingItem.getQuantity());
        		spaceRepository.save(space);
        	}
        }
    	
        ReportRequest reportRequest = new ReportRequest();
        reportRequest.setReportType("Inventory");
        reportRequest.setDetails("Item ID "+itemId +" is Deleted.");
        reportService.createReport(reportRequest);
        
        
    	
 
        inventoryRepository.deleteById(itemId);
    }
 
 
    
    public Inventory createAndSaveNewItem(String itemName, Space space) {
        Inventory newInventory = new Inventory();
        newInventory.setItemName(itemName);
        newInventory.setCategory("Uncategorized");
        newInventory.setQuantity(0); 
        newInventory.setLastUpdated(LocalDateTime.now());
        newInventory.setSpace(space); 
        newInventory.setLocation(space.getZone()); 

        return inventoryRepository.save(newInventory);
    }
}


