"use client"

import type React from "react"
import dynamic from "next/dynamic"
import ParsedMedicalResponse from "./parse"

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface PlotlyConfig {
  data: any[]
  layout: any
  config: any
}

interface ChartDisplayProps {
  title: string
  chartType: string
  imageData?: string
  plotlyConfig?: PlotlyConfig
  textDescription?: string
  onImageClick: () => void
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({
  title,
  chartType,
  imageData,
  plotlyConfig,
  textDescription,
  onImageClick,
}) => {
  const isPlotlyChart = !!plotlyConfig

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium capitalize">
            {chartType}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        {isPlotlyChart ? (
          <div
            className="w-full cursor-pointer hover:opacity-90 transition-opacity"
            onClick={onImageClick}
            title="Click to view interactive chart"
          >
            <Plot
              data={plotlyConfig.data}
              layout={{
                ...plotlyConfig.layout,
                height: 400,
                margin: { l: 50, r: 50, t: 50, b: 50 },
                paper_bgcolor: "transparent",
                plot_bgcolor: "transparent",
              }}
              config={{
                ...plotlyConfig.config,
                displayModeBar: false,
                responsive: true,
                staticPlot: true, // Make preview non-interactive
              }}
              style={{ width: "100%", height: "400px" }}
            />
          </div>
        ) : imageData ? (
          <img
            src={`data:image/png;base64,${imageData}`}
            alt={title}
            className="w-full h-auto rounded-md shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            style={{ maxHeight: "500px", objectFit: "contain" }}
            onClick={onImageClick}
            title="Click to view full size"
          />
        ) : null}
      </div>

      {textDescription && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
          <ParsedMedicalResponse content={textDescription} />
        </div>
      )}
    </div>
  )
}

export default ChartDisplay
