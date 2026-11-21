package com.example.weatherallert.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name="warning_meteo_table")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WarningMeteoClass{
    @Id
    @Column(name="teryt_code", nullable=false, unique=true)
    private String terytId;
    @Column(nullable=false)
    private String province;
    @Column(nullable=false)
    private String country;
}