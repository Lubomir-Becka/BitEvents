package com.bitevents.bitevents.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordDto {

    @NotBlank(message = "Súčasné heslo je povinné")
    private String currentPassword;

    @NotBlank(message = "Nové heslo je povinné")
    @Size(min = 8, message = "Heslo musí mať aspoň 8 znakov")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
        message = "Heslo musí obsahovať aspoň jedno malé písmeno, veľké písmeno a číslo"
    )
    private String newPassword;
}
