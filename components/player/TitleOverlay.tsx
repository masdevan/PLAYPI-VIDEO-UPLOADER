import React from 'react'

type TitleOverlayProps = {
  title: string
  show?: boolean
}

export default function TitleOverlay({ title, show = true }: TitleOverlayProps) {
  return (
    <div className={`absolute top-0 left-0 w-full pointer-events-none z-30 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className="p-3 sm:p-4 md:p-5 max-w-full">
        <h1
          className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold leading-snug line-clamp-2 drop-shadow-md break-words"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
        >
          {title}
        </h1>
      </div>
    </div>
  )
}


