package com.example.weatherallert.service;
import com.example.weatherallert.dto.ImgwMeteoWarningDto;
import com.example.weatherallert.dto.MeteoWarningResponseDto;
import com.example.weatherallert.entity.WarningMeteoClass;
import com.example.weatherallert.repository.WarningMeteoRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Objects;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
@Service
public class WarningMeteoService extends AbstractWeatherService<ImgwMeteoWarningDto, MeteoWarningResponseDto, WarningMeteoClass, WarningMeteoRepository>   {
    private static final String IMGW_URL="https://danepubliczne.imgw.pl/api/data/warningsmeteo";
    public WarningMeteoService(WarningMeteoRepository warningMeteoRepository, WebClient.Builder webClientBuilder){
        super(warningMeteoRepository, webClientBuilder, IMGW_URL);
    }
    @Override
    public Map<String, List<MeteoWarningResponseDto>> getAndCollectData(){
        ImgwMeteoWarningDto[] rawResponse = webClient.get()
            .retrieve()
            .bodyToMono(ImgwMeteoWarningDto[].class)
            .block();
        if(rawResponse==null){
            return Map.of();
        }
        Map<String, WarningMeteoClass> terytMap = lokalizationRepository.findAll()
            .stream()
            .collect(Collectors.toMap(WarningMeteoClass::getTerytId, Function.identity()));

    return Arrays.stream(rawResponse)
            .map(raw -> {
                List<String> terytCodes = raw.getTeryt() != null ? raw.getTeryt() : List.of();

                List<WarningMeteoClass> locations = terytCodes.stream()
                        .map(terytMap::get)
                        .filter(Objects::nonNull)
                        .toList();

                List<String> provinces = locations.stream()
                        .map(WarningMeteoClass::getProvince)
                        .distinct()
                        .toList();

                List<String> counties = locations.stream()
                        .map(WarningMeteoClass::getCountry)
                        .toList();

                return MeteoWarningResponseDto.builder()
                        .eventId(raw.getEventId())
                        .eventName(raw.getEventName())
                        .level(raw.getLevel())
                        .probability(raw.getProbability())
                        .validFrom(raw.getValidFrom())
                        .validTo(raw.getValidTo())
                        .publishedAt(raw.getPublishedAt())
                        .content(raw.getContent())
                        .comment(raw.getComment())
                        .teryt(terytCodes)
                        .province(provinces)
                        .country(counties)
                        .build();
            })
            .collect(Collectors.groupingBy(MeteoWarningResponseDto::getEventId));
        }
    

}

