package com.example.weatherallert.repository;

import com.example.weatherallert.entity.SynopLokalizationClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface SynopLokalizationRepository extends JpaRepository<SynopLokalizationClass,String>{
    
}