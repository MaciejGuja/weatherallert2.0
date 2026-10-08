package com.example.weatherallert.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
@Entity
@Table(name="meteo_lokalization_table")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MeteoLokalizationClass{
    @Id
    @Column(name="station_code", nullable=false, unique=true)
    private String stationCode;
    @Column(nullable=false)
    private String province;
    @Column(nullable=false)
    private String country;
}