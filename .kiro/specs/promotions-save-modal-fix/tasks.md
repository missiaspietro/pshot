# Implementation Plan

- [x] 1. Add SaveConfigurationModal for promotions in reports page


  - Locate the modal rendering section in app/reports/page.tsx (around line 1723)
  - Add the SaveConfigurationModal component for promotions after the survey save modal
  - Pass the correct props: isPromotionsSaveModalOpen, setIsPromotionsSaveModalOpen, handleSavePromotionsConfiguration, isPromotionsNameDuplicate, isSavingPromotions
  - Ensure the modal follows the same pattern as the existing save modals
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3_




- [ ] 2. Test the save button functionality
  - Verify that clicking the "Salvar" button opens the modal
  - Test that the modal allows entering a configuration name
  - Confirm that saving works correctly and closes the modal
  - Verify that the saved configuration appears in the configurations list
  - Test that the button is disabled when no fields are selected
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_