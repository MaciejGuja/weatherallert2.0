package com.example.weatherallert.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherForecastResponseDto {
    private String date;
    private Double tempMaxC;
    private Double tempMinC;
    private Double windSpeedKph;
    private Double windGustKph;
    private String windDir;
    private Integer windDirDeg;
    private String icon;
}