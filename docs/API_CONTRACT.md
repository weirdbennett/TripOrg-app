# REST API Contract Specification

This document defines the complete REST API contract for TripOrg. The backend (Spring Boot) should implement these endpoints exactly as specified to ensure seamless frontend integration.

## Base URL

All endpoints are prefixed with `/api/v1`

## Authentication

All endpoints (except login) require authentication via Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Response Format

All successful responses return JSON. Error responses follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created
- `204 No Content` - Successful deletion
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication Endpoints

### POST /auth/login

Login and receive authentication token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "user1",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John D.",
    "email": "user@example.com",
    "preferredCurrency": "USD"
  },
  "token": "jwt_token_here"
}
```

### POST /auth/logout

Logout and invalidate token.

**Response:** `204 No Content`

### GET /auth/me

Get current authenticated user.

**Response:** `200 OK`
```json
{
  "user": {
    "id": "user1",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John D.",
    "email": "user@example.com",
    "preferredCurrency": "USD"
  }
}
```

---

## User Endpoints

### GET /users/:id

Get user by ID.

**Response:** `200 OK`
```json
{
  "user": {
    "id": "user1",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John D.",
    "email": "user@example.com",
    "preferredCurrency": "USD"
  }
}
```

### PUT /users/:id

Update user information.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John D.",
  "email": "user@example.com",
  "preferredCurrency": "USD",
  "themePreference": "dark"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "user1",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John D.",
    "email": "user@example.com",
    "preferredCurrency": "USD"
  }
}
```

---

## Trip Endpoints

### GET /trips

Get all trips for the current user.

**Response:** `200 OK`
```json
{
  "trips": [
    {
      "id": "trip1",
      "name": "Summer in Paris",
      "country": "France",
      "city": "Paris",
      "specificPlace": "Montmartre area",
      "startDate": "2024-07-15",
      "endDate": "2024-07-22",
      "baseCurrency": "EUR",
      "transportType": "plane",
      "ticketsStatus": "purchased",
      "ticketFiles": [],
      "accommodation": { ... },
      "foodStrategy": "mixed",
      "estimatedDailyFoodBudgetPerPerson": 50,
      "activities": [],
      "localTransportNotes": "...",
      "sharedNotes": "...",
      "importantDeadlines": "...",
      "documentsChecklist": ["passport", "visa"],
      "createdAt": "2024-01-10T08:00:00Z",
      "createdBy": "user1",
      "participants": ["user1", "user2"]
    }
  ]
}
```

### POST /trips

Create a new trip.

**Request:**
```json
{
  "name": "Summer in Paris",
  "country": "France",
  "city": "Paris",
  "specificPlace": "Montmartre area",
  "startDate": "2024-07-15",
  "endDate": "2024-07-22",
  "baseCurrency": "EUR",
  "transportType": "plane",
  "ticketsStatus": "not_purchased",
  "foodStrategy": "mixed",
  "estimatedDailyFoodBudgetPerPerson": 50
}
```

**Response:** `201 Created`
```json
{
  "trip": {
    "id": "trip1",
    ...
  }
}
```

### GET /trips/:id

Get trip by ID.

**Response:** `200 OK`
```json
{
  "trip": { ... }
}
```

### PUT /trips/:id

Update trip.

**Request:** (all fields optional)
```json
{
  "name": "Updated Trip Name",
  "sharedNotes": "New notes"
}
```

**Response:** `200 OK`
```json
{
  "trip": { ... }
}
```

### DELETE /trips/:id

Delete trip.

**Response:** `204 No Content`

---

## Participant Endpoints

### GET /trips/:id/participants

Get all participants for a trip.

**Response:** `200 OK`
```json
{
  "participants": [
    {
      "id": "user1",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John D.",
      "email": "user@example.com",
      "preferredCurrency": "USD"
    }
  ]
}
```

### POST /trips/:id/participants

Add participant to trip.

**Request:**
```json
{
  "userId": "user2"
}
```

**Response:** `200 OK`
```json
{
  "trip": { ... }
}
```

### DELETE /trips/:id/participants/:userId

Remove participant from trip.

**Response:** `200 OK`
```json
{
  "trip": { ... }
}
```

---

## Expense Endpoints

### GET /trips/:id/expenses

Get all expenses for a trip.

**Response:** `200 OK`
```json
{
  "expenses": [
    {
      "id": "exp1",
      "tripId": "trip1",
      "amount": 450,
      "category": "transport",
      "description": "Round-trip flights",
      "author": "user1",
      "timestamp": "2024-01-15T10:00:00Z",
      "isShared": true
    }
  ]
}
```

### POST /trips/:id/expenses

Create new expense.

**Request:**
```json
{
  "amount": 450,
  "category": "transport",
  "description": "Round-trip flights",
  "isShared": true
}
```

**Response:** `201 Created`
```json
{
  "expense": { ... }
}
```

### GET /trips/:id/expenses/:expenseId

Get expense by ID.

**Response:** `200 OK`
```json
{
  "expense": { ... }
}
```

### PUT /trips/:id/expenses/:expenseId

Update expense.

**Request:**
```json
{
  "amount": 500,
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "expense": { ... }
}
```

### DELETE /trips/:id/expenses/:expenseId

Delete expense.

**Response:** `204 No Content`

### GET /trips/:id/budget

Get budget summary for a trip.

