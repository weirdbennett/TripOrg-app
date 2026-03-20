package com.triporg.repository;

import com.triporg.entity.Accommodation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccommodationRepository extends JpaRepository<Accommodation, String> {
    Optional<Accommodation> findByTripId(String tripId);
    void deleteByTripId(String tripId);
}


