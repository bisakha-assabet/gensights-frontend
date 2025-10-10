"use client";

import { useState, useCallback, useRef } from "react";
import type { DataType } from "../types";
import { buildQuery } from "@/app/(dashboard)/dashboard/utils/query";
import { getStoredToken } from "@/context/auth/authUtils";

const mockData: DataType = {
  clusters: [
    {
      cluster_id: 1,
      title: "Drug Safety Analysis",
      summary:
        "Comprehensive analysis of drug safety profiles including adverse events, contraindications, and risk assessments across different patient populations.",
    },
    {
      cluster_id: 2,
      title: "Clinical Efficacy Studies",
      summary:
        "Research focused on drug effectiveness, treatment outcomes, and comparative analysis of therapeutic interventions in clinical settings.",
    },
    {
      cluster_id: 3,
      title: "Regulatory Compliance",
      summary:
        "Studies related to regulatory requirements, submission processes, and compliance with international pharmaceutical standards.",
    },
    {
      cluster_id: 4,
      title: "Patient Access Programs",
      summary:
        "Research on patient access initiatives, affordability programs, and healthcare accessibility across different demographics.",
    },
    {
      cluster_id: 5,
      title: "Drug Interactions Research",
      summary:
        "Investigation of drug-drug interactions, contraindications, and polypharmacy effects in various patient populations.",
    },
  ],
  questions: [
    {
      clusters: [1],
      question: "Adverse event reporting for Drug X",
      country_code: "US",
      case_created_date: "2024-01-15",
      product: "Drug X",
      case_no: "MOCK-001",
    },
    {
      clusters: [1, 2],
      question: "Safety profile comparison",
      country_code: "CA",
      case_created_date: "2024-01-20",
      product: "Drug Y",
      case_no: "MOCK-002",
    },
    {
      clusters: [2, 3],
      question: "Efficacy in elderly patients",
      country_code: "UK",
      case_created_date: "2024-02-01",
      product: "Drug Z",
      case_no: "MOCK-003",
    },
    {
      clusters: [3, 4],
      question: "Regulatory submission timeline",
      country_code: "DE",
      case_created_date: "2024-02-10",
      product: "Drug A",
      case_no: "MOCK-004",
    },
    {
      clusters: [4],
      question: "Patient assistance program effectiveness",
      country_code: "FR",
      case_created_date: "2024-02-15",
      product: "Drug B",
      case_no: "MOCK-005",
    },
    {
      clusters: [5],
      question: "Drug interaction with common medications",
      country_code: "IT",
      case_created_date: "2024-02-20",
      product: "Drug C",
      case_no: "MOCK-006",
    },
    {
      clusters: [1, 5],
      question: "Safety concerns with polypharmacy",
      country_code: "ES",
      case_created_date: "2024-03-01",
      product: "Drug D",
      case_no: "MOCK-007",
    },
  ],
};

// Helper function to get authenticated headers
const getAuthHeaders = (deviceUuid?: string) => {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (deviceUuid) {
    headers["Device"] = deviceUuid;
  }

  return headers;
};

