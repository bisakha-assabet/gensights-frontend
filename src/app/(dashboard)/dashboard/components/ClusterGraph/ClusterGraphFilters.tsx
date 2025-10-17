"use client";
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
  // cluster count controls (optional)
  selectedClusterCount,
  setSelectedClusterCount,
  selectedClusterCountEnabled,
  setSelectedClusterCountEnabled,
}: ClusterGraphFiltersProps) {
  const { user, userProduct } = useAuth();

  // Preselect product if therapeutic specialist
  useEffect(() => {
    if (userProduct) {
      setSelectedProduct([userProduct]);
    }
  }, [userProduct]);

  const handleDropdownToggle = (dropdown: string) => {
    if (loading) return;
    closeAllDropdowns();
    switch (dropdown) {
      case "product":
        setProductDropdownOpen(!productDropdownOpen);
        break;
      case "country":
        setCountryDropdownOpen(!countryDropdownOpen);
        break;
      case "quarter":
        setQuarterDropdownOpen(!quarterDropdownOpen);
        break;
      case "year":
        setYearDropdownOpen(!yearDropdownOpen);
        break;
    }
  };

  const toggleSelection = (type: "product" | "country", value: string) => {
    if (loading) return;
    const toggle = (arr: string[], v: string) =>
      arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
    switch (type) {
      case "product":
        setSelectedProduct((prev: string[]) => toggle(prev, value));
        break;
      case "country":
        setSelectedCountry((prev: string[]) => toggle(prev, value));
        break;
    }
  };

  const clearSelection = (type: "product" | "country") => {
    if (loading) return;
    switch (type) {
      case "product":
        setSelectedProduct([]);
        break;
      case "country":
        setSelectedCountry([]);
        break;
    }
  };

  const getButtonClasses = (isOpen: boolean) => {
    const base =
      "flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded-md transition-colors";
    const interactive = loading
      ? "cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-700"
      : "hover:bg-gray-50 dark:hover:bg-gray-600";
    return `${base} ${interactive}`;
  };

  // Determine which filters to show based on user role
  const shouldShowProductFilter = () => {
    // Show product filter for Global Admin and Global Head
    // Hide for Therapeutic Specialist (they have a specific product)
    // Show for Country Head
    return user?.role !== "Therapeutic Specialist";
  };

  const shouldShowCountryFilter = () => {
    // Show country filter for Global Admin and Global Head
    // Show for Therapeutic Specialist (they can access all countries)
    // Hide for Country Head (they have specific accessible countries)
    return user?.role !== "Country Head";
  };

  const renderButtonLabel = (placeholder: string, values: string[]) => {
    if (values.length === 0) return placeholder;
    if (values.length === 1) return values[0];
    return `${values.length} selected`;
  };

  return (
    <div className="justify-center right-10 z-10 flex items-center flex-nowrap gap-2 mt-5">
      {/* Product Filter */}
      {shouldShowProductFilter() && (
        <div className="relative">
          <button
            onClick={() => handleDropdownToggle("product")}
            disabled={loading}
            className={getButtonClasses(productDropdownOpen)}
          >
            <span className={selectedProduct.length ? "font-medium" : ""}>
              {renderButtonLabel("Product", selectedProduct)}
            </span>
            <ChevronDown size={16} className={loading ? "opacity-50" : ""} />
          </button>
          {productDropdownOpen && !loading && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20">
              <button
                onClick={() => clearSelection("product")}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                All Products
              </button>
              <div className="max-h-64 overflow-auto py-1">
                {products.map((product) => (
                  <label
                    key={product}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={selectedProduct.includes(product)}
                      onChange={() => toggleSelection("product", product)}
                    />
                    <span className="dark:text-gray-200">{product}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Country Filter */}
      {shouldShowCountryFilter() && (
        <div className="relative">
          <button
            onClick={() => handleDropdownToggle("country")}
            disabled={loading}
            className={getButtonClasses(countryDropdownOpen)}
          >
            <span className={selectedCountry.length ? "font-medium" : ""}>
              {renderButtonLabel("Country", selectedCountry)}
            </span>
            <ChevronDown size={16} className={loading ? "opacity-50" : ""} />
          </button>
          {countryDropdownOpen && !loading && (
            <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20">
              <button
                onClick={() => clearSelection("country")}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                All Countries
              </button>
              <div className="max-h-64 overflow-auto py-1">
                {countries.map((country) => (
                  <label
                    key={country}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={selectedCountry.includes(country)}
                      onChange={() => toggleSelection("country", country)}
                    />
                    <span className="dark:text-gray-200">{country}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quarter Filter */}
      <div className="relative">
        <button
          onClick={() => handleDropdownToggle("quarter")}
          disabled={loading}
          className={getButtonClasses(quarterDropdownOpen)}
        >
          <span className={selectedQuarter !== "Quarter" ? "font-medium" : ""}>
            {selectedQuarter}
          </span>
          <ChevronDown size={16} className={loading ? "opacity-50" : ""} />
        </button>
        {quarterDropdownOpen && !loading && (
          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20">
            <button
              onClick={() => {
                setSelectedQuarter("Quarter");
                setQuarterDropdownOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              All Quarters
            </button>
            {quarters.map((quarter) => (
              <button
                key={quarter}
                onClick={() => {
                  setSelectedQuarter(quarter);
                  setQuarterDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
              >
                {quarter}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Year Filter */}
      <div className="relative">
        <button
          onClick={() => handleDropdownToggle("year")}
          disabled={loading}
          className={getButtonClasses(yearDropdownOpen)}
        >
          <span className={selectedYear !== "Year" ? "font-medium" : ""}>
            {selectedYear}
          </span>
          <ChevronDown size={16} className={loading ? "opacity-50" : ""} />
        </button>
        {yearDropdownOpen && !loading && (
          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20">
            <button
              onClick={() => {
                setSelectedYear("Year");
                setYearDropdownOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              All Years
            </button>
            {years.map((year) => (
              <button
                key={year}
                onClick={() => {
                  setSelectedYear(year);
                  setYearDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Number of clusters toggle + slider */}
      <div className="flex items-center gap-2 px-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={!!selectedClusterCountEnabled}
            onChange={() => {
              if (loading || !setSelectedClusterCountEnabled) return;
              setSelectedClusterCountEnabled(!selectedClusterCountEnabled);
            }}
            disabled={loading}
          />
          <span className="dark:text-gray-200">Clusters</span>
        </label>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min={1}
            max={15}
            value={selectedClusterCount ?? 5}
            onChange={(e) =>
              setSelectedClusterCount &&
              setSelectedClusterCount(Number(e.target.value))
            }
            disabled={loading || !selectedClusterCountEnabled}
            className="w-36"
          />
          <div className="text-sm w-8 text-right">{selectedClusterCount}</div>
        </div>
      </div>
    </div>
  );
}
