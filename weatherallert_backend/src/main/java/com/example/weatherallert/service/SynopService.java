package com.example.weatherallert.service;
import com.example.weatherallert.dto.ImgwSynopDto;
import com.example.weatherallert.dto.SynopResponseDto;
import com.example.weatherallert.entity.SynopLokalizationClass;
import com.example.weatherallert.repository.SynopLokalizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
@Service
public class SynopService extends AbstractWeatherService<ImgwSynopDto, SynopResponseDto, SynopLokalizationClass, SynopLokalizationRepository>   {
    private static final String IMGW_URL="https://danepubliczne.imgw.pl/api/data/synop";
    public SynopService(SynopLokalizationRepository synopLokalizationRepository, WebClient.Builder webClientBuilder){
        super(synopLokalizationRepository, webClientBuilder, IMGW_URL);
    }
    @Override
    public Map<String, List<SynopResponseDto>> getAndCollectData(){
        ImgwSynopDto[] rawResponse = webClient.get()
            .retrieve()
            .bodyToMono(ImgwSynopDto[].class)
            .block();
        if(rawResponse==null){
            return Map.of();
        }
        Map<String, SynopLokalizationClass> stationInMap=lokalizationRepository.findAll()
            .stream()
            .collect(Collectors.toMap(SynopLokalizationClass::getStationId, Function.identity()));
            return Arrays.stream(rawResponse)
                .map(raw->{
                    SynopLokalizationClass synopId=stationInMap.get(raw.getStationId());
                    String province=synopId!=null?synopId.getProvince():"UNKNOWN";
                    String country=synopId!=null?synopId.getCountry():"UNKNOWN";
                    Double latitudeGeo=synopId!=null?synopId.getLatitudeGeo():null;
                    Double longitudeGeo=synopId!=null?synopId.getLongitudeGeo():null;
                    return SynopResponseDto.builder()
                        .stationId(raw.getStationId())
                        .station(raw.getStation())
                        .province(province)
                        .country(country)
                        .measurementData(raw.getMeasurementData())
                        .measurementHour(raw.getMeasurementHour())
                        .temprature(raw.getTemprature())
                        .windSpeed(raw.getWindSpeed())
                        .windDirection(raw.getWindDirection())
                        .relativeHumidity(raw.getRelativeHumidity())
                        .totalPrecipitation(raw.getTotalPrecipitation())
                        .airPressure(raw.getAirPressure())
                        .latitudeGeo(latitudeGeo)
                        .longitudeGeo(longitudeGeo)
                        .build();   
                }).collect(Collectors.groupingBy(SynopResponseDto::getProvince));
        }
    

}

