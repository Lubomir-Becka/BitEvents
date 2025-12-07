package com.bitevents.bitevents.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Value;


@Value
public class RegistrationRequest {

    @NotBlank(message = "Meno je povinné")
    String name;

    @NotBlank(message = "Priezvisko je povinné")
    String surname;

    @Email(message = "E-mail nie je v správnom formáte")
    @NotBlank(message = "E-mail je povinný")
    String email;

    @NotBlank(message = "Heslo je povinné")
    @Size(min = 8, message = "Heslo musí mať aspoň 8 znakov")
    String password;

}
