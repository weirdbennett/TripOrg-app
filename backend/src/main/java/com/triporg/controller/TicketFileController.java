package com.triporg.controller;

import com.triporg.dto.TicketFileDto;
import com.triporg.security.CurrentUser;
import com.triporg.security.UserPrincipal;
import com.triporg.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/trips/{tripId}/tickets/files")
@RequiredArgsConstructor
public class TicketFileController {
    
    private final FileStorageService fileStorageService;
    
    @PostMapping
    public ResponseEntity<Map<String, TicketFileDto>> uploadFile(
            @PathVariable String tripId,
            @RequestParam("file") MultipartFile file,
            @CurrentUser UserPrincipal principal) {
        TicketFileDto ticketFile = fileStorageService.uploadFile(tripId, file, principal.getId());
        return ResponseEntity.ok(Map.of("ticketFile", ticketFile));
    }
    
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Map<String, Boolean>> deleteFile(
            @PathVariable String tripId,
            @PathVariable String fileId,
            @CurrentUser UserPrincipal principal) {
        fileStorageService.deleteFile(tripId, fileId, principal.getId());
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String tripId,
            @PathVariable String fileId,
            @CurrentUser UserPrincipal principal) {
        Resource resource = fileStorageService.loadFileAsResource(tripId, fileId, principal.getId());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}


