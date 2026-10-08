package com.example.weatherallert.repository;

import com.example.weatherallert.entity.MeteoLokalizationClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface MeteoLokalizationRepository extends JpaRepository<MeteoLokalizationClass, String> {

}