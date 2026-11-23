package com.example.weatherallert.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class ImgwHydroWarningDto {

    @JsonProperty("numer")
    private String eventId;

    @JsonProperty("zdarzenie")
    private String eventName;

    @JsonProperty("stopień")
    private String level;

    @JsonProperty("prawdopodobienstwo")
    private String probability;

    @JsonProperty("data_do")
    private String validTo;

    @JsonProperty("data_od")
    private String validFrom;

    @JsonProperty("opublikowano")
    private String publishedAt;

    @JsonProperty("przebieg")
    private String content;

    @JsonProperty("komentarz")
    private String comment;

    @JsonProperty("obszary")
    private List<Area> areas;

    @Data
    public static class Area {
        @JsonProperty("wojewodztwo")
        private String province;

        @JsonProperty("opis")
        private String description;

        @JsonProperty("kod_zlewni")
        private List<String> catchmentCodes;
    }
}