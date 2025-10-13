package com.project.lwms.model;



import jakarta.persistence.*;

import java.time.LocalDate;


@Entity
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int shipmentId;
	private String origin;
	private String destination;
	private String status;
	private LocalDate expectedDeliveryDate;

	public int getQuantity() {
		return quantity;
	}

	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}

	private int quantity;


	public int getShipmentId() {

		return shipmentId;
	}

	public void setShipmentId(int shipmentId) {

		this.shipmentId = shipmentId;
	}

	public String getOrigin() {

		return origin;
	}

	public void setOrigin(String origin) {

		this.origin = origin;
	}

	public String getDestination() {

		return destination;
	}

	public void setDestination(String destination) {

		this.destination = destination;
	}

	public String getStatus() {

		return status;
	}

	public void setStatus(String status) {

		this.status = status;
	}

	public LocalDate getExpectedDeliveryDate() {

		return expectedDeliveryDate;
	}

	public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) {

		this.expectedDeliveryDate = expectedDeliveryDate;
	}

	public Inventory getInventory() {

		return inventory;
	}

	public void setInventory(Inventory inventory) {

		this.inventory = inventory;
	}

	// Many shipments can be associated with one inventory item
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "itemId")
	private Inventory inventory;


	@Override
	public String toString() {
		return "Shipment [shipmentId=" + shipmentId + ", origin=" + origin + "," +
				" destination=" + destination + ", status=" + status +
				", expectedDeliveryDate=" + expectedDeliveryDate + ", inventory=" + inventory + "]";
	}


	public Shipment() {
		super();
	}

	public Shipment(int shipmentId, String origin, String destination, String status,
			LocalDate expectedDeliveryDate, Inventory inventory) {
		super();
		this.shipmentId = shipmentId;
		this.origin = origin;
		this.destination = destination;
		this.status = status;
		this.expectedDeliveryDate = expectedDeliveryDate;
		this.inventory = inventory;
	}

	public Space getSpace() {
		// TODO Auto-generated method stub
		return null;
	}

	public void setSpace(Space spc) {
		// TODO Auto-generated method stub
		
	}




}