package com.example.weatherallert.service;
import com.example.weatherallert.dto.ImgwHydroDto;
import com.example.weatherallert.dto.HydroResponseDto;
import com.example.weatherallert.entity.HydroLokalizationClass;
import com.example.weatherallert.repository.HydroLokalizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
@Service
public class HydroService extends AbstractWeatherService<ImgwHydroDto, HydroResponseDto, HydroLokalizationClass, HydroLokalizationRepository>   {
    private static final String IMGW_URL="https://danepubliczne.imgw.pl/api/data/hydro";
    public HydroService(HydroLokalizationRepository hydroLokalizationRepository, WebClient.Builder webClientBuilder){
        super(hydroLokalizationRepository, webClientBuilder, IMGW_URL);
    }
    @Override
    public Map<String, List<HydroResponseDto>> getAndCollectData(){
        ImgwHydroDto[] rawResponse = webClient.get()
            .retrieve()
            .bodyToMono(ImgwHydroDto[].class)
            .block();
        if(rawResponse==null){
            return Map.of();
        }
        Map<String, HydroLokalizationClass> stationInMap=lokalizationRepository.findAll()
            .stream()
            .collect(Collectors.toMap(HydroLokalizationClass::getStationId, Function.identity()));
            return Arrays.stream(rawResponse)
                .map(raw->{
                    HydroLokalizationClass hydroId=stationInMap.get(raw.getStationId());
                    String province=hydroId!=null?hydroId.getProvince():"UNKNOWN";
                    String country=hydroId!=null?hydroId.getCountry():"UNKNOWN";
                    return HydroResponseDto.builder()
                        .stationId(raw.getStationId())
                        .stationName(raw.getStationName())
                        .river(raw.getRiver())
                        .province(province)
                        .country(country)
                        .longitude(raw.getLongitude())
                        .latitude(raw.getLatitude())
                        .stationEstablishmentYear(raw.getStationEstablishmentYear())
                        .zeroGaugeOrdinate(raw.getZeroGaugeOrdinate())
                        .riverKilometer(raw.getRiverKilometer())
                        .alarmLevel(raw.getAlarmLevel())
                        .warningLevel(raw.getWarningLevel())
                        .waterLevel(raw.getWaterLevel())
                        .waterLevelMeasurementDate(raw.getWaterLevelMeasurementDate())
                        .waterTemperature(raw.getWaterTemperature())
                        .waterTemperatureMeasurementDate(raw.getWaterTemperatureMeasurementDate())
                        .flow(raw.getFlow())
                        .flowDate(raw.getFlowDate())
                        .icePhenomenon(raw.getIcePhenomenon())
                        .icePhenomenonMeasurementDate(raw.getIcePhenomenonMeasurementDate())
                        .overgrowthPhenomenon(raw.getOvergrowthPhenomenon())
                        .overgrowthPhenomenonMeasurementDate(raw.getOvergrowthPhenomenonMeasurementDate())
                        .build();
                }).collect(Collectors.groupingBy(HydroResponseDto::getProvince));
        }
    

}

