import type React from "react"
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react'

interface ModalHeaderProps {
  title: string
  chartType: string
  zoom: number
  position: { x: number; y: number }
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
  onDownloadImage: () => void
  onClose: () => void
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  chartType,
  zoom,
  position,
  onZoomIn,
  onZoomOut,
  onResetView,
  onDownloadImage,
  onClose,
}) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
        {title}
      </h2>
      <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium capitalize">
        {chartType}
      </span>
    </div>
    
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
        <button
          onClick={onZoomOut}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          title="Zoom Out"
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <span className="px-2 text-sm text-gray-600 dark:text-gray-300 min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          title="Zoom In"
          disabled={zoom >= 3}
        >
          <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {(zoom !== 1 || position.x !== 0 || position.y !== 0) && (
        <button
          onClick={onResetView}
          className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Reset View"
        >
          Reset
        </button>
      )}
      
      <button
        onClick={onDownloadImage}
        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        title="Download Image"
      >
        <Download className="w-4 h-4" />
      </button>
      
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md transition-colors"
        title="Close"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  </div>
)

export default ModalHeader
