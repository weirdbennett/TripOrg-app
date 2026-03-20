package com.triporg.controller;

import com.triporg.dto.TripDto;
import com.triporg.dto.UserDto;
import com.triporg.dto.request.AddParticipantRequest;
import com.triporg.dto.request.CreateTripRequest;
import com.triporg.dto.request.UpdateTripRequest;
import com.triporg.security.CurrentUser;
import com.triporg.security.UserPrincipal;
import com.triporg.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@Slf4j
public class TripController {
    
    private final TripService tripService;
    
    @GetMapping
    public ResponseEntity<Map<String, List<TripDto>>> getTrips(@CurrentUser UserPrincipal principal) {
        List<TripDto> trips = tripService.getTripsForUser(principal.getId());
        return ResponseEntity.ok(Map.of("trips", trips));
    }
    
    @PostMapping
    public ResponseEntity<Map<String, TripDto>> createTrip(
            @Valid @RequestBody CreateTripRequest request,
            @CurrentUser UserPrincipal principal) {
        TripDto trip = tripService.createTrip(request, principal.getId());
        return ResponseEntity.ok(Map.of("trip", trip));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, TripDto>> getTrip(
            @PathVariable String id,
            @CurrentUser UserPrincipal principal) {
        TripDto trip = tripService.getTrip(id, principal.getId());
        return ResponseEntity.ok(Map.of("trip", trip));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, TripDto>> updateTrip(
            @PathVariable String id,
            @RequestBody UpdateTripRequest request,
            @CurrentUser UserPrincipal principal) {
        TripDto trip = tripService.updateTrip(id, request, principal.getId());
        return ResponseEntity.ok(Map.of("trip", trip));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteTrip(
            @PathVariable String id,
            @CurrentUser UserPrincipal principal) {
        tripService.deleteTrip(id, principal.getId());
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    @GetMapping("/{id}/participants")
    public ResponseEntity<Map<String, List<UserDto>>> getParticipants(
            @PathVariable String id,
            @CurrentUser UserPrincipal principal) {
        List<UserDto> participants = tripService.getParticipants(id, principal.getId());
        return ResponseEntity.ok(Map.of("participants", participants));
    }
    
    @PostMapping("/{id}/participants")
    public ResponseEntity<Map<String, TripDto>> addParticipant(
            @PathVariable String id,
            @Valid @RequestBody AddParticipantRequest request,
            @CurrentUser UserPrincipal principal) {
        TripDto trip = tripService.addParticipant(id, request.getUserId(), principal.getId());
        return ResponseEntity.ok(Map.of("trip", trip));
    }
    
    @DeleteMapping("/{id}/participants/{userId}")
    public ResponseEntity<Map<String, TripDto>> removeParticipant(
            @PathVariable String id,
            @PathVariable String userId,
            @CurrentUser UserPrincipal principal) {
        log.info("DELETE /trips/{}/participants/{} called by user {}", id, userId, principal.getId());
        TripDto trip = tripService.removeParticipant(id, userId, principal.getId());
        log.info("Participant removed successfully, returning trip with {} participants", trip.getParticipants().size());
        return ResponseEntity.ok(Map.of("trip", trip));
    }
}


