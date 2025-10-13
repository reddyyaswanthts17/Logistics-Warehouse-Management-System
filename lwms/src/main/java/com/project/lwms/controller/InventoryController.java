package com.project.lwms.controller;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.lwms.model.Inventory;
import com.project.lwms.service.InventoryService;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("/viewItems")
    public List<Inventory> viewInventory() {

        return inventoryService.viewInventory();
    }

    @GetMapping("/viewItems/{id}")
    public ResponseEntity<Inventory> viewItemById(@PathVariable int id) {
        return inventoryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addItem(@RequestBody Inventory inventory) {
        Inventory resultInventory = inventoryService.addItem(inventory, inventory.getQuantity());
        if (resultInventory == null){
            return ResponseEntity.badRequest().body("Error: Not enough available space or space not found");
        }
        return ResponseEntity.ok(resultInventory);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Inventory> updateItem(@PathVariable int id, @RequestBody Inventory inventory) {
        Inventory updatedItem = inventoryService.updateItem(id, inventory);
        if (updatedItem != null) {
            return ResponseEntity.ok(updatedItem);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> removeItem(@PathVariable int id) {
        inventoryService.removeItem(id);
        return ResponseEntity.noContent().build();
    }


}
