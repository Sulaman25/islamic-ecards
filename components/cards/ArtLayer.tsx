// components/cards/ArtLayer.tsx
"use client"
import type { ArtConfig, CardPalette } from "@/types/card"
import { ArtLayerCSS }    from "./ArtLayerCSS"
import { ArtLayerLottie } from "./ArtLayerLottie"
import { ArtLayerImage }  from "./ArtLayerImage"

interface Props {
  art: ArtConfig
  palette: CardPalette
  isOpen: boolean
}

export function ArtLayer({ art, palette, isOpen }: Props) {
  if (art.tier === "lottie") return <ArtLayerLottie art={art} palette={palette} isOpen={isOpen} />
  if (art.tier === "image")  return <ArtLayerImage  art={art} palette={palette} isOpen={isOpen} />
  return <ArtLayerCSS art={art} palette={palette} isOpen={isOpen} />
}
