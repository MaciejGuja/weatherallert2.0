package com.example.weatherallert.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name="synop_lokalization_table")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SynopLokalizationClass{
    @Id
    @Column(name="station_id", nullable=false, unique=true)
    private String stationId;
    @Column(nullable=false)
    private String province;
    @Column(nullable=false)
    private String country;

    private Double latitudeGeo;
    private Double longitudeGeo;
}