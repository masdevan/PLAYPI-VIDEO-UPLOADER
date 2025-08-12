"use client"

import React from "react"

type ProgressBarProps = {
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void
  onTouchStart: () => void
  onTouchMove: () => void
  progress: number
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ onClick, onTouchStart, onTouchMove, progress }, ref) => {
    return (
      <div
        ref={ref}
        className="w-full h-1 bg-gray-600 mb-2 cursor-pointer"
        onClick={onClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        <div className="h-full bg-purple-500 transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>
    )
  }
)

ProgressBar.displayName = "ProgressBar"

export default ProgressBar


