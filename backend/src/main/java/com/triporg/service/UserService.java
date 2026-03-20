package com.triporg.service;

import com.triporg.config.FileStorageConfig;
import com.triporg.dto.UserDto;
import com.triporg.dto.request.UpdateUserRequest;
import com.triporg.entity.User;
import com.triporg.exception.BadRequestException;
import com.triporg.exception.NotFoundException;
import com.triporg.mapper.EntityMapper;
import com.triporg.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final FileStorageConfig fileStorageConfig;
    private final EntityMapper mapper;
    
    // Only allow common image formats for avatars (security reasons)
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    
    // Fetch user details by ID
    @Transactional(readOnly = true)
    public UserDto getUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return mapper.toUserDto(user);
    }
    
    // Search for users by name or email (for adding them to trips)
    @Transactional(readOnly = true)
    public List<UserDto> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return userRepository.searchUsers(query.trim())
                .stream()
                .map(mapper::toUserDto)
                .collect(Collectors.toList());
    }
    
    // Update user profile information
    @Transactional
    public UserDto updateUser(String userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        // Only update fields if they were provided in the request
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        if (request.getPreferredCurrency() != null) {
            user.setPreferredCurrency(request.getPreferredCurrency());
        }
        if (request.getThemePreference() != null) {
            user.setThemePreference(request.getThemePreference());
        }
        
        user = userRepository.save(user);
        return mapper.toUserDto(user);
    }
    
    // Save user avatar to disk and update database with avatar path
    @Transactional
    public UserDto uploadAvatar(String userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        // Validate file exists and is not empty
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        
        // Only allow image file types
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Only image files (JPEG, PNG, GIF, WebP) are allowed");
        }
        
        // Limit file size to 5MB to prevent storage abuse
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("File size must be less than 5MB");
        }
        
        try {
            // Delete old avatar if user already has one
            if (user.getAvatar() != null && user.getAvatar().startsWith("/api/v1/users/")) {
                deleteAvatarFile(userId);
            }
            
            // Generate unique filename for the avatar
            String fileId = UUID.randomUUID().toString();
            String extension = getExtension(file.getOriginalFilename());
            String storedFileName = fileId + extension;
            
            Path uploadPath = Paths.get(fileStorageConfig.getUploadDir());
            Path avatarsPath = uploadPath.resolve("avatars");
            
            // Create avatars directory if it doesn't exist
            if (!Files.exists(avatarsPath)) {
                Files.createDirectories(avatarsPath);
            }
            
            // Save file to disk
            Path filePath = avatarsPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Store the API path so we can retrieve it later
            String avatarUrl = "/api/v1/users/" + userId + "/avatar?v=" + fileId;
            user.setAvatar(avatarUrl);
            user = userRepository.save(user);
            
            log.info("Avatar uploaded for user {}: {}", userId, storedFileName);
            
            return mapper.toUserDto(user);
            
        } catch (IOException e) {
            log.error("Failed to store avatar file", e);
            throw new BadRequestException("Failed to store avatar file");
        }
    }
    
    // Load avatar file from disk so user can download/view it
    public Resource getAvatarResource(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        // Return null if user doesn't have an avatar stored
        if (user.getAvatar() == null || !user.getAvatar().startsWith("/api/v1/users/")) {
            return null;
        }
        
        try {
            Path avatarsPath = Paths.get(fileStorageConfig.getUploadDir()).resolve("avatars");
            
            // Find the avatar file for this user
            if (Files.exists(avatarsPath)) {
                var files = Files.list(avatarsPath)
                        .filter(path -> {
                            String name = path.getFileName().toString();
                            return user.getAvatar().contains(name.substring(0, name.lastIndexOf('.')));
                        })
                        .findFirst();
                
                if (files.isPresent()) {
                    Resource resource = new UrlResource(files.get().toUri());
                    if (resource.exists() && resource.isReadable()) {
                        return resource;
                    }
                }
            }
            return null;
        } catch (Exception e) {
            log.error("Failed to load avatar", e);
            return null;
        }
    }
    
    // Remove user's avatar from disk and database
    @Transactional
    public UserDto deleteAvatar(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        // Delete avatar file from disk
        deleteAvatarFile(userId);
        
        // Clear avatar path from user record
        user.setAvatar(null);
        user = userRepository.save(user);
        
        return mapper.toUserDto(user);
    }
    
    // Helper method to delete avatar file from disk
    private void deleteAvatarFile(String userId) {
        try {
            Path avatarsPath = Paths.get(fileStorageConfig.getUploadDir()).resolve("avatars");
            if (Files.exists(avatarsPath)) {
                // Find and delete all avatar files for this user
                Files.list(avatarsPath)
                        .filter(path -> path.getFileName().toString().contains(userId))
                        .forEach(path -> {
                            try {
                                Files.deleteIfExists(path);
                            } catch (IOException e) {
                                log.error("Failed to delete avatar file", e);
                            }
                        });
            }
        } catch (IOException e) {
            log.error("Failed to scan avatar directory", e);
        }
    }
    
    // Extract file extension from filename (default to .jpg if not found)
    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex > 0 ? filename.substring(dotIndex) : ".jpg";
    }
}

