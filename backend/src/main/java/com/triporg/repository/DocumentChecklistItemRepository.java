package com.triporg.repository;

import com.triporg.entity.DocumentChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChecklistItemRepository extends JpaRepository<DocumentChecklistItem, String> {
    List<DocumentChecklistItem> findByTripIdOrderByCreatedAtAsc(String tripId);
    void deleteByTripId(String tripId);
}


