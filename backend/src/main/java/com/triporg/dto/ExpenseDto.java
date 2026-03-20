package com.triporg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDto {
    private String id;
    private String tripId;
    private BigDecimal amount;
    private String category;
    private String description;
    private String author;
    private String authorName;
    private String timestamp;
    private Boolean isShared;
}


