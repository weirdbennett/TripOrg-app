package com.triporg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogEntryDto {
    private String id;
    private String tripId;
    private String userId;
    private String userName;
    private String actionType;
    private String entityType;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private String timestamp;
}


