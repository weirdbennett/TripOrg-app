package com.triporg.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {
    
    @Id
    @Column(length = 36)
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, length = 100)
    private String country;
    
    @Column(nullable = false, length = 100)
    private String city;
    
    @Column(name = "specific_place")
    private String specificPlace;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @Column(name = "base_currency", nullable = false, length = 10)
    private String baseCurrency;
    
    @Column(name = "transport_type", nullable = false, length = 20)
    private String transportType;
    
    @Column(name = "tickets_status", nullable = false, length = 20)
    private String ticketsStatus;
    
    @Column(name = "ticket_price", precision = 10, scale = 2)
    private BigDecimal ticketPrice;
    
    @Column(name = "food_strategy", nullable = false, length = 20)
    private String foodStrategy;
    
    @Column(name = "estimated_daily_food_budget_per_person", precision = 10, scale = 2)
    private BigDecimal estimatedDailyFoodBudgetPerPerson;
    
    @Column(name = "local_transport_notes", columnDefinition = "TEXT")
    private String localTransportNotes;
    
    @Column(name = "shared_notes", columnDefinition = "TEXT")
    private String sharedNotes;
    
    @Column(name = "important_deadlines", columnDefinition = "TEXT")
    private String importantDeadlines;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    
    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
    
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<TripParticipant> participants = new HashSet<>();
    
    @OneToOne(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private Accommodation accommodation;
    
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<Activity> activities = new ArrayList<>();
    
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DocumentChecklistItem> documentsChecklist = new ArrayList<>();
    
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("uploadedAt ASC")
    @Builder.Default
    private List<TicketFile> ticketFiles = new ArrayList<>();
    
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Expense> expenses = new ArrayList<>();
    
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<ActivityLog> activityLogs = new ArrayList<>();
    
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<ChatMessage> chatMessages = new ArrayList<>();
    
    @OneToOne(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private AIChatSession aiChatSession;
}