**Response:** `200 OK`
```json
{
  "summary": {
    "totalSharedCost": 1350,
    "costPerParticipant": 675,
    "balancePerUser": {
      "user1": 675,
      "user2": 675
    },
    "expensesByCategory": {
      "transport": 450,
      "accommodation": 840,
      "food": 0,
      "activities": 60,
      "other": 0
    }
  }
}
```

---

## Activity Log Endpoints

### GET /trips/:id/activity-log

Get activity log for a trip.

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 100)
- `offset` (optional): Number of entries to skip (default: 0)
- `entityType` (optional): Filter by entity type
- `actionType` (optional): Filter by action type

**Response:** `200 OK`
```json
{
  "entries": [
    {
      "id": "log1",
      "tripId": "trip1",
      "userId": "user1",
      "userName": "John D.",
      "actionType": "create",
      "entityType": "trip",
      "fieldName": null,
      "oldValue": null,
      "newValue": null,
      "timestamp": "2024-01-10T08:00:00Z"
    }
  ],
  "total": 10
}
```

---

## Chat Endpoints

### GET /trips/:id/chat/messages

Get chat messages for a trip.

**Query Parameters:**
- `limit` (optional): Number of messages to return (default: 100)
- `offset` (optional): Number of messages to skip (default: 0)

**Response:** `200 OK`
```json
{
  "messages": [
    {
      "id": "msg1",
      "tripId": "trip1",
      "userId": "user1",
      "userName": "John D.",
      "userAvatar": null,
      "content": "Hello everyone!",
      "timestamp": "2024-01-10T08:30:00Z"
    }
  ],
  "total": 10
}
```

### POST /trips/:id/chat/messages

Send a chat message.

**Request:**
```json
{
  "content": "Hello everyone!"
}
```

**Response:** `201 Created`
```json
{
  "message": { ... }
}
```

---

## AI Chat Endpoints

### GET /trips/:id/ai-chat/session

Get AI chat session for a trip.

**Response:** `200 OK`
```json
{
  "session": {
    "tripId": "trip1",
    "isLocked": false,
    "messages": []
  }
}
```

### GET /trips/:id/ai-chat/messages

Get AI chat messages.

**Response:** `200 OK`
```json
{
  "messages": [
    {
      "id": "ai1",
      "tripId": "trip1",
      "role": "user",
      "content": "What are the best restaurants?",
      "timestamp": "2024-01-10T10:00:00Z"
    },
    {
      "id": "ai2",
      "tripId": "trip1",
      "role": "assistant",
      "content": "Here are some recommendations...",
      "timestamp": "2024-01-10T10:00:05Z"
    }
  ]
}
```

### POST /trips/:id/ai-chat/messages

Send message to AI assistant.

**Request:**
```json
{
  "content": "What are the best restaurants in Montmartre?"
}
```

**Response:** `200 OK`
```json
{
  "message": {
    "id": "ai1",
    "tripId": "trip1",
    "role": "user",
    "content": "What are the best restaurants in Montmartre?",
    "timestamp": "2024-01-10T10:00:00Z"
  },
  "session": {
    "tripId": "trip1",
    "isLocked": true,
    "messages": [...]
  }
}
```

**Note:** The session will be locked (`isLocked: true`) while the AI is processing. The backend should:
1. Lock the session immediately
2. Process the AI request
3. Add the AI response to messages
4. Unlock the session

### POST /trips/:id/ai-chat/lock

Manually lock/unlock AI chat (admin only).

**Request:**
```json
{
  "lock": true
}
```

**Response:** `200 OK`
```json
{
  "session": { ... }
}
```

---

## Ticket File Endpoints

### POST /trips/:id/tickets/files

Upload a ticket file.

**Request:** `multipart/form-data`
- `file`: File to upload

**Response:** `201 Created`
```json
{
  "ticketFile": {
    "id": "file1",
    "fileName": "flight_tickets.pdf",
    "fileSize": 245000,
    "uploadedAt": "2024-01-15T10:00:00Z",
    "uploadedBy": "user1"
  }
}
```

### DELETE /trips/:id/tickets/files/:fileId

Delete a ticket file.

**Response:** `204 No Content`

---

## Data Types

### TransportType
- `plane`
- `train`
- `car`
- `bus`
- `mixed`
- `other`

### AccommodationType
- `hotel`
- `apartment`
- `hostel`
- `other`

### FoodStrategy
- `eating_out`
- `mixed`
- `self_cooking`

### ExpenseCategory
- `transport`
- `accommodation`
- `food`
- `activities`
- `other`

### ActionType
- `create`
- `update`
- `delete`
- `add`
- `remove`

### EntityType
- `trip`
- `expense`
- `participant`
- `accommodation`
- `activity`
- `message`

---

## Error Handling

All errors should follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:00:00Z",
  "details": {
    "field": "Additional error details"
  }
}
```

Common error codes:
- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `AI_CHAT_LOCKED` - AI chat is currently locked
- `INTERNAL_ERROR` - Server error

---

## Real-time Updates (Future)

For real-time collaboration, consider implementing:

1. **WebSocket** connection for:
   - Chat messages
   - Activity log updates
   - Trip changes
   - Expense updates

2. **Server-Sent Events (SSE)** for:
   - Activity log streaming
   - Budget summary updates

The frontend is prepared to handle real-time updates through polling (current implementation) and can be easily upgraded to WebSocket/SSE.


