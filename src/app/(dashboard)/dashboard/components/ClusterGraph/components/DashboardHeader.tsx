import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import ClusterGraphControls from '../ClusterGraphControls';
import ClusterGraphFilters from '../ClusterGraphFilters';
import FilterActions from './FilterActions';

interface DashboardHeaderProps {
  currentStep: number;
  totalSteps: number;
  getStepTitle: () => string;
  getCurrentSummary: () => string;
  selectedProduct: string[];
  setSelectedProduct: Dispatch<SetStateAction<string[]>>;
  selectedCountry: string[];
  setSelectedCountry: Dispatch<SetStateAction<string[]>>;
  selectedQuarter: string;
  setSelectedQuarter: (value: string) => void;
  selectedYear: string;
  setSelectedYear: (value: string) => void;
  products: string[];
  countries: string[];
  quarters: string[];
  years: string[];
  productDropdownOpen: boolean;
  setProductDropdownOpen: (open: boolean) => void;
  countryDropdownOpen: boolean;
  setCountryDropdownOpen: (open: boolean) => void;
  quarterDropdownOpen: boolean;
  setQuarterDropdownOpen: (open: boolean) => void;
  yearDropdownOpen: boolean;
  setYearDropdownOpen: (open: boolean) => void;
  loading: boolean;
  closeAllDropdowns: () => void;
  hasAppliedFilters: boolean;
  hasSelectedFilters: boolean;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentStep,
  totalSteps,
  getStepTitle,
  getCurrentSummary,
  selectedProduct,
  setSelectedProduct,
  selectedCountry,
  setSelectedCountry,
  selectedQuarter,
  setSelectedQuarter,
  selectedYear,
  setSelectedYear,
  products,
  countries,
  quarters,
  years,
  productDropdownOpen,
  setProductDropdownOpen,
  countryDropdownOpen,
  setCountryDropdownOpen,
  quarterDropdownOpen,
  setQuarterDropdownOpen,
  yearDropdownOpen,
  setYearDropdownOpen,
  loading,
  closeAllDropdowns,
  hasAppliedFilters,
  hasSelectedFilters,
  onApplyFilters,
  onResetFilters
}) => {
  return (
    <div className="flex justify-between items-start">
      <ClusterGraphControls
        currentStep={currentStep}
        totalSteps={totalSteps}
        getStepTitle={getStepTitle}
        getCurrentSummary={getCurrentSummary}
      />

      <div className="flex items-center gap-2">
        <ClusterGraphFilters
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedQuarter={selectedQuarter}
          setSelectedQuarter={setSelectedQuarter}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          products={products}
          countries={countries}
          quarters={quarters}
          years={years}
          productDropdownOpen={productDropdownOpen}
          setProductDropdownOpen={setProductDropdownOpen}
          countryDropdownOpen={countryDropdownOpen}
          setCountryDropdownOpen={setCountryDropdownOpen}
          quarterDropdownOpen={quarterDropdownOpen}
          setQuarterDropdownOpen={setQuarterDropdownOpen}
          yearDropdownOpen={yearDropdownOpen}
          setYearDropdownOpen={setYearDropdownOpen}
          loading={loading}
          closeAllDropdowns={closeAllDropdowns}
        />
        
        <FilterActions
          hasAppliedFilters={hasAppliedFilters}
          hasSelectedFilters={hasSelectedFilters}
          loading={loading}
          onApplyFilters={onApplyFilters}
          onResetFilters={onResetFilters}
        />
      </div>
    </div>
  );
};

export default DashboardHeader;