package com.triporg.controller;

import com.triporg.dto.AIChatMessageDto;
import com.triporg.dto.AIChatSessionDto;
import com.triporg.dto.request.AIResponseRequest;
import com.triporg.dto.request.LockAIChatRequest;
import com.triporg.dto.request.SendMessageRequest;
import com.triporg.security.CurrentUser;
import com.triporg.security.UserPrincipal;
import com.triporg.service.AIChatService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trips/{tripId}/ai-chat")
@RequiredArgsConstructor
@Slf4j
public class AIChatController {
    
    private final AIChatService aiChatService;
    
    @GetMapping("/session")
    public ResponseEntity<Map<String, AIChatSessionDto>> getSession(
            @PathVariable String tripId,
            @CurrentUser UserPrincipal principal) {
        AIChatSessionDto session = aiChatService.getSession(tripId, principal.getId());
        return ResponseEntity.ok(Map.of("session", session));
    }
    
    @GetMapping("/messages")
    public ResponseEntity<Map<String, List<AIChatMessageDto>>> getMessages(
            @PathVariable String tripId,
            @CurrentUser UserPrincipal principal) {
        List<AIChatMessageDto> messages = aiChatService.getMessages(tripId, principal.getId());
        return ResponseEntity.ok(Map.of("messages", messages));
    }
    
    @PostMapping("/messages")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @PathVariable String tripId,
            @Valid @RequestBody SendMessageRequest request,
            @CurrentUser UserPrincipal principal,
            HttpServletRequest httpRequest) {
        
        // Extract auth token from request header to pass to n8n
        String authHeader = httpRequest.getHeader("Authorization");
        String authToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            authToken = authHeader.substring(7);
        }
        
        // Save message and lock session (transaction commits when method returns)
        AIChatService.SendMessageResult result = aiChatService.sendMessage(tripId, request, principal.getId());
        
        // Call n8n webhook AFTER transaction commits - session is now visible to other transactions
        aiChatService.callN8nWebhook(result.getTripId(), result.getSessionId(), result.getUserMessageContent(), authToken);
        
        // Return immediately - AI response will come via callback to /response endpoint
        AIChatSessionDto session = aiChatService.getSession(tripId, principal.getId());
        return ResponseEntity.ok(Map.of("message", result.getMessage(), "session", session));
    }
    
    @PostMapping("/lock")
    public ResponseEntity<Map<String, AIChatSessionDto>> lockChat(
            @PathVariable String tripId,
            @Valid @RequestBody LockAIChatRequest request,
            @CurrentUser UserPrincipal principal) {
        AIChatSessionDto session = aiChatService.lockSession(tripId, request.getLock(), principal.getId());
        return ResponseEntity.ok(Map.of("session", session));
    }
    
    // Endpoint for n8n to send back AI-generated responses
    // This endpoint is called by the n8n workflow after processing the AI request
    // This endpoint uses Bearer token authentication
    // The auth token is passed through from the original user request

    @PostMapping("/response")
    public ResponseEntity<Map<String, Object>> receiveAIResponse(
            @PathVariable String tripId,
            @Valid @RequestBody AIResponseRequest request) {
        
        log.info("Received AI response callback for tripId: {}, sessionId: {}", tripId, request.getSessionId());
        
        AIChatMessageDto message = aiChatService.receiveAIResponse(tripId, request);
        
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", message
        ));
    }
}
