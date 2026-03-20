package com.triporg.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateExpenseRequest {
    private BigDecimal amount;
    private String category;
    private String description;
}


