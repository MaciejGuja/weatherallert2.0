package com.example.weatherallert.controller;
import com.example.weatherallert.dto.WeatherForecastResponseDto;
import com.example.weatherallert.dto.CityRequestDto;
import com.example.weatherallert.service.WeatherForecastsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/forecast")
@CrossOrigin(origins = "*")
public class WeatherForecastController {
    private final WeatherForecastsService weatherForecastsService;

    public WeatherForecastController(WeatherForecastsService weatherForecastsService) {
        this.weatherForecastsService = weatherForecastsService;
    }

    @PostMapping("/cityname")
    public ResponseEntity<List<WeatherForecastResponseDto>> getCityForecast(@RequestBody CityRequestDto request) {
        List<WeatherForecastResponseDto> forecast = weatherForecastsService.getCityForecast(request.cityName());
        return ResponseEntity.ok(forecast);
    }
}