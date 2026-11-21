package com.example.weatherallert.controller;
import com.example.weatherallert.dto.MeteoWarningResponseDto;
import com.example.weatherallert.service.WarningMeteoService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;
@RestController
@CrossOrigin(origins = "*")
public class WarningController{
    private final WarningMeteoService warningMeteoService;
    WarningController(WarningMeteoService warningMeteoService){
        this.warningMeteoService=warningMeteoService;
    }
    @RequestMapping(value = "/api/warning/meteo/grouped", method = RequestMethod.GET)
    public Map<String, List<MeteoWarningResponseDto>> getGroupedMeteoWarningData() {
        return warningMeteoService.getAndCollectData();
    }
}