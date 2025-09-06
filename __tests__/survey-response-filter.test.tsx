import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SurveyResponseDropdown } from '@/components/ui/survey-response-dropdown'

describe('SurveyResponseDropdown', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  test('maintains fixed height with long text', () => {
    render(
      <SurveyResponseDropdown
        value="2"
        onChange={mockOnChange}
      />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-8') // Fixed height class
  })

  test('expands horizontally when needed', () => {
    render(
      <SurveyResponseDropdown
        value="3"
        onChange={mockOnChange}
      />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('min-w-[120px]')
    expect(button).toHaveClass('max-w-[200px]')
  })

  test('shows active indicator when filtered', () => {
    render(
      <SurveyResponseDropdown
        value="1"
        onChange={mockOnChange}
        showActiveIndicator={true}
      />
    )

    // Should show purple dot indicator
    const indicator = document.querySelector('.bg-purple-500')
    expect(indicator).toBeInTheDocument()
  })

  test('does not show indicator when value is empty', () => {
    render(
      <SurveyResponseDropdown
        value=""
        onChange={mockOnChange}
        showActiveIndicator={true}
      />
    )

    // Should not show purple dot indicator
    const indicator = document.querySelector('.bg-purple-500')
    expect(indicator).not.toBeInTheDocument()
  })

  test('truncates very long text with tooltip', () => {
    render(
      <SurveyResponseDropdown
        value="2"
        onChange={mockOnChange}
      />
    )

    const textSpan = screen.getByText('Apenas boas')
    expect(textSpan).toHaveClass('truncate')
    expect(textSpan).toHaveAttribute('title', 'Apenas boas')
  })

  test('calls onChange when option is selected', async () => {
    render(
      <SurveyResponseDropdown
        value=""
        onChange={mockOnChange}
      />
    )

    // Open dropdown
    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Select "Apenas ótimas"
    const option = screen.getByText('Apenas ótimas')
    fireEvent.click(option)

    expect(mockOnChange).toHaveBeenCalledWith('1')
  })

  test('shows all options when opened', async () => {
    render(
      <SurveyResponseDropdown
        value=""
        onChange={mockOnChange}
      />
    )

    // Open dropdown
    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Check all options are present
    expect(screen.getByText('Todas')).toBeInTheDocument()
    expect(screen.getByText('Apenas ótimas')).toBeInTheDocument()
    expect(screen.getByText('Apenas boas')).toBeInTheDocument()
    expect(screen.getByText('Apenas regulares')).toBeInTheDocument()
    expect(screen.getByText('Apenas péssimas')).toBeInTheDocument()
  })

  test('closes dropdown when option is selected', async () => {
    render(
      <SurveyResponseDropdown
        value=""
        onChange={mockOnChange}
      />
    )

    // Open dropdown
    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Select option
    const option = screen.getByText('Apenas boas')
    fireEvent.click(option)

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByText('Apenas ótimas')).not.toBeInTheDocument()
    })
  })

  test('is disabled when disabled prop is true', () => {
    render(
      <SurveyResponseDropdown
        value=""
        onChange={mockOnChange}
        disabled={true}
      />
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('cursor-not-allowed')
  })
})