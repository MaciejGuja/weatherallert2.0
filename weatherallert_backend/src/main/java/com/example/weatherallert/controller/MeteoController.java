package com.example.weatherallert.controller;
import com.example.weatherallert.service.MeteoService;
import com.example.weatherallert.dto.MeteoResponseDto;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/meteo")
@CrossOrigin(origins="*")
public class MeteoController{
    private final MeteoService meteoService;
    MeteoController(MeteoService meteoService){
        this.meteoService=meteoService;
    }
    @GetMapping("/grouped")
    public Map<String, List<MeteoResponseDto>> getGroupedMeteoData(){
        return meteoService.getAndCollectData();
    }
}