package com.triporg.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String error;
    private String code;
    private String timestamp;
    private Map<String, String> details;
    
    public static ErrorResponse of(String error, String code) {
        return ErrorResponse.builder()
                .error(error)
                .code(code)
                .timestamp(Instant.now().toString())
                .build();
    }
    
    public static ErrorResponse of(String error, String code, Map<String, String> details) {
        return ErrorResponse.builder()
                .error(error)
                .code(code)
                .timestamp(Instant.now().toString())
                .details(details)
                .build();
    }
}


