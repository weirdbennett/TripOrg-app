package com.triporg.service;

import com.triporg.dto.BudgetSummaryDto;
import com.triporg.dto.ExpenseDto;
import com.triporg.dto.request.CreateExpenseRequest;
import com.triporg.dto.request.UpdateExpenseRequest;
import com.triporg.entity.Activity;
import com.triporg.entity.Expense;
import com.triporg.entity.Trip;
import com.triporg.entity.User;
import com.triporg.exception.ForbiddenException;
import com.triporg.exception.NotFoundException;
import com.triporg.mapper.EntityMapper;
import com.triporg.repository.AccommodationRepository;
import com.triporg.repository.ActivityRepository;
import com.triporg.repository.ExpenseRepository;
import com.triporg.repository.TripParticipantRepository;
import com.triporg.repository.TripRepository;
import com.triporg.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    
    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripParticipantRepository participantRepository;
    private final AccommodationRepository accommodationRepository;
    private final ActivityRepository activityRepository;
    private final ActivityLogService activityLogService;
    private final EntityMapper mapper;
    
    // Auto-Expense source identifiers (used to link auto-generated expenses to their source data for easy cleanup if deleted)
    private static final String AUTO_SOURCE_TICKETS = "tickets";
    private static final String AUTO_SOURCE_ACCOMMODATION = "accommodation";
    private static final String AUTO_SOURCE_FOOD = "food";
    private static final String AUTO_SOURCE_ACTIVITIES_PREFIX = "activity_";
    
    // Fetch all expenses for a specific trip (user must be a participant)
    @Transactional(readOnly = true)
    public List<ExpenseDto> getExpenses(String tripId, String userId) {
        validateAccess(tripId, userId);
        return expenseRepository.findByTripIdOrderByCreatedAtDesc(tripId).stream()
                .map(mapper::toExpenseDto)
                .collect(Collectors.toList());
    }
    
    // Create a new expense and log the activity
    @Transactional
    public ExpenseDto createExpense(String tripId, CreateExpenseRequest request, String userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("Trip not found"));
        validateAccess(tripId, userId);
        
        User user = userRepository.findById(userId).orElseThrow();
        
        Expense expense = Expense.builder()
                .id(UUID.randomUUID().toString())
                .trip(trip)
                .amount(request.getAmount())
                .category(request.getCategory())
                .description(request.getDescription())
                .author(user)
                .isShared(request.getIsShared())
                .build();
        
        expense = expenseRepository.save(expense);
        
        activityLogService.log(trip, user, "add", "expense", "amount", 
                null, request.getAmount().toString());
        
        return mapper.toExpenseDto(expense);
    }
    
    // Update expense with new values and track what changed
    @Transactional
    public ExpenseDto updateExpense(String tripId, String expenseId, 
                                     UpdateExpenseRequest request, String userId) {
        validateAccess(tripId, userId);
        
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new NotFoundException("Expense not found"));
        
        if (!expense.getTrip().getId().equals(tripId)) {
            throw new NotFoundException("Expense not found");
        }
        
        User user = userRepository.findById(userId).orElseThrow();
        Trip trip = expense.getTrip();
        
        // Only log and update amount if it actually changed
        if (request.getAmount() != null) {
            if (!request.getAmount().equals(expense.getAmount())) {
                activityLogService.log(trip, user, "update", "expense", "amount",
                        expense.getAmount().toString(), request.getAmount().toString());
                expense.setAmount(request.getAmount());
            }
        }
        // Only log and update category if it actually changed
        if (request.getCategory() != null) {
            if (!request.getCategory().equals(expense.getCategory())) {
                activityLogService.log(trip, user, "update", "expense", "category",
                        expense.getCategory(), request.getCategory());
                expense.setCategory(request.getCategory());
            }
        }
        // Only log and update description if it actually changed
        if (request.getDescription() != null) {
            if (!request.getDescription().equals(expense.getDescription())) {
                activityLogService.log(trip, user, "update", "expense", "description",
                        expense.getDescription(), request.getDescription());
                expense.setDescription(request.getDescription());
            }
        }
        
        expense = expenseRepository.save(expense);
        return mapper.toExpenseDto(expense);
    }
    
    // Remove expense and clear any linked data from source container
    @Transactional
    public void deleteExpense(String tripId, String expenseId, String userId) {
        validateAccess(tripId, userId);
        
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new NotFoundException("Expense not found"));
        
        if (!expense.getTrip().getId().equals(tripId)) {
            throw new NotFoundException("Expense not found");
        }
        
        User user = userRepository.findById(userId).orElseThrow();
        Trip trip = expense.getTrip();
        
        // If this is an auto-generated expense, clear the corresponding container data
        if (Boolean.TRUE.equals(expense.getIsAutoGenerated()) && expense.getAutoSource() != null) {
            clearContainerData(trip, expense.getAutoSource());
        }
        
        activityLogService.log(trip, user, "delete", "expense");
        
        expenseRepository.delete(expense);
    }
    
    // Clear the container data associated with an auto-generated expense to keep things consistent
    private void clearContainerData(Trip trip, String autoSource) {
        switch (autoSource) {
            case AUTO_SOURCE_TICKETS:
                trip.setTicketPrice(null);
                tripRepository.save(trip);
                break;
            case AUTO_SOURCE_ACCOMMODATION:
                if (trip.getAccommodation() != null) {
                    trip.getAccommodation().setPricePerNight(null);
                    accommodationRepository.save(trip.getAccommodation());
                }
                break;
            case AUTO_SOURCE_FOOD:
                trip.setEstimatedDailyFoodBudgetPerPerson(null);
                tripRepository.save(trip);
                break;
            default:
                if (autoSource.startsWith(AUTO_SOURCE_ACTIVITIES_PREFIX)) {
                    String activityId = autoSource.substring(AUTO_SOURCE_ACTIVITIES_PREFIX.length());
                    activityRepository.findById(activityId).ifPresent(activity -> {
                        activity.setEstimatedCost(null);
                        activityRepository.save(activity);
                    });
                }
                break;
        }
    }
    
    // Calculate budget summary including total costs and per-person costs
    @Transactional(readOnly = true)
    public BudgetSummaryDto getBudgetSummary(String tripId, String userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("Trip not found"));
        validateAccess(tripId, userId);
        
        // 1. Get all shared expenses
        List<Expense> sharedExpenses = expenseRepository.findSharedByTripId(tripId);
        List<String> participantIds = participantRepository.findByTripId(tripId).stream()
                .map(p -> p.getUser().getId())
                .collect(Collectors.toList());
        
        // 2. Get number of participants
        int participantCount = participantIds.size();
        
        // 3. Group expenses by category
        Map<String, BigDecimal> expensesByCategory = new HashMap<>();
        expensesByCategory.put("transport", BigDecimal.ZERO);
        expensesByCategory.put("accommodation", BigDecimal.ZERO);
        expensesByCategory.put("food", BigDecimal.ZERO);
        expensesByCategory.put("activities", BigDecimal.ZERO);
        expensesByCategory.put("other", BigDecimal.ZERO);
        
        // 4. Calculate total cost
        BigDecimal totalSharedCost = BigDecimal.ZERO;
        
        for (Expense expense : sharedExpenses) {
            String category = expense.getCategory();
            BigDecimal current = expensesByCategory.getOrDefault(category, BigDecimal.ZERO);
            expensesByCategory.put(category, current.add(expense.getAmount()));
            totalSharedCost = totalSharedCost.add(expense.getAmount());
        }
        
        // 5. Calculate cost per participant (divided equally)
        BigDecimal costPerParticipant = participantCount > 0 
                ? totalSharedCost.divide(BigDecimal.valueOf(participantCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        
        // 6. Calculate balance for each user (on this stage balance = cost per participant, since i dont track who paid what, but i could extend this in the future)
        Map<String, BigDecimal> balancePerUser = new HashMap<>();
        for (String participantId : participantIds) {
            balancePerUser.put(participantId, costPerParticipant);
        }
        
        return BudgetSummaryDto.builder()
                .totalSharedCost(totalSharedCost)
                .costPerParticipant(costPerParticipant)
                .balancePerUser(balancePerUser)
                .expensesByCategory(expensesByCategory)
                .build();
    }
    
    // Check if user is a trip participant before allowing access
    private void validateAccess(String tripId, String userId) {
        if (!tripRepository.isUserParticipant(tripId, userId)) {
            throw new ForbiddenException("Access denied");
        }
    }
}


