package com.example.weatherallert.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
@Data
public class ImgwHydroDto {

    @JsonProperty("id_stacji")
    private String stationId;

    @JsonProperty("stacja")
    private String stationName;

    @JsonProperty("rzeka")
    private String river;

    @JsonProperty("wojewodztwo")
    private String province;

    @JsonProperty("lon")
    private Double longitude;

    @JsonProperty("lat")
    private Double latitude;

    @JsonProperty("rok_zalozenia_stacji")
    private String stationEstablishmentYear;

    @JsonProperty("rzedna_zerawodowskazu")
    private String zeroGaugeOrdinate;

    @JsonProperty("kilometr_biegu_rzeki")
    private String riverKilometer;

    @JsonProperty("stan_alarmowy")
    private String alarmLevel;

    @JsonProperty("stan_ostrzegawczy")
    private String warningLevel;

    @JsonProperty("stan_wody")
    private String waterLevel;

    @JsonProperty("stan_wody_data_pomiaru")
    private String waterLevelMeasurementDate;

    @JsonProperty("temperatura_wody")
    private Double waterTemperature;

    @JsonProperty("temperatura_wody_data_pomiaru")
    private String waterTemperatureMeasurementDate;

    @JsonProperty("przeplyw")
    private String flow;

    @JsonProperty("przeplyw_data")
    private String flowDate;

    @JsonProperty("zjawisko_lodowe")
    private String icePhenomenon;

    @JsonProperty("zjawisko_lodowe_data_pomiaru")
    private String icePhenomenonMeasurementDate;

    @JsonProperty("zjawisko_zarastania")
    private String overgrowthPhenomenon;

    @JsonProperty("zjawisko_zarastania_data_pomiaru")
    private String overgrowthPhenomenonMeasurementDate;

}