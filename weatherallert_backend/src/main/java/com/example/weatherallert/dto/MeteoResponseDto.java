package com.example.weatherallert.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeteoResponseDto{
    private String stationCode;
    private String stationName;
    private String province;
    private String country;
    private Double lon; 
    private Double lat;
    private String stationEstablishmentYear;
    private String heightAboveSeaLevel;
    private Double groundTemperature;
    private String groundTemperatureDate;
    private Double airTemperature;
    private String airTemperatureDate;
    private Double windDirection;
    private String windDirectionDate;
    private Double windAverageSpeed;
    private String windAverageSpeedDate;
    private Double windMaximumSpeed;
    private String windMaximumSpeedDate;
    private Double relativeHumidity;
    private String relativeHumidityDate;
    private Double windGust10min;
    private String windGust10minDate;
    private String precipitation10min;
    private String precipitation10minDate;

}