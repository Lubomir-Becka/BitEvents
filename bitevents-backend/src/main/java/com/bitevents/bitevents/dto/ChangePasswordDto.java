package com.bitevents.bitevents.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordDto {

    @NotBlank(message = "Súčasné heslo je povinné")
    private String currentPassword;

    @NotBlank(message = "Nové heslo je povinné")
    @Size(min = 8, max = 128, message = "Heslo musí mať 8-128 znakov")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#^()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).*$",
        message = "Heslo musí obsahovať aspoň jedno malé písmeno, veľké písmeno, číslo a špeciálny znak"
    )
    private String newPassword;

    @AssertTrue(message = "Nové heslo musí byť odlišné od súčasného hesla")
    public boolean isNewPasswordDifferent() {
        if (currentPassword == null || newPassword == null) {
            return true;
        }
        return !currentPassword.equals(newPassword);
    }
}
