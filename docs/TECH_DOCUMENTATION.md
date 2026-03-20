# TripOrg - Complete Technical Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Decisions](#3-technology-decisions)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Design](#6-database-design)
7. [Security Implementation](#7-security-implementation)
8. [AI Integration](#8-ai-integration)
9. [Docker Infrastructure](#9-docker-infrastructure)
10. [API Design](#10-api-design)
11. [Key Implementation Details](#11-key-implementation-details)

---

## 1. Project Overview

### 1.1 Purpose

TripOrg is a collaborative trip planning platform that enables groups of users to organize travel together. The application addresses the common challenge of coordinating trip logistics among multiple participants by providing a centralized platform for:

- Trip information management
- Expense tracking and cost splitting
- Real-time communication
- AI-powered travel assistance

### 1.2 Core Features

| Feature | Description |
|---------|-------------|
| Trip Management | CRUD operations for trips with detailed travel information |
| Participant System | Invite/remove participants with role-based access |
| Expense Tracking | Shared expense management with automatic cost calculation |
| Activity Log | Immutable audit trail of all modifications |
| Real-time Chat | Built-in messaging for trip participants |
| AI Assistant | LLM-powered travel planning assistant |
| Email Verification | Secure user registration flow |
| Theming | Dark/light mode with persistence |

### 1.3 Technical Scope

- **Type**: Full-stack web application
- **Architecture**: Client-server with RESTful API
- **Deployment**: Docker containerized microservices
- **Authentication**: JWT-based stateless authentication
- **Database**: Relational (PostgreSQL)

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              User Browser                                │
│                         (React SPA Application)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ HTTP/HTTPS
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Docker Network (triporg-network)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  Frontend   │  │   Backend   │  │  PostgreSQL │  │    Mailpit      │ │
│  │  (Vite)     │  │(Spring Boot)│  │   Database  │  │  (Email Test)   │ │
│  │  Port:3000  │  │  Port:8080  │  │  Port:5432  │  │  Port:8025      │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘ │
│         │                │                │                              │
│         │                │                │         ┌─────────────────┐ │
│         │                │                │         │       n8n       │ │
│         │                │                │         │  (AI Workflow)  │ │
│         │                │                │         │   Port:5678     │ │
│         └────────────────┴────────────────┴─────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Communication Flow

1. **User → Frontend**: Browser loads React SPA from port 3000
2. **Frontend → Backend**: REST API calls to port 8080
3. **Backend → Database**: JPA/Hibernate queries to PostgreSQL
4. **Backend → n8n**: Webhook calls for AI processing
5. **n8n → Backend**: Callback with AI response
6. **Backend → Mailpit**: SMTP for verification emails

### 2.3 Data Flow

```
User Action
    │
    ▼
React Component
    │
    ▼
API Adapter (apiAdapter.ts)
    │
    ▼
HTTP Request (api.ts)
    │
    ▼
Spring Controller
    │
    ▼
Service Layer (business logic)
    │
    ▼
Repository (JPA)
    │
    ▼
PostgreSQL
```

---

## 3. Technology Decisions

### 3.1 Frontend Technology Choices

| Technology | Reason |
|------------|--------|
| **React 18** | Industry standard, component-based architecture, large ecosystem |
| **TypeScript** | Type safety, better IDE support, reduced runtime errors |
| **Vite** | Fast development server, optimized production builds |
| **Tailwind CSS** | Utility-first styling, consistent design, rapid development |
| **React Router** | De-facto standard for React routing |
| **date-fns** | Lightweight, tree-shakeable date manipulation |
| **Recharts** | React-native charting library for expense visualizations |

### 3.2 Backend Technology Choices

| Technology | Reason |
|------------|--------|
| **Java 17** | LTS version, enterprise standard |
| **Spring Boot 3.2** | Production-ready framework, comprehensive ecosystem |
| **Spring Security** | Robust security framework with JWT support |
| **Spring Data JPA** | Simplified data access with Hibernate ORM |
| **PostgreSQL** | Reliable RDBMS, excellent JSON support, ACID compliance |
| **Flyway** | Version-controlled database migrations |
| **Lombok** | Reduced boilerplate (getters, setters, builders) |

### 3.3 Infrastructure Choices

| Technology | Reason |
|------------|--------|
| **Docker** | Consistent environments, easy deployment |
| **Docker Compose** | Multi-container orchestration |
| **n8n** | Visual workflow automation for AI integration |
| **Mailpit** | Local email testing without external SMTP |

---

## 4. Frontend Architecture

### 4.1 Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── layout/          # App-level layout components
│   │   └── Header.tsx   # Navigation header with auth state
│   ├── trip/            # Trip-specific components
│   │   ├── ActivityLog.tsx      # Audit trail display
│   │   ├── AIChatPanel.tsx      # AI assistant interface
│   │   ├── BudgetOverview.tsx   # Expense visualization
│   │   ├── ChatPanel.tsx        # Participant chat
│   │   ├── EditableAccommodation.tsx
│   │   ├── EditableActivities.tsx
│   │   ├── EditableList.tsx
│   │   ├── EditableText.tsx
│   │   ├── EditableTickets.tsx
│   │   ├── ExpensesList.tsx
│   │   ├── ParticipantInvite.tsx
│   │   ├── TripHeader.tsx
│   │   └── TripSection.tsx
│   └── ui/              # Generic UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       └── Textarea.tsx
├── context/             # React Context providers
│   ├── ThemeContext.tsx # Theme state management
│   └── UserContext.tsx  # Authentication state
├── hooks/               # Custom React hooks
│   ├── useTrip.ts       # Single trip data fetching
│   └── useTrips.ts      # Trips list fetching
├── pages/               # Route-level components
│   ├── HomePage.tsx     # Landing page
│   ├── LoginPage.tsx    # Auth (login/register)
│   ├── ProfilePage.tsx  # User profile management
│   ├── TripDetailPage.tsx
│   ├── TripsPage.tsx
│   └── VerifyEmailPage.tsx
├── services/            # API communication
│   ├── api.ts           # HTTP client and endpoints
│   └── apiAdapter.ts    # API abstraction layer
├── types/               # TypeScript definitions
│   ├── index.ts         # Domain models
│   └── api.ts           # Request/response types
├── utils/               # Utility functions
│   └── avatar.ts        # Avatar URL resolution
├── App.tsx              # Root component with routing
├── main.tsx             # Application entry point
└── index.css            # Global styles and Tailwind
```

### 4.2 State Management Strategy

The application uses React Context for global state:

**UserContext** - Authentication state:
- `user`: Current user object
- `authenticated`: Boolean auth status
- `loading`: Auth check in progress
- `updateUser()`: Profile updates
- `refreshUser()`: Re-fetch user data
- `logout()`: Clear auth state

**ThemeContext** - UI preferences:
- `theme`: 'light' | 'dark'
- `toggleTheme()`: Switch theme
- Persists to localStorage

### 4.3 Component Patterns

**Container/Presenter Pattern**:
- Pages fetch data and manage state
- Components receive data via props
- Separation of concerns

**Controlled Components**:
- Form inputs controlled by React state
- Validation before submission
- Error display integrated

**Editable Components**:
- `Editable*` components toggle between view/edit modes
- Auto-save on blur with debouncing
- Optimistic UI updates

### 4.4 API Layer Design

```typescript
// api.ts - Low-level HTTP client
const request = async <T>(endpoint: string, options?: RequestInit): Promise<T>

// apiAdapter.ts - High-level abstraction
export const apiAdapter = {
  getTrips: () => api.getTrips(),
  createTrip: (data) => api.createTrip(data),
  // ...
}
```

Benefits:
- Single point for HTTP configuration
- JWT token management centralized
- Consistent error handling
- Easy to mock for testing

---

## 5. Backend Architecture

### 5.1 Package Structure

```
com.triporg/
├── config/              # Spring configuration
│   ├── AsyncConfig.java         # Async processing
│   ├── CorsConfig.java          # CORS settings
│   ├── FileStorageConfig.java   # File upload config
│   ├── RestTemplateConfig.java  # HTTP client config
│   └── SecurityConfig.java      # Spring Security setup
├── controller/          # REST endpoints
│   ├── AIChatController.java
│   ├── AuthController.java
│   ├── ChatController.java
│   ├── ExpenseController.java
│   ├── HealthController.java
│   ├── TicketFileController.java
│   ├── TripController.java
│   └── UserController.java
├── dto/                 # Data Transfer Objects
│   ├── request/         # Incoming request bodies
│   └── response/        # API response formats
├── entity/              # JPA entities
│   ├── User.java
│   ├── Trip.java
│   ├── TripParticipant.java
│   ├── Expense.java
│   ├── Activity.java
│   ├── Accommodation.java
│   ├── ActivityLog.java
│   ├── ChatMessage.java
│   ├── AIChatSession.java
│   ├── AIChatMessage.java
│   ├── DocumentChecklistItem.java
│   └── TicketFile.java
├── exception/           # Exception handling
│   ├── GlobalExceptionHandler.java
│   ├── BadRequestException.java
│   ├── ForbiddenException.java
│   ├── NotFoundException.java
│   └── UnauthorizedException.java
├── mapper/              # Object mapping
│   └── EntityMapper.java
├── repository/          # JPA repositories
├── security/            # Authentication
│   ├── CurrentUser.java         # Annotation for principal
│   ├── JwtAuthenticationFilter.java
│   ├── JwtTokenProvider.java
│   └── UserPrincipal.java
├── service/             # Business logic
│   ├── ActivityLogService.java
│   ├── AIChatService.java
│   ├── AuthService.java
│   ├── ChatService.java
│   ├── EmailService.java
│   ├── ExpenseService.java
│   ├── FileStorageService.java
│   ├── TripService.java
│   └── UserService.java
└── TripOrgApplication.java
```

### 5.2 Layered Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Controller Layer                         │
│  - HTTP request handling                                         │
│  - Input validation (@Valid)                                     │
│  - Response formatting                                           │
│  - @CurrentUser authentication injection                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Service Layer                           │
│  - Business logic implementation                                 │
│  - Transaction management (@Transactional)                       │
│  - Activity logging                                              │
│  - Authorization checks                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Repository Layer                          │
│  - JPA interfaces extending JpaRepository                        │
│  - Custom @Query methods                                         │
│  - Database abstraction                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Entity Layer                             │
│  - JPA @Entity classes                                           │
│  - Relationship mapping                                          │
│  - Lifecycle hooks (@PrePersist, @PreUpdate)                     │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Key Services

**TripService**
- Trip CRUD operations
- Participant management
- Activity logging for all modifications
- Authorization enforcement

**AuthService**
- User registration with email verification
- Login with password verification
- JWT token generation
- Email verification flow

**AIChatService**
- Session management
- Message persistence
- n8n webhook integration
- Response handling via callback

**ActivityLogService**
- Immutable audit trail creation
- Automatic change detection
- User attribution

---

## 6. Database Design

### 6.1 Entity Relationship Diagram

```
┌──────────────┐
│    users     │
├──────────────┤
│ id (PK)      │
│ email        │──────────────────────────────────────────┐
│ password     │                                          │
│ first_name   │      ┌───────────────────────┐           │
│ last_name    │      │  trip_participants    │           │
│ display_name │      ├───────────────────────┤           │
│ avatar       │      │ id (PK)               │           │
│ email_verified│     │ trip_id (FK)          │───────────│────┐
│ verification_token  │ user_id (FK)          │───────────┘    │
└──────────────┘      │ joined_at             │                │
                      └───────────────────────┘                │
                                                               │
┌──────────────────────────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────────────────────────┐
│                              trips                                    │
├──────────────────────────────────────────────────────────────────────┤
│ id (PK)                │ name                │ country               │
│ city                   │ specific_place      │ start_date            │
│ end_date               │ base_currency       │ transport_type        │
│ tickets_status         │ ticket_price        │ food_strategy         │
│ estimated_daily_food   │ local_transport     │ shared_notes          │
│ important_deadlines    │ created_at          │ created_by (FK→users) │
└──────────────────────────────────────────────────────────────────────┘
       │
       │ 1:N relationships
       ▼
┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│  expenses   │  │ activities  │  │ activity_logs │  │chat_messages │
├─────────────┤  ├─────────────┤  ├──────────────┤  ├──────────────┤
│ id (PK)     │  │ id (PK)     │  │ id (PK)      │  │ id (PK)      │
│ trip_id(FK) │  │ trip_id(FK) │  │ trip_id(FK)  │  │ trip_id(FK)  │
│ amount      │  │ name        │  │ user_id(FK)  │  │ user_id(FK)  │
│ category    │  │ cost        │  │ action_type  │  │ content      │
│ description │  │ notes       │  │ entity_type  │  │ created_at   │
│ author(FK)  │  │             │  │ field_name   │  │              │
│ is_shared   │  │             │  │ old_value    │  │              │
│ created_at  │  │             │  │ new_value    │  │              │
└─────────────┘  └─────────────┘  └──────────────┘  └──────────────┘

┌───────────────────┐
│ ai_chat_sessions  │
├───────────────────┤           ┌──────────────────┐
│ id (PK)           │           │ ai_chat_messages │
│ trip_id (FK)      │──────────▶├──────────────────┤
│ is_locked         │           │ id (PK)          │
│ created_at        │           │ session_id (FK)  │
└───────────────────┘           │ trip_id (FK)     │
                                │ role             │
                                │ content          │
                                │ created_at       │
                                └──────────────────┘
```

### 6.2 Key Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| User ↔ Trip | M:N | Via trip_participants join table |
| Trip → User | N:1 | created_by foreign key |
| Trip → Expense | 1:N | Expenses belong to trips |
| Trip → Activity | 1:N | Activities belong to trips |
| Trip → ActivityLog | 1:N | Immutable audit entries |
| Trip → ChatMessage | 1:N | Participant messages |
| Trip → AIChatSession | 1:1 | One AI session per trip |
| AIChatSession → AIChatMessage | 1:N | Conversation history |

### 6.3 Database Migrations

Flyway manages schema versioning:

- `V1__initial_schema.sql` - Core tables
- `V2__add_ticket_price.sql` - Ticket price field
- `V3__add_email_verification.sql` - Email verification columns

---

## 7. Security Implementation

### 7.1 Authentication Flow

```
1. Registration
   ┌─────────────┐     ┌──────────────┐     ┌───────────────┐
   │   Client    │────▶│   Backend    │────▶│   Database    │
   │             │     │ (hash pass)  │     │ (store user)  │
   └─────────────┘     └──────────────┘     └───────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │   Mailpit    │
                       │ (send email) │
                       └──────────────┘

2. Email Verification
   ┌─────────────┐     ┌──────────────┐     ┌───────────────┐
   │   Client    │────▶│   Backend    │────▶│   Database    │
   │ (click link)│     │(verify token)│     │(mark verified)│
   └─────────────┘     └──────────────┘     └───────────────┘

3. Login
   ┌─────────────┐     ┌──────────────┐     ┌───────────────┐
   │   Client    │────▶│   Backend    │────▶│   Return JWT  │
   │ (email/pass)│     │(verify creds)│     │               │
   └─────────────┘     └──────────────┘     └───────────────┘
```

### 7.2 JWT Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "iat": 1704067200,
    "exp": 1704153600
  },
  "signature": "..."
}
```

### 7.3 Authorization Model

```
Resource Access Control:
─────────────────────────
Trip Access: user must be in trip.participants
Expense Modification: trip participant
User Profile: only own profile
Avatar: public read, owner write
```

### 7.4 Security Configuration

```java
// SecurityConfig.java key settings
.requestMatchers("/api/v1/auth/login", "/api/v1/auth/register").permitAll()
.requestMatchers("/api/v1/auth/verify-email", "/api/v1/auth/resend-verification").permitAll()
.requestMatchers("/api/v1/users/*/avatar").permitAll()
.requestMatchers("/api/v1/**").authenticated()
```

---

## 8. AI Integration

### 8.1 Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend    │────▶│    n8n      │
│ (send msg)  │     │ (save, lock) │     │ (webhook)   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                    │
                           │                    ▼
                           │             ┌─────────────┐
                           │             │   LLM API   │
                           │             │   (Groq)    │
                           │             └─────────────┘
                           │                    │
                           ▼                    │
                    ┌──────────────┐            │
                    │   Backend    │◀───────────┘
                    │ (save resp)  │
                    └──────────────┘
```

### 8.2 Message Flow

1. User sends message to AI
2. Backend locks AI session (prevents concurrent messages)
3. Backend saves user message
4. Backend calls n8n webhook with trip context
5. n8n processes with LLM (Groq model)
6. n8n calls backend callback with response
7. Backend saves AI response and unlocks session
8. Frontend polls and receives response

### 8.3 Session Locking

Critical for preventing race conditions:
- Session locked immediately on message send
- Remains locked during LLM processing
- Unlocked only after response saved
- Frontend shows "AI is responding..." indicator

---

## 9. Docker Infrastructure

### 9.1 Container Overview

| Container | Image | Purpose | Port |
|-----------|-------|---------|------|
| triporg-postgres | postgres:15-alpine | Database | 5432 |
| triporg-backend | Custom (Spring Boot) | REST API | 8080 |
| triporg-frontend | Custom (Vite/React) | Web UI | 3000 |
| triporg-mailpit | axllent/mailpit | Email testing | 8025 |
| triporg-n8n | n8nio/n8n | AI workflows | 5678 |

### 9.2 Network Configuration

All containers join `triporg-network` (bridge driver):
- Internal DNS resolution by container name
- Isolated from host network except exposed ports
- Backend connects to `postgres:5432` (container name)

### 9.3 Volume Persistence

| Volume | Purpose |
|--------|---------|
| postgres_data | Database files |
| uploads | User-uploaded files |
| n8n_data | n8n workflow data |

### 9.4 Health Checks

PostgreSQL health check ensures backend starts only after database is ready:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U triporg -d triporg"]
  interval: 5s
  timeout: 5s
  retries: 5
```

---

## 10. API Design

### 10.1 REST Conventions

- Base path: `/api/v1`
- Resource-based URLs
- HTTP methods: GET, POST, PUT, DELETE
- JSON request/response bodies
- JWT in Authorization header

### 10.2 Response Format

```json
// Success
{
  "trip": { ... },
  "participants": [ ... ]
}

// Error
{
  "error": "Human readable message",
  "code": "ERROR_CODE",
  "timestamp": "2026-01-11T10:00:00Z"
}
```

### 10.3 Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | User registration |
| POST | /auth/login | User login |
| GET | /auth/verify-email | Email verification |
| GET | /trips | List user's trips |
| POST | /trips | Create trip |
| GET | /trips/:id | Get trip details |
| PUT | /trips/:id | Update trip |
| POST | /trips/:id/participants | Add participant |
| DELETE | /trips/:id/participants/:userId | Remove participant |
| GET | /trips/:id/expenses | List expenses |
| POST | /trips/:id/expenses | Create expense |
| GET | /trips/:id/activity-log | Get audit trail |
| POST | /trips/:id/ai-chat/messages | Send AI message |

---

## 11. Key Implementation Details

### 11.1 Activity Logging

Every modification creates an immutable log entry:
```java
activityLogService.log(trip, user, "update", "trip", 
    "name", oldValue, newValue);
```

### 11.2 Participant Management

- Only trip owner can add/remove others
- Any participant can leave voluntarily
- Removal cascades to remove from trip_participants
- Activity log tracks who removed whom

### 11.3 Expense Cost Splitting

```java
BudgetSummary:
- totalSharedCost = sum of all isShared=true expenses
- costPerParticipant = totalSharedCost / participantCount
- expensesByCategory = grouped totals
```

### 11.4 File Storage

Avatar and ticket files stored locally:
```
/app/uploads/
├── avatars/
│   └── {userId}/avatar_{uuid}.{ext}
└── tickets/
    └── {tripId}/{uuid}_{filename}
```

### 11.5 Email Verification

1. Generate UUID token on registration
2. Store token + expiry (24 hours) in user record
3. Send email with verification link
4. Verify endpoint validates token and expiry
5. Mark email_verified = true, clear token

---

## Appendix A: Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DB_HOST | Yes | Database hostname |
| DB_PORT | Yes | Database port |
| DB_NAME | Yes | Database name |
| DB_USERNAME | Yes | Database user |
| DB_PASSWORD | Yes | Database password |
| JWT_SECRET | Yes | JWT signing key (32+ chars) |
| JWT_EXPIRATION | No | Token lifetime (ms) |
| CORS_ORIGINS | Yes | Allowed origins |
| FRONTEND_URL | Yes | For email links |
| MAIL_HOST | Yes | SMTP server |
| MAIL_PORT | Yes | SMTP port |
| N8N_ENABLED | No | Enable AI features |
| N8N_WEBHOOK_URL | No | n8n webhook endpoint |

---

## Appendix B: Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection failed | Check postgres container health |
| JWT invalid | Verify JWT_SECRET matches |
| CORS errors | Add origin to CORS_ORIGINS |
| Email not sending | Verify Mailpit running, check MAIL_HOST |
| AI not responding | Check n8n workflow configured, N8N_ENABLED=true |
