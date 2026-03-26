// components/cards/ArtLayerLottie.tsx
"use client"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { ArtLayerCSS } from "./ArtLayerCSS"
import type { ArtConfig, CardPalette } from "@/types/card"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

interface Props {
  art: ArtConfig
  palette: CardPalette
  isOpen: boolean
}

export function ArtLayerLottie({ art, palette, isOpen }: Props) {
  const [data, setData]       = useState<object | null>(null)
  const [failed, setFailed]   = useState(false)
  const [loaded, setLoaded]   = useState(false)

  useEffect(() => {
    if (!art.src || !isOpen) return
    fetch(art.src)
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json() })
      .then(d => { setData(d); setLoaded(true) })
      .catch(() => setFailed(true))
  }, [art.src, isOpen])

  // Fallback to CSS art if lottie file missing
  if (failed || !art.src) {
    return <ArtLayerCSS art={art} palette={palette} isOpen={isOpen} />
  }

  if (!loaded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "2rem", opacity: 0.3 }}>
        {art.icon}
      </div>
    )
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Lottie
        animationData={data!}
        loop={art.loop ?? false}
        autoplay={isOpen}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}
