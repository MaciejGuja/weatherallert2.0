package com.example.weatherallert.service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.example.weatherallert.dto.WeatherRawDataDto;
import com.example.weatherallert.dto.WeatherForecastResponseDto;
import com.example.weatherallert.dto.GeocodingResponseDto;
import org.springframework.stereotype.Service;
@Service
public class WeatherForecastsService{
    protected final WebClient webClient;
    WeatherForecastsService(WebClient.Builder webClientBuilder){
        this.webClient = webClientBuilder
            .clone()
            .build();
    }
     private static String mapWmoToIcon(Integer code) {
            if (code == null) return "NULL";
            return switch (code) {
                case 0 -> "sunny.png";
                case 1 -> "fair.png";
                case 2 -> "pcloudy.png";
                case 3 -> "cloudy.png";
                case 45, 48 -> "fog.png";
                case 51, 53 -> "drizzle.png";
                case 55 -> "drizzle.png";
                case 56, 57, 66, 67 -> "freezingrain.png";
                case 61, 63 -> "rain.png";
                case 65 -> "rainw.png";
                case 71 -> "flurries.png";
                case 73 -> "flurriesw.png";
                case 75, 86 -> "blizzard.png";
                case 77 -> "sleet.png";
                case 80, 81 -> "showers.png";
                case 82 -> "showersw.png";
                case 85 -> "snowshowers.png";
                case 95 -> "tstorm.png";
                case 96, 99 -> "tstorms.png";
                default -> "NULL";
            };
        }
    public List<WeatherForecastResponseDto> getCityForecast(String cityName){
            GeocodingResponseDto geoResponse = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("geocoding-api.open-meteo.com")
                        .path("/v1/search")
                        .queryParam("name", cityName)
                        .queryParam("count", 1)
                        .queryParam("language", "pl")
                        .queryParam("format", "json")
                        .build())
                .retrieve()
                .bodyToMono(GeocodingResponseDto.class)
                .block();
            if (geoResponse == null || geoResponse.getResults() == null) {
                throw new IllegalStateException("Nie znaleziono miasta: " + cityName);
            }
            Double lat = geoResponse.getResults().get(0).getLatitude();
            Double lon = geoResponse.getResults().get(0).getLongitude();
            WeatherRawDataDto rawResponse = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                    .scheme("https")
                    .host("api.open-meteo.com")
                    .path("/v1/forecast")
                    .queryParam("latitude", lat)
                    .queryParam("longitude", lon)
                    .queryParam("daily", "weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,rain_sum,precipitation_sum")
                    .queryParam("forecast_days", 14)
                    .queryParam("timezone", "auto")
                    .build())
            .retrieve()
            .bodyToMono(WeatherRawDataDto.class)
            .block();
                if (rawResponse == null
                    || rawResponse.getDaily() == null) {
                throw new IllegalStateException("Brak danych dla miasta: " + cityName);
            }
            WeatherRawDataDto.Daily daily = rawResponse.getDaily();
            List<WeatherForecastResponseDto> result = new ArrayList<>();

            for (int i = 0; i < daily.getDateTimeISO().size(); i++) {
                WeatherForecastResponseDto dto = WeatherForecastResponseDto.builder()
                        .date(daily.getDateTimeISO().get(i))
                        .tempMaxC(daily.getMaxTempC().get(i))
                        .tempMinC(daily.getMinTempC().get(i))
                        .windSpeedKph(daily.getWindSpeedKPH().get(i))
                        .windGustKph(daily.getWindGustKPH().get(i))
                        .windDir(null)
                        .windDirDeg(daily.getWindDirDEG().get(i))
                        .icon(mapWmoToIcon(daily.getIcon().get(i))) 
                        .rainMm(daily.getRainSum().get(i)) 
                        .build();
                result.add(dto);
                }
                return result;
        }
}