package com.example.weatherallert.service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;
import java.util.Map;
public abstract class AbstractWeatherService<RAW_DATA_DTO, RESPONSE_DTO, ENTITY, REPOSITORY> {
    protected final String BASE_URL;
    protected final REPOSITORY lokalizationRepository;
    protected final WebClient webClient;
    public AbstractWeatherService(REPOSITORY lokalizationRepository, WebClient.Builder webClientBuilder, String BASE_URL){
        this.lokalizationRepository = lokalizationRepository;
        this.BASE_URL = BASE_URL;
        this.webClient = webClientBuilder
            .clone()
            .baseUrl(BASE_URL)
            .codecs(c -> c.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
            .build();
    }
    public abstract Map<String, List<RESPONSE_DTO>> getAndCollectData();
}

