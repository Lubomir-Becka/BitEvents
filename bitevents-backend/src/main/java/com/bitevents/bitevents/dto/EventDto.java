package com.bitevents.bitevents.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class EventDto {

    @NotNull(message = "ID organizátora je povinné")
    private Integer organizerId;

    @NotNull(message = "ID miesta konania je povinné")
    private Integer venueId;

    @NotBlank(message = "Názov udalosti je povinný")
    @Size(max = 255, message = "Názov je príliš dlhý")
    private String name;

    @NotBlank(message = "Popis je povinný")
    private String description;

    @NotBlank(message = "Typ udalosti je povinný")
    @Size(max = 100)
    private String type;

    @NotNull(message = "Dátum začiatku je povinný")
    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;

    @PositiveOrZero(message = "Kapacita musí byť nezáporné číslo")
    private Integer capacity;

    @DecimalMin(value = "0.00", message = "Cena nesmie byť záporná")
    private BigDecimal price;

    private String imageUrl;

}
