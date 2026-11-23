package com.example.weatherallert.controller;
import com.example.weatherallert.dto.MeteoWarningResponseDto;
import com.example.weatherallert.dto.HydroWarningResponseDto;
import com.example.weatherallert.service.WarningMeteoService;
import com.example.weatherallert.service.WarningHydroService;
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
    private final WarningHydroService warningHydroService;
    WarningController(WarningMeteoService warningMeteoService, WarningHydroService warningHydroService){
        this.warningMeteoService=warningMeteoService;
        this.warningHydroService=warningHydroService;
    }
    @RequestMapping(value = "/api/warning/meteo/grouped", method = RequestMethod.GET)
    public Map<String, List<MeteoWarningResponseDto>> getGroupedMeteoWarningData() {
        return warningMeteoService.getAndCollectData();
    }
    @RequestMapping(value = "/api/warning/hydro/grouped", method = RequestMethod.GET)
    public Map<String, List<HydroWarningResponseDto>> getGroupedHydroWarningData() {
        return warningHydroService.getAndCollectData();
    }
}