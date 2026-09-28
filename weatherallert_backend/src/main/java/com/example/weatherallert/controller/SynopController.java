package com.example.weatherallert.controller;
import com.example.weatherallert.service.SynopService;
import com.example.weatherallert.dto.SynopResponseDto;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/synop")
@CrossOrigin(origins="*")
public class SynopController{
    private final SynopService synopService;
    SynopController(SynopService synopService){
        this.synopService=synopService;
    }
    @GetMapping("/grouped")
    public Map<String, List<SynopResponseDto>> getGroupedSynopData(){
        return synopService.getAndCollectSynopticData();
    }
}
