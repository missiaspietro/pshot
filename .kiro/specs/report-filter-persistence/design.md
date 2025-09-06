# Design Document

## Overview

Esta funcionalidade implementa um sistema completo de persistência de configurações de filtros para relatórios de aniversários. O sistema utiliza criptografia AES-256 para armazenar configurações na coluna `config_filtros_relatorios` da tabela `users`, garantindo segurança e integridade dos dados.

## Architecture

### Component Structure
```
ReportConfigurationSection
├── FilterConfigurationForm (existing)
├── SaveConfigurationButton (new)
├── SaveConfigurationModal (new)
├── SavedConfigurationsList (new)
└── ConfigurationItem (new)
```

### Data Flow
```
User Input → Frontend State → Encryption → Database Storage
Database → Decryption → Frontend State → UI Update
```

## Components and Interfaces

### FilterConfiguration Interface
```typescript
interface FilterConfiguration {
  id: string
  name: string
  selectedFields: string[]
  createdAt: string
  updatedAt: string
}

interface EncryptedConfiguration {
  configurations: FilterConfiguration[]
}
```

### SaveConfigurationModal
```typescript
interface SaveConfigurationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => Promise<void>
  currentConfig: {
    selectedFields: string[]
  }
}
```

### SavedConfigurationsList
```typescript
interface SavedConfigurationsListProps {
  configurations: FilterConfiguration[]
  onLoad: (config: FilterConfiguration) => void
  onDelete: (configId: string) => void
  isLoading: boolean
}
```

## Data Models

### Database Schema
```sql
-- Existing column in users table
config_filtros_relatorios TEXT NULL
```

### Encrypted Data Structure
```json
{
  "configurations": [
    {
      "id": "uuid-v4",
      "name": "Configuração Padrão",
      "selectedFields": ["bot_disconnected", "invalid_number", "sent", "company", "subnet"],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Encryption Strategy
- **Algorithm:** AES-256-GCM
- **Key Derivation:** PBKDF2 with user-specific salt
- **IV:** Random 12-byte initialization vector per encryption
- **Format:** Base64 encoded encrypted data

## API Endpoints

### Save Configuration
```typescript
POST /api/users/report-filters
{
  name: string
  selectedFields: string[]
}
Response: { success: boolean, message: string }
```

### Load Configurations
```typescript
GET /api/users/report-filters
Response: {
  success: boolean
  configurations: FilterConfiguration[]
}
```

### Delete Configuration
```typescript
DELETE /api/users/report-filters/:configId
Response: { success: boolean, message: string }
```

## Security Considerations

### Encryption Implementation
```typescript
// Encryption service
class FilterConfigEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly KEY_LENGTH = 32
  private static readonly IV_LENGTH = 12
  
  static encrypt(data: EncryptedConfiguration, userSalt: string): string
  static decrypt(encryptedData: string, userSalt: string): EncryptedConfiguration
  static generateSalt(): string
}
```

### Data Validation
- Input sanitization for configuration names
- Schema validation for configuration data
- Maximum limits for number of saved configurations (10 per user)
- Name length limits (3-50 characters)

## Error Handling

### Frontend Error States
- Network connectivity issues
- Invalid configuration data
- Encryption/decryption failures
- Database operation failures

### Backend Error Responses
```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}
```

## Testing Strategy

### Unit Tests
- Encryption/decryption functions
- Configuration validation
- Component state management
- API endpoint handlers

### Integration Tests
- End-to-end save/load flow
- Database operations
- Error handling scenarios
- Cross-browser compatibility

### Security Tests
- Encryption strength validation
- Data integrity verification
- SQL injection prevention
- XSS protection

## Performance Considerations

### Frontend Optimizations
- Debounced save operations
- Lazy loading of configurations
- Memoized encryption operations
- Optimistic UI updates

### Backend Optimizations
- Connection pooling for database
- Cached user salt retrieval
- Batch operations for multiple configs
- Rate limiting for API endpoints

## Implementation Details

### Database Migration
```sql
-- Column already exists, no migration needed
-- config_filtros_relatorios TEXT NULL
```

### Frontend State Management
```typescript
interface ReportConfigState {
  selectedFields: string[]
  savedConfigurations: FilterConfiguration[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
}
```

### Encryption Service Location
- `lib/filter-config-encryption.ts` - Core encryption logic
- `lib/filter-config-service.ts` - API service layer
- `hooks/use-filter-configs.ts` - React hook for state management