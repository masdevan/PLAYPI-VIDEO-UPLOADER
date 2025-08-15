"use client"

import React, { PropsWithChildren } from "react"

type VideoSurfaceProps = {
  videoRef: React.RefObject<HTMLVideoElement>
  videoContainerRef: React.RefObject<HTMLDivElement>
  src: string
  onMouseMove: () => void
  onTouchStart: () => void
  onTouchMove: () => void
  onTogglePlay: () => void
  onClick?: () => void
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
    children,
  }: PropsWithChildren<VideoSurfaceProps>
) {
  const handleVideoClick = () => {
    onTogglePlay()
    onClick?.()
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

      {children}
    </div>
  )
}


