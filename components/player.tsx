"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import VideoSurface from '@/components/player/VideoSurface'
import CenterPlayOverlay from '@/components/player/CenterPlayOverlay'
import ControlsBar from '@/components/player/ControlsBar'
import BackToUploadButton from '@/components/player/BackToUploadButton'
import { bannerAdConfig, bannerAdScript, _x1 } from '@/lib/adConfig'

interface VideoPlayerProps {
  src: string
  uploadResponse?: any
  onBack: () => void
  showBackButton?: boolean
  fullWidth?: boolean
  fullHeight?: boolean
  autoPlay?: boolean
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  uploadResponse, 
  onBack, 
  showBackButton = true, 
  fullWidth = false, 
  fullHeight = false,
  autoPlay = false
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
  const [showAd, setShowAd] = useState(false)
  const adIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [hasShownBanner, setHasShownBanner] = useState(false)
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showRedirectOverlay, setShowRedirectOverlay] = useState(false)

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
      
      if (autoPlay && video.paused) {
        video.play().catch(error => {
          console.log('Auto-play failed:', error)
        })
      }
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

  // Auto-play when src changes
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      const video = videoRef.current
      
      // Always mute initially for better auto-play success rate
      if (autoPlay) {
        video.muted = true
        setIsMuted(true)
      }
      
      const handleCanPlay = () => {
        if (video.paused && autoPlay) {
          video.play().catch(error => {
            console.log('Auto-play failed:', error)
            // Try again after a short delay
            setTimeout(() => {
              if (video.paused && autoPlay) {
                video.play().catch(err => console.log('Retry auto-play failed:', err))
              }
            }, 100)
          })
        }
      }
      
      const handleLoadedData = () => {
        if (video.paused && autoPlay) {
          video.play().catch(error => {
            console.log('Auto-play on loadeddata failed:', error)
          })
        }
      }
      
      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('loadeddata', handleLoadedData)
      
      if (video.readyState >= 2 && video.paused && autoPlay) {
        video.play().catch(error => {
          console.log('Immediate auto-play failed:', error)
        })
      }
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('loadeddata', handleLoadedData)
      }
    }
  }, [src, autoPlay])

  // Additional auto-play attempt when video element is ready
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      const video = videoRef.current
      
      video.muted = true
      setIsMuted(true)
      
      const playTimeout = setTimeout(() => {
        if (video.paused && autoPlay) {
          video.play().catch(error => {
            console.log('Delayed auto-play failed:', error)
          })
        }
      }, 500)
      
      return () => clearTimeout(playTimeout)
    }
  }, [autoPlay])

  // Ad display logic - show banner on first load, redirect after 10 seconds
  useEffect(() => {
    if (isPlaying) {
      // Show banner ad only on first load
      if (!hasShownBanner) {
        setShowAd(true)
        setHasShownBanner(true)
      }
      
      // Start redirect interval - show overlay after 10 seconds
      redirectTimeoutRef.current = setInterval(() => {
        setShowRedirectOverlay(true)
        // Auto-hide overlay after 3 seconds
        setTimeout(() => {
          setShowRedirectOverlay(false)
        }, 3000)
      }, 10000) // Every 10 seconds
    } else {
      // Clear redirect interval when paused
      if (redirectTimeoutRef.current) {
        clearInterval(redirectTimeoutRef.current)
        redirectTimeoutRef.current = null
      }
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearInterval(redirectTimeoutRef.current)
        redirectTimeoutRef.current = null
      }
    }
  }, [isPlaying, hasShownBanner])

  // Reset banner state when video source changes
  useEffect(() => {
    setHasShownBanner(false)
    setShowAd(false)
  }, [src])

  // Anti-detection ad injection
  useEffect(() => {
    if (showAd) {
      const injectAd = () => {
        const container = document.getElementById('content-display')
        if (!container) return

        // Clear container
        container.innerHTML = ''

        // Create script with simple approach
        const script1 = document.createElement('script')
        script1.type = 'text/javascript'
        script1.textContent = 
          'atOptions = {' +
            '"key": "' + _x1._k + '",' +
            '"format": "' + _x1._f + '",' +
            '"height": ' + _x1._h + ',' +
            '"width": ' + _x1._w + ',' +
            '"params": {}' +
          '};'

        // Create second script with delayed loading
        const script2 = document.createElement('script')
        script2.type = 'text/javascript'
        script2.src = _x1._s
        script2.async = true

        // Append scripts with delay
        container.appendChild(script1)
        setTimeout(() => {
          container.appendChild(script2)
        }, Math.random() * 1000 + 500) // Random delay between 500-1500ms
      }

      // Delay injection to avoid detection
      const timer = setTimeout(injectAd, Math.random() * 2000 + 1000) // Random delay between 1-3 seconds

      return () => clearTimeout(timer)
    }
  }, [showAd])

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
      
      if (!videoRef.current.muted && videoRef.current.paused && autoPlay) {
        videoRef.current.play().catch(error => {
          console.log('Play after unmute failed:', error)
        })
      }
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
        onSkipForward={skipForward}
        onSkipBackward={skipBackward}
      >
        <CenterPlayOverlay isPlaying={isPlaying} />

        {showRedirectOverlay && (
          <div className="absolute inset-0 w-full h-full z-50">
            <a 
              href="https://www.profitableratecpm.com/p4ptye9c?key=59ab21333377c7851cb775a1870fcacb"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
            </a>
          </div>
        )}

        {/* Advertisement Overlay */}
        {showAd && (
          <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/80">
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setShowAd(false)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors z-50 cursor-pointer"
              >
                ×
              </button>
              
              <div 
                id="content-display"
                className={`w-[${_x1._w}px] h-[${_x1._h}px] bg-gray-200 flex items-center justify-center`}
              >
                <div className="text-gray-500 text-sm">Loading content...</div>
              </div>
            </div>
          </div>
        )}

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
