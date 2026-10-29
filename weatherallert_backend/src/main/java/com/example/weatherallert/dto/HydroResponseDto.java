package com.example.weatherallert.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HydroResponseDto{
    private String stationId;
    private String stationName;
    private String river;
    private String province;
    private String country;
    private Double longitude;
    private Double latitude;
    private String stationEstablishmentYear;
    private String zeroGaugeOrdinate;
    private String riverKilometer;
    private String alarmLevel;
    private String warningLevel;
    private String waterLevel;
    private String waterLevelMeasurementDate;
    private Double waterTemperature;
    private String waterTemperatureMeasurementDate;
    private String flow;
    private String flowDate;
    private String icePhenomenon;
    private String icePhenomenonMeasurementDate;
    private String overgrowthPhenomenon;
    private String overgrowthPhenomenonMeasurementDate;
}