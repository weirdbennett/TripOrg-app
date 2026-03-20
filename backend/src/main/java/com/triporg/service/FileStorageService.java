package com.triporg.service;

import com.triporg.config.FileStorageConfig;
import com.triporg.dto.TicketFileDto;
import com.triporg.entity.TicketFile;
import com.triporg.entity.Trip;
import com.triporg.entity.User;
import com.triporg.exception.BadRequestException;
import com.triporg.exception.ForbiddenException;
import com.triporg.exception.NotFoundException;
import com.triporg.mapper.EntityMapper;
import com.triporg.repository.TicketFileRepository;
import com.triporg.repository.TripRepository;
import com.triporg.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {
    
    private final TicketFileRepository ticketFileRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;
    private final FileStorageConfig fileStorageConfig;
    private final EntityMapper mapper;
    
    // Save file to disk and create database record for tracking
    @Transactional
    public TicketFileDto uploadFile(String tripId, MultipartFile file, String userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("Trip not found"));
        validateAccess(tripId, userId);
        
        User user = userRepository.findById(userId).orElseThrow();
        
        // Check if file is not empty
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        
        // Only allow PDF files (for security reasons)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new BadRequestException("Only PDF files are allowed");
        }
        
        try {
            // Generate unique file ID and create storage path
            String fileId = UUID.randomUUID().toString();
            String originalFileName = file.getOriginalFilename();
            String storedFileName = fileId + "_" + originalFileName;
            
            Path uploadPath = Paths.get(fileStorageConfig.getUploadDir());
            Path tripPath = uploadPath.resolve(tripId);
            
            // Create directory if it doesn't exist
            if (!Files.exists(tripPath)) {
                Files.createDirectories(tripPath);
            }
            
            // Save file to disk
            Path filePath = tripPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Create database record to track file metadata
            TicketFile ticketFile = TicketFile.builder()
                    .id(fileId)
                    .trip(trip)
                    .fileName(originalFileName)
                    .fileSize(file.getSize())
                    .filePath(filePath.toString())
                    .uploadedBy(user)
                    .build();
            
            ticketFile = ticketFileRepository.save(ticketFile);
            
            // Log this activity so others can see the file was uploaded
            activityLogService.log(trip, user, "add", "trip", "ticketFile", null, originalFileName);
            
            return mapper.toTicketFileDto(ticketFile);
            
        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new BadRequestException("Failed to store file");
        }
    }
    
    // Remove file from disk and database
    @Transactional
    public void deleteFile(String tripId, String fileId, String userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("Trip not found"));
        validateAccess(tripId, userId);
        
        User user = userRepository.findById(userId).orElseThrow();
        
        TicketFile ticketFile = ticketFileRepository.findById(fileId)
                .orElseThrow(() -> new NotFoundException("File not found"));
        
        // Make sure file belongs to the correct trip
        if (!ticketFile.getTrip().getId().equals(tripId)) {
            throw new NotFoundException("File not found");
        }
        
        try {
            // Delete actual file from disk
            Path filePath = Paths.get(ticketFile.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("Failed to delete file from disk", e);
        }
        
        // Log the deletion activity
        activityLogService.log(trip, user, "delete", "trip", "ticketFile", 
                ticketFile.getFileName(), null);
        
        // Remove from database
        ticketFileRepository.delete(ticketFile);
    }
    
    // Retrieve file so user can download it
    public Resource loadFileAsResource(String tripId, String fileId, String userId) {
        validateAccess(tripId, userId);
        
        TicketFile ticketFile = ticketFileRepository.findById(fileId)
                .orElseThrow(() -> new NotFoundException("File not found"));
        
        // Make sure file belongs to the correct trip
        if (!ticketFile.getTrip().getId().equals(tripId)) {
            throw new NotFoundException("File not found");
        }
        
        try {
            // Load file from disk as resource for downloading
            Path filePath = Paths.get(ticketFile.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            // Check if file exists and is readable
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new NotFoundException("File not found");
            }
        } catch (MalformedURLException e) {
            throw new NotFoundException("File not found");
        }
    }
    
    // Check if user is a trip participant before allowing access
    private void validateAccess(String tripId, String userId) {
        if (!tripRepository.isUserParticipant(tripId, userId)) {
            throw new ForbiddenException("Access denied");
        }
    }
}


