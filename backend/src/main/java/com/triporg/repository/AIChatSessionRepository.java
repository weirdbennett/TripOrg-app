package com.triporg.repository;

import com.triporg.entity.AIChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AIChatSessionRepository extends JpaRepository<AIChatSession, String> {
    Optional<AIChatSession> findByTripId(String tripId);
}


