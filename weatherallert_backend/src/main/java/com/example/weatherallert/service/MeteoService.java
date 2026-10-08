package com.example.weatherallert.service;
import com.example.weatherallert.dto.ImgwMeteoDto;
import com.example.weatherallert.dto.MeteoResponseDto;
import com.example.weatherallert.entity.MeteoLokalizationClass;
import com.example.weatherallert.repository.MeteoLokalizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
@Service
public class MeteoService extends AbstractWeatherService<ImgwMeteoDto, MeteoResponseDto, MeteoLokalizationClass, MeteoLokalizationRepository>   {
    private static final String IMGW_URL="https://danepubliczne.imgw.pl/api/data/meteo";
    public MeteoService(MeteoLokalizationRepository meteoLokalizationRepository, WebClient.Builder webClientBuilder){
        super(meteoLokalizationRepository, webClientBuilder, IMGW_URL);
    }
    @Override
    public Map<String, List<MeteoResponseDto>> getAndCollectData(){
        ImgwMeteoDto[] rawResponse = webClient.get()
            .retrieve()
            .bodyToMono(ImgwMeteoDto[].class)
            .block();
        if(rawResponse==null){
            return Map.of();
        }
        Map<String, MeteoLokalizationClass> stationInMap=lokalizationRepository.findAll()
            .stream()
            .collect(Collectors.toMap(MeteoLokalizationClass::getStationCode, Function.identity()));
            return Arrays.stream(rawResponse)
                .map(raw->{
                    MeteoLokalizationClass meteoId=stationInMap.get(raw.getStationCode());
                    String province=meteoId!=null?meteoId.getProvince():"UNKNOWN";
                    String country=meteoId!=null?meteoId.getCountry():"UNKNOWN";
                    return MeteoResponseDto.builder()
                        .stationCode(raw.getStationCode())
                        .stationName(raw.getStationName())
                        .province(province)
                        .country(country)
                        .lon(raw.getLon())
                        .lat(raw.getLat())
                        .stationEstablishmentYear(raw.getStationEstablishmentYear())
                        .heightAboveSeaLevel(raw.getHeightAboveSeaLevel())
                        .groundTemperature(raw.getGroundTemperature())
                        .groundTemperatureDate(raw.getGroundTemperatureDate())
                        .airTemperature(raw.getAirTemperature())
                        .airTemperatureDate(raw.getAirTemperatureDate())
                        .windDirection(raw.getWindDirection())
                        .windDirectionDate(raw.getWindDirectionDate())
                        .windAverageSpeed(raw.getWindAverageSpeed())
                        .windAverageSpeedDate(raw.getWindAverageSpeedDate())
                        .windMaximumSpeed(raw.getWindMaximumSpeed())
                        .windMaximumSpeedDate(raw.getWindMaximumSpeedDate())
                        .relativeHumidity(raw.getRelativeHumidity())
                        .relativeHumidityDate(raw.getRelativeHumidityDate())
                        .windGust10min(raw.getWindGust10min())
                        .windGust10minDate(raw.getWindGust10minDate())
                        .precipitation10min(raw.getPrecipitation10min())
                        .precipitation10minDate(raw.getPrecipitation10minDate())
                        .build();
                }).collect(Collectors.groupingBy(MeteoResponseDto::getProvince));
        }
    

}

