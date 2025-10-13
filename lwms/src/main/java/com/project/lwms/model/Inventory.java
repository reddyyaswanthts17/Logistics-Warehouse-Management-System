package com.project.lwms.model;



import jakarta.persistence.*;


import java.time.LocalDateTime;

@Entity
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int itemId;
    private String itemName;
    private String category;
    private Integer quantity;
    private String location;
    private LocalDateTime lastUpdated;

    public Space getSpace() {
        return space;
    }

    public void setSpace(Space space) {
        this.space = space;
    }

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "spaceId")
    private Space space;



    public int getItemId() {
        return itemId;
    }

    public void setItemId(int itemId) {

        this.itemId = itemId;
    }
    public String getItemName() {

        return itemName;
    }
    public void setItemName(String itemName) {

        this.itemName = itemName;
    }
    public String getCategory() {

        return category;
    }
    public void setCategory(String category) {

        this.category = category;
    }
    public Integer getQuantity() {

        return quantity;
    }
    public void setQuantity(Integer quantity) {

        this.quantity = quantity;
    }
    public String getLocation() {

        return location;
    }
    public void setLocation(String location) {

        this.location = location;
    }
    public LocalDateTime getLastUpdated() {

        return lastUpdated;
    }
    public void setLastUpdated(LocalDateTime lastUpdated) {

        this.lastUpdated = lastUpdated;
    }

	public Inventory(int itemId, String itemName, String category, Integer quantity, String location,
			LocalDateTime lastUpdated) {
		super();
		this.itemId = itemId;
		this.itemName = itemName;
		this.category = category;
		this.quantity = quantity;
		this.location = location;
		this.lastUpdated = lastUpdated;
	}

    @Override
    public String toString() {
        return "Inventory [itemId=" + itemId + "," +
                " itemName=" + itemName + ", category=" + category + ", " +
                "quantity=" + quantity + ", location=" + location + ", " +
                "lastUpdated=" + lastUpdated + "]";
    }

    public Inventory() {
    }
}


