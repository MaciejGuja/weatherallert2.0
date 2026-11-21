package com.example.weatherallert.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class ImgwMeteoWarningDto {

    @JsonProperty("id")
    private String eventId;

    @JsonProperty("nazwa_zdarzenia")
    private String eventName;

    @JsonProperty("stopien")
    private String level;

    @JsonProperty("prawdopodobienstwo")
    private String probability;

    @JsonProperty("obowiazuje_do")
    private String validTo;

    @JsonProperty("obowiazuje_od")
    private String validFrom;

    @JsonProperty("opublikowano")
    private String publishedAt;

    @JsonProperty("tresc")
    private String content;

    @JsonProperty("komentarz")
    private String comment;

    @JsonProperty("teryt")
    private List<String> teryt;
}