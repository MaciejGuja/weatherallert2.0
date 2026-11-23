package com.example.weatherallert.repository;

import com.example.weatherallert.entity.WarningHydroClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface WarningHydroRepository extends JpaRepository<WarningHydroClass,String>{
    
}