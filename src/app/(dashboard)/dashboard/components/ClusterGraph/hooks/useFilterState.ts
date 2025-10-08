import { useState } from 'react';

export const useFilterState = () => {
  const [selectedProduct, setSelectedProduct] = useState("Product");
  const [selectedCountry, setSelectedCountry] = useState("Country");
  const [selectedQuarter, setSelectedQuarter] = useState("Quarter");
  const [selectedYear, setSelectedYear] = useState("Year");
  
  const [appliedProduct, setAppliedProduct] = useState("Product");
  const [appliedCountry, setAppliedCountry] = useState("Country");
  const [appliedQuarter, setAppliedQuarter] = useState("Quarter");
  const [appliedYear, setAppliedYear] = useState("Year");
  
  // Dropdown states
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [quarterDropdownOpen, setQuarterDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  // Check if any filters are selected (not yet applied)
  const hasSelectedFilters = () => {
    return selectedProduct !== "Product" || 
           selectedCountry !== "Country" || 
           selectedQuarter !== "Quarter" || 
           selectedYear !== "Year";
  };

  // Check if any filters are currently applied
  const hasAppliedFilters = () => {
    return appliedProduct !== "Product" || 
           appliedCountry !== "Country" || 
           appliedQuarter !== "Quarter" || 
           appliedYear !== "Year";
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedProduct("Product");
    setSelectedCountry("Country");
    setSelectedQuarter("Quarter");
    setSelectedYear("Year");
    setAppliedProduct("Product");
    setAppliedCountry("Country");
    setAppliedQuarter("Quarter");
    setAppliedYear("Year");
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
    appliedProduct,
    setAppliedProduct,
    appliedCountry,
    setAppliedCountry,
    appliedQuarter,
    setAppliedQuarter,
    appliedYear,
    setAppliedYear,
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