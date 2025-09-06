# Implementation Plan

- [x] 1. Create dashboard counters service


  - Create new service file `lib/dashboard-counters-service.ts`
  - Implement `getPesquisasEnviadasCount()` function to query pesquisas_enviadas table
  - Implement `getPromocoesCount()` function to query promocoes table with correct field names
  - Add proper error handling and return 0 on failures
  - _Requirements: 1.2, 2.2, 3.2_









- [ ] 2. Update dashboard card title
  - Modify `statsData` array in `app/dashboard/page.tsx`



  - Change title from "Relatório de Pesquisas" to "Pesquisas" for index 1

  - _Requirements: 1.1_


- [ ] 3. Implement pesquisas counter integration
  - Add new state variable `pesquisasEnviadasCount` in dashboard component





  - Create function to fetch pesquisas count using new service
  - Update card value to use real pesquisas count instead of respostasPesquisasStats
  - Add loading state handling for pesquisas counter
  - _Requirements: 1.2, 1.3, 1.4, 1.5_




- [ ] 4. Update promoções counter implementation
  - Modify existing `fetchPromocaoCount` function to use new service
  - Ensure it queries the correct `promocoes` table with `Rede` field filter


  - Maintain existing error handling and loading states
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5. Integrate user empresa filtering
  - Ensure both counter functions receive `user.empresa` parameter


  - Add validation to check if empresa field is available
  - Handle cases where user or empresa is undefined
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Update dashboard data loading logic
  - Modify the main data loading useEffect to call new counter functions



  - Execute both counter queries in parallel for better performance
  - Update state management to handle new pesquisas counter
  - Ensure proper error handling and loading states
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7. Add unit tests for counter service
  - Create test file `__tests__/dashboard-counters-service.test.ts`
  - Test getPesquisasEnviadasCount with valid empresa parameter
  - Test getPromocoesCount with valid empresa parameter
  - Test error handling scenarios for both functions
  - Test behavior with invalid/empty empresa values
  - _Requirements: All requirements validation_

- [ ] 8. Add integration tests for dashboard counters
  - Create test file `__tests__/dashboard-counters-integration.test.tsx`
  - Test dashboard component renders correct counter values
  - Test loading states and error states for both counters
  - Test user authentication integration affects counter values
  - _Requirements: All requirements validation_