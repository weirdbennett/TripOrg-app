# TripOrg - Collaborative Trip Planning Platform

A full-stack web application for organizing group trips with real-time collaboration, expense tracking, and AI-powered travel assistance.

## Features

- **Trip Management**: Create and manage trips with detailed information (destination, dates, transport, accommodation)
- **Collaborative Planning**: Invite participants to join trips and plan together
- **Expense Tracking**: Track shared expenses with automatic cost splitting
- **Real-time Chat**: Built-in chat for trip participants
- **AI Assistant**: AI-powered travel planning assistant (via n8n integration)
- **Activity Log**: Complete audit trail of all trip modifications
- **Email Verification**: Secure user registration with email verification
- **Dark/Light Theme**: User preference-based theming

## API Documentation

See [docs/API_CONTRACT.md](docs/API_CONTRACT.md) for complete REST API specification.

## Architecture

See [docs/TECH_DOCUMENTATION.md](docs/TECH_DOCUMENTATION.md) for detailed architecture documentation.

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)
- Recharts (data visualization)

### Backend
- Java 17
- Spring Boot 3.2
- Spring Security (JWT authentication)
- Spring Data JPA (PostgreSQL)
- Flyway (database migrations)

### Infrastructure
- Docker & Docker Compose
- PostgreSQL 15
- Mailpit (email testing)
- n8n (AI workflow automation)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/triporg.git
   cd triporg
   ```

2. **Configure environment (optional)**
   ```bash
   cp env.example .env
   # Edit .env to customize settings (recommended for production)
   ```

3. **Start the application**
   ```bash
   docker compose up --build -d
   ```

4. **Access the application**

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Mailpit (email): http://localhost:8025
   - n8n (AI workflows): http://localhost:5678

   

   **Setting up n8n workflow**

   See [docs/n8n-backup-10.01.2026.json](docs/n8n-backup-10.01.2026.json) for n8n workflow backup.

## Project Structure

```
triporg/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/triporg/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST API controllers
│   │   ├── dto/             # Data transfer objects
│   │   ├── entity/          # JPA entities
│   │   ├── exception/       # Exception handling
│   │   ├── mapper/          # Entity-DTO mappers
│   │   ├── repository/      # JPA repositories
│   │   ├── security/        # JWT authentication
│   │   └── service/         # Business logic
│   └── src/main/resources/
│       ├── application.yml  # Application config
│       └── db/migration/    # Flyway migrations
├── src/                     # React frontend
│   ├── components/          # UI components
│   ├── context/             # React context providers
│   ├── hooks/               # Custom hooks
│   ├── pages/               # Page components
│   ├── services/            # API client
│   └── types/               # TypeScript types
├── docs/                    # Documentation
├── docker-compose.yml       # Container orchestration
├── Dockerfile               # Frontend container
└── env.example              # Environment template
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_NAME` | PostgreSQL database name | `triporg` |
| `DB_USERNAME` | Database username | `triporg` |
| `DB_PASSWORD` | Database password | `triporg` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | dev default |
| `JWT_EXPIRATION` | Token expiration (ms) | `86400000` |
| `CORS_ORIGINS` | Allowed CORS origins | localhost |
| `FRONTEND_URL` | Frontend URL for emails | `http://localhost:3000` |
| `N8N_ENABLED` | Enable AI integration | `true` |

## API Documentation

See [docs/API_CONTRACT.md](docs/API_CONTRACT.md) for complete REST API specification.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## Security Notes

For production deployment:
1. Change `JWT_SECRET` to a cryptographically secure random string
2. Change default database passwords
3. Configure HTTPS/TLS
4. Review and restrict CORS origins
5. Enable rate limiting

## Author

Uladzislau Yaseu
