package com.bitevents.bitevents.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileDto {

    @NotBlank(message = "Celé meno je povinné")
    @Size(min = 2, max = 100, message = "Celé meno musí mať 2-100 znakov")
    @Pattern(regexp = "^[a-zA-ZáäčďéíľňóôŕšťúýžÁÄČĎÉÍĽŇÓÔŔŠŤÚÝŽ\\s'-]+$",
             message = "Meno môže obsahovať iba písmená, medzery, pomlčky a apostrofy")
    private String fullName;

    @Size(max = 500, message = "URL profilového obrázka je príliš dlhá")
    @Pattern(regexp = "^(https?://.*|)$",
             message = "Musí byť platná HTTP/HTTPS adresa alebo prázdne",
             flags = Pattern.Flag.CASE_INSENSITIVE)
    private String profilePicture;
}
