"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import ApiService from "@/services/api"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize,
  Download,
} from "lucide-react"
import ProgressBar from "./ProgressBar"

type ControlsBarProps = {
  show: boolean
  progressRef: React.RefObject<HTMLDivElement>
  progress: number
  onProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void
  onTouchStart: () => void
  onTouchMove: () => void

  isPlaying: boolean
  onTogglePlay: () => void
  onSkipBackward: () => void
  onSkipForward: () => void

  isMuted: boolean
  onToggleMute: () => void

  currentTime: number
  duration: number

  isFullscreen: boolean
  onToggleFullscreen: () => void
  uploadResponse?: any
}

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export default function ControlsBar({
  show,
  progressRef,
  progress,
  onProgressClick,
  onTouchStart,
  onTouchMove,
  isPlaying,
  onTogglePlay,
  onSkipBackward,
  onSkipForward,
  isMuted,
  onToggleMute,
  currentTime,
  duration,
  isFullscreen,
  onToggleFullscreen,
  uploadResponse,
}: ControlsBarProps) {
  const handleDownload = () => {
    if (uploadResponse?.filename) {
      ApiService.downloadVideo(uploadResponse.filename)
    }
  }

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-black/80 p-2 transition-transform duration-300 z-50 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <ProgressBar
        ref={progressRef}
        progress={progress}
        onClick={onProgressClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePlay}
            onTouchStart={onTouchStart}
            className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 cursor-pointer p-0"
            style={{ borderRadius: "0" }}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSkipBackward}
            onTouchStart={onTouchStart}
            className="text-white hover:bg-white/20 w-7 h-7 sm:w-9 sm:h-9 cursor-pointer p-0"
            style={{ borderRadius: "0" }}
            title="Skip Backward 10s"
          >
            <SkipBack className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSkipForward}
            onTouchStart={onTouchStart}
            className="text-white hover:bg-white/20 w-7 h-7 sm:w-9 sm:h-9 cursor-pointer p-0"
            style={{ borderRadius: "0" }}
            title="Skip Forward 10s"
          >
            <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMute}
            onTouchStart={onTouchStart}
            className="text-white hover:bg-white/20 w-7 h-7 sm:w-9 sm:h-9 cursor-pointer p-0"
            style={{ borderRadius: "0" }}
          >
            {isMuted ? (
              <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </Button>

          <div className="text-xs text-gray-300 ml-2">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {uploadResponse?.filename && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              onTouchStart={onTouchStart}
              className="text-white hover:bg-white/20 w-7 h-7 sm:w-9 sm:h-9 cursor-pointer p-0"
              style={{ borderRadius: "0" }}
              title="Download Video"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFullscreen}
            onTouchStart={onTouchStart}
            className="text-white hover:bg-white/20 w-7 h-7 sm:w-9 sm:h-9 cursor-pointer p-0"
            style={{ borderRadius: "0" }}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}


