package com.triporg.repository;

import com.triporg.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, String> {
    List<ActivityLog> findByTripIdOrderByCreatedAtDesc(String tripId);
    Page<ActivityLog> findByTripId(String tripId, Pageable pageable);
    long countByTripId(String tripId);
}


