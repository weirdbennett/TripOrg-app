-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar VARCHAR(500),
    preferred_currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    theme_preference VARCHAR(10) NOT NULL DEFAULT 'light',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Trips table
CREATE TABLE trips (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    specific_place VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    base_currency VARCHAR(10) NOT NULL,
    transport_type VARCHAR(20) NOT NULL,
    tickets_status VARCHAR(20) NOT NULL,
    food_strategy VARCHAR(20) NOT NULL,
    estimated_daily_food_budget_per_person DECIMAL(10, 2),
    local_transport_notes TEXT,
    shared_notes TEXT,
    important_deadlines TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36) NOT NULL REFERENCES users(id),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trips_created_by ON trips(created_by);
CREATE INDEX idx_trips_start_date ON trips(start_date);

-- Trip participants (many-to-many)
CREATE TABLE trip_participants (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trip_id, user_id)
);

CREATE INDEX idx_trip_participants_trip ON trip_participants(trip_id);
CREATE INDEX idx_trip_participants_user ON trip_participants(user_id);

-- Accommodation table
CREATE TABLE accommodations (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) NOT NULL UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    price_per_night DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Activities table
CREATE TABLE activities (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    estimated_cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_trip ON activities(trip_id);

-- Documents checklist table
CREATE TABLE documents_checklist (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    item VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_checklist_trip ON documents_checklist(trip_id);

-- Ticket files table
CREATE TABLE ticket_files (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(36) NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_ticket_files_trip ON ticket_files(trip_id);

-- Expenses table
CREATE TABLE expenses (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(20) NOT NULL,
    description VARCHAR(500) NOT NULL,
    author_id VARCHAR(36) NOT NULL REFERENCES users(id),
    is_shared BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_trip ON expenses(trip_id);
CREATE INDEX idx_expenses_author ON expenses(author_id);
CREATE INDEX idx_expenses_category ON expenses(category);

-- Activity log table (audit log)
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    user_name VARCHAR(100) NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    entity_type VARCHAR(20) NOT NULL,
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_trip ON activity_logs(trip_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Chat messages table
CREATE TABLE chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    user_name VARCHAR(100) NOT NULL,
    user_avatar VARCHAR(500),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_trip ON chat_messages(trip_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- AI chat sessions table
CREATE TABLE ai_chat_sessions (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) NOT NULL UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AI chat messages table
CREATE TABLE ai_chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    trip_id VARCHAR(36) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_chat_messages_session ON ai_chat_messages(session_id);
CREATE INDEX idx_ai_chat_messages_trip ON ai_chat_messages(trip_id);
CREATE INDEX idx_ai_chat_messages_created_at ON ai_chat_messages(created_at);


