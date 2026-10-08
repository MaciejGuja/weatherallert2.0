package com.example.weatherallert.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
@Data
public class ImgwMeteoDto{
    @JsonProperty("kod_stacji")
    private String stationCode;

    @JsonProperty("nazwa_stacji")
    private String stationName;

    @JsonProperty("lon")
    private Double lon;

    @JsonProperty("lat")
    private Double lat;

    @JsonProperty("rok_zalozenia_stacji")
    private String stationEstablishmentYear;

    @JsonProperty("wysokosc_npm")
    private String heightAboveSeaLevel;

    @JsonProperty("temperatura_gruntu")
    private Double groundTemperature;

    @JsonProperty("temperatura_gruntu_data")
    private String groundTemperatureDate;

    @JsonProperty("temperatura_powietrza")
    private Double airTemperature;

    @JsonProperty("temperatura_powietrza_data")
    private String airTemperatureDate;

    @JsonProperty("wiatr_kierunek")
    private Double windDirection;

    @JsonProperty("wiatr_kierunek_data")
    private String windDirectionDate;

    @JsonProperty("wiatr_srednia_predkosc")
    private Double windAverageSpeed;

    @JsonProperty("wiatr_srednia_predkosc_data")
    private String windAverageSpeedDate;

    @JsonProperty("wiatr_predkosc_maksymalna")
    private Double windMaximumSpeed;

    @JsonProperty("wiatr_predkosc_maksymalna_data")
    private String windMaximumSpeedDate;

    @JsonProperty("wilgotnosc_wzgledna")
    private Double relativeHumidity;

    @JsonProperty("wilgotnosc_wzgledna_data")
    private String relativeHumidityDate;

    @JsonProperty("wiatr_poryw_10min")
    private Double windGust10min;

    @JsonProperty("wiatr_poryw_10min_data")
    private String windGust10minDate;

    @JsonProperty("opad_10min")
    private String precipitation10min;

    @JsonProperty("opad_10min_data")
    private String precipitation10minDate;
}