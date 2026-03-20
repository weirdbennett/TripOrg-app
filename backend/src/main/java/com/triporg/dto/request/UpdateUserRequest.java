package com.triporg.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private String displayName;
    private String email;
    private String avatar;
    private String preferredCurrency;
    private String themePreference;
}


