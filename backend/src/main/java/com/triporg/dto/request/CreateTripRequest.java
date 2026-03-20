package com.triporg.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTripRequest {
    @NotBlank(message = "Trip name is required")
    private String name;
    
    @NotBlank(message = "Country is required")
    private String country;
    
    @NotBlank(message = "City is required")
    private String city;
    
    private String specificPlace;
    
    @NotBlank(message = "Start date is required")
    private String startDate;
    
    @NotBlank(message = "End date is required")
    private String endDate;
    
    @NotBlank(message = "Base currency is required")
    private String baseCurrency;
    
    @NotNull(message = "Transport type is required")
    private String transportType;
    
    @NotNull(message = "Tickets status is required")
    private String ticketsStatus;
    
    @NotNull(message = "Food strategy is required")
    private String foodStrategy;
    
    private BigDecimal estimatedDailyFoodBudgetPerPerson;
}


