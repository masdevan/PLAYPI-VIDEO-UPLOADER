"use client"

import React from "react"
import { Pause, Play } from "lucide-react"

type CenterPlayOverlayProps = {
  isPlaying: boolean
}

export default function CenterPlayOverlay({ isPlaying }: CenterPlayOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
      <div
        className={`p-3 bg-black/50 rounded-full transition-opacity cursor-pointer duration-300 ${
          isPlaying ? "opacity-0" : "opacity-100"
        }`}
      >
        {isPlaying ? (
          <Pause className="w-8 h-8 text-purple-500 cursor-pointer" />
        ) : (
          <Play className="w-8 h-8 text-purple-500 cursor-pointer" />
        )}
      </div>
    </div>
  )
}


