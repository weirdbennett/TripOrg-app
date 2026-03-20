package com.triporg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetSummaryDto {
    private BigDecimal totalSharedCost;
    private BigDecimal costPerParticipant;
    private Map<String, BigDecimal> balancePerUser;
    private Map<String, BigDecimal> expensesByCategory;
}


