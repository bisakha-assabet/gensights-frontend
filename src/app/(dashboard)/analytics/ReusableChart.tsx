"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react"
import type { Data, Layout, Config } from "plotly.js"
import type { ApiResponse, AnalyticsData, SummaryStats } from "./types"
import { useFilters } from "./AnalyticsLayout"
import { useAuth } from "@/context/auth"

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface ReusableChartProps {
  apiEndpoint: string
  title: string
  description?: string
  chartHeight?: number
  showSummary?: boolean
}

export const ReusableChart: React.FC<ReusableChartProps> = ({
  apiEndpoint,
  title,
  description,
  chartHeight = 400,
  showSummary = true,
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const { appliedFilters } = useFilters()
  const { user, userProduct } = useAuth()

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const queryParams = new URLSearchParams()

      // Role-based data filtering logic
      if (user?.role === 'Global Admin' || user?.role === 'Global Head') {
        // Global Admin and Global Head can see all data - use applied filters if any
        if (appliedFilters.product.length > 0) {
          appliedFilters.product.forEach((product) => {
            queryParams.append("product", product)
          })
        }
        if (appliedFilters.country.length > 0) {
          appliedFilters.country.forEach((country) => {
            queryParams.append("country_code", country)
          })
        }
      } else if (user?.role === 'Therapeutic Specialist') {
        // Therapeutic specialists can only see their assigned product
        if (userProduct) {
          queryParams.append("product", userProduct)
        } else if (user.therapeutic_area) {
          // Fallback to therapeutic area if userProduct is not available
          const productMapping: Record<string, string> = {
            "Neurology": "Cetaprofen",
            "Respiratory": "Respilin",
            "Nephrology": "Betacenib",
          }
          const mappedProduct = productMapping[user.therapeutic_area]
          if (mappedProduct) {
            queryParams.append("product", mappedProduct)
          }
        }
        
        // They can filter by country if selected
        if (appliedFilters.country.length > 0) {
          appliedFilters.country.forEach((country) => {
            queryParams.append("country_code", country)
          })
        }
      } else if (user?.role === 'Country Head') {
        // Country heads can only see their assigned countries
        if (user.accessible_countries && user.accessible_countries.length > 0) {
          user.accessible_countries.forEach((country) => {
            queryParams.append("country_code", country)
          })
        }
        
        // They can filter by product if selected
        if (appliedFilters.product.length > 0) {
          appliedFilters.product.forEach((product) => {
            queryParams.append("product", product)
          })
        }
      } else {
        // For other roles, use applied filters as normal
        if (appliedFilters.product.length > 0) {
          appliedFilters.product.forEach((product) => {
            queryParams.append("product", product)
          })
        }
        if (appliedFilters.country.length > 0) {
          appliedFilters.country.forEach((country) => {
            queryParams.append("country_code", country)
          })
        }
      }

      // Time-based filters apply to all roles
      if (appliedFilters.quarter.length > 0) {
        appliedFilters.quarter.forEach((quarter) => {
          const quarterNumber = quarter.replace("Q", "")
          queryParams.append("quarterly", quarterNumber)
        })
      }

      if (appliedFilters.year.length > 0) {
        appliedFilters.year.forEach((year) => {
          queryParams.append("yearly", year)
        })
      }

      const queryString = queryParams.toString()
      const fullUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${apiEndpoint}${queryString ? `?${queryString}` : ""}`

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.message || "Failed to fetch analytics data")
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint, appliedFilters, user, userProduct])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const handleRefresh = useCallback(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const summaryStats = useMemo((): SummaryStats | null => {
    if (!data || !data.data || data.data.length === 0) return null

    const chartData = data.data[0]
    const totalQuestions = chartData.y?.reduce((sum: number, val: number) => sum + val, 0) || 0
    const totalItems = chartData.x?.length || 0
    const topItem = chartData.x?.[0] || "N/A"

    return {
      totalItems,
      totalQuestions,
      topItem,
    }
  }, [data])

  const plotData: Data[] = useMemo(() => {
    if (!data || !data.data || data.data.length === 0) return []

    return data.data.map((item) => ({
      type: "bar" as const,
      x: item.x,
      y: item.y,
      marker: {
        color: "rgba(59, 130, 246, 0.8)",
        line: {
          color: "rgba(59, 130, 246, 1)",
          width: 1,
        },
      },
      hovertemplate: "<b>%{x}</b><br>" + "Questions: %{y}<br>" + "Percentage: %{customdata}%<extra></extra>",
      customdata: item.percentages,
      textposition: "auto" as const,
    }))
  }, [data])

  const layout: Partial<Layout> = useMemo(
    () => ({
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        family: "system-ui, -apple-system, sans-serif",
        size: 11,
        color: "#374151",
      },
      title: {
        text: data?.layout.title || title,
        font: {
          size: 16,
          color: "#1f2937",
        },
      },
      xaxis: {
        title: {
          text: data?.layout.xaxis.title || "X Axis",
        },
        tickangle: -45,
        tickfont: {
          size: 10,
        },
        gridcolor: "rgba(0,0,0,0.1)",
      },
      yaxis: {
        title: {
          text: data?.layout.yaxis.title || "Y Axis",
        },
        gridcolor: "rgba(0,0,0,0.1)",
        tickfont: {
          size: 10,
        },
      },
      margin: {
        l: 50,
        r: 20,
        t: 60,
        b: 80,
      },
      height: chartHeight,
      bargap: 0.6,
      bargroupgap: 0.1,
    }),
    [data, title, chartHeight],
  )

  const config: Partial<Config> = useMemo(
    () => ({
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
    }),
    [],
  )

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-center" style={{ height: `${chartHeight}px` }}>
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600 text-sm">Loading analytics data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 text-red-600 mb-4">
          <AlertCircle className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Error Loading Data</h3>
        </div>
        <p className="text-gray-700 mb-4 text-sm">{error}</p>
        <button
          onClick={handleRefresh}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      </div>
    )
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-600">
          <p className="mb-4">No analytics data available</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2 mx-auto"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-gray-600 text-sm mt-1">{description}</p>}
          </div>
          <button
            onClick={handleRefresh}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh data"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <Plot data={plotData} layout={layout} config={config} style={{ width: "100%" }} useResizeHandler={true} />
      </div>

      {/* Summary Statistics */}
      {showSummary && summaryStats && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{summaryStats.totalItems}</p>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Total Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{summaryStats.totalQuestions}</p>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Total Questions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{summaryStats.topItem}</p>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Top Performer</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
