"use client"

import React, { useEffect, useRef, useState } from 'react'
import AD_CONFIG from '@/lib/adConfig'

interface MediaPlayerProps {
    isPlaying: boolean
    children: React.ReactNode
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ isPlaying, children }) => {
    const [showMediaOverlay, setShowMediaOverlay] = useState(false)
    const [showUserLayer, setShowUserLayer] = useState(false)
    const mediaIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const userIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const [userEngaged, setUserEngaged] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const [videoStarted, setVideoStarted] = useState(false)
    const EXTERNAL_TARGET = AD_CONFIG.getExternalTarget()
    
    const USER_LAYER_DELAY = 10000  
    const MEDIA_OVERLAY_DELAY = 120000   

    useEffect(() => {
        console.log('AdRedirect Debug:', {
            isPlaying,
            EXTERNAL_TARGET,
            isInitialized,
            videoStarted,
            userEngaged,
            adsEnabled: AD_CONFIG.isEnabled()
        })
    }, [isPlaying, EXTERNAL_TARGET, isInitialized, videoStarted, userEngaged])

    useEffect(() => {
        if (AD_CONFIG.isEnabled() && !isInitialized && (isPlaying || userEngaged)) {
            console.log('Initializing ads...')
            setIsInitialized(true)
            setVideoStarted(true)
            setShowUserLayer(true)
            
            if (userIntervalRef.current) {
                clearInterval(userIntervalRef.current)
            }
            userIntervalRef.current = setInterval(() => {
                console.log('Showing user layer ad')
                setShowUserLayer(true)
            }, USER_LAYER_DELAY)
            
            if (mediaIntervalRef.current) {
                clearInterval(mediaIntervalRef.current)
            }
            mediaIntervalRef.current = setInterval(() => {
                console.log('Showing media overlay ad')
                setShowMediaOverlay(true)
            }, MEDIA_OVERLAY_DELAY)
        }
    }, [isPlaying, userEngaged, isInitialized])
    useEffect(() => {
        if (isPlaying && AD_CONFIG.isEnabled() && isInitialized) {
            if (!userIntervalRef.current) {
                userIntervalRef.current = setInterval(() => {
                    setShowUserLayer(true)
                }, USER_LAYER_DELAY)
            }
            
            if (!mediaIntervalRef.current) {
                mediaIntervalRef.current = setInterval(() => {
                    setShowMediaOverlay(true)
                }, MEDIA_OVERLAY_DELAY)
            }
        }
    }, [isPlaying, isInitialized])
    useEffect(() => {
        if (!isPlaying && videoStarted) {
            console.log('Video stopped, cleaning up ads')
            if (userIntervalRef.current) {
                clearInterval(userIntervalRef.current)
                userIntervalRef.current = null
            }
            if (mediaIntervalRef.current) {
                clearInterval(mediaIntervalRef.current)
                mediaIntervalRef.current = null
            }
            setShowUserLayer(false)
            setShowMediaOverlay(false)
        }
    }, [isPlaying, videoStarted])
    useEffect(() => {
        return () => {
            if (userIntervalRef.current) {
                clearInterval(userIntervalRef.current)
            }
            if (mediaIntervalRef.current) {
                clearInterval(mediaIntervalRef.current)
            }
        }
    }, [])

    const handleUserEngagement = () => {
        if (!userEngaged) {
            console.log('User engaged, starting ads')
            setUserEngaged(true)
        }
    }

    const handleMediaClick = () => {
        if (EXTERNAL_TARGET) {
            console.log('Media overlay clicked, redirecting to:', EXTERNAL_TARGET)
            window.open(EXTERNAL_TARGET, '_blank', 'noopener,noreferrer')
            setShowMediaOverlay(false)
        }
    }

    const handleUserClick = () => {
        if (EXTERNAL_TARGET) {
            console.log('User layer clicked, redirecting to:', EXTERNAL_TARGET)
            window.open(EXTERNAL_TARGET, '_blank', 'noopener,noreferrer')
            setShowUserLayer(false)
            if (userIntervalRef.current) {
                clearInterval(userIntervalRef.current)
            }
            setTimeout(() => {
                setShowUserLayer(true)
                userIntervalRef.current = setInterval(() => {
                    setShowUserLayer(true)
                }, USER_LAYER_DELAY)
            }, USER_LAYER_DELAY)
        }
    }

    if (!AD_CONFIG.isEnabled()) {
        console.warn('Ads are not enabled')
        return <>{children}</>
    }

    return (
        <div
            className="relative w-full h-full"
            onClick={handleUserEngagement}
            onTouchStart={handleUserEngagement}
        >
            {children}

            {showUserLayer && EXTERNAL_TARGET && (
                <div className="fixed inset-0 w-full h-full z-40">
                    <div
                        className="absolute inset-0 w-full h-full bg-transparent cursor-pointer"
                        onClick={handleUserClick}
                    />
                </div>
            )}

            {showMediaOverlay && EXTERNAL_TARGET && (
                <div className="fixed inset-0 w-full h-full z-50">
                    <div
                        className="absolute inset-0 w-full h-full bg-black/50"
                        onClick={handleMediaClick}
                    />
                    
                    <button
                        onClick={handleMediaClick}
                        className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold hover:bg-red-600 transition-colors z-10 cursor-pointer"
                    >
                        ×
                    </button>
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div 
                            className="bg-white/90 rounded-lg p-6 text-center max-w-sm mx-4 pointer-events-auto cursor-pointer hover:bg-white/95 transition-colors"
                            onClick={handleMediaClick}
                        >
                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                                Special Offer!
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Click here to get exclusive content and offers!
                            </p>
                            <button
                                onClick={handleMediaClick}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Click Here
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MediaPlayer
