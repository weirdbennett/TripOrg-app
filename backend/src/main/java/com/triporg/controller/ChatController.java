package com.triporg.controller;

import com.triporg.dto.ActivityLogEntryDto;
import com.triporg.dto.ChatMessageDto;
import com.triporg.dto.request.SendMessageRequest;
import com.triporg.security.CurrentUser;
import com.triporg.security.UserPrincipal;
import com.triporg.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trips/{tripId}/chat")
@RequiredArgsConstructor
public class ChatController {
    
    private final ChatService chatService;
    
    @GetMapping("/messages")
    public ResponseEntity<Map<String, Object>> getMessages(
            @PathVariable String tripId,
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(defaultValue = "0") int offset,
            @CurrentUser UserPrincipal principal) {
        List<ChatMessageDto> messages = chatService.getMessages(tripId, principal.getId(), limit, offset);
        long total = chatService.getMessageCount(tripId, principal.getId());
        return ResponseEntity.ok(Map.of("messages", messages, "total", total));
    }
    
    @PostMapping("/messages")
    public ResponseEntity<Map<String, ChatMessageDto>> sendMessage(
            @PathVariable String tripId,
            @Valid @RequestBody SendMessageRequest request,
            @CurrentUser UserPrincipal principal) {
        ChatMessageDto message = chatService.sendMessage(tripId, request, principal.getId());
        return ResponseEntity.ok(Map.of("message", message));
    }
}

@RestController
@RequestMapping("/api/v1/trips/{tripId}/activity-log")
@RequiredArgsConstructor
class ActivityLogController {
    
    private final ChatService chatService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getActivityLog(
            @PathVariable String tripId,
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(defaultValue = "0") int offset,
            @CurrentUser UserPrincipal principal) {
        List<ActivityLogEntryDto> entries = chatService.getActivityLog(tripId, principal.getId(), limit, offset);
        long total = chatService.getActivityLogCount(tripId, principal.getId());
        return ResponseEntity.ok(Map.of("entries", entries, "total", total));
    }
}


