package com.triporg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripDto {
    private String id;
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
    private List<TicketFileDto> ticketFiles;
    private AccommodationDto accommodation;
    private String foodStrategy;
    private BigDecimal estimatedDailyFoodBudgetPerPerson;
    private List<ActivityDto> activities;
    private String localTransportNotes;
    private String sharedNotes;
    private String importantDeadlines;
    private List<String> documentsChecklist;
    private String createdAt;
    private String createdBy;
    private List<String> participants;
}