export const useDataManagement = (deviceUuid?: string) => {
  const [data, setData] = useState<DataType | null>(null);
  const [allData, setAllData] = useState<DataType | null>(null);
  const [availableOptions, setAvailableOptions] = useState<{
    products: string[];
    countries: string[];
    quarters: string[];
    years: string[];
  }>({
    products: [],
    countries: [],
    quarters: [],
    years: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitialFetchRef = useRef(false);

  // Fetch complete dataset for filter options calculation
  const fetchAllData = useCallback(async () => {
    if (isInitialFetchRef.current) {
      return;
    }
    isInitialFetchRef.current = true;
    try {
      const url = `${process.env.NEXT_PUBLIC_MEDGENTICS_API_BASE_URL}/cluster/get-clusters`;

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(deviceUuid),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Authentication required. Please log in again.");
        }
        throw new Error("Failed to fetch complete data");
      }

      const result = await response.json();

      console.log("Complete dataset fetched:", result);
      setAllData(result as DataType);
      setData(result as DataType);
    } catch (err) {
      console.error("Error fetching complete data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);

      // Only fallback to mock data in development or if it's not an auth error
      if (!errorMessage.includes("Authentication")) {
        setAllData(mockData);
        setData(mockData);
      }
    }
  }, [deviceUuid]);

  // Calculate available filter options based on current selections
  const updateAvailableOptions = (
    selectedProduct: string[],
    selectedCountry: string[],
    selectedQuarter: string,
    selectedYear: string
  ) => {
    if (!allData) return;

    console.log("=== UPDATING AVAILABLE OPTIONS ===");
    console.log("Current selections:", {
      selectedProduct,
      selectedCountry,
      selectedQuarter,
      selectedYear,
    });

    const tempFilters = {
      product: selectedProduct.length ? selectedProduct : undefined,
      country: selectedCountry.length ? selectedCountry : undefined,
      quarter: selectedQuarter !== "Quarter" ? selectedQuarter : undefined,
      year: selectedYear !== "Year" ? selectedYear : undefined,
    } as {
      product?: string[];
      country?: string[];
      quarter?: string; // single selection
      year?: string;    // single selection
    };

    let questionsForProducts = [...allData.questions];
    if (tempFilters.country) {
      questionsForProducts = questionsForProducts.filter(
        (q) => tempFilters.country!.includes(q.country_code)
      );
    }
    if (tempFilters.quarter) {
      const quarterNumber = Number.parseInt(tempFilters.quarter.replace("Q", ""));
      questionsForProducts = questionsForProducts.filter((q) => {
        const date = new Date(q.case_created_date);
        const questionQuarter = Math.floor(date.getMonth() / 3) + 1;
        return questionQuarter === quarterNumber;
      });
    }
    if (tempFilters.year) {
      questionsForProducts = questionsForProducts.filter((q) => {
        const date = new Date(q.case_created_date);
        return date.getFullYear().toString() === tempFilters.year;
      });
    }
    const availableProducts = Array.from(
      new Set(questionsForProducts.map((q) => q.product).filter(Boolean))
    );

    let questionsForCountries = [...allData.questions];
    if (tempFilters.product) {
      questionsForCountries = questionsForCountries.filter(
        (q) => tempFilters.product!.includes(q.product)
      );
    }
    if (tempFilters.quarter) {
      const quarterNumber = Number.parseInt(tempFilters.quarter.replace("Q", ""));
      questionsForCountries = questionsForCountries.filter((q) => {
        const date = new Date(q.case_created_date);
        const questionQuarter = Math.floor(date.getMonth() / 3) + 1;
        return questionQuarter === quarterNumber;
      });
    }
    if (tempFilters.year) {
      questionsForCountries = questionsForCountries.filter((q) => {
        const date = new Date(q.case_created_date);
        return date.getFullYear().toString() === tempFilters.year;
      });
    }
    const availableCountries = Array.from(
      new Set(questionsForCountries.map((q) => q.country_code).filter(Boolean))
    );

    let questionsForQuarters = [...allData.questions];
    if (tempFilters.product) {
      questionsForQuarters = questionsForQuarters.filter(
        (q) => tempFilters.product!.includes(q.product)
      );
    }
    if (tempFilters.country) {
      questionsForQuarters = questionsForQuarters.filter(
        (q) => tempFilters.country!.includes(q.country_code)
      );
    }
    if (tempFilters.year) {
      questionsForQuarters = questionsForQuarters.filter((q) => {
        const date = new Date(q.case_created_date);
        return date.getFullYear().toString() === tempFilters.year;
      });
    }
    const availableQuarterNumbers = Array.from(
      new Set(
        questionsForQuarters.map((q) => {
          const date = new Date(q.case_created_date);
          return Math.floor(date.getMonth() / 3) + 1;
        })
      )
    );
    const availableQuarters = availableQuarterNumbers
      .map((q) => `Q${q}`)
      .sort();

    let questionsForYears = [...allData.questions];
    if (tempFilters.product) {
      questionsForYears = questionsForYears.filter(
        (q) => tempFilters.product!.includes(q.product)
      );
    }
    if (tempFilters.country) {
      questionsForYears = questionsForYears.filter(
        (q) => tempFilters.country!.includes(q.country_code)
      );
    }
    if (tempFilters.quarter) {
      const quarterNumber = Number.parseInt(tempFilters.quarter.replace("Q", ""));
      questionsForYears = questionsForYears.filter((q) => {
        const date = new Date(q.case_created_date);
        const questionQuarter = Math.floor(date.getMonth() / 3) + 1;
        return questionQuarter === quarterNumber;
      });
    }
    const availableYears = Array.from(
      new Set(
        questionsForYears.map((q) => {
          const date = new Date(q.case_created_date);
          return date.getFullYear().toString();
        })
      )
    )
      .filter(Boolean)
      .sort();

    console.log("Available options calculated:", {
      products: availableProducts.length,
      countries: availableCountries.length,
      quarters: availableQuarters.length,
      years: availableYears.length,
    });

    setAvailableOptions({
      products: availableProducts,
      countries: availableCountries,
      quarters: availableQuarters,
      years: availableYears,
    });
  };

  // Apply filters (fetch filtered data)
  const applyFilters = async (
    selectedProduct: string[],
    selectedCountry: string[],
    selectedQuarter: string,
    selectedYear: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = buildQuery({
        product: selectedProduct.length ? selectedProduct : undefined,
        country_code: selectedCountry.length ? selectedCountry : undefined,
        quarter: selectedQuarter !== "Quarter" ? selectedQuarter : undefined,
        year: selectedYear !== "Year" ? selectedYear : undefined,
      });

      const url = `${
        process.env.NEXT_PUBLIC_MEDGENTICS_API_BASE_URL
      }/cluster/get-clusters${queryParams ? "?" + queryParams : ""}`;

      console.log("=== APPLYING FILTERS ===");
      console.log("Selected filters:", {
        product: selectedProduct,
        country: selectedCountry,
        quarter: selectedQuarter,
        year: selectedYear,
      });
      console.log("Built query:", queryParams);
      console.log("Full URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(deviceUuid),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Authentication required. Please log in again.");
        }
        throw new Error("Failed to fetch filtered data");
      }

      const result = await response.json();

      console.log("Filtered API Response:", result);
      console.log("Number of clusters:", result.clusters?.length || 0);
      console.log("Number of questions:", result.questions?.length || 0);

      setData(result as DataType);

      return result as DataType;
    } catch (err) {
      const error = err as Error;
      console.error("Error applying filters:", error);
      setError("Error applying filters: " + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    setData,
    allData,
    availableOptions,
    loading,
    error,
    setError,
    fetchAllData,
    updateAvailableOptions,
    applyFilters,
  };
};
