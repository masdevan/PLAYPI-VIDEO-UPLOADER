"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import ApiService from "@/services/api"
import Link from "next/link"
import Image from "next/image"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize,
  Download,
  Share2,
} from "lucide-react"
import ProgressBar from "./ProgressBar"
import { useRouter } from "next/navigation"
import Settings from "@/components/player/Settings"

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
  videoId?: string
  playbackRate?: number
  onChangePlaybackRate?: (rate: number) => void
  embedCode?: string
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
  videoId,
  playbackRate,
  onChangePlaybackRate,
  embedCode,
}: ControlsBarProps) {
  const [videoDetails, setVideoDetails] = useState<any>(null)
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)
  const router = useRouter()
  const [showShareTooltip, setShowShareTooltip] = useState(false)
  const [shareTooltipText, setShareTooltipText] = useState("URL copied to clipboard")
  const shareTooltipTimerRef = useRef<NodeJS.Timeout | null>(null)
  const navigateTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (videoId) {
      setIsLoadingVideo(true)
      ApiService.getVideoById(videoId)
        .then((response) => {
          setVideoDetails(response)
        })
        .catch((error) => {
          console.error('Error fetching video details:', error)
        })
        .finally(() => {
          setIsLoadingVideo(false)
        })
    }
  }, [videoId])

  const currentShareUrl = videoDetails?.share_url || uploadResponse?.share_url

  const handleDownload = () => {
    console.log('Download clicked')
    
    const downloadUrl = videoDetails?.download_url || uploadResponse?.download_url
    
    if (downloadUrl) {
      console.log('Using download_url:', downloadUrl)
      ApiService.downloadVideo(downloadUrl)
    } else {
      console.log('No download_url found')
      alert('Download tidak tersedia untuk video ini')
    }
  }

  const handleShare = async () => {
    try {
      if (!currentShareUrl) {
        setShareTooltipText("Cannot share: missing video ID")
        setShowShareTooltip(true)
        if (shareTooltipTimerRef.current) clearTimeout(shareTooltipTimerRef.current)
        shareTooltipTimerRef.current = setTimeout(() => setShowShareTooltip(false), 1200)
        return
      }

      try {
        await navigator.clipboard.writeText(currentShareUrl)
        setShareTooltipText("URL copied to clipboard")
      } catch (err) {
        setShareTooltipText("Copy failed")
      }

      setShowShareTooltip(true)
      if (shareTooltipTimerRef.current) clearTimeout(shareTooltipTimerRef.current)
      shareTooltipTimerRef.current = setTimeout(() => setShowShareTooltip(false), 1200)
    } catch (error) {
      console.error('Error in share:', error)
    }
  }

  useEffect(() => {
    return () => {
      if (shareTooltipTimerRef.current) clearTimeout(shareTooltipTimerRef.current)
      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current)
    }
  }, [])

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
        currentTime={currentTime}
        duration={duration}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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

          <Link 
            href={process.env.NEXT_PUBLIC_WEB_URL || '/'} 
            className="flex ml-3 items-center gap-2 text-white hover:text-gray-300 transition-colors duration-200"
          >
            <Image
              src="/icon/icon.png"
              alt="PlayPi"
              width={20}
              height={20}
              className="rounded-sm"
            />
            <span className="text-sm font-semibold">PlayPi</span>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <div className="relative">
            {showShareTooltip && (
              <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-black text-xs px-2 py-1 rounded shadow z-[1000]">
                {shareTooltipText}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              onTouchStart={onTouchStart}
              className="text-white hover:bg-white/20 w-7 h-7 sm:w-9 sm:h-9 cursor-pointer p-0"
              style={{ borderRadius: "0" }}
              title="Share"
            >
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
          <Settings 
            onTouchStart={onTouchStart}
            playbackRate={playbackRate}
            onChangePlaybackRate={onChangePlaybackRate}
            embedCode={currentShareUrl ? `<iframe src="${currentShareUrl}" width="360" height="640" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>` : embedCode}
          />
          {(videoDetails?.download_url || uploadResponse?.download_url) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              onTouchStart={onTouchStart}
              disabled={isLoadingVideo}
              className="text-white hover:bg-white/20 w-7 h-7 sm:w-9 sm:h-9 cursor-pointer p-0 disabled:opacity-50"
              style={{ borderRadius: "0" }}
              title={isLoadingVideo ? "Loading..." : "Download Video"}
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


