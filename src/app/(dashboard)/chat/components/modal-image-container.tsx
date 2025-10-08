import type React from "react"

interface ModalImageContainerProps {
  imageData: string
  title: string
  zoom: number
  position: { x: number; y: number }
  isDragging: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: () => void
  onMouseLeave: () => void
  descriptionExists: boolean
}

const ModalImageContainer: React.FC<ModalImageContainerProps> = ({
  imageData,
  title,
  zoom,
  position,
  isDragging,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  descriptionExists,
}) => (
  <div
    className="flex-1 overflow-hidden relative bg-gray-50 dark:bg-gray-900"
    style={{ height: descriptionExists ? 'calc(100% - 280px)' : 'calc(100% - 180px)' }}
  >
    <div
      className={`w-full h-full flex items-center justify-center ${zoom > 1 ? 'cursor-grab' : 'cursor-default'} ${isDragging ? 'cursor-grabbing' : ''}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <img
        src={`data:image/png;base64,${imageData}`}
        alt={title}
        className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
        style={{
          transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          transformOrigin: 'center center'
        }}
        draggable={false}
      />
    </div>
  </div>
)

export default ModalImageContainer
