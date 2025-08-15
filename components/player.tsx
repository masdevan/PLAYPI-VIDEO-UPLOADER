"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import VideoSurface from '@/components/player/VideoSurface'
import CenterPlayOverlay from '@/components/player/CenterPlayOverlay'
import ControlsBar from '@/components/player/ControlsBar'
import BackToUploadButton from '@/components/player/BackToUploadButton'

interface VideoPlayerProps {
  src: string
  uploadResponse?: any
  onBack: () => void
  showBackButton?: boolean
  fullWidth?: boolean
  fullHeight?: boolean
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  uploadResponse, 
  onBack, 
  showBackButton = true, 
  fullWidth = false, 
  fullHeight = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault()
        return false
      }
      
      // Show controls when any key is pressed (except special keys)
      if (!['F12', 'Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        showControlsTemporarily()
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const handleDevTools = () => {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        document.body.innerHTML = '<div class="text-center p-8 text-red-500">Developer tools detected!</div>'
      }
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    setInterval(handleDevTools, 1000)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      setProgress((video.currentTime / video.duration) * 100)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      showControlsTemporarily()
    }
    const handlePause = () => {
      setIsPlaying(false)
      setShowControls(true)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
        controlsTimeoutRef.current = null
      }
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
    handleVideoInteraction()
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
    handleVideoInteraction()
  }

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
    }
    handleVideoInteraction()
  }

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10)
    }
    handleVideoInteraction()
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const clickTime = (clickX / width) * videoRef.current.duration
      videoRef.current.currentTime = clickTime
    }
    handleVideoInteraction()
  }



  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true)
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 2000)
  }, [isPlaying])

  const handleMouseMove = () => {
    if (isPlaying) {
      showControlsTemporarily()
    }
  }

  const handleVideoInteraction = () => {
    showControlsTemporarily()
  }

  const handleTouchStart = () => {
    showControlsTemporarily()
  }

  const handleTouchMove = () => {
    showControlsTemporarily()
  }

  const handleVideoClick = () => {
    showControlsTemporarily()
  }

  useEffect(() => {
    if (isPlaying) {
      showControlsTemporarily()
    } else {
      setShowControls(true)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying, showControlsTemporarily])

  return (
    <div className={`${fullWidth ? 'w-full' : 'max-w-4xl mx-auto'} ${fullHeight ? 'h-full' : ''}`}>
      <VideoSurface
        videoRef={videoRef}
        videoContainerRef={videoContainerRef}
        src={src}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTogglePlay={togglePlay}
        onClick={handleVideoClick}
      >
        <CenterPlayOverlay isPlaying={isPlaying} />

        <ControlsBar
          show={showControls}
          progressRef={progressRef}
          progress={progress}
          onProgressClick={handleProgressClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onSkipBackward={skipBackward}
          onSkipForward={skipForward}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          currentTime={currentTime}
          duration={duration}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          uploadResponse={uploadResponse}
        />
      </VideoSurface>

      {showBackButton && <BackToUploadButton onBack={onBack} />}
    </div>
  )
}

export default VideoPlayer
