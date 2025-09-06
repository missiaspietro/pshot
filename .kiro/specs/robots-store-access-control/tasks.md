# Implementation Plan

- [x] 1. Enhance bot service with store-based filtering


  - Add new method `getBotsPorEmpresaELoja` to filter bots by both company and store
  - Add utility method `getBotsByUserAccess` to determine which filtering method to use based on user access level
  - Maintain existing `getBotsPorEmpresa` method for backward compatibility
  - _Requirements: 1.1, 1.2, 2.2, 3.2, 3.3_





- [ ] 2. Implement access level detection logic
  - Create utility function to determine if user is Super Admin based on `access_level` field
  - Add validation for user store field existence


  - Implement fallback logic for users without defined store
  - _Requirements: 1.3, 2.1, 3.1, 3.4_



- [x] 3. Update robots page with access control




  - Modify data fetching logic in `app/robots/page.tsx` to use appropriate bot service method based on user access level
  - Implement conditional filtering logic for Super Admin vs regular users
  - Add handling for users without defined store
  - _Requirements: 1.1, 1.2, 2.1, 2.2_





- [ ] 4. Update statistics calculations
  - Modify robot statistics (total, connected, disconnected) to reflect only visible robots
  - Ensure counters are calculated from filtered robot list



  - Add appropriate messaging when no robots are visible
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 5. Implement user feedback for edge cases
  - Add informative message for users without defined store
  - Update empty state messaging to be context-aware
  - Ensure error handling maintains security boundaries
  - _Requirements: 1.3, 3.4, 4.4_

- [ ] 6. Add comprehensive testing
  - Write unit tests for new bot service methods
  - Create integration tests for different user access scenarios
  - Add security tests to verify access control enforcement
  - Test statistics calculations with filtered data
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_