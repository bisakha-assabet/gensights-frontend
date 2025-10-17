import { useState } from 'react';

export const useFilterState = () => {
  const [selectedProduct, setSelectedProduct] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState("Quarter");
  const [selectedYear, setSelectedYear] = useState("Year");
  // Cluster count slider state (default value 5, disabled by default)
  const [selectedClusterCount, setSelectedClusterCount] = useState<number>(5);
  const [selectedClusterCountEnabled, setSelectedClusterCountEnabled] = useState<boolean>(false);
  
  const [appliedProduct, setAppliedProduct] = useState<string[]>([]);
  const [appliedCountry, setAppliedCountry] = useState<string[]>([]);
  const [appliedQuarter, setAppliedQuarter] = useState("Quarter");
  const [appliedYear, setAppliedYear] = useState("Year");
  const [appliedClusterCount, setAppliedClusterCount] = useState<number>(5);
  const [appliedClusterCountEnabled, setAppliedClusterCountEnabled] = useState<boolean>(false);
  
  // Dropdown states
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [quarterDropdownOpen, setQuarterDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  // Check if any filters are selected (not yet applied)
  const hasSelectedFilters = () => {
    return selectedProduct.length > 0 || 
      selectedCountry.length > 0 || 
           selectedQuarter !== "Quarter" || 
           selectedYear !== "Year" ||
           selectedClusterCountEnabled;
  };

  // Check if any filters are currently applied
  const hasAppliedFilters = () => {
    return appliedProduct.length > 0 || 
      appliedCountry.length > 0 || 
           appliedQuarter !== "Quarter" || 
           appliedYear !== "Year" ||
           appliedClusterCountEnabled;
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedProduct([]);
    setSelectedCountry([]);
    setSelectedQuarter("Quarter");
    setSelectedYear("Year");
    setSelectedClusterCount(5);
    setSelectedClusterCountEnabled(false);
    setAppliedProduct([]);
    setAppliedCountry([]);
    setAppliedQuarter("Quarter");
    setAppliedYear("Year");
    setAppliedClusterCount(5);
    setAppliedClusterCountEnabled(false);
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setProductDropdownOpen(false);
    setCountryDropdownOpen(false);
    setQuarterDropdownOpen(false);
    setYearDropdownOpen(false);
  };

  return {
    selectedProduct,
    setSelectedProduct,
    selectedCountry,
    setSelectedCountry,
    selectedQuarter,
    setSelectedQuarter,
    selectedYear,
    setSelectedYear,
    selectedClusterCount,
    setSelectedClusterCount,
    selectedClusterCountEnabled,
    setSelectedClusterCountEnabled,
    appliedProduct,
    setAppliedProduct,
    appliedCountry,
    setAppliedCountry,
    appliedQuarter,
    setAppliedQuarter,
    appliedYear,
    setAppliedYear,
    appliedClusterCount,
    appliedClusterCountEnabled,
    setAppliedClusterCount,
    setAppliedClusterCountEnabled,
    productDropdownOpen,
    setProductDropdownOpen,
    countryDropdownOpen,
    setCountryDropdownOpen,
    quarterDropdownOpen,
    setQuarterDropdownOpen,
    yearDropdownOpen,
    setYearDropdownOpen,
    hasSelectedFilters,
    hasAppliedFilters,
    resetFilters,
    closeAllDropdowns
  };
};