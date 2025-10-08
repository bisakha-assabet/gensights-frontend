import type React from "react"

interface ModalInstructionsProps {
  zoom: number
}

const ModalInstructions: React.FC<ModalInstructionsProps> = ({ zoom }) => (
  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
      <span>Press ESC to close</span>
      <span>•</span>
      <span>Use zoom controls to magnify</span>
      {zoom > 1 && (
        <>
          <span>•</span>
          <span>Drag to pan around</span>
        </>
      )}
    </div>
  </div>
)

export default ModalInstructions
