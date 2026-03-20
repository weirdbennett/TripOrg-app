package com.triporg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketFileDto {
    private String id;
    private String fileName;
    private Long fileSize;
    private String uploadedAt;
    private String uploadedBy;
}


