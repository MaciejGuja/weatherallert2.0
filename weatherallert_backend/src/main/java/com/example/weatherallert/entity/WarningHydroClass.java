package com.example.weatherallert.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name="warning_hydro_table")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WarningHydroClass{
    @Id
    @Column(name="zlewnia_code", nullable=false, unique=true)
    private String terytId;
    @Column(nullable=false)
    private String province;
    @Column(nullable=false)
    private String country;
}