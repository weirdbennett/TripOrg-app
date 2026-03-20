package com.triporg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIChatMessageDto {
    private String id;
    private String tripId;
    private String role;
    private String content;
    private String timestamp;
}


