package com.example.weatherallert.service;
import com.example.weatherallert.dto.ImgwHydroWarningDto;
import com.example.weatherallert.dto.HydroWarningResponseDto;
import com.example.weatherallert.entity.WarningHydroClass;
import com.example.weatherallert.repository.WarningHydroRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Objects;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
@Service
public class WarningHydroService extends AbstractWeatherService<ImgwHydroWarningDto, HydroWarningResponseDto, WarningHydroClass, WarningHydroRepository>   {
    private static final String IMGW_URL="https://danepubliczne.imgw.pl/api/data/warningshydro";
    public WarningHydroService(WarningHydroRepository warningHydroRepository, WebClient.Builder webClientBuilder){
        super(warningHydroRepository, webClientBuilder, IMGW_URL);
    }
    @Override
    public Map<String, List<HydroWarningResponseDto>> getAndCollectData(){
        ImgwHydroWarningDto[] rawResponse = webClient.get()
            .retrieve()
            .bodyToMono(ImgwHydroWarningDto[].class)
            .block();
        if(rawResponse==null){
            return Map.of();
        }
        return Arrays.stream(rawResponse)
             .map(raw -> {
    //     Map<String, WarningHydroClass> terytMap = lokalizationRepository.findAll()
    //         .stream()
    //         .collect(Collectors.toMap(WarningHydroClass::getTerytId, Function.identity()));

    // return Arrays.stream(rawResponse)
    //         .map(raw -> {
    //             List<String> terytCodes = raw.getTeryt() != null ? raw.getTeryt() : List.of();

    //             List<WarningHydroClass> locations = terytCodes.stream()
    //                     .map(terytMap::get)
    //                     .filter(Objects::nonNull)
    //                     .toList();

    //             List<String> provinces = locations.stream()
    //                     .map(WarningHydroClass::getProvince)
    //                     .distinct()
    //                     .toList();

    //             List<String> counties = locations.stream()
    //                     .map(WarningHydroClass::getCountry)
    //                     .toList();

                return HydroWarningResponseDto.builder()
                    .eventId(raw.getEventId())
                    .eventName(raw.getEventName())
                    .level(raw.getLevel())
                    .probability(raw.getProbability())
                    .validFrom(raw.getValidFrom())
                    .validTo(raw.getValidTo())
                    .publishedAt(raw.getPublishedAt())
                    .content(raw.getContent())
                    .comment(raw.getComment())
                    .build();
            })
            .collect(Collectors.groupingBy(HydroWarningResponseDto::getEventId));
        }
}

