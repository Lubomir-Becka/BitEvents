package com.bitevents.bitevents.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class VenueDto {

    @NotBlank(message = "Názov miesta je povinný")
    private String name;

    @NotBlank(message = "Adresa je povinná")
    private String address;

    @NotNull(message = "Vlastník (Organizátor ID) je povinný")
    private Long ownerId;

    @NotNull(message = "Zemepisná šírka je povinná")
    @DecimalMin(value = "-90.0", message = "Latitude musí byť medzi -90 a 90")
    @DecimalMax(value = "90.0", message = "Latitude musí byť medzi -90 a 90")
    private Double latitude;

    @NotNull(message = "Zemepisná dĺžka je povinná")
    @DecimalMin(value = "-180.0", message = "Longitude musí byť medzi -180 a 180")
    @DecimalMax(value = "180.0", message = "Longitude musí byť medzi -180 a 180")
    private Double longitude;
}
