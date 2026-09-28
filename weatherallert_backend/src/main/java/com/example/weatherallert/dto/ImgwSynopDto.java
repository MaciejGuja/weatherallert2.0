package com.example.weatherallert.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
@Data
public class ImgwSynopDto{
    @JsonProperty("id_stacji")
    private String stationId;

    @JsonProperty("stacja")
    private String station; 

    @JsonProperty("data_pomiaru")
    private String measurementData;

    @JsonProperty("godzina_pomiaru")
    private String measurementHour;

    @JsonProperty("temperatura")
    private String temprature;

    @JsonProperty("predkosc_wiatru")
    private String windSpeed;

    @JsonProperty("kierunek_wiatru")
    private String windDirection;

    @JsonProperty("wilgotnosc_wzgledna")
    private String relativeHumidity;

    @JsonProperty("suma_opadu")
    private String totalPrecipitation;

    @JsonProperty("cisnienie")
    private String airPressure;
}