package com.example.weatherallert.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name="hydro_lokalization_table")
public class HydroLokalizationClass{
    @Id
    @Column(name="station_id",nullable=false,unique=true)
    private String stationId;
    @Column(nullable=false)
    private String province;
    @Column(nullable=false)
    private String country;
}