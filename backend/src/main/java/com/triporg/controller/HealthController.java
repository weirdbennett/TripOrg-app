package com.triporg.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {
    
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "service", "TripOrg Backend",
            "version", "1.0.0",
            "timestamp", Instant.now().toString()
        ));
    }
    
    @GetMapping("/api/v1")
    public ResponseEntity<Map<String, Object>> apiRoot() {
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "service", "TripOrg API",
            "version", "v1",
            "timestamp", Instant.now().toString()
        ));
    }
}


