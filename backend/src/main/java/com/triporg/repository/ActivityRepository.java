package com.triporg.repository;

import com.triporg.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, String> {
    List<Activity> findByTripIdOrderByCreatedAtAsc(String tripId);
    void deleteByTripId(String tripId);
}