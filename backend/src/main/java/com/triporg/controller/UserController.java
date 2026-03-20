package com.triporg.controller;

import com.triporg.dto.UserDto;
import com.triporg.dto.request.UpdateUserRequest;
import com.triporg.security.CurrentUser;
import com.triporg.security.UserPrincipal;
import com.triporg.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/search")
    public ResponseEntity<Map<String, List<UserDto>>> searchUsers(@RequestParam String q) {
        List<UserDto> users = userService.searchUsers(q);
        return ResponseEntity.ok(Map.of("users", users));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, UserDto>> getUser(@PathVariable String id) {
        UserDto user = userService.getUser(id);
        return ResponseEntity.ok(Map.of("user", user));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, UserDto>> updateUser(
            @PathVariable String id,
            @RequestBody UpdateUserRequest request,
            @CurrentUser UserPrincipal principal) {
        // Users can only update their own profile
        if (!id.equals(principal.getId())) {
            return ResponseEntity.status(403).build();
        }
        UserDto user = userService.updateUser(id, request);
        return ResponseEntity.ok(Map.of("user", user));
    }
    
    @PostMapping("/{id}/avatar")
    public ResponseEntity<Map<String, UserDto>> uploadAvatar(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @CurrentUser UserPrincipal principal) {
        // Users can only update their own avatar
        if (!id.equals(principal.getId())) {
            return ResponseEntity.status(403).build();
        }
        UserDto user = userService.uploadAvatar(id, file);
        return ResponseEntity.ok(Map.of("user", user));
    }
    
    @GetMapping("/{id}/avatar")
    public ResponseEntity<Resource> getAvatar(@PathVariable String id) {
        Resource resource = userService.getAvatarResource(id);
        if (resource == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }
    
    @DeleteMapping("/{id}/avatar")
    public ResponseEntity<Map<String, UserDto>> deleteAvatar(
            @PathVariable String id,
            @CurrentUser UserPrincipal principal) {
        // Users can only delete their own avatar
        if (!id.equals(principal.getId())) {
            return ResponseEntity.status(403).build();
        }
        UserDto user = userService.deleteAvatar(id);
        return ResponseEntity.ok(Map.of("user", user));
    }
}

