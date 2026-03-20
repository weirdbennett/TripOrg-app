package com.triporg.repository;

import com.triporg.entity.TripParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripParticipantRepository extends JpaRepository<TripParticipant, String> {
    List<TripParticipant> findByTripId(String tripId);
    Optional<TripParticipant> findByTripIdAndUserId(String tripId, String userId);
    boolean existsByTripIdAndUserId(String tripId, String userId);
    void deleteByTripIdAndUserId(String tripId, String userId);
}


