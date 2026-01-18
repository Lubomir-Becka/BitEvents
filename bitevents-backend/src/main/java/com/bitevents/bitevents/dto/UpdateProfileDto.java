package com.bitevents.bitevents.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileDto {

    @NotBlank(message = "Celé meno je povinné")
    @Size(min = 2, max = 100, message = "Celé meno musí mať 2-100 znakov")
    private String fullName;

    @Size(max = 500, message = "URL profilového obrázka je príliš dlhá")
    private String profilePicture;
}
