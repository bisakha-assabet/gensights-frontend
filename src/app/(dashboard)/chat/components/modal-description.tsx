import type React from "react"

interface ModalDescriptionProps {
  description?: string
}

const ModalDescription: React.FC<ModalDescriptionProps> = ({ description }) => {
  if (!description) return null

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 max-h-24 overflow-y-auto">
      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {description}
      </div>
    </div>
  )
}

export default ModalDescription
