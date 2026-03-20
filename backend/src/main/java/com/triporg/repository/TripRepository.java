package com.triporg.repository;

import com.triporg.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, String> {
    
    @Query("SELECT DISTINCT t FROM Trip t " +
           "JOIN t.participants p " +
           "WHERE p.user.id = :userId " +
           "ORDER BY t.startDate DESC")
    List<Trip> findByParticipantUserId(@Param("userId") String userId);
    
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END " +
           "FROM TripParticipant p " +
           "WHERE p.trip.id = :tripId AND p.user.id = :userId")
    boolean isUserParticipant(@Param("tripId") String tripId, @Param("userId") String userId);
}


