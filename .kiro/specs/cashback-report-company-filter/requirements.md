# Requirements Document

## Introduction

This feature ensures that the cashback report card on the dashboard screen properly filters data by the existing date filters and the logged user's company. Currently, the cashback report may not be consistently applying the company filter based on the `rede_de_loja` field from the `EnvioCashTemTotal` table, and needs to integrate with the existing date filtering mechanism already present on the dashboard.

## Requirements

### Requirement 1

**User Story:** As a logged-in user, I want the cashback report card to show only data from my company, so that I see relevant cashback information for my organization.

#### Acceptance Criteria

1. WHEN a user views the dashboard THEN the cashback report card SHALL filter data by the user's company matching the `Rede_de_loja` field
2. WHEN the user's company is not available THEN the cashback report card SHALL display no data or an appropriate message
3. WHEN the cashback data is loaded THEN the system SHALL use the logged user's `empresa` field to match against `Rede_de_loja`

### Requirement 2

**User Story:** As a user filtering data by date ranges, I want the cashback report card to respect the same date filters, so that all dashboard data is consistent.

#### Acceptance Criteria

1. WHEN the user selects a period filter (1, 2, or 3 months) THEN the cashback report card SHALL filter data by that period
2. WHEN the user sets custom start and end dates THEN the cashback report card SHALL filter data by those specific dates
3. WHEN date filters are cleared THEN the cashback report card SHALL revert to the default period filtering
4. WHEN date filters change THEN the cashback report card SHALL automatically refresh with new filtered data

### Requirement 3

**User Story:** As a user, I want the cashback report card to use the existing date filter controls, so that I don't see duplicate date pickers on the screen.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the cashback report card SHALL use the existing `cashbackStartDate` and `cashbackEndDate` state variables
2. WHEN the dashboard loads THEN the cashback report card SHALL use the existing `periodoSelecionado` state variable
3. WHEN the dashboard loads THEN the cashback report card SHALL NOT create additional date picker controls
4. WHEN the existing date filters change THEN the cashback report card SHALL respond to those changes automatically