# Implementation Plan

- [x] 1. Create cashback report service for database integration


  - Create `lib/cashback-report-service.ts` with methods to query EnvioCashTemTotal table
  - Implement filtering by company (Rede_de_loja) and date range (Envio_novo)
  - Add proper TypeScript interfaces for cashback data structure
  - Include error handling for database connection issues
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 3.2, 4.4_

- [x] 2. Update API route to use real database data


  - Modify `/api/reports/cashback/route.ts` to remove all mock data
  - Integrate with the new cashback report service
  - Add user authentication and company extraction logic
  - Implement proper error responses for authentication and data issues
  - _Requirements: 1.1, 3.1, 3.3, 4.1, 4.2, 4.3_

- [x] 3. Implement user company identification system


  - Add method to extract user company from authentication context
  - Create fallback mechanism to get company from user session/cookies
  - Add validation to ensure user has company defined before data access
  - Implement proper error handling for missing company information
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Add comprehensive error handling to API


  - Implement specific error responses for different failure scenarios
  - Add proper HTTP status codes for authentication, authorization, and data errors
  - Create user-friendly error messages for frontend consumption
  - Add logging for debugging and monitoring purposes
  - _Requirements: 4.3, 5.3_

- [x] 5. Update modal component error handling


  - Enhance `CashbackPreviewModal` to handle real API errors gracefully
  - Add retry mechanism for failed data requests
  - Improve loading states and user feedback during data fetching
  - Maintain existing modal interface while adding robust error handling
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 6. Implement date filtering functionality


  - Add proper date range filtering in the database service
  - Handle cases where only start date, only end date, or both dates are provided
  - Implement validation for date formats and logical date ranges
  - Add fallback behavior when no dates are specified
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 7. Add field selection and data formatting


  - Implement dynamic field selection based on user choices
  - Add proper data formatting for display in the modal table
  - Handle null/undefined values in database fields appropriately
  - Maintain compatibility with existing field mapping and labels
  - _Requirements: 1.3, 5.1_

- [x] 8. Create unit tests for cashback report service


  - Write tests for database query methods with different filter combinations
  - Test error handling scenarios including database connection failures
  - Add tests for company filtering and date range validation
  - Create mock data setup for consistent testing
  - _Requirements: 1.1, 2.1, 2.2, 3.2_

- [x] 9. Create integration tests for API route


  - Test complete API flow from request to database response
  - Add tests for authentication and authorization scenarios
  - Test error handling with various invalid inputs
  - Verify proper data filtering and response formatting
  - _Requirements: 1.1, 3.1, 4.1, 4.3_

- [x] 10. Clean up and remove all mock data references


  - Remove all hardcoded/mock data from the API route
  - Clean up any console.log statements related to mock data
  - Update any comments or documentation referencing test data
  - Verify no mock data remains in the codebase
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 11. Test end-to-end modal functionality


  - Test complete user flow from clicking "Ver" button to displaying data
  - Verify data filtering works correctly with different date ranges
  - Test modal behavior with no data found scenarios
  - Ensure PDF generation still works with real data
  - _Requirements: 1.1, 1.4, 5.4, 5.5_

- [x] 12. Add performance optimizations





  - Implement efficient database queries with proper indexing considerations
  - Add query optimization for large datasets
  - Implement proper data pagination if needed for large result sets
  - Add caching strategies for frequently accessed data
  - _Requirements: 1.1, 1.3_