package com.example.weatherallert.service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;
import com.example.weatherallert.dto.WeatherRawDataDto;
import com.example.weatherallert.dto.WeatherForecastResponseDto;
import org.springframework.stereotype.Service;
@Service
public class WeatherForecastsService{
    protected final WebClient webClient;
    protected final String BASE_URL="https://data.api.xweather.com/forecasts";
    protected final String NAME_URL="/{cityName},PL";
    WeatherForecastsService(WebClient.Builder webClientBuilder){
        this.webClient = webClientBuilder
            .clone()
            .baseUrl(BASE_URL)
            .build();
    }
    public List<WeatherForecastResponseDto> getCityForecast(String cityName){
            WeatherRawDataDto rawResponse = webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path(NAME_URL)                     
                    .queryParam("limit", "14")          
                    .queryParam("client_id", "qyr7Uum9yBHJcuVHQlHUU")
                    .queryParam("client_secret", "ScPBDpz5IPlfkoVYu4zWXEHZR0bOHqyxs5pYfFdc")
                    .build(cityName)) 
                .retrieve()
                .bodyToMono(WeatherRawDataDto.class)
                .block();
            if (rawResponse == null
                || rawResponse.getResponse() == null
                || rawResponse.getResponse().isEmpty()) {
            throw new IllegalStateException("Brak danych dla miasta: " + cityName);
        }
    List<WeatherRawDataDto.Period> dni = rawResponse.getResponse().get(0).getPeriods();
    return dni.stream()
            .map(period -> WeatherForecastResponseDto.builder()
                    .date(period.getDateTimeISO().substring(0, 10))
                    .tempMaxC(period.getMaxTempC())
                    .tempMinC(period.getMinTempC())
                    .windSpeedKph(period.getWindSpeedKPH())
                    .windGustKph(period.getWindGustKPH())
                    .windDir(period.getWindDir())
                    .windDirDeg(period.getWindDirDEG())
                    .icon(period.getIcon())
                    .build())
            .collect(Collectors.toList());
}
}