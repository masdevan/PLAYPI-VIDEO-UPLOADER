"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { ApiService } from '@/lib/api'

interface VideoPlayerProps {
  src: string
  onBack: () => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onBack }) => {
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
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const handleDevTools = () => {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.outerWidth > 200) {
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleDownload = async () => {
    const isValidUrl = src.startsWith('http://') || src.startsWith('https://');
    
    if (isValidUrl) {
      try {
        const safelinkResponse = await ApiService.createSafelink(src);
        
        if (safelinkResponse && safelinkResponse.data && safelinkResponse.data.short_url) {
          await navigator.clipboard.writeText(safelinkResponse.data.short_url);
          toast.success("Safelink has been copied to clipboard!");
        } else {
          downloadVideo();
        }
      } catch (error) {
        console.error('Safelink creation failed:', error);
        downloadVideo();
      }
    } else {
      downloadVideo();
    }
  }

  const downloadVideo = () => {
    const a = document.createElement("a")
    a.href = src
    a.download = "video.mp4"
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success("Video download started!");
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

  const showControlsTemporarily = () => {
    setShowControls(true)
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 2000)
  }

  const handleMouseMove = () => {
    showControlsTemporarily()
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

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true)
    }
  }, [isPlaying])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black rounded-none overflow-hidden relative" style={{ backgroundColor: "#111111" }} ref={videoContainerRef} onMouseMove={handleMouseMove} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
        <video
          ref={videoRef}
          src={src}
          className="w-full bg-black"
          style={{ minHeight: '400px' }}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
        
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'auto' }}
          onContextMenu={(e) => e.preventDefault()}
          onClick={togglePlay}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`p-3 bg-black/50 rounded-full transition-opacity cursor-pointer duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
            {isPlaying ? (
              <Pause className="w-8 h-8 text-purple-500 cursor-pointer" />
            ) : (
              <Play className="w-8 h-8 text-purple-500 cursor-pointer" />
            )}
          </div>
        </div>
        
        <div className={`absolute bottom-0 left-0 right-0 bg-black/80 p-2 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
          <div 
            ref={progressRef}
            className="w-full h-1 bg-gray-600 mb-2 cursor-pointer" 
            onClick={handleProgressClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <div 
              className="h-full bg-purple-500 transition-all duration-100" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                onTouchStart={handleTouchStart}
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
                onClick={skipBackward}
                onTouchStart={handleTouchStart}
                className="text-white hover:bg-white/20 w-7 h-7 sm:w-9 sm:h-9 cursor-pointer p-0"
                style={{ borderRadius: "0" }}
                title="Skip Backward 10s"
              >
                <SkipBack className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={skipForward}
                onTouchStart={handleTouchStart}
                className="text-white hover:bg-white/20 w-7 h-7 sm:w-9 sm:h-9 cursor-pointer p-0"
                style={{ borderRadius: "0" }}
                title="Skip Forward 10s"
              >
                <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                onTouchStart={handleTouchStart}
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
                <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleDownload}
                 onTouchStart={handleTouchStart}
                 className="text-white hover:bg-white/20 w-7 h-7 sm:w-9 sm:h-9 cursor-pointer p-0"
                 style={{ borderRadius: "0" }}
                 title="Get Safelink"
               >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                onTouchStart={handleTouchStart}
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
      </div>
      
      <div className="mt-4 sm:mt-6 text-center">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800 cursor-pointer"
          style={{ borderRadius: "0", backgroundColor: "#111111" }}
        >
          ← Back to Upload
        </Button>
      </div>
    </div>
  )
}

export default VideoPlayer
