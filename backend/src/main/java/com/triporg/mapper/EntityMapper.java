package com.triporg.mapper;

import com.triporg.dto.*;
import com.triporg.entity.*;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class EntityMapper {
    
    public UserDto toUserDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .displayName(user.getDisplayName())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .preferredCurrency(user.getPreferredCurrency())
                .build();
    }
    
    public TripDto toTripDto(Trip trip) {
        if (trip == null) return null;
        return TripDto.builder()
                .id(trip.getId())
                .name(trip.getName())
                .country(trip.getCountry())
                .city(trip.getCity())
                .specificPlace(trip.getSpecificPlace())
                .startDate(trip.getStartDate().toString())
                .endDate(trip.getEndDate().toString())
                .baseCurrency(trip.getBaseCurrency())
                .transportType(trip.getTransportType())
                .ticketsStatus(trip.getTicketsStatus())
                .ticketPrice(trip.getTicketPrice())
                .ticketFiles(trip.getTicketFiles().stream()
                        .map(this::toTicketFileDto)
                        .collect(Collectors.toList()))
                .accommodation(toAccommodationDto(trip.getAccommodation()))
                .foodStrategy(trip.getFoodStrategy())
                .estimatedDailyFoodBudgetPerPerson(trip.getEstimatedDailyFoodBudgetPerPerson())
                .activities(trip.getActivities().stream()
                        .map(this::toActivityDto)
                        .collect(Collectors.toList()))
                .localTransportNotes(trip.getLocalTransportNotes())
                .sharedNotes(trip.getSharedNotes())
                .importantDeadlines(trip.getImportantDeadlines())
                .documentsChecklist(trip.getDocumentsChecklist().stream()
                        .map(DocumentChecklistItem::getItem)
                        .collect(Collectors.toList()))
                .createdAt(toIsoString(trip.getCreatedAt()))
                .createdBy(trip.getCreatedBy().getId())
                .participants(trip.getParticipants().stream()
                        .map(p -> p.getUser().getId())
                        .collect(Collectors.toList()))
                .build();
    }
    
    private String toIsoString(Instant instant) {
        return instant != null ? instant.toString() : Instant.now().toString();
    }
    
    public AccommodationDto toAccommodationDto(Accommodation accommodation) {
        if (accommodation == null) return null;
        return AccommodationDto.builder()
                .type(accommodation.getType())
                .name(accommodation.getName())
                .address(accommodation.getAddress())
                .checkInDate(accommodation.getCheckInDate().toString())
                .checkOutDate(accommodation.getCheckOutDate().toString())
                .pricePerNight(accommodation.getPricePerNight())
                .notes(accommodation.getNotes())
                .build();
    }
    
    public ActivityDto toActivityDto(Activity activity) {
        if (activity == null) return null;
        return ActivityDto.builder()
                .id(activity.getId())
                .name(activity.getName())
                .estimatedCost(activity.getEstimatedCost())
                .notes(activity.getNotes())
                .build();
    }
    
    public TicketFileDto toTicketFileDto(TicketFile ticketFile) {
        if (ticketFile == null) return null;
        return TicketFileDto.builder()
                .id(ticketFile.getId())
                .fileName(ticketFile.getFileName())
                .fileSize(ticketFile.getFileSize())
                .uploadedAt(ticketFile.getUploadedAt().toString())
                .uploadedBy(ticketFile.getUploadedBy().getId())
                .build();
    }
    
    public ExpenseDto toExpenseDto(Expense expense) {
        if (expense == null) return null;
        User author = expense.getAuthor();
        String authorDisplayName = author.getDisplayName() != null ? author.getDisplayName() :
                (author.getFirstName() + " " + author.getLastName()).trim();
        return ExpenseDto.builder()
                .id(expense.getId())
                .tripId(expense.getTrip().getId())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .description(expense.getDescription())
                .author(author.getId())
                .authorName(authorDisplayName)
                .timestamp(expense.getCreatedAt().toString())
                .isShared(expense.getIsShared())
                .build();
    }
    
    public ActivityLogEntryDto toActivityLogEntryDto(ActivityLog log) {
        if (log == null) return null;
        return ActivityLogEntryDto.builder()
                .id(log.getId())
                .tripId(log.getTrip().getId())
                .userId(log.getUser().getId())
                .userName(log.getUserName())
                .actionType(log.getActionType())
                .entityType(log.getEntityType())
                .fieldName(log.getFieldName())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .timestamp(log.getCreatedAt().toString())
                .build();
    }
    
    public ChatMessageDto toChatMessageDto(ChatMessage message) {
        if (message == null) return null;
        return ChatMessageDto.builder()
                .id(message.getId())
                .tripId(message.getTrip().getId())
                .userId(message.getUser().getId())
                .userName(message.getUserName())
                .userAvatar(message.getUserAvatar())
                .content(message.getContent())
                .timestamp(message.getCreatedAt().toString())
                .build();
    }
    
    public AIChatMessageDto toAIChatMessageDto(AIChatMessage message) {
        if (message == null) return null;
        return AIChatMessageDto.builder()
                .id(message.getId())
                .tripId(message.getTrip().getId())
                .role(message.getRole())
                .content(message.getContent())
                .timestamp(message.getCreatedAt().toString())
                .build();
    }
    
    public AIChatSessionDto toAIChatSessionDto(AIChatSession session) {
        if (session == null) return null;
        return AIChatSessionDto.builder()
                .tripId(session.getTrip().getId())
                .isLocked(session.getIsLocked())
                .messages(session.getMessages().stream()
                        .map(this::toAIChatMessageDto)
                        .collect(Collectors.toList()))
                .build();
    }
    
    public LocalDate parseDate(String date) {
        return LocalDate.parse(date);
    }
    
    public Instant parseInstant(String timestamp) {
        return Instant.parse(timestamp);
    }
}

