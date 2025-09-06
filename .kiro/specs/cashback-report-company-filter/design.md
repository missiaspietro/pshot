# Design Document

## Overview

This design ensures the cashback report card on the dashboard properly integrates with existing date filtering mechanisms and consistently applies company-based filtering using the `rede_de_loja` field. The solution leverages the existing state management and filtering infrastructure already present in the dashboard component.

## Architecture

The cashback report filtering will be implemented by modifying the existing `fetchCashbackPorLoja` function and ensuring it properly integrates with the current state management system. The architecture follows the existing pattern used by other dashboard components.

### Current State Flow
```
User Interaction → State Update → useEffect Trigger → Data Fetch → UI Update
```

### Integration Points
- **State Variables**: `cashbackStartDate`, `cashbackEndDate`, `periodoSelecionado`, `user.empresa`
- **Data Fetching**: `fetchCashbackPorLoja` function
- **Service Layer**: `getCashbackData` function in `lib/cashback-service.ts`
- **Database**: `EnvioCashTemTotal` table with `Rede_de_loja` field

## Components and Interfaces

### Modified Functions

#### 1. fetchCashbackPorLoja (Dashboard Component)
**Current Signature:**
```typescript
const fetchCashbackPorLoja = async (meses?: number, startDate?: string, endDate?: string)
```

**Modifications:**
- Ensure consistent company filtering using `user.empresa`
- Maintain existing date filtering logic
- Improve error handling for missing company data

#### 2. getCashbackData (Service Layer)
**Current Signature:**
```typescript
export async function getCashbackData(
  empresa: string, 
  startDate?: string, 
  endDate?: string
): Promise<{ data: CashbackData[], lojas: string[] }>
```

**Modifications:**
- Ensure the `empresa` parameter is always passed correctly
- Validate company parameter before database queries
- Maintain existing date filtering logic

### State Management Integration

The solution will use the existing state variables:
- `cashbackStartDate` and `cashbackEndDate` for custom date ranges
- `periodoSelecionado` for predefined periods (1, 2, or 3 months)
- `user.empresa` for company filtering

### Database Query Pattern

```sql
SELECT Loja, Envio_novo, Status, Rede_de_loja 
FROM EnvioCashTemTotal 
WHERE Status = 'Enviada' 
  AND Rede_de_loja = {user.empresa}
  AND Envio_novo >= {startDate}
  AND Envio_novo <= {endDate}
```

## Data Models

### User Context
```typescript
interface User {
  empresa: string; // Maps to Rede_de_loja in database
  // other user properties...
}
```

### Cashback Data
```typescript
interface CashbackData {
  mes: string;
  [key: string]: string | number; // Dynamic store properties
}
```

### Database Schema (EnvioCashTemTotal)
```sql
CREATE TABLE public."EnvioCashTemTotal" (
  "Nome" text null,
  "Whatsapp" text null,
  "Loja" text null,
  "Rede_de_loja" text null,  -- Company filter field
  "Envio_novo" date null default now(),
  "Status" text null,
  id uuid not null default gen_random_uuid(),
  constraint EnvioCashTemTotal_pkey primary key (id)
);
```

## Error Handling

### Company Validation
- Check if `user.empresa` exists before making database queries
- Display appropriate message when company data is unavailable
- Log company filtering issues for debugging

### Date Validation
- Validate date range inputs before database queries
- Handle invalid date formats gracefully
- Ensure start date is not after end date

### Data Availability
- Handle empty result sets gracefully
- Display appropriate messages when no data is found
- Maintain loading states during data fetching

## Testing Strategy

### Unit Tests
- Test company filtering logic with various user contexts
- Test date filtering with different date ranges and periods
- Test error handling for missing company data
- Test integration with existing state management

### Integration Tests
- Test complete data flow from user interaction to UI update
- Test interaction between date filters and company filters
- Test dashboard component behavior with different user roles

### Manual Testing Scenarios
1. **Company Filtering**: Login with different company users and verify data isolation
2. **Date Integration**: Test all date filter combinations (periods + custom dates)
3. **Error Scenarios**: Test behavior with missing company data or invalid dates
4. **State Persistence**: Verify filters maintain state during component re-renders

## Implementation Approach

### Phase 1: Service Layer Enhancement
- Enhance `getCashbackData` function to ensure proper company filtering
- Add validation for company parameter
- Improve error handling and logging

### Phase 2: Dashboard Integration
- Modify `fetchCashbackPorLoja` to ensure consistent company filtering
- Verify integration with existing date filtering state
- Add proper error handling for company-related issues

### Phase 3: Testing and Validation
- Implement unit tests for modified functions
- Perform integration testing with different user scenarios
- Validate data consistency across different filter combinations