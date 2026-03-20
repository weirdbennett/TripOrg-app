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
public class AccommodationDto {
    private String type;
    private String name;
    private String address;
    private String checkInDate;
    private String checkOutDate;
    private BigDecimal pricePerNight;
    private String notes;
}


