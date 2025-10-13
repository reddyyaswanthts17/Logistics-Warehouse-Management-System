package com.project.lwms.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity

public class Space {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int spaceId;
	private Integer totalCapacity;
	private Integer usedCapacity;
	private Integer availableCapacity;
	private String zone;

	public int getSpaceId() {

		return spaceId;
	}

	public void setSpaceId(int spaceId) {

		this.spaceId = spaceId;
	}

	public Integer getTotalCapacity() {

		return totalCapacity;
	}

	public void setTotalCapacity(Integer totalCapacity) {

		this.totalCapacity = totalCapacity;
	}

	public Integer getUsedCapacity() {

		return usedCapacity;
	}

	public void setUsedCapacity(Integer usedCapacity) {

		this.usedCapacity = usedCapacity;
	}

	public Integer getAvailableCapacity() {

		return availableCapacity;
	}

	public void setAvailableCapacity(Integer availableCapacity) {

		this.availableCapacity = availableCapacity;
	}

	public String getZone() {

		return zone;
	}

	public void setZone(String zone) {

		this.zone = zone;
	}

	public Space() {
		super();
	}

	public Space(int spaceId, Integer totalCapacity, Integer usedCapacity, Integer availableCapacity, String zone) {
		super();
		this.spaceId = spaceId;
		this.totalCapacity = totalCapacity;
		this.usedCapacity = usedCapacity;
		this.availableCapacity = availableCapacity;
		this.zone = zone;
	}

	@Override
	public String toString() {
		return "Space [spaceId=" + spaceId + ", totalCapacity=" + totalCapacity +
				", usedCapacity=" + usedCapacity + ", availableCapacity=" + availableCapacity + ", zone=" + zone + "]";
	}

}