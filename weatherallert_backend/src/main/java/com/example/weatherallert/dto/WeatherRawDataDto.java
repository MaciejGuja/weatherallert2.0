package com.example.weatherallert.dto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WeatherRawDataDto {

    @JsonProperty("success")
    private Boolean success;

    @JsonProperty("response")
    private List<Response> response;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Response {
        @JsonProperty("periods")
        private List<Period> periods;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Period {

        @JsonProperty("dateTimeISO")
        private String dateTimeISO;

        @JsonProperty("maxTempC")
        private Double maxTempC;

        @JsonProperty("minTempC")
        private Double minTempC;

        @JsonProperty("feelslikeC")
        private Double feelslikeC;

        @JsonProperty("windSpeedKPH")
        private Double windSpeedKPH;

        @JsonProperty("windGustKPH")
        private Double windGustKPH;

        @JsonProperty("windDir")
        private String windDir;

        @JsonProperty("windDirDEG")
        private Integer windDirDEG;

        @JsonProperty("icon")
        private String icon;
    }
}