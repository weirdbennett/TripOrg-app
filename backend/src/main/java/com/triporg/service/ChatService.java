package com.triporg.service;

import com.triporg.dto.ActivityLogEntryDto;
import com.triporg.dto.ChatMessageDto;
import com.triporg.dto.request.SendMessageRequest;
import com.triporg.entity.ActivityLog;
import com.triporg.entity.ChatMessage;
import com.triporg.entity.Trip;
import com.triporg.entity.User;
import com.triporg.exception.ForbiddenException;
import com.triporg.exception.NotFoundException;
import com.triporg.mapper.EntityMapper;
import com.triporg.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    
    private final ChatMessageRepository chatMessageRepository;
    private final ActivityLogRepository activityLogRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;
    private final EntityMapper mapper;
    
    // Fetch all chat messages for a specific trip, check if user has access first
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getMessages(String tripId, String userId, int limit, int offset) {
        validateAccess(tripId, userId);
        
        return chatMessageRepository.findByTripIdOrderByCreatedAtAsc(tripId).stream()
                .map(mapper::toChatMessageDto)
                .collect(Collectors.toList());
    }
    
    // Count total messages in a trip
    @Transactional(readOnly = true)
    public long getMessageCount(String tripId, String userId) {
        validateAccess(tripId, userId);
        return chatMessageRepository.countByTripId(tripId);
    }
    
    // Create and save a new message, then log the activity
    @Transactional
    public ChatMessageDto sendMessage(String tripId, SendMessageRequest request, String userId) {
        // Get the trip or throw error if it doesnt exist
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("Trip not found"));
        // Make sure user is allowed to chat in this trip
        validateAccess(tripId, userId);
        
        // Get the user who's sending the message
        User user = userRepository.findById(userId).orElseThrow();
        
        // Build the message object with all needed info
        ChatMessage message = ChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .trip(trip)
                .user(user)
                .userName(user.getDisplayName())
                .userAvatar(user.getAvatar())
                .content(request.getContent())
                .build();
        
        // Save message to database
        message = chatMessageRepository.save(message);
        
        // Log this action so other users can see who posted what
        activityLogService.log(trip, user, "add", "message");
        
        return mapper.toChatMessageDto(message);
    }
    
    // Get activity log with pagination (sorting by newest first)
    @Transactional(readOnly = true)
    public List<ActivityLogEntryDto> getActivityLog(String tripId, String userId, int limit, int offset) {
        validateAccess(tripId, userId);
        
        // Calculate page number and limit, avoiding division by zero
        PageRequest pageRequest = PageRequest.of(offset / Math.max(limit, 1), 
                Math.max(limit, 1), 
                Sort.by(Sort.Direction.DESC, "createdAt"));
        
        return activityLogRepository.findByTripId(tripId, pageRequest).stream()
                .map(mapper::toActivityLogEntryDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public long getActivityLogCount(String tripId, String userId) {
        validateAccess(tripId, userId);
        return activityLogRepository.countByTripId(tripId);
    }
    
    // Check if user is actually part of the trip before allowing access
    private void validateAccess(String tripId, String userId) {
        if (!tripRepository.isUserParticipant(tripId, userId)) {
            throw new ForbiddenException("Access denied");
        }
    }
}


