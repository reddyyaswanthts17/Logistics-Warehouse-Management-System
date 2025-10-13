package com.project.lwms.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.lwms.model.Shipment;
import com.project.lwms.service.ShipmentService;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {


    @Autowired
    private ShipmentService shipmentService;

    @PostMapping("/receive")
    public ResponseEntity<?> receiveShipment(@RequestBody Shipment shipment, @RequestParam(required = false) String newItemName) {
        Shipment result = shipmentService.receiveShipment(shipment, newItemName);

        if (result == null) {
            // Return a 400 Bad Request with a custom error message
            return ResponseEntity.badRequest().body("Error: Not enough available space or space not found.");
        }

        // Return a 200 OK with the successful shipment object
        return ResponseEntity.ok(result);
    }

    @PutMapping("/dispatch/{shipmentId}")
    public ResponseEntity<?> dispatchShipment(@PathVariable int shipmentId, @RequestParam int quantityToDispatch) {
        try {
            Shipment dispatched = shipmentService.dispatchShipment(shipmentId, quantityToDispatch);
            if (dispatched != null) {
                return ResponseEntity.ok(dispatched);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Shipment with ID " + shipmentId + " not found.");
        } catch (RuntimeException e) {
            // Catch specific exceptions from the service layer and provide a meaningful error message
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


    @GetMapping("/track/{shipmentId}")
    public ResponseEntity<Shipment> trackShipment(@PathVariable int shipmentId) {
        return shipmentService.trackShipment(shipmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/view")
    public List<Shipment> viewAllShipments() {
        return shipmentService.viewAllShipments();
    }
}
