package com.triporg.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LockAIChatRequest {
    @NotNull(message = "Lock status is required")
    private Boolean lock;
}


