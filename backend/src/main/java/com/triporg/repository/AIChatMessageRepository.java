package com.triporg.repository;

import com.triporg.entity.AIChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIChatMessageRepository extends JpaRepository<AIChatMessage, String> {
    List<AIChatMessage> findByTripIdOrderByCreatedAtAsc(String tripId);
    List<AIChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);
}


