package com.example.weatherallert.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeteoWarningResponseDto {
    private String eventId;
    private String eventName;
    private String level;
    private String probability;
    private String validTo;
    private String validFrom;
    private String publishedAt;
    private String content;
    private String comment;
    private List<String> teryt;
    private List<String> country;
    private List<String> province;
}