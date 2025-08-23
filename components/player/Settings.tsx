"use client"

import React, { useEffect, useRef, useState } from "react"
import { Settings as SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type SettingsProps = {
  onTouchStart?: () => void
  playbackRate?: number
  onChangePlaybackRate?: (rate: number) => void
  embedCode?: string
}

export default function Settings({ onTouchStart, playbackRate = 1, onChangePlaybackRate, embedCode }: SettingsProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [showEmbedTooltip, setShowEmbedTooltip] = useState(false)
  const embedTooltipTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [isEmbedded, setIsEmbedded] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
      if (embedTooltipTimerRef.current) clearTimeout(embedTooltipTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setIsEmbedded(window.self !== window.top)
      } catch {
        setIsEmbedded(true)
      }
    }
  }, [])

  return (
    <div className="relative" ref={wrapperRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        onTouchStart={onTouchStart}
        className="text-white hover:bg-white/20 w-7 h-7 sm:w-9 sm:h-9 cursor-pointer p-0"
        style={{ borderRadius: "0" }}
        title="Settings"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <SettingsIcon className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-9 right-0 z-[1000] min-w-[220px] bg-black/90 text-white text-xs rounded shadow border border-white/10 pointer-events-auto"
        >
          <div className="px-3 py-2 border-b border-white/10 font-semibold">Settings</div>
          <div className="p-3 space-y-3">
            <div>
              <div className="mb-2 opacity-80">Speed</div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 1.2, 1.5, 2, 4, 8].map((rate) => (
                  <button
                    key={rate}
                    className={`px-2 py-1.5 border cursor-pointer ${
                      playbackRate === rate 
                        ? 'bg-white text-black' 
                        : 'bg-transparent text-white border-white/20 hover:bg-white/10'
                    } transition`}
                    onClick={() => onChangePlaybackRate && onChangePlaybackRate(rate)}
                  >
                    {rate === 1 ? 'Normal' : `${rate}x`}
                </button>
                ))}
              </div>
            </div>

            {!isEmbedded && (
              <div className="relative pointer-events-auto">
                {showEmbedTooltip && (
                  <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-black text-xs px-2 py-1 rounded shadow z-[1000]">
                    Video has embedded to clipboard
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full border-white/30 text-white bg-white/10 hover:bg-white/20 cursor-pointer"
                  style={{ borderRadius: "0" }}
                  onClick={async () => {
                    try {
                      const fallbackBase = typeof window !== 'undefined' ? window.location.href : ''
                      const code = embedCode || (fallbackBase ? `<iframe src="${fallbackBase}" width="360" height="640" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>` : '')
                      if (!code) return
                      await navigator.clipboard.writeText(code)
                      setShowEmbedTooltip(true)
                      if (embedTooltipTimerRef.current) clearTimeout(embedTooltipTimerRef.current)
                      embedTooltipTimerRef.current = setTimeout(() => setShowEmbedTooltip(false), 1200)
                    } catch {}
                  }}
                  onTouchStart={onTouchStart}
                >
                  Embed Iframe
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


