"use client"

import React from "react"
import { Button } from "@/components/ui/button"

type BackToUploadButtonProps = {
  onBack: () => void
}

export default function BackToUploadButton({ onBack }: BackToUploadButtonProps) {
  return (
    <div className="mt-4 sm:mt-6 text-center">
      <Button
        onClick={onBack}
        variant="outline"
                  className="border-[#1c1c1c] text-gray-300 hover:bg-gray-800 cursor-pointer"
        style={{ borderRadius: "0", backgroundColor: "#111111" }}
      >
        ← Back to Upload
      </Button>
    </div>
  )
}


