package com.bitevents.bitevents.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginDto {

    @NotBlank(message = "E-mail je povinný")
    @Email(message = "Zadajte platný e-mail")
    private String email;

    @NotBlank(message = "Heslo je povinné")
    private String password;
}
