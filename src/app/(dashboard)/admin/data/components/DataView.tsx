"use client"

import type React from "react"
import { useState } from "react"
import { RefreshCw, ArrowLeft, Search, Download } from "lucide-react"

interface DataViewProps {
  data: any[]
  onBackToImport: () => void
  onRefresh: () => void
  isLoading?: boolean
}

const DataView: React.FC<DataViewProps> = ({ data, onBackToImport, onRefresh, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  // Get headers from first data item
  const headers = data.length > 0 ? Object.keys(data[0]) : []

  // Filter data based on search term
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) => value?.toString().toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const truncateText = (text: string, maxLength = 100): string => {
    if (!text) return ""
    return text.toString().length > maxLength ? text.toString().substring(0, maxLength) + "..." : text.toString()
  }

  const handleExport = () => {
    // Convert data to CSV
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `imported_data_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">IMPORTED DATA</h1>
        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            disabled={data.length === 0}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={onBackToImport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Import
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search data..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page when searching
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="text-sm text-gray-600">
          {filteredData.length} of {data.length} records
        </div>
      </div>

      {/* Data Table */}
      {data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No data available</p>
          <p className="text-gray-400 text-sm mt-2">Import some data to see it here</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-400">
                <tr>
                  {headers.map((header, index) => {
                    const isQuestionColumn = header.toLowerCase().includes("question")
                    return (
                      <th
                        key={index}
                        className={`px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider ${
                          isQuestionColumn ? "min-w-80" : "min-w-32"
                        }`}
                      >
                        <div className="truncate">{header.replace(/_/g, " ")}</div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {headers.map((header, colIndex) => {
                      const isQuestionColumn = header.toLowerCase().includes("question")
                      return (
                        <td
                          key={colIndex}
                          className={`px-4 py-4 text-sm text-gray-900 align-top ${
                            isQuestionColumn ? "max-w-md" : "max-w-xs"
                          }`}
                        >
                          <div className="break-words overflow-hidden">
                            {isQuestionColumn ? truncateText(row[header], 200) : truncateText(row[header], 50)}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
                {filteredData.length} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DataView;
