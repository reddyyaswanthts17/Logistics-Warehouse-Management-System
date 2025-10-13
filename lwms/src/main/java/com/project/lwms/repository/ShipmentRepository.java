package com.project.lwms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.lwms.model.Shipment;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Integer> {

}
