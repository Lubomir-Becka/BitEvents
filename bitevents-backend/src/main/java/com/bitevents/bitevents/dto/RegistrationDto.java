package com.bitevents.bitevents.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Value;


@Data
public class RegistrationDto {

    @NotBlank(message = "Celé meno je povinné")
    @Size(max = 255, message = "Meno je príliš dlhé")
    private String fullName;

    @Email(message = "E-mail nie je v správnom formáte")
    @NotBlank(message = "E-mail je povinný")
    private String email;

    @NotBlank(message = "Heslo je povinné")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$",
            message = "Heslo musí mať aspoň 8 znakov, obsahovať jedno číslo, jedno malé a jedno veľké písmeno a jeden špeciálny znak")
    private String password;

    private boolean isOrganizer;
}
