package com.project.lwms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.lwms.model.Space;

@Repository
public interface SpaceRepository extends JpaRepository<Space, Integer>{

}
