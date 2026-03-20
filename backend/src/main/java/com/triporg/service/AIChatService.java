package com.triporg.service;

import com.triporg.dto.AIChatMessageDto;
import com.triporg.dto.AIChatSessionDto;
import com.triporg.dto.request.AIResponseRequest;
import com.triporg.dto.request.SendMessageRequest;
import com.triporg.entity.AIChatMessage;
import com.triporg.entity.AIChatSession;
import com.triporg.entity.Trip;
import com.triporg.entity.User;
import com.triporg.exception.BadRequestException;
import com.triporg.exception.ForbiddenException;
import com.triporg.exception.NotFoundException;
import com.triporg.mapper.EntityMapper;
import com.triporg.repository.AIChatMessageRepository;
import com.triporg.repository.AIChatSessionRepository;
import com.triporg.repository.TripRepository;
import com.triporg.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIChatService {
    
    private final AIChatSessionRepository sessionRepository;
    private final AIChatMessageRepository messageRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;
    private final RestTemplate restTemplate;
    
    @Value("${app.n8n.webhook-url:http://triporg-n8n:5678/webhook/triporg-ai}")
    private String n8nWebhookUrl;
    
    @Value("${app.n8n.enabled:true}")
    private boolean n8nEnabled;
    
    @Transactional(readOnly = true)
    public AIChatSessionDto getSession(String tripId, String userId) {
        validateAccess(tripId, userId);
        
        AIChatSession session = sessionRepository.findByTripId(tripId)
                .orElse(null);
        
        if (session == null) {
            // Create empty session DTO
            return AIChatSessionDto.builder()
                    .tripId(tripId)
                    .isLocked(false)
                    .messages(List.of())
                    .build();
        }
        
        return mapper.toAIChatSessionDto(session);
    }
    
    @Transactional(readOnly = true)
    public List<AIChatMessageDto> getMessages(String tripId, String userId) {
        validateAccess(tripId, userId);
        
        return messageRepository.findByTripIdOrderByCreatedAtAsc(tripId).stream()
                .map(mapper::toAIChatMessageDto)
                .collect(Collectors.toList());
    }
    
    // Sends a user message and locks the session
    // return SendMessageResult containing the message DTO and sessionId for webhook call

    @Transactional
    public SendMessageResult sendMessage(String tripId, SendMessageRequest request, String userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("Trip not found"));
        validateAccess(tripId, userId);
        
        AIChatSession session = sessionRepository.findByTripId(tripId)
                .orElseGet(() -> {
                    AIChatSession newSession = AIChatSession.builder()
                            .id(UUID.randomUUID().toString())
                            .trip(trip)
                            .isLocked(false)
                            .build();
                    return sessionRepository.save(newSession);
                });
        
        if (session.getIsLocked()) {
            throw new BadRequestException("AI chat is currently locked");
        }
        
        // Lock the session
        session.setIsLocked(true);
        sessionRepository.save(session);
        
        // Create user message
        AIChatMessage userMessage = AIChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .session(session)
                .trip(trip)
                .role("user")
                .content(request.getContent())
                .build();
        
        userMessage = messageRepository.save(userMessage);
        
        // Return result with sessionId, webhook will be called by controller after transaction commits
        return new SendMessageResult(
                mapper.toAIChatMessageDto(userMessage),
                session.getId(),
                tripId,
                request.getContent()
        );
    }
    

    // Result object for sendMessage containing data needed for webhook call
    @lombok.Value
    public static class SendMessageResult {
        AIChatMessageDto message;
        String sessionId;
        String tripId;
        String userMessageContent;
    }
    

    //Async method to call n8n webhook for AI response generation, if n8n is not available or disabled, falls back to mock response.
    @Async
    public void callN8nWebhook(String tripId, String sessionId, String userMessage, String authToken) {
        if (!n8nEnabled) {
            log.info("n8n integration disabled, using mock response");
            generateMockResponse(tripId, sessionId, userMessage);
            return;
        }
        
        try {
            log.info("Calling n8n webhook for tripId: {}, sessionId: {}", tripId, sessionId);
            
            // Build request payload
            Map<String, String> payload = new HashMap<>();
            payload.put("tripId", tripId);
            payload.put("sessionId", sessionId);
            payload.put("userMessage", userMessage);
            payload.put("authToken", authToken);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);
            
            // Call n8n webhook, we dont care about the response here, n8n will call back to receiveAIResponse when done
            restTemplate.postForEntity(n8nWebhookUrl, request, String.class);
            
            log.info("Successfully called n8n webhook for tripId: {}", tripId);
            
        } catch (Exception e) {
            log.error("Failed to call n8n webhook, falling back to mock response: {}", e.getMessage());
            generateMockResponse(tripId, sessionId, userMessage);
        }
    }
    

    // Fallback method for when n8n is unavailable
    @Transactional
    public void generateMockResponse(String tripId, String sessionId, String userMessage) {
        try {
            Thread.sleep(1000);
            
            Trip trip = tripRepository.findById(tripId).orElse(null);
            AIChatSession session = sessionRepository.findById(sessionId).orElse(null);
            
            if (trip != null && session != null) {
                String aiContent = "I apologize, but the AI service is currently unavailable. " +
                        "Please try again later. Your question was: \"" + userMessage + "\"";
                
                AIChatMessage aiMessage = AIChatMessage.builder()
                        .id(UUID.randomUUID().toString())
                        .session(session)
                        .trip(trip)
                        .role("assistant")
                        .content(aiContent)
                        .build();
                
                messageRepository.save(aiMessage);
                
                // Unlock session
                session.setIsLocked(false);
                sessionRepository.saveAndFlush(session);
                
                log.info("Generated mock response for tripId: {}, session unlocked", tripId);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    

    // Receives AI response from n8n webhook callback, this endpoint is called by n8n after generating the AI response
    // We look up the session by tripId instead of sessionId to avoid race conditions where n8n calls back before the session creation transaction commits
    @Transactional
    public AIChatMessageDto receiveAIResponse(String tripId, AIResponseRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("Trip not found"));
        
        // The sessionId in the request is used for logging/debugging only
        AIChatSession session = sessionRepository.findByTripId(tripId)
                .orElseThrow(() -> new NotFoundException("AI chat session not found for trip: " + tripId));
        
        // Create AI message
        AIChatMessage aiMessage = AIChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .session(session)
                .trip(trip)
                .role("assistant")
                .content(request.getContent())
                .build();
        
        aiMessage = messageRepository.save(aiMessage);
        
        // Unlock the session
        session.setIsLocked(false);
        sessionRepository.saveAndFlush(session);
        
        log.info("Received and saved AI response for tripId: {}, sessionId: {}, session unlocked: {}", 
                tripId, request.getSessionId(), !session.getIsLocked());
        
        return mapper.toAIChatMessageDto(aiMessage);
    }
    
    @Transactional
    public AIChatSessionDto lockSession(String tripId, boolean lock, String userId) {
        validateAccess(tripId, userId);
        
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("Trip not found"));
        
        AIChatSession session = sessionRepository.findByTripId(tripId)
                .orElseGet(() -> {
                    AIChatSession newSession = AIChatSession.builder()
                            .id(UUID.randomUUID().toString())
                            .trip(trip)
                            .isLocked(false)
                            .build();
                    return sessionRepository.save(newSession);
                });
        
        session.setIsLocked(lock);
        session = sessionRepository.save(session);
        
        return mapper.toAIChatSessionDto(session);
    }
    
    private void validateAccess(String tripId, String userId) {
        if (!tripRepository.isUserParticipant(tripId, userId)) {
            throw new ForbiddenException("Access denied");
        }
    }
}
