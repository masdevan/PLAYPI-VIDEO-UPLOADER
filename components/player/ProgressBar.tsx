"use client"

import React from "react"

type ProgressBarProps = {
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void
  onTouchStart: () => void
  onTouchMove: () => void
  progress: number
  currentTime: number
  duration: number
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ onClick, onTouchStart, onTouchMove, progress, currentTime, duration }, ref) => {
    const formatTime = (time: number): string => {
      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time % 60)
      return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    return (
      <div className="flex items-center gap-3">
        <div className="text-xs text-gray-300 whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        
        <div
          ref={ref}
          className="flex-1 h-1 bg-gray-600 cursor-pointer"
          onClick={onClick}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
        >
          <div className="h-full bg-purple-500 transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
      </div>
    )
  }
)

ProgressBar.displayName = "ProgressBar"

export default ProgressBar


