package com.triporg.service;

import com.triporg.dto.*;
import com.triporg.dto.request.CreateTripRequest;
import com.triporg.dto.request.UpdateTripRequest;
import com.triporg.entity.*;
import com.triporg.exception.ForbiddenException;
import com.triporg.exception.NotFoundException;
import com.triporg.mapper.EntityMapper;
import com.triporg.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripService {
    
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripParticipantRepository participantRepository;
    private final AccommodationRepository accommodationRepository;
    private final ActivityRepository activityRepository;
    private final DocumentChecklistItemRepository documentChecklistRepository;
    private final ExpenseRepository expenseRepository;
    private final ActivityLogService activityLogService;
    private final EntityMapper mapper;
    
    // Auto-expense source identifiers (used to track which expenses were auto-generated from trip data)
    private static final String AUTO_SOURCE_TICKETS = "tickets";
    private static final String AUTO_SOURCE_ACCOMMODATION = "accommodation";
    private static final String AUTO_SOURCE_FOOD = "food";
    private static final String AUTO_SOURCE_ACTIVITIES_PREFIX = "activity_";
    
    // Fetch all trips the user is part of
    @Transactional(readOnly = true)
    public List<TripDto> getTripsForUser(String userId) {
        return tripRepository.findByParticipantUserId(userId).stream()
                .map(mapper::toTripDto)
                .collect(Collectors.toList());
    }
    
    // Get a single trip (of corse user must be a participant)
    @Transactional(readOnly = true)
    public TripDto getTrip(String tripId, String userId) {
        Trip trip = findTripWithAccess(tripId, userId);
        return mapper.toTripDto(trip);
    }
    
    // Create a new trip and add the creator as the first participant
    @Transactional
    public TripDto createTrip(CreateTripRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        Trip trip = Trip.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .country(request.getCountry())
                .city(request.getCity())
                .specificPlace(request.getSpecificPlace())
                .startDate(LocalDate.parse(request.getStartDate()))
                .endDate(LocalDate.parse(request.getEndDate()))
                .baseCurrency(request.getBaseCurrency())
                .transportType(request.getTransportType())
                .ticketsStatus(request.getTicketsStatus())
                .foodStrategy(request.getFoodStrategy())
                .estimatedDailyFoodBudgetPerPerson(request.getEstimatedDailyFoodBudgetPerPerson())
                .createdBy(user)
                .build();
        
        trip = tripRepository.save(trip);
        
        // Add creator as first participant
        TripParticipant participant = TripParticipant.builder()
                .id(UUID.randomUUID().toString())
                .trip(trip)
                .user(user)
                .build();
        participantRepository.save(participant);
        
        // Log the creation activity
        activityLogService.log(trip, user, "create", "trip");
        
        // Reload to get all relations
        trip = tripRepository.findById(trip.getId()).orElseThrow();
        return mapper.toTripDto(trip);
    }
    
    // Update trip details and automatically sync expenses based on new data
    @Transactional
    public TripDto updateTrip(String tripId, UpdateTripRequest request, String userId) {
        Trip trip = findTripWithAccess(tripId, userId);
        User user = userRepository.findById(userId).orElseThrow();
        
        // Track changes for logging (only log if value actually changed)
        if (request.getName() != null && !request.getName().equals(trip.getName())) {
            activityLogService.log(trip, user, "update", "trip", "name", trip.getName(), request.getName());
            trip.setName(request.getName());
        }
        if (request.getCountry() != null && !request.getCountry().equals(trip.getCountry())) {
            activityLogService.log(trip, user, "update", "trip", "country", trip.getCountry(), request.getCountry());
            trip.setCountry(request.getCountry());
        }
        if (request.getCity() != null && !request.getCity().equals(trip.getCity())) {
            activityLogService.log(trip, user, "update", "trip", "city", trip.getCity(), request.getCity());
            trip.setCity(request.getCity());
        }
        if (request.getSpecificPlace() != null) {
            trip.setSpecificPlace(request.getSpecificPlace());
        }
        if (request.getStartDate() != null) {
            LocalDate newDate = LocalDate.parse(request.getStartDate());
            if (!newDate.equals(trip.getStartDate())) {
                activityLogService.log(trip, user, "update", "trip", "startDate", 
                        trip.getStartDate().toString(), request.getStartDate());
                trip.setStartDate(newDate);
            }
        }
        if (request.getEndDate() != null) {
            LocalDate newDate = LocalDate.parse(request.getEndDate());
            if (!newDate.equals(trip.getEndDate())) {
                activityLogService.log(trip, user, "update", "trip", "endDate",
                        trip.getEndDate().toString(), request.getEndDate());
                trip.setEndDate(newDate);
            }
        }
        if (request.getTransportType() != null) {
            if (!request.getTransportType().equals(trip.getTransportType())) {
                activityLogService.log(trip, user, "update", "trip", "transportType",
                        trip.getTransportType(), request.getTransportType());
                trip.setTransportType(request.getTransportType());
            }
        }
        if (request.getTicketsStatus() != null) {
            if (!request.getTicketsStatus().equals(trip.getTicketsStatus())) {
                activityLogService.log(trip, user, "update", "trip", "ticketsStatus",
                        trip.getTicketsStatus(), request.getTicketsStatus());
                trip.setTicketsStatus(request.getTicketsStatus());
            }
        }
        if (request.getTicketPrice() != null) {
            trip.setTicketPrice(request.getTicketPrice());
        }
        if (request.getFoodStrategy() != null) {
            if (!request.getFoodStrategy().equals(trip.getFoodStrategy())) {
                activityLogService.log(trip, user, "update", "trip", "foodStrategy",
                        trip.getFoodStrategy(), request.getFoodStrategy());
                trip.setFoodStrategy(request.getFoodStrategy());
            }
        }
        if (request.getEstimatedDailyFoodBudgetPerPerson() != null) {
            trip.setEstimatedDailyFoodBudgetPerPerson(request.getEstimatedDailyFoodBudgetPerPerson());
        }
        if (request.getLocalTransportNotes() != null) {
            activityLogService.log(trip, user, "update", "trip", "localTransportNotes", 
                    trip.getLocalTransportNotes(), request.getLocalTransportNotes());
            trip.setLocalTransportNotes(request.getLocalTransportNotes());
        }
        if (request.getSharedNotes() != null) {
            activityLogService.log(trip, user, "update", "trip", "sharedNotes",
                    trip.getSharedNotes(), request.getSharedNotes());
            trip.setSharedNotes(request.getSharedNotes());
        }
        if (request.getImportantDeadlines() != null) {
            activityLogService.log(trip, user, "update", "trip", "importantDeadlines",
                    trip.getImportantDeadlines(), request.getImportantDeadlines());
            trip.setImportantDeadlines(request.getImportantDeadlines());
        }
        
        // Handle accommodation changes
        if (request.getAccommodation() != null) {
            updateAccommodation(trip, request.getAccommodation(), user);
        }
        
        // Handle activities changes
        if (request.getActivities() != null) {
            updateActivities(trip, request.getActivities(), user);
        }
        
        // Handle documents checklist changes
        if (request.getDocumentsChecklist() != null) {
            updateDocumentsChecklist(trip, request.getDocumentsChecklist(), user);
        }
        
        trip = tripRepository.save(trip);
        
        // Automatically create or update expenses based on trip pricing data
        syncAutoExpenses(trip, user);
        
        return mapper.toTripDto(trip);
    }
    
    // Create or update auto-generated expenses based on trip pricing data (tickets, accommodation, food, activities)
    private void syncAutoExpenses(Trip trip, User user) {
        // Sync ticket expense based on ticket price
        syncAutoExpense(trip, user, AUTO_SOURCE_TICKETS, "transport",
                trip.getTicketPrice(), "Transport tickets");
        
        // Sync accommodation expense (calculated as price per night * number of nights)
        BigDecimal accommodationTotal = null;
        if (trip.getAccommodation() != null && trip.getAccommodation().getPricePerNight() != null) {
            long nights = ChronoUnit.DAYS.between(
                    trip.getAccommodation().getCheckInDate(),
                    trip.getAccommodation().getCheckOutDate());
            if (nights > 0) {
                accommodationTotal = trip.getAccommodation().getPricePerNight()
                        .multiply(BigDecimal.valueOf(nights));
            }
        }
        syncAutoExpense(trip, user, AUTO_SOURCE_ACCOMMODATION, "accommodation",
                accommodationTotal, 
                trip.getAccommodation() != null ? trip.getAccommodation().getName() : "Accommodation");
        
        // 3. Sync food expense (total for all days and all participants)
        BigDecimal foodTotal = null;
        if (trip.getEstimatedDailyFoodBudgetPerPerson() != null) {
            long days = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;
            int participantCount = trip.getParticipants().size();
            if (days > 0 && participantCount > 0) {
                foodTotal = trip.getEstimatedDailyFoodBudgetPerPerson()
                        .multiply(BigDecimal.valueOf(days))
                        .multiply(BigDecimal.valueOf(participantCount));
            }
        }
        syncAutoExpense(trip, user, AUTO_SOURCE_FOOD, "food",
                foodTotal, "Estimated food expenses");
        
        // 4. Sync activity expenses (one expense per activity)
        syncActivityExpenses(trip, user);
    }
    
    // Create, update, or delete a single auto-generated expense
    private void syncAutoExpense(Trip trip, User user, String autoSource, String category,
                                  BigDecimal amount, String description) {
        var existingExpense = expenseRepository.findAutoGeneratedByTripAndSource(trip.getId(), autoSource);
        
        // If we have an amount, create or update the expense
        if (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
            Expense expense = existingExpense.orElseGet(() -> Expense.builder()
                    .id(UUID.randomUUID().toString())
                    .trip(trip)
                    .author(user)
                    .isShared(true)
                    .isAutoGenerated(true)
                    .autoSource(autoSource)
                    .build());
            
            expense.setAmount(amount);
            expense.setCategory(category);
            expense.setDescription(description);
            expenseRepository.save(expense);
        } else if (existingExpense.isPresent()) {
            // If amount is zero or null, delete the expense
            expenseRepository.delete(existingExpense.get());
        }
    }
    
    // Sync all activity expenses (create, update, or delete based on activity costs)
    private void syncActivityExpenses(Trip trip, User user) {
        // Get all existing auto-generated activity expenses
        var existingActivityExpenses = expenseRepository.findAutoGeneratedByTripId(trip.getId())
                .stream()
                .filter(e -> e.getAutoSource() != null && e.getAutoSource().startsWith(AUTO_SOURCE_ACTIVITIES_PREFIX))
                .collect(java.util.stream.Collectors.toMap(Expense::getAutoSource, e -> e));
        
        // Create/update expenses for each activity with a cost
        for (Activity activity : trip.getActivities()) {
            String autoSource = AUTO_SOURCE_ACTIVITIES_PREFIX + activity.getId();
            
            if (activity.getEstimatedCost() != null && activity.getEstimatedCost().compareTo(BigDecimal.ZERO) > 0) {
                Expense expense = existingActivityExpenses.get(autoSource);
                if (expense == null) {
                    expense = Expense.builder()
                            .id(UUID.randomUUID().toString())
                            .trip(trip)
                            .author(user)
                            .isShared(true)
                            .isAutoGenerated(true)
                            .autoSource(autoSource)
                            .build();
                }
                expense.setAmount(activity.getEstimatedCost());
                expense.setCategory("activities");
                expense.setDescription(activity.getName());
                expenseRepository.save(expense);
                existingActivityExpenses.remove(autoSource);
            } else {
                // Remove if exists but no longer has cost
                if (existingActivityExpenses.containsKey(autoSource)) {
                    expenseRepository.delete(existingActivityExpenses.get(autoSource));
                    existingActivityExpenses.remove(autoSource);
                }
            }
        }
        
        // Delete any remaining old activity expenses (for deleted activities)
        existingActivityExpenses.values().forEach(expenseRepository::delete);
    }
    
    // Create or update accommodation for the trip
    private void updateAccommodation(Trip trip, AccommodationDto dto, User user) {
        Accommodation existing = trip.getAccommodation();
        
        // If no name provided, delete the accommodation
        if (dto.getName() == null || dto.getName().isEmpty()) {
            if (existing != null) {
                activityLogService.log(trip, user, "delete", "accommodation");
                trip.setAccommodation(null);
                accommodationRepository.delete(existing);
            }
            return;
        }
        
        // Create new accommodation if doesn't exist
        if (existing == null) {
            existing = Accommodation.builder()
                    .id(UUID.randomUUID().toString())
                    .trip(trip)
                    .build();
            activityLogService.log(trip, user, "add", "accommodation");
        } else {
            activityLogService.log(trip, user, "update", "accommodation");
        }
        
        // Update accommodation fields
        existing.setType(dto.getType());
        existing.setName(dto.getName());
        existing.setAddress(dto.getAddress());
        existing.setCheckInDate(LocalDate.parse(dto.getCheckInDate()));
        existing.setCheckOutDate(LocalDate.parse(dto.getCheckOutDate()));
        existing.setPricePerNight(dto.getPricePerNight());
        existing.setNotes(dto.getNotes());
        
        accommodationRepository.save(existing);
        trip.setAccommodation(existing);
    }
    
    // Replace all activities with new ones (clear old, add new)
    private void updateActivities(Trip trip, List<ActivityDto> dtos, User user) {
        // Clear existing activities
        activityRepository.deleteByTripId(trip.getId());
        trip.getActivities().clear();
        
        activityLogService.log(trip, user, "update", "activity", "activities", null, 
                dtos.size() + " activities");
        
        // Add new activities
        for (ActivityDto dto : dtos) {
            Activity activity = Activity.builder()
                    .id(dto.getId() != null ? dto.getId() : UUID.randomUUID().toString())
                    .trip(trip)
                    .name(dto.getName())
                    .estimatedCost(dto.getEstimatedCost())
                    .notes(dto.getNotes())
                    .build();
            activityRepository.save(activity);
            trip.getActivities().add(activity);
        }
    }
    
    // Replace all documents checklist items with new ones
    private void updateDocumentsChecklist(Trip trip, List<String> items, User user) {
        // Clear existing items
        documentChecklistRepository.deleteByTripId(trip.getId());
        trip.getDocumentsChecklist().clear();
        
        activityLogService.log(trip, user, "update", "trip", "documentsChecklist", null,
                String.join(", ", items));
        
        // Add new items
        for (String item : items) {
            DocumentChecklistItem checklistItem = DocumentChecklistItem.builder()
                    .id(UUID.randomUUID().toString())
                    .trip(trip)
                    .item(item)
                    .build();
            documentChecklistRepository.save(checklistItem);
            trip.getDocumentsChecklist().add(checklistItem);
        }
    }
    
    // Delete a trip
    @Transactional
    public void deleteTrip(String tripId, String userId) {
        Trip trip = findTripWithAccess(tripId, userId);
        
        // Only the creator can delete the trip
        if (!trip.getCreatedBy().getId().equals(userId)) {
            throw new ForbiddenException("Only the trip owner can delete this trip");
        }
        
        tripRepository.delete(trip);
    }
    
    // Add a new participant to the trip
    @Transactional
    public TripDto addParticipant(String tripId, String participantUserId, String currentUserId) {
        Trip trip = findTripWithAccess(tripId, currentUserId);
        User currentUser = userRepository.findById(currentUserId).orElseThrow();
        User newUser = userRepository.findById(participantUserId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        // Check if already a participant
        if (participantRepository.existsByTripIdAndUserId(tripId, participantUserId)) {
            return mapper.toTripDto(trip);
        }
        
        TripParticipant participant = TripParticipant.builder()
                .id(UUID.randomUUID().toString())
                .trip(trip)
                .user(newUser)
                .build();
        participantRepository.save(participant);
        
        activityLogService.log(trip, currentUser, "add", "participant", null, null, newUser.getDisplayName());
        
        trip = tripRepository.findById(tripId).orElseThrow();
        return mapper.toTripDto(trip);
    }
    
    // Remove a participant from the trip
    @Transactional
    public TripDto removeParticipant(String tripId, String participantUserId, String currentUserId) {
        log.info("removeParticipant called: tripId={}, participantUserId={}, currentUserId={}", 
                tripId, participantUserId, currentUserId);
        
        final Trip trip = findTripWithAccess(tripId, currentUserId);
        final User currentUser = userRepository.findById(currentUserId).orElseThrow();
        
        // Prevent removing the trip owner
        if (trip.getCreatedBy().getId().equals(participantUserId)) {
            log.warn("Attempted to remove trip owner: tripId={}, ownerId={}", tripId, participantUserId);
            throw new ForbiddenException("Cannot remove the trip owner");
        }
        
        // Only owner can remove other participants, or user can remove themselves
        if (!trip.getCreatedBy().getId().equals(currentUserId) && !participantUserId.equals(currentUserId)) {
            log.warn("Unauthorized removal attempt: tripId={}, currentUserId={}, targetUserId={}", 
                    tripId, currentUserId, participantUserId);
            throw new ForbiddenException("Only the trip owner can remove other participants");
        }
        
        Optional<TripParticipant> participantOpt = participantRepository.findByTripIdAndUserId(tripId, participantUserId);
        if (participantOpt.isPresent()) {
            TripParticipant p = participantOpt.get();
            User removedUser = p.getUser();
            String removedUserName = removedUser.getDisplayName();
            boolean isVoluntaryLeave = currentUserId.equals(participantUserId);
            
            log.info("Removing participant: tripId={}, userId={}, userName={}, voluntary={}", 
                    tripId, participantUserId, removedUserName, isVoluntaryLeave);
            
            // Remove from trip's collection - this updates the entity state
            trip.getParticipants().remove(p);

            participantRepository.delete(p);
            participantRepository.flush();
            
            // Log differently based on whether user left voluntarily or was removed
            if (isVoluntaryLeave) {
                // User left voluntarily - log as the leaving user
                activityLogService.log(trip, removedUser, "leave", "participant", 
                        null, null, null);
            } else {
                // User was removed by someone else - log who removed whom
                activityLogService.log(trip, currentUser, "remove", "participant", 
                        null, removedUserName, null);
            }
            
            log.info("removeParticipant completed: tripId={}, remainingParticipants={}", 
                    tripId, trip.getParticipants().size());
        } else {
            log.warn("Participant not found for removal: tripId={}, userId={}", tripId, participantUserId);
        }
        
        return mapper.toTripDto(trip);
    }
    
    // Get all participants of a trip
    @Transactional(readOnly = true)
    public List<UserDto> getParticipants(String tripId, String userId) {
        findTripWithAccess(tripId, userId);
        return participantRepository.findByTripId(tripId).stream()
                .map(p -> mapper.toUserDto(p.getUser()))
                .collect(Collectors.toList());
    }
    
    // Helper method to find a trip and verify user has access
    private Trip findTripWithAccess(String tripId, String userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("Trip not found"));
        
        if (!tripRepository.isUserParticipant(tripId, userId)) {
            throw new ForbiddenException("Access denied");
        }
        
        return trip;
    }
}

