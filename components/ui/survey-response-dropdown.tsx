"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"

interface SurveyResponseDropdownProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  showActiveIndicator?: boolean
}

const responseOptions = [
  { value: "", label: "Todas" },
  { value: "1", label: "Apenas ótimas" },
  { value: "2", label: "Apenas boas" },
  { value: "3", label: "Apenas regulares" },
  { value: "4", label: "Apenas péssimas" }
]

export function SurveyResponseDropdown({ 
  value, 
  onChange, 
  disabled = false,
  showActiveIndicator = true
}: SurveyResponseDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = responseOptions.find(option => option.value === value) || responseOptions[0]
  const isFiltered = value !== "" && showActiveIndicator

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative min-w-[120px] max-w-[200px] h-8 px-2 text-left bg-white border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
          transition-all duration-200 ease-in-out overflow-hidden
          ${disabled 
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200' 
            : 'hover:border-gray-400 cursor-pointer'
          }
          ${isOpen ? 'ring-2 ring-purple-500 border-purple-500' : 'border-gray-300'}
          ${isFiltered ? 'border-purple-400 bg-purple-50' : ''}
        `}
      >
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {isFiltered && (
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
            )}
            <span 
              className={`text-xs truncate ${
                disabled ? 'text-gray-400' : 
                isFiltered ? 'text-purple-700 font-medium' : 'text-gray-600'
              }`}
              title={selectedOption.label}
            >
              {selectedOption.label}
            </span>
          </div>
          <ChevronDown 
            className={`
              h-3 w-3 transition-transform duration-200 flex-shrink-0 ml-1
              ${disabled ? 'text-gray-400' : 
                isFiltered ? 'text-purple-500' : 'text-gray-500'}
              ${isOpen ? 'transform rotate-180' : ''}
            `} 
          />
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg min-w-[160px]">
          <div className="py-1 max-h-48 overflow-auto">
            {responseOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-3 py-2 text-left text-xs transition-colors duration-150
                  hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                  ${value === option.value 
                    ? 'bg-purple-50 text-purple-700' 
                    : 'text-gray-600'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="whitespace-nowrap">{option.label}</span>
                  {value === option.value && (
                    <Check className="h-3 w-3 text-purple-600 ml-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}