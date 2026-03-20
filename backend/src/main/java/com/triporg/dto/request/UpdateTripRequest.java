package com.triporg.dto.request;

import com.triporg.dto.AccommodationDto;
import com.triporg.dto.ActivityDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTripRequest {
    private String name;
    private String country;
    private String city;
    private String specificPlace;
    private String startDate;
    private String endDate;
    private String baseCurrency;
    private String transportType;
    private String ticketsStatus;
    private BigDecimal ticketPrice;
    private AccommodationDto accommodation;
    private String foodStrategy;
    private BigDecimal estimatedDailyFoodBudgetPerPerson;
    private List<ActivityDto> activities;
    private String localTransportNotes;
    private String sharedNotes;
    private String importantDeadlines;
    private List<String> documentsChecklist;
}


