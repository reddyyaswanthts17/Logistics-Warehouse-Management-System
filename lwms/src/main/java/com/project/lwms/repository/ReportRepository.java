package com.project.lwms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.lwms.model.Report;

@Repository
public interface ReportRepository extends JpaRepository<Report, Integer>{

}
