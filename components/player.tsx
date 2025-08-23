"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import VideoSurface from '@/components/player/VideoSurface'
import CenterPlayOverlay from '@/components/player/CenterPlayOverlay'
import TitleOverlay from '@/components/player/TitleOverlay'
import ControlsBar from '@/components/player/ControlsBar'
import BackToUploadButton from '@/components/player/BackToUploadButton'
import AdRedirect from '@/components/player/AdRedirect'
import AdBlockerDetection from '@/components/player/AdBlockerDetection'


interface VideoPlayerProps {
  src: string
  uploadResponse?: any
  onBack: () => void
  showBackButton?: boolean
  fullWidth?: boolean
  fullHeight?: boolean
  autoPlay?: boolean
  videoId?: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  uploadResponse, 
  onBack, 
  showBackButton = true, 
  fullWidth = false, 
  fullHeight = false,
  autoPlay = false,
  videoId
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isAdBlocked, setIsAdBlocked] = useState(false)
  const isAdBlockedRef = useRef(false)
  const userPausedRef = useRef(false)
  const autoplayRetryRef = useRef(0)
  const autoplayRetryTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoMutedRef = useRef(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isPlayRequestPending, setIsPlayRequestPending] = useState(false)
  const displayTitle = uploadResponse?.title || 'Unknown Title'
  const [playbackRate, setPlaybackRate] = useState(1)
  const [currentSrc, setCurrentSrc] = useState(src)
  const hlsInstanceRef = useRef<any>(null)
  const [activeSource, setActiveSource] = useState<'hls' | 'normal'>(() => {
    const isM3u8 = typeof src === 'string' && src.toLowerCase().includes('.m3u8')
    return isM3u8 ? 'hls' : 'normal'
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as HTMLElement).isContentEditable)) {
        return
      }
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

      switch (e.key) {
        case 'ArrowLeft': {
          e.preventDefault()
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
          }
          break
        }
        case 'ArrowRight': {
          e.preventDefault()
          if (videoRef.current) {
            const vid = videoRef.current
            vid.currentTime = Math.min(vid.duration || vid.currentTime + 10, vid.currentTime + 10)
          }
          break
        }
        case 'm':
        case 'M': {
          e.preventDefault()
          if (videoRef.current) {
            const newMuted = !videoRef.current.muted
            videoRef.current.muted = newMuted
            setIsMuted(newMuted)
            if (!newMuted && videoRef.current.paused && autoPlay && !isPlayRequestPending) {
              safePlay()
            }
          }
          break
        }
        default:
          break
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
    
    try {
      const isEmbedded = window.self !== window.top
      if (!isEmbedded) {
        setInterval(handleDevTools, 1000)
      }
    } catch {
    }

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
        attemptAutoPlay()
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

  // Apply playback rate when changed
  useEffect(() => {
    if (videoRef.current) {
      try {
        videoRef.current.playbackRate = playbackRate
      } catch {}
    }
  }, [playbackRate])

  // Handle HLS vs normal source switching
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const isM3u8 = typeof currentSrc === 'string' && currentSrc.toLowerCase().includes('.m3u8')

    // Cleanup previous hls instance
    if (hlsInstanceRef.current) {
      try { hlsInstanceRef.current.destroy() } catch {}
      hlsInstanceRef.current = null
    }

    if (isM3u8) {
      // Native HLS support (Safari)
      if (video.canPlayType('application/vnd.apple.mpegURL')) {
        try { video.src = currentSrc } catch {}
      } else {
        // Use hls.js for browsers without native support
        ;(async () => {
          try {
            const mod = await import('hls.js')
            const Hls = mod.default
            if (Hls && Hls.isSupported()) {
              const hls = new Hls()
              hlsInstanceRef.current = hls
              hls.attachMedia(video)
              hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                try { hls.loadSource(currentSrc) } catch {}
              })
            } else {
              try { video.src = currentSrc } catch {}
            }
          } catch {
            try { video.src = currentSrc } catch {}
          }
        })()
      }
    } else {
      try { video.src = currentSrc } catch {}
    }

    return () => {
      if (hlsInstanceRef.current) {
        try { hlsInstanceRef.current.destroy() } catch {}
        hlsInstanceRef.current = null
      }
    }
  }, [currentSrc])

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
        controlsTimeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      const video = videoRef.current
      
      const handleCanPlay = () => {
        if (video.paused && autoPlay && !isPlayRequestPending) {
          attemptAutoPlay()
        }
      }
      
      const handleLoadedData = () => {
        if (video.paused && autoPlay && !isPlayRequestPending) {
          attemptAutoPlay()
        }
      }
      
      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('loadeddata', handleLoadedData)
      
      if (video.readyState >= 2 && video.paused && autoPlay && !isPlayRequestPending) {
        attemptAutoPlay()
      }
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('loadeddata', handleLoadedData)
      }
    }
  }, [src, autoPlay, isPlayRequestPending])

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current
      video.muted = false
      setIsMuted(false)
    }
  }, [src])

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      const video = videoRef.current
      
      const playTimeout = setTimeout(() => {
        if (video.paused && autoPlay && !isPlayRequestPending) {
          attemptAutoPlay()
        }
      }, 500)
      
      return () => clearTimeout(playTimeout)
    }
  }, [autoPlay, isPlayRequestPending])



  const safePlay = async () => {
    if (isAdBlockedRef.current) {
      return
    }
    if (videoRef.current && !isPlayRequestPending && videoRef.current.paused) {
      setIsPlayRequestPending(true)
      try {
        await videoRef.current.play()
      } catch (error) {
        console.log('Play failed:', error)
      } finally {
        setIsPlayRequestPending(false)
      }
    }
  }

  const togglePlay = () => {
    if (isAdBlockedRef.current) {
      return
    }
    if (videoRef.current) {
      if (autoMutedRef.current) {
        try { videoRef.current.muted = false } catch {}
        setIsMuted(false)
        autoMutedRef.current = false
      }
      if (isPlaying) {
        videoRef.current.pause()
        userPausedRef.current = true
      } else {
        safePlay()
        userPausedRef.current = false
      }
    }
    handleVideoInteraction()
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
      
      if (!videoRef.current.muted && videoRef.current.paused && autoPlay && !isPlayRequestPending) {
        safePlay()
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
    if (autoMutedRef.current && videoRef.current) {
      try { videoRef.current.muted = false } catch {}
      setIsMuted(false)
      autoMutedRef.current = false
    }
    showControlsTemporarily()
  }

  const handleTouchMove = () => {
    showControlsTemporarily()
  }

  const handleVideoClick = () => {
    if (autoMutedRef.current && videoRef.current) {
      try { videoRef.current.muted = false } catch {}
      setIsMuted(false)
      autoMutedRef.current = false
    }
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

  useEffect(() => {
    return () => {
      if (autoplayRetryTimerRef.current) {
        clearTimeout(autoplayRetryTimerRef.current)
        autoplayRetryTimerRef.current = null
      }
    }
  }, [])

  const attemptAutoPlay = () => {
    if (!autoPlay) return
    if (isAdBlockedRef.current) return
    if (userPausedRef.current) return
    const video = videoRef.current
    if (!video) return
    if (!video.paused) return
    if (isPlayRequestPending) return

    try {
      video.muted = false
      setIsMuted(false)
      autoMutedRef.current = false
    } catch {}
    safePlay()

    if (autoplayRetryRef.current < 5) {
      autoplayRetryRef.current += 1
      autoplayRetryTimerRef.current = setTimeout(() => {
        if (videoRef.current && videoRef.current.paused && !isAdBlockedRef.current && !userPausedRef.current) {
          attemptAutoPlay()
        }
      }, 400)
    } else {
      autoplayRetryRef.current = 0
    }
  }

  // Keep internal src in sync with incoming src changes
  useEffect(() => {
    setCurrentSrc(src)
    setActiveSource(() => (typeof src === 'string' && src.toLowerCase().includes('.m3u8') ? 'hls' : 'normal'))
  }, [src])

  // Source control handlers
  const handleSelectSource = (mode: 'hls' | 'normal') => {
    const hlsUrl = uploadResponse?.stream_url
    const normalUrl = uploadResponse?.preview_url || src
    if (mode === 'hls' && hlsUrl) {
      setCurrentSrc(hlsUrl)
      setActiveSource('hls')
    } else if (mode === 'normal' && normalUrl) {
      setCurrentSrc(normalUrl)
      setActiveSource('normal')
    }
  }

  return (
    <div className={`${fullWidth ? 'w-full' : 'max-w-4xl mx-auto'} ${fullHeight ? 'h-full' : ''}`}>
      <div className="relative w-full h-full">
        <AdBlockerDetection
          onDetectedChange={(detected: boolean) => {
            setIsAdBlocked(detected)
            isAdBlockedRef.current = detected
            if (detected && videoRef.current) {
              try { videoRef.current.pause() } catch {}
              try { videoRef.current.muted = true } catch {}
              setIsMuted(true)
              setIsPlaying(false)
            } else if (!detected) {
              autoplayRetryRef.current = 0
              attemptAutoPlay()
            }
          }}
        >
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
              <TitleOverlay title={displayTitle} show={showControls} />
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
                videoId={videoId}
                playbackRate={playbackRate}
                onChangePlaybackRate={setPlaybackRate}
                embedCode={(() => {
                  if (uploadResponse?.embed_iframe) return uploadResponse.embed_iframe
                  if (!videoId) return undefined
                  const base = process.env.NEXT_PUBLIC_WEB_URL || (typeof window !== 'undefined' ? window.location.origin : '')
                  if (!base) return undefined
                  return `<iframe src="${base}/video/${videoId}" width="360" height="640" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`
                })()}
              />
              
              <AdRedirect isPlaying={isPlaying} />
            </VideoSurface>
        </AdBlockerDetection>
      </div>

      {showBackButton && <BackToUploadButton onBack={onBack} />}
    </div>
  )
}

export default VideoPlayer
