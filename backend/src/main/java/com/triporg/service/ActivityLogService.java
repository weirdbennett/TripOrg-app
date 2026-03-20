package com.triporg.service;

import com.triporg.entity.ActivityLog;
import com.triporg.entity.Trip;
import com.triporg.entity.User;
import com.triporg.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityLogService {
    
    private final ActivityLogRepository activityLogRepository;
    
    // Simple overload that just logs basic action without field changes (like creating a trip or adding a member)
    @Transactional
    public void log(Trip trip, User user, String actionType, String entityType) {
        log(trip, user, actionType, entityType, null, null, null);
    }
    
    // Record an activity log entry with details on what changed (useful for tracking who did what and when)
    @Transactional
    public void log(Trip trip, User user, String actionType, String entityType, 
                    String fieldName, String oldValue, String newValue) {
        // Create activity log with all the details about what changed
        ActivityLog log = ActivityLog.builder()
                .id(UUID.randomUUID().toString())
                .trip(trip)
                .user(user)
                .userName(user.getDisplayName())
                .actionType(actionType)
                .entityType(entityType)
                .fieldName(fieldName)
                .oldValue(truncate(oldValue, 500))
                .newValue(truncate(newValue, 500))
                .build();
        
        // Save the log to database
        activityLogRepository.save(log);
    }
    
    // Make sure text doesnt exceed database limits by cutting it off with dots
    private String truncate(String value, int maxLength) {
        if (value == null) return null;
        if (value.length() <= maxLength) return value;
        return value.substring(0, maxLength - 3) + "...";
    }
}


