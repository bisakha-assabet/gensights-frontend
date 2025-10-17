"use client";
import { useState, useEffect } from "react";
import { useDarkMode } from "@/context/DarkModeContext";
import ClusterGraph from "./components/ClusterGraph/ClusterGraph";
import ClusterGraphTooltip from "./components/ClusterGraph/ClusterGraphTooltip";
import NavigationDots from "./components/NavigationDots";
import DashboardHeader from "./components/ClusterGraph/components/DashboardHeader";
import FilterStatus from "./components/ClusterGraph/components/FilterStatus";
import { useFilterState } from "./components/ClusterGraph/hooks/useFilterState";
import { useDataManagement } from "./components/ClusterGraph/hooks/useDataManagement";
import { useDimensions } from "./components/ClusterGraph/hooks/useDimensions";
import type { Node } from "./components/ClusterGraph/types";
import ClusterConnectionNotification from "./components/ClusterGraph/components/ClusterConnectionNotification";
import { clusterColors } from "./components/ClusterGraph/utils/clusterUtils";
import { useAuth } from "@/context/auth/useAuth";

export default function DashboardPage() {
  const { isDarkMode } = useDarkMode();

  const [currentStep, setCurrentStep] = useState(0);
  const [clickedQuestionId, setClickedQuestionId] = useState<string | null>(
    null
  );
  const [connectedClusters, setConnectedClusters] = useState<Node[]>([]);

  const handleQuestionClick = (
    questionId: string,
    connectedClusterIds: number[]
  ) => {
    if (!data?.clusters) return;

    // Find the connected cluster nodes
    const connectedClusterNodes = data.clusters
      .filter((cluster: any) =>
        connectedClusterIds.includes(cluster.cluster_id)
      )
      .map((cluster: any) => ({
        id: cluster.cluster_id,
        clusterId: cluster.cluster_id,
        label: cluster.title,
        color: clusterColors[cluster.cluster_id]?.main || "#666",
        type: "cluster" as const,
      }));

    setClickedQuestionId(questionId);
    setConnectedClusters(connectedClusterNodes);

    console.log(
      `Question ${questionId} clicked, highlighting clusters:`,
      connectedClusterNodes
    );
  };

  // Reset notification state
  const handleCloseNotification = () => {
    setClickedQuestionId(null);
    setConnectedClusters([]);
  };

  // Custom hooks for state management
  const {
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
    closeAllDropdowns,
  } = useFilterState();

  const { deviceUuid } = useAuth();

  const {
    data,
    setData,
    allData,
    availableOptions,
    loading,
    error,
    fetchAllData,
    updateAvailableOptions,
    applyFilters: applyFiltersAPI,
  } = useDataManagement(deviceUuid);

  const { containerRef, dimensions } = useDimensions();

  const totalSteps = data?.clusters?.length ? data.clusters.length + 1 : 1;

  // Apply filters with state updates
  const applyFilters = async () => {
    try {
      await applyFiltersAPI(
        selectedProduct,
        selectedCountry,
        selectedQuarter,
        selectedYear,
        selectedClusterCountEnabled,
        selectedClusterCount
      );

      // Update applied filters to match current selections
      setAppliedProduct([...selectedProduct]);
      setAppliedCountry([...selectedCountry]);
      setAppliedQuarter(selectedQuarter);
      setAppliedYear(selectedYear);
      // update applied cluster count state
      setAppliedClusterCount(selectedClusterCount);
      setAppliedClusterCountEnabled(selectedClusterCountEnabled);

      setCurrentStep(0);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  // Reset filters with data update
  const handleResetFilters = () => {
    resetFilters();
    setCurrentStep(0);

    // Show all data immediately
    if (allData) {
      setData(allData);
    }
  };

  // Initial setup: fetch complete data
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Update available options when selections change or when allData is loaded
  useEffect(() => {
    updateAvailableOptions(
      selectedProduct,
      selectedCountry,
      selectedQuarter,
      selectedYear
    );
  }, [
    selectedProduct,
    selectedCountry,
    selectedQuarter,
    selectedYear,
    allData,
  ]);

  // Add keyboard and scroll navigation controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        setCurrentStep((prev) => Math.max(0, prev - 1));
      } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
      }
    };

    const handleWheel = (event: WheelEvent) => {
      // Only handle wheel events when not scrolling the page
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();

        if (event.deltaY > 0) {
          // Scroll down - next step
          setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
        } else {
          // Scroll up - previous step
          setCurrentStep((prev) => Math.max(0, prev - 1));
        }
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [totalSteps]);

  const getCurrentSummary = () => {
    if (!data || currentStep === 0) {
      return "Explore the interconnected network of medical research clusters and their associated questions. Each cluster represents a specific area of medical research, connected to relevant questions from healthcare professionals worldwide.";
    }
    // currentStep is 1..N for storytelling steps, but cluster_id is 0-based
    const cluster = data.clusters.find((c) => c.cluster_id === currentStep - 1);
    return cluster ? cluster.summary : "";
  };

  const getStepTitle = () => {
    if (currentStep === 0) return "Medical Research Network Overview";
    // Map UI step to 0-based cluster_id
    const cluster = data?.clusters?.find(
      (c) => c.cluster_id === currentStep - 1
    );
    return cluster ? cluster.title.replace(/"/g, "") : "";
  };

  if (error && !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden h-[calc(100vh-95px)] text-black dark:text-gray-100">
      <ClusterConnectionNotification
        questionId={clickedQuestionId}
        connectedClusters={connectedClusters}
        onClose={handleCloseNotification}
        isDarkMode={isDarkMode}
      />
      <main className="flex flex-col h-full overflow-hidden">
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          <div
            className="flex-1 flex flex-col relative overflow-hidden"
            ref={containerRef}
          >
            <NavigationDots
              currentStep={currentStep}
              totalSteps={totalSteps}
              setCurrentStep={setCurrentStep}
            />

            <DashboardHeader
              currentStep={currentStep}
              totalSteps={totalSteps}
              getStepTitle={getStepTitle}
              getCurrentSummary={getCurrentSummary}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              selectedQuarter={selectedQuarter}
              setSelectedQuarter={setSelectedQuarter}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              products={availableOptions.products}
              countries={availableOptions.countries}
              quarters={availableOptions.quarters}
              years={availableOptions.years}
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
              hasAppliedFilters={hasAppliedFilters()}
              hasSelectedFilters={hasSelectedFilters()}
              onApplyFilters={applyFilters}
              onResetFilters={handleResetFilters}
              selectedClusterCount={selectedClusterCount}
              setSelectedClusterCount={setSelectedClusterCount}
              selectedClusterCountEnabled={selectedClusterCountEnabled}
              setSelectedClusterCountEnabled={setSelectedClusterCountEnabled}
            />

            <FilterStatus loading={loading} />

            <div className="flex-1 relative overflow-hidden">
              <ClusterGraph
                data={data}
                loading={loading}
                dimensions={dimensions}
                currentStep={currentStep}
                totalSteps={totalSteps}
                isDarkMode={isDarkMode}
                onQuestionClick={handleQuestionClick}
                setCurrentStep={setCurrentStep}
              />
              <ClusterGraphTooltip />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
