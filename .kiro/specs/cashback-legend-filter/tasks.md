# Implementation Plan

- [ ] 1. Create memoized filtered stores calculation
  - Add useMemo hook to calculate lojasComDados from cashbackTemTotalLojas and cashbackTemTotalData
  - Implement filtering logic to include only stores with data (value > 0 in any month)
  - Ensure the memoization dependencies are correctly set to prevent unnecessary recalculations
  - _Requirements: 1.1, 1.2, 3.2_

- [ ] 2. Update legend rendering to use filtered stores
  - Modify the legend rendering logic to use lojasComDados instead of cashbackTemTotalLojas
  - Ensure the slice(0, 10) operation works correctly with the filtered list
  - Maintain existing hover interactions and styling for legend items
  - _Requirements: 1.1, 1.3_

- [ ] 3. Fix "Ver mais" button visibility logic
  - Update the conditional rendering of "Ver mais" button to use lojasComDados.length > 10
  - Ensure the button is hidden when there are 10 or fewer stores with data
  - Maintain existing button functionality and styling when it is visible
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 4. Test legend filtering functionality
  - Write test cases to verify only stores with data appear in legend
  - Test scenarios with different numbers of stores (0, 5, 10, 15+ stores with data)
  - Verify hover interactions still work correctly with filtered legend
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 5. Test "Ver mais" button behavior
  - Test button visibility with various store counts (≤10 and >10 stores with data)
  - Verify button functionality when visible (expand/collapse behavior)
  - Test edge cases where store count changes dynamically
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 6. Validate data loading and backend integration
  - Confirm that getCashbackData continues to fetch all stores from database
  - Verify that filtering only affects UI display, not data fetching
  - Test that other components using store data are not affected
  - _Requirements: 3.1, 3.2, 3.3_