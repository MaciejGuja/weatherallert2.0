package com.example.weatherallert.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WeatherRawDataDto {

    @JsonProperty("latitude")
    private Double latitude;

    @JsonProperty("longitude")
    private Double longitude;

    @JsonProperty("timezone")
    private String timezone;

    @JsonProperty("daily")
    private Daily daily;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Daily {
        
        @JsonProperty("time")
        private List<String> dateTimeISO;

        @JsonProperty("weather_code")
        private List<Integer> icon;

        @JsonProperty("temperature_2m_max")
        private List<Double> maxTempC;

        @JsonProperty("temperature_2m_min")
        private List<Double> minTempC;

        @JsonProperty("wind_speed_10m_max")
        private List<Double> windSpeedKPH;

        @JsonProperty("wind_gusts_10m_max")
        private List<Double> windGustKPH;

        @JsonProperty("wind_direction_10m_dominant")
        private List<Integer> windDirDEG;

        @JsonProperty("rain_sum")
        private List<Double> rainSum;

        @JsonProperty("precipitation_sum")
        private List<Double> precipitationSum;
    }
}