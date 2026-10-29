package com.example.weatherallert.controller;
import com.example.weatherallert.service.HydroService;
import com.example.weatherallert.dto.HydroResponseDto;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/hydro")
@CrossOrigin(origins="*")
public class HydroController{
    private final HydroService hydroService;
    HydroController(HydroService hydroService){
        this.hydroService=hydroService;
    }
    @GetMapping("/grouped")
    public Map<String,List<HydroResponseDto>> getGroupedHydroData(){
        return hydroService.getAndCollectData();
    }

}