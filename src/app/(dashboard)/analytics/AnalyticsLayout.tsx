"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext, useCallback, useMemo } from "react"
import { ChevronDown, Check } from "lucide-react"
import { useAuth } from "@/context/auth"

interface FilterState {
  product: string[]
  country: string[]
  quarter: string[]
  year: string[]
}

interface Country {
  code: string
  name: string
}

interface FilterContextType {
  filters: FilterState
  appliedFilters: FilterState
  updateFilter: (key: keyof FilterState, value: string) => void
  applyFilters: () => void
  resetFilters: () => void
  isFiltering: boolean
  hasActiveFilters: boolean
  hasUnappliedChanges: boolean
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export const useFilters = () => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider")
  }
  return context
}

const MultiSelectDropdown = ({
  label,
  options,
  selectedValues,
  onSelectionChange,
  disabled = false,
  loading = false,
}: {
  label: string
  options: { value: string; label: string }[]
  selectedValues: string[]
  onSelectionChange: (value: string) => void
  disabled?: boolean
  loading?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return label
    }
    if (selectedValues.length === 1) {
      const option = options.find((opt) => opt.value === selectedValues[0])
      return option?.label || selectedValues[0]
    }
    return `${selectedValues.length} selected`
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        className={`appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px] text-left ${
          disabled || loading ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400"
        }`}
        disabled={disabled || loading}
      >
        <span className={selectedValues.length === 0 ? "text-gray-500" : "text-gray-900"}>
          {loading ? "Loading..." : getDisplayText()}
        </span>
        <ChevronDown
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && !disabled && !loading && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onSelectionChange(option.value)
                }}
                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-center w-4 h-4 mr-3">
                  {selectedValues.includes(option.value) && <Check className="h-3 w-3 text-blue-600" />}
                </div>
                <span className="text-sm text-gray-900">{option.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export const AnalyticsFilters = () => {
  const { filters, updateFilter, applyFilters, resetFilters, isFiltering, hasActiveFilters, hasUnappliedChanges } =
    useFilters()
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const { user, userProduct } = useAuth()

  const products = useMemo(
    () => [
      { value: "Respilin", label: "Respilin" },
      { value: "Betacenib", label: "Betacenib" },
      { value: "Cetaprofen", label: "Cetaprofen" },
    ],
    [],
  )

  const quarters = useMemo(
    () => [
      { value: "Q1", label: "Q1" },
      { value: "Q2", label: "Q2" },
      { value: "Q3", label: "Q3" },
      { value: "Q4", label: "Q4" },
    ],
    [],
  )

  const years = useMemo(
    () => [
      { value: "2024", label: "2024" },
      { value: "2025", label: "2025" },
    ],
    [],
  )

  // Determine which filters to show based on user role
  const shouldShowProductFilter = () => {
    // Show product filter for all users, but data will be filtered automatically
    return true;
  };

  const shouldShowCountryFilter = () => {
    // Show country filter for all users, but data will be filtered automatically
    return true;
  };

  // Get filter labels with role-based context
  const getProductFilterLabel = () => {
    if (user?.role === 'THERAPEUTIC_SPECIALIST') {
      return `Product (Auto-filtered: ${userProduct || user.therapeutic_area})`
    }
    return "Product"
  }

  const getCountryFilterLabel = () => {
    if (user?.role === 'COUNTRY_HEAD') {
      return `Country (Auto-filtered: ${user.accessible_countries?.length || 0} assigned)`
    }
    return "Country"
  }

  const fetchCountries = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        const fallbackCountries = [
          { code: "US", name: "United States" },
          { code: "CA", name: "Canada" },
          { code: "UK", name: "United Kingdom" },
          { code: "DE", name: "Germany" },
          { code: "FR", name: "France" },
        ]
        setCountries(fallbackCountries)
        setLoadingCountries(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/countries/`, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        if (userData.data && userData.data.results && Array.isArray(userData.data.results)) {
          let countryList = userData.data.results.map((country: any) => ({
            code: country.code || country.country_code || country.id,
            name: country.name || country.country_name || country.title,
          }))
          
          // Filter countries based on user role and accessible countries
          if (user?.role === 'COUNTRY_HEAD' && user.accessible_countries) {
            countryList = countryList.filter((country: Country) => 
              user.accessible_countries.includes(country.name)
            )
          }
          
          setCountries(countryList)
        } else {
          const fallbackCountries = [
            { code: "US", name: "United States" },
            { code: "CA", name: "Canada" },
          ]
          setCountries(fallbackCountries)
        }
      } else {
        const fallbackCountries = [
          { code: "US", name: "United States" },
          { code: "CA", name: "Canada" },
        ]
        setCountries(fallbackCountries)
      }
    } catch (error) {
      const fallbackCountries = [
        { code: "US", name: "United States" },
        { code: "CA", name: "Canada" },
      ]
      setCountries(fallbackCountries)
    } finally {
      setLoadingCountries(false)
    }
  }, [user])

  useEffect(() => {
    fetchCountries()
  }, [fetchCountries])

  // Preselect product if therapeutic specialist
  useEffect(() => {
    if (userProduct && shouldShowProductFilter()) {
      // Set the user's product as the default selection
      if (!filters.product.includes(userProduct)) {
        updateFilter("product", userProduct)
      }
    }
  }, [userProduct, shouldShowProductFilter])

  // Show warning if user has no accessible countries (for Country Head)
  const showNoCountriesWarning = useMemo(() => {
    return user?.role === 'COUNTRY_HEAD' && 
           (!user.accessible_countries || user.accessible_countries.length === 0)
  }, [user])

  // Show warning if user has no therapeutic area (for Therapeutic Specialist)
  const showNoTherapeuticAreaWarning = useMemo(() => {
    return user?.role === 'THERAPEUTIC_SPECIALIST' && !user.therapeutic_area
  }, [user])

  const countryOptions = useMemo(
    () =>
      countries.map((country) => ({
        value: country.name, // Send country name instead of code
        label: country.name,
      })),
    [countries],
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Warning messages for role-based limitations */}
      {showNoCountriesWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Limited Data Access
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>As a Country Head, you don't have any assigned countries. Your analytics will show no data until countries are assigned by your administrator.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNoTherapeuticAreaWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Limited Data Access
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>As a Therapeutic Specialist, you don't have an assigned therapeutic area. Your analytics will show no data until a therapeutic area is assigned by your administrator.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information about automatic filtering */}
      {(user?.role === 'THERAPEUTIC_SPECIALIST' || user?.role === 'COUNTRY_HEAD') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Automatic Data Filtering
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  {user?.role === 'THERAPEUTIC_SPECIALIST' && 
                    `Your analytics are automatically filtered to show only data for your assigned product (${userProduct || user.therapeutic_area}).`
                  }
                  {user?.role === 'COUNTRY_HEAD' && 
                    `Your analytics are automatically filtered to show only data for your assigned countries (${user.accessible_countries?.length || 0} countries).`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Product Filter - Only show if user role allows it */}
        {shouldShowProductFilter() && (
          <MultiSelectDropdown
            label={getProductFilterLabel()}
            options={products}
            selectedValues={filters.product}
            onSelectionChange={(value) => updateFilter("product", value)}
            disabled={isFiltering}
          />
        )}

        {/* Country Filter - Only show if user role allows it */}
        {shouldShowCountryFilter() && (
          <MultiSelectDropdown
            label={getCountryFilterLabel()}
            options={countryOptions}
            selectedValues={filters.country}
            onSelectionChange={(value) => updateFilter("country", value)}
            disabled={isFiltering}
            loading={loadingCountries}
          />
        )}

        <MultiSelectDropdown
          label="Quarter"
          options={quarters}
          selectedValues={filters.quarter}
          onSelectionChange={(value) => updateFilter("quarter", value)}
          disabled={isFiltering}
        />

        <MultiSelectDropdown
          label="Year"
          options={years}
          selectedValues={filters.year}
          onSelectionChange={(value) => updateFilter("year", value)}
          disabled={isFiltering}
        />

        {!hasActiveFilters ? (
          <button
            onClick={applyFilters}
            disabled={!hasUnappliedChanges || isFiltering}
            className={`px-6 py-2 rounded-lg text-sm transition-colors ${
              !hasUnappliedChanges || isFiltering
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isFiltering ? "Filtering..." : "Filter"}
          </button>
        ) : (
          <button
            onClick={resetFilters}
            disabled={isFiltering}
            className={`px-6 py-2 rounded-lg text-sm transition-colors ${
              isFiltering ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

// Analytics Layout Wrapper
interface AnalyticsLayoutProps {
  children: React.ReactNode
  title: string
  showFilters?: boolean
}

export const AnalyticsLayout: React.FC<AnalyticsLayoutProps> = ({ children, title, showFilters = true }) => {
  const [filters, setFilters] = useState<FilterState>({
    product: [],
    country: [],
    quarter: [],
    year: [],
  })

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    product: [],
    country: [],
    quarter: [],
    year: [],
  })

  const [isFiltering, setIsFiltering] = useState(false)
  const { user, userProduct } = useAuth()

  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[key]
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value]

      return { ...prev, [key]: newValues }
    })
  }, [])

  const applyFilters = useCallback(async () => {
    setIsFiltering(true)
    setAppliedFilters(filters)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsFiltering(false)
  }, [filters])

  const resetFilters = useCallback(() => {
    const emptyFilters = {
      product: [],
      country: [],
      quarter: [],
      year: [],
    }
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }, [])

  const hasActiveFilters = useMemo(() => {
    return Object.values(appliedFilters).some((arr) => arr.length > 0)
  }, [appliedFilters])

  const hasUnappliedChanges = useMemo(() => {
    return JSON.stringify(filters) !== JSON.stringify(appliedFilters)
  }, [filters, appliedFilters])

  const filterContextValue: FilterContextType = useMemo(
    () => ({
      filters,
      appliedFilters,
      updateFilter,
      applyFilters,
      resetFilters,
      isFiltering,
      hasActiveFilters,
      hasUnappliedChanges,
    }),
    [
      filters,
      appliedFilters,
      updateFilter,
      applyFilters,
      resetFilters,
      isFiltering,
      hasActiveFilters,
      hasUnappliedChanges,
    ],
  )

  return (
    <FilterContext.Provider value={filterContextValue}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header + Filters Row */}
          <div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {/* Role-based access information */}
              {user && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Role:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                      {user.role.replace('_', ' ')}
                    </span>
                  </span>
                  {user.role === 'THERAPEUTIC_SPECIALIST' && user.therapeutic_area && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Product:</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                        {userProduct || user.therapeutic_area}
                      </span>
                    </span>
                  )}
                  {user.role === 'COUNTRY_HEAD' && user.accessible_countries && user.accessible_countries.length > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Countries:</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs">
                        {user.accessible_countries.length} assigned
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>
            {showFilters && <AnalyticsFilters />}
          </div>

          {/* Content */}
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </FilterContext.Provider>
  )
}
