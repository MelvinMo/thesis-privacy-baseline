# Backend Server Documentation

## Technology

- **Express.js**: Web application framework for Node.js, providing robust HTTP server functionality
- **TypeScript**: Ensuring type safety and better development experience
- **JWT Authentication**: JSON Web Token implementation for secure, stateless user authentication
- **Frontend Encryption**: All client-side data encryption is handled in the frontend application
- **Backend Password Hashing**: User passwords are securely hashed using the bcrypt library before storage

## Deployment

The backend is deployed using Render's free tier for web services.

## Architecture Overview

The backend follows a **modular and scalable architecture** with well-defined abstractions that promote maintainability and extensibility. The design emphasizes the **Dependency Inversion Principle**, ensuring loose coupling between components.

## Service Layer Architecture

### LLM Service Abstraction

The `LLMService` serves as the primary abstraction layer for language model interactions:

- **Interface-Based Design**: Concrete classes implement the `LLMService` interface, defining specific behaviors for different language models
- **Model Agnostic**: Easy switching between different LLM providers (OpenAI, Claude, etc.)
- **Extensibility**: New language models can be integrated by simply implementing the interface
- **Dependency Inversion**: Code depends on abstractions, not concrete implementations

```typescript
interface LLMService {
  analyzePrivacyRisks(
    transparencyEvent: TransparencyEvent,
    prompt: string
  ): Promise<TransparencyEvent>;
}
```

## Data Access Layer

### Repository Pattern Implementation

The data layer follows the Repository pattern with dedicated interfaces for each data type:

#### Repository Interfaces

- **`JournalRepository.ts`**
- **`SensorDataRepository.ts`**
- **`SleepDataRepository.ts`**
- **`UserRepository.ts`**

#### Database Implementations

The `firestore` directory contains concrete implementations for Google Firestore:

- **Provider Abstraction**: Database-agnostic design allows for easy migration to other providers
- **Consistent Interface**: All repositories follow the same interface pattern
- **Extensibility**: Adding new database providers requires only implementing the repository interfaces

## API Layer

### Route Implementation

The Express.js routes provide complete CRUD (Create, Read, Update, Delete) functionality for all resources:

- **Full CRUD Operations**: All endpoints include comprehensive data manipulation capabilities
- **RESTful Design**: Routes follow REST conventions for consistent API behavior
- **Authentication Integration**: JWT middleware protects secured endpoints

**Note**: While full CRUD operations are implemented for completeness, many endpoints were not required for this prototype and therefore have not been properly tested. Production deployment would require comprehensive testing of all endpoints.

## Key Benefits

- Clear separation of concerns between layers
- Interface-based design promotes extensibility
- Modular structure enables independent component updates
- New data types can be added by creating corresponding repository interfaces
- Additional LLM providers can be integrated without affecting existing code
- Database migrations are simplified through the repository pattern

## Future Considerations

- **Testing**: Need to create a comprehensive test suite to ensure all routes and services function as expected
