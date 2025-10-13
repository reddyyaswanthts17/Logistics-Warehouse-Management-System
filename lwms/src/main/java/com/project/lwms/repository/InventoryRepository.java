package com.project.lwms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.lwms.model.Inventory;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Integer>{
	
	List<Inventory> findAll();

}
