'use client';
import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { ClusterGraphFiltersProps } from "./types";
import { useAuth } from "@/context/auth";

export default function ClusterGraphFilters({
  selectedProduct,
  setSelectedProduct,
  selectedCountry,
  setSelectedCountry,
  selectedQuarter,
  setSelectedQuarter,
  selectedYear,
  setSelectedYear,
  countries,
  quarters,
  products,
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
}: ClusterGraphFiltersProps) {
  const { user, userProduct } = useAuth();

  // Preselect product if therapeutic specialist
  useEffect(() => {
    if (userProduct) {
      setSelectedProduct(userProduct);
    }
  }, [userProduct]);

  const handleDropdownToggle = (dropdown: string) => {
    if (loading) return;
    closeAllDropdowns();
    switch (dropdown) {
      case 'product': setProductDropdownOpen(!productDropdownOpen); break;
      case 'country': setCountryDropdownOpen(!countryDropdownOpen); break;
      case 'quarter': setQuarterDropdownOpen(!quarterDropdownOpen); break;
      case 'year': setYearDropdownOpen(!yearDropdownOpen); break;
    }
  };

  const handleSelection = (type: string, value: string) => {
    if (loading) return;
    switch (type) {
      case 'product': setSelectedProduct(value); setProductDropdownOpen(false); break;
      case 'country': setSelectedCountry(value); setCountryDropdownOpen(false); break;
      case 'quarter': setSelectedQuarter(value); setQuarterDropdownOpen(false); break;
      case 'year': setSelectedYear(value); setYearDropdownOpen(false); break;
    }
  };

  const getButtonClasses = (isOpen: boolean) => {
    const base = "flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded-md transition-colors";
    const interactive = loading ? "cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-700" : "hover:bg-gray-50 dark:hover:bg-gray-600";
    return `${base} ${interactive}`;
  };

  // Determine which filters to show based on user role
  const shouldShowProductFilter = () => {
    // Show product filter for Global Admin and Global Head
    // Hide for Therapeutic Specialist (they have a specific product)
    // Show for Country Head
    return user?.role !== 'Therapeutic Specialist';
  };

  const shouldShowCountryFilter = () => {
    // Show country filter for Global Admin and Global Head
    // Show for Therapeutic Specialist (they can access all countries)
    // Hide for Country Head (they have specific accessible countries)
    return user?.role !== 'Country Head';
  };

  return (
    <div className="justify-center right-10 z-10 flex flex-wrap gap-2 mt-5">
      {/* Product Filter */}
      {shouldShowProductFilter() && (
        <div className="relative">
          <button onClick={() => handleDropdownToggle('product')} disabled={loading} className={getButtonClasses(productDropdownOpen)}>
            <span className={selectedProduct !== "Product" ? "font-medium" : ""}>{selectedProduct}</span>
            <ChevronDown size={16} className={loading ? "opacity-50" : ""} />
          </button>
          {productDropdownOpen && !loading && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20">
              <button onClick={() => handleSelection('product', 'Product')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">All Products</button>
              {products.map((product) => (
                <button key={product} onClick={() => handleSelection('product', product)} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">{product}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Country Filter */}
      {shouldShowCountryFilter() && (
        <div className="relative">
          <button onClick={() => handleDropdownToggle('country')} disabled={loading} className={getButtonClasses(countryDropdownOpen)}>
            <span className={selectedCountry !== "Country" ? "font-medium" : ""}>{selectedCountry}</span>
            <ChevronDown size={16} className={loading ? "opacity-50" : ""} />
          </button>
          {countryDropdownOpen && !loading && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20">
              <button onClick={() => handleSelection('country', 'Country')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">All Countries</button>
              {countries.map((country) => (
                <button key={country} onClick={() => handleSelection('country', country)} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">{country}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quarter Filter */}
      <div className="relative">
        <button onClick={() => handleDropdownToggle('quarter')} disabled={loading} className={getButtonClasses(quarterDropdownOpen)}>
          <span className={selectedQuarter !== "Quarter" ? "font-medium" : ""}>{selectedQuarter}</span>
          <ChevronDown size={16} className={loading ? "opacity-50" : ""} />
        </button>
        {quarterDropdownOpen && !loading && (
          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20">
            <button onClick={() => handleSelection('quarter', 'Quarter')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">All Quarters</button>
            {quarters.map((quarter) => (
              <button key={quarter} onClick={() => handleSelection('quarter', quarter)} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">{quarter}</button>
            ))}
          </div>
        )}
      </div>

      {/* Year Filter */}
      <div className="relative">
        <button onClick={() => handleDropdownToggle('year')} disabled={loading} className={getButtonClasses(yearDropdownOpen)}>
          <span className={selectedYear !== "Year" ? "font-medium" : ""}>{selectedYear}</span>
          <ChevronDown size={16} className={loading ? "opacity-50" : ""} />
        </button>
        {yearDropdownOpen && !loading && (
          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20">
            <button onClick={() => handleSelection('year', 'Year')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">All Years</button>
            {years.map((year) => (
              <button key={year} onClick={() => handleSelection('year', year)} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">{year}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}