package com.bitevents.bitevents.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class EventDto {

    @NotNull(message = "ID organizátora je povinné")
    @Min(value = 1, message = "ID organizátora musí byť kladné číslo")
    private Long organizerId;

    @NotNull(message = "ID miesta konania je povinné")
    @Min(value = 1, message = "ID miesta konania musí byť kladné číslo")
    private Long venueId;

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
    @Future(message = "Dátum začiatku musí byť v budúcnosti")
    private OffsetDateTime startDateTime;

    private OffsetDateTime endDateTime;

    @Min(value = 1, message = "Kapacita musí byť minimálne 1")
    @Max(value = 100000, message = "Kapacita nesmie presiahnuť 100 000")
    private Integer capacity;

    @DecimalMin(value = "0.00", message = "Cena nesmie byť záporná")
    @DecimalMax(value = "999999.99", message = "Cena je príliš vysoká")
    private BigDecimal price;

    @Pattern(regexp = "^https?://.*", message = "URL obrázka musí byť platná HTTP/HTTPS adresa",
             flags = Pattern.Flag.CASE_INSENSITIVE)
    private String imageUrl;

    @Pattern(regexp = "Upcoming|Cancelled|Postponed|Sold Out|Completed",
             message = "Neplatný stav udalosti")
    private String status;

    @AssertTrue(message = "Dátum konca musí byť po dátume začiatku")
    public boolean isEndDateTimeValid() {
        if (endDateTime == null || startDateTime == null) {
            return true; // endDateTime is optional
        }
        return endDateTime.isAfter(startDateTime);
    }
}
