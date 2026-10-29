package com.example.weatherallert.repository;

import com.example.weatherallert.entity.HydroLokalizationClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface HydroLokalizationRepository extends JpaRepository<HydroLokalizationClass,String>{

}