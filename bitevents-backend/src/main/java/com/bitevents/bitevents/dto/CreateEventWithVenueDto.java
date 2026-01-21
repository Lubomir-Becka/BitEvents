package com.bitevents.bitevents.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class CreateEventWithVenueDto {

    @NotBlank(message = "Názov udalosti je povinný")
    @Size(min = 3, max = 255, message = "Názov musí mať 3-255 znakov")
    private String name;

    @NotBlank(message = "Popis je povinný")
    @Size(min = 10, max = 5000, message = "Popis musí mať 10-5000 znakov")
    private String description;

    @NotBlank(message = "Typ udalosti je povinný")
    @Size(max = 100, message = "Typ je príliš dlhý")
    private String type;

    @NotNull(message = "Dátum začiatku je povinný")
    private OffsetDateTime startDateTime;

    private OffsetDateTime endDateTime;

    @Min(value = 1, message = "Kapacita musí byť minimálne 1")
    @Max(value = 100000, message = "Kapacita nesmie presiahnuť 100 000")
    private Integer capacity;

    @DecimalMin(value = "0.00", message = "Cena nesmie byť záporná")
    @DecimalMax(value = "999999.99", message = "Cena je príliš vysoká")
    private BigDecimal price;

    @Pattern(regexp = "^(https?://.*|)$", message = "URL obrázka musí byť platná HTTP/HTTPS adresa",
             flags = Pattern.Flag.CASE_INSENSITIVE)
    private String imageUrl;

    @Pattern(regexp = "Upcoming|Cancelled|Postponed|Sold Out|Completed",
             message = "Neplatný stav udalosti")
    private String status;

    @NotNull(message = "Informácie o mieste konania sú povinné")
    @Valid
    private VenueInfo venue;

    @Data
    public static class VenueInfo {
        @NotBlank(message = "Názov miesta je povinný")
        @Size(max = 255, message = "Názov miesta je príliš dlhý")
        private String name;

        @NotBlank(message = "Adresa je povinná")
        @Size(max = 500, message = "Adresa je príliš dlhá")
        private String address;

        @NotBlank(message = "Mesto je povinné")
        @Size(max = 100, message = "Mesto je príliš dlhé")
        private String city;

        @DecimalMin(value = "-90.0", message = "Neplatná zemepisná šírka")
        @DecimalMax(value = "90.0", message = "Neplatná zemepisná šírka")
        private BigDecimal latitude;

        @DecimalMin(value = "-180.0", message = "Neplatná zemepisná dĺžka")
        @DecimalMax(value = "180.0", message = "Neplatná zemepisná dĺžka")
        private BigDecimal longitude;

        @Pattern(regexp = "^(https?://.*|)$", message = "Google Maps URL musí byť platná",
                 flags = Pattern.Flag.CASE_INSENSITIVE)
        private String googleMapsUrl;
    }

    @AssertTrue(message = "Dátum konca musí byť po dátume začiatku")
    public boolean isEndDateTimeValid() {
        if (endDateTime == null || startDateTime == null) {
            return true;
        }
        return endDateTime.isAfter(startDateTime);
    }
}
