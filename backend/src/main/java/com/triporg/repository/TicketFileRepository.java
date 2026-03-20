package com.triporg.repository;

import com.triporg.entity.TicketFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketFileRepository extends JpaRepository<TicketFile, String> {
    List<TicketFile> findByTripIdOrderByUploadedAtAsc(String tripId);
}


