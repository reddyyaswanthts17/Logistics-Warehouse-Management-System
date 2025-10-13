package com.project.lwms.service;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import com.project.lwms.model.Inventory;
import com.project.lwms.model.ReportRequest;
import com.project.lwms.model.Shipment;
import com.project.lwms.model.Space;
import com.project.lwms.repository.InventoryRepository;
import com.project.lwms.repository.ShipmentRepository;
import com.project.lwms.repository.SpaceRepository;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ShipmentService {
	
	@Autowired
	private ReportService reportService;

    @Autowired
    private SpaceRepository spaceRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;
    
    @Autowired
    private InventoryService inventoryService;    
    
    @Transactional
    public Shipment receiveShipment(Shipment shipment, String newItemName) {
        Inventory inv;
        Space spc;

        if (newItemName != null && !newItemName.trim().isEmpty()) {
           
            int spcId = shipment.getSpace().getSpaceId();
            spc = spaceRepository.findById(spcId)
                    .orElseThrow(() -> new RuntimeException("Space not found with ID: " + spcId));

            inv = inventoryService.createAndSaveNewItem(newItemName, spc);
        } 
        else {
            int invId = shipment.getInventory().getItemId();
            inv = inventoryRepository.findById(invId)
                    .orElseThrow(() -> new RuntimeException("Inventory item not found with ID: " + invId));
            
            if (inv.getSpace() == null) {
                throw new RuntimeException("Inventory item is not linked to a space.");
            }
            spc = inv.getSpace();
        }

        if (spc.getAvailableCapacity() < shipment.getQuantity()) {
            return null;
        }

        inv.setQuantity(inv.getQuantity() + shipment.getQuantity());
        spc.setAvailableCapacity(spc.getAvailableCapacity() - shipment.getQuantity());
        spc.setUsedCapacity(spc.getUsedCapacity() + shipment.getQuantity());

        inventoryRepository.save(inv);
        spaceRepository.save(spc);

        shipment.setStatus("RECEIVED");
        shipment.setInventory(inv);
        shipment.setSpace(spc);

        ReportRequest reportRequest = new ReportRequest();
        reportRequest.setReportType("Shipment");
        reportRequest.setDetails("Shipment Received with shipment ID: " + shipment.getShipmentId());
        reportService.createReport(reportRequest);

        return shipmentRepository.save(shipment);
    }
    
    
    
    @Transactional
    public Shipment dispatchShipment(int shipmentId, int quantityToDispatch) {
       
        Shipment shipment = shipmentRepository.findById(shipmentId)
            .orElseThrow(() -> new RuntimeException("Shipment with ID " + shipmentId + " not found."));

        Inventory inventory = shipment.getInventory();
        if (inventory == null) {
             throw new RuntimeException("Shipment does not have an associated inventory item.");
        }
        Space space = inventory.getSpace();
        if (space == null) {
            throw new RuntimeException("Inventory item does not have an associated space.");
        }

        if (quantityToDispatch <= 0 || quantityToDispatch > inventory.getQuantity()) {
            throw new RuntimeException("Invalid quantity to dispatch. The quantity must be greater than 0 and not exceed the available inventory.");
        }

        if (quantityToDispatch > shipment.getQuantity()) {
             throw new RuntimeException("Invalid quantity to dispatch. Cannot dispatch more than what is in the shipment record.");
        }

        int newShipmentQuantity = shipment.getQuantity() - quantityToDispatch;
        shipment.setQuantity(newShipmentQuantity);

        shipment.setStatus("DISPATCHED");

        shipmentRepository.save(shipment);

        int newInventoryQuantity = inventory.getQuantity() - quantityToDispatch;
        inventory.setQuantity(newInventoryQuantity);

        inventoryRepository.save(inventory);

        space.setUsedCapacity(space.getUsedCapacity() - quantityToDispatch);
        space.setAvailableCapacity(space.getAvailableCapacity() + quantityToDispatch);
     
        spaceRepository.save(space);
        
        ReportRequest reportRequest = new ReportRequest();
        reportRequest.setReportType("Shipment");
        reportRequest.setDetails("Shipment Dispatched with shipment ID: " + shipment.getShipmentId());
        reportService.createReport(reportRequest);

        return shipment;
    }


    public Optional<Shipment> trackShipment(int shipmentId) {
        return shipmentRepository.findById(shipmentId);
    }

    public List<Shipment> viewAllShipments() {
        return shipmentRepository.findAll();
    }
}