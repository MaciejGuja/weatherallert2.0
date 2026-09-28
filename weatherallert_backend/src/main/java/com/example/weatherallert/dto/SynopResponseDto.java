package com.example.weatherallert.dto;
import lombok.Builder;
import lombok.Data;
@Data
@Builder
public class SynopResponseDto{
    private String stationId;
    private String station;
    private String province;
    private String country;
    private String measurementData;
    private String measurementHour;
    private String temprature;
    private String windSpeed;
    private String windDirection;
    private String relativeHumidity;
    private String totalPrecipitation;
    private String airPressure;
    private Double latitudeGeo;
    private Double longitudeGeo;
}