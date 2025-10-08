"use client"

import type React from "react"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import ModalHeader from "./modal-header"
import ModalImageContainer from "./modal-image-container"
import ModalDescription from "./modal-description"
import ModalInstructions from "./modal-instructions"

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface PlotlyConfig {
  data: any[]
  layout: any
  config: any
}

interface VisualizationModalProps {
  isOpen: boolean
  onClose: () => void
  imageData?: string
  plotlyConfig?: PlotlyConfig
  title: string
  chartType: string
  description?: string
}

const VisualizationModal: React.FC<VisualizationModalProps> = ({
  isOpen,
  onClose,
  imageData,
  plotlyConfig,
  title,
  chartType,
  description,
}) => {
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const isPlotlyChart = !!plotlyConfig

  // Reset zoom and position when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const downloadImage = () => {
    if (isPlotlyChart) {
      // For Plotly charts, we'll trigger the built-in download from the chart
      const plotElement = document.querySelector(".js-plotly-plot")
      if (plotElement) {
        // @ts-ignore - Plotly global object
        window.Plotly?.downloadImage(plotElement, {
          format: "png",
          filename: title || "visualization",
          width: 1200,
          height: 800,
        })
      }
    } else if (imageData) {
      const link = document.createElement("a")
      link.href = `data:image/png;base64,${imageData}`
      link.download = `${title || "visualization"}.png`
      link.click()
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1 && !isPlotlyChart) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1 && !isPlotlyChart) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const resetView = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4 bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
        <ModalHeader
          title={title}
          chartType={chartType}
          zoom={zoom}
          position={position}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={resetView}
          onDownloadImage={downloadImage}
          onClose={onClose}
        />

        {isPlotlyChart ? (
          <div className="flex-1 p-6 overflow-auto">
            <div className="w-full h-full min-h-[500px] bg-white dark:bg-gray-800 rounded-lg">
              <Plot
                data={plotlyConfig.data}
                layout={{
                  ...plotlyConfig.layout,
                  autosize: true,
                  responsive: true,
                  paper_bgcolor: "transparent",
                  plot_bgcolor: "transparent",
                }}
                config={{
                  ...plotlyConfig.config,
                  displayModeBar: true,
                  responsive: true,
                  displaylogo: false,
                  modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
                }}
                style={{ width: "100%", height: "100%" }}
                useResizeHandler={true}
              />
            </div>
          </div>
        ) : (
          <ModalImageContainer
            imageData={imageData || ""}
            title={title}
            zoom={zoom}
            position={position}
            isDragging={isDragging}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            descriptionExists={!!description}
          />
        )}

        <ModalDescription description={description} />

        {!isPlotlyChart && <ModalInstructions zoom={zoom} />}
      </div>
    </div>
  )
}

export default VisualizationModal
