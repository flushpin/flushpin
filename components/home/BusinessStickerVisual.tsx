import Image from 'next/image'

/**
 * Final promotional photograph for the homepage business acquisition section.
 */
export const BUSINESS_STICKER_VISUAL_SRC = '/images/flushpin-free-sticker-cafe.png'

/** Keep in sync with the wrapper below when changing crop. */
export const BUSINESS_STICKER_VISUAL_ASPECT = 'aspect-[4/5]' as const

type Props = {
  /** Optional override — defaults to BUSINESS_STICKER_VISUAL_SRC */
  src?: string | null
  alt?: string
}

/**
 * Right-column lifestyle image for the homepage business acquisition section.
 */
export default function BusinessStickerVisual({
  src = BUSINESS_STICKER_VISUAL_SRC,
  alt = 'FlushPin restroom access sticker with QR code on a restroom door inside a modern café',
}: Props) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101614] shadow-[0_28px_70px_rgba(0,0,0,0.55)] ${BUSINESS_STICKER_VISUAL_ASPECT}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 92vw, (max-width: 1024px) 44vw, 480px"
        />
      ) : null}
    </div>
  )
}
