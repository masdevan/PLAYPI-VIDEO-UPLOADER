"use client"

import React, { PropsWithChildren, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type VideoSurfaceProps = {
  videoRef: React.RefObject<HTMLVideoElement>
  videoContainerRef: React.RefObject<HTMLDivElement>
  src: string
  onMouseMove: () => void
  onTouchStart: () => void
  onTouchMove: () => void
  onTogglePlay: () => void
  onClick?: () => void
  onSkipForward?: () => void
  onSkipBackward?: () => void
}

export default function VideoSurface(
  {
    videoRef,
    videoContainerRef,
    src,
    onMouseMove,
    onTouchStart,
    onTouchMove,
    onTogglePlay,
    onClick,
    onSkipForward,
    onSkipBackward,
    children,
  }: PropsWithChildren<VideoSurfaceProps>
) {
  const lastClickTime = useRef<number>(0)
  const lastClickArea = useRef<'left' | 'right' | 'center' | null>(null)
  const [showLeftIcon, setShowLeftIcon] = useState(false)
  const [showRightIcon, setShowRightIcon] = useState(false)

  const handleVideoClick = (e: React.MouseEvent) => {
    const currentTime = Date.now()
    const clickX = e.clientX
    const rect = e.currentTarget.getBoundingClientRect()
    const videoWidth = rect.width
    const clickArea = clickX < videoWidth / 3 ? 'left' : clickX > (videoWidth * 2) / 3 ? 'right' : 'center'
  
    if (currentTime - lastClickTime.current < 300 && lastClickArea.current === clickArea) {
      // Double click detected
      if (clickArea === 'left' && onSkipBackward) {
        onSkipBackward()
        setShowLeftIcon(true)
        setTimeout(() => setShowLeftIcon(false), 1000)
      } else if (clickArea === 'right' && onSkipForward) {
        onSkipForward()
        setShowRightIcon(true)
        setTimeout(() => setShowRightIcon(false), 1000)
      } else if (clickArea === 'center') {
        // Center double click also toggles play/pause
        onTogglePlay()
        onClick?.()
      }
      
      lastClickTime.current = 0
      lastClickArea.current = null
    } else {
      // Single click anywhere toggles play/pause
      onTogglePlay()
      onClick?.()
    
      lastClickTime.current = currentTime
      lastClickArea.current = clickArea
      
      setTimeout(() => {
        if (lastClickTime.current === currentTime) {
          lastClickTime.current = 0
          lastClickArea.current = null
        }
      }, 500)
    }
  }

  return (
    <div
      className="bg-black rounded-none overflow-hidden relative w-full h-full"
      style={{ backgroundColor: "#111111" }}
      ref={videoContainerRef}
      onMouseMove={onMouseMove}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full bg-black object-contain"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />

      <div
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "auto" }}
        onContextMenu={(e) => e.preventDefault()}
        onClick={handleVideoClick}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      />

      {onSkipBackward && (
        <div 
          className="absolute left-0 top-0 w-1/3 h-full opacity-0 hover:opacity-10 transition-opacity duration-200 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)' }}
        />
      )}
      
      {onSkipForward && (
        <div 
          className="absolute right-0 top-0 w-1/3 h-full opacity-0 hover:opacity-10 transition-opacity duration-200 pointer-events-none"
          style={{ background: 'linear-gradient(to left, rgba(255,255,255,0.1), transparent)' }}
        />
      )}

      {showLeftIcon && (
        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-30">
          <div className="flex items-center space-x-1">
            <ChevronLeft className="w-8 h-8 text-white drop-shadow-lg animate-fade-in-out" />
            <ChevronLeft className="w-8 h-8 text-white drop-shadow-lg animate-fade-in-out" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      )}

      {showRightIcon && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30">
          <div className="flex items-center space-x-1">
            <ChevronRight className="w-8 h-8 text-white drop-shadow-lg animate-fade-in-out" />
            <ChevronRight className="w-8 h-8 text-white drop-shadow-lg animate-fade-in-out" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      )}

      {children}
    </div>
  )
}


