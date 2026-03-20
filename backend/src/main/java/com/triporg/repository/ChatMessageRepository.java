package com.triporg.repository;

import com.triporg.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    List<ChatMessage> findByTripIdOrderByCreatedAtAsc(String tripId);
    Page<ChatMessage> findByTripId(String tripId, Pageable pageable);
    long countByTripId(String tripId);
}


