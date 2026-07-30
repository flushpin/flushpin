import Image from 'next/image'

type LogoProps = {
  height?: number
  href?: string
  /** Use on dark backgrounds (homepage hero header). */
  variant?: 'light' | 'dark'
}

export default function Logo({ height = 40, href = '/', variant = 'light' }: LogoProps) {
  const img =
    variant === 'dark' ? (
      <span
        className="inline-flex items-center font-extrabold lowercase tracking-tight"
        style={{ fontSize: Math.round(height * 0.72), lineHeight: 1 }}
        aria-label="FlushPin"
      >
        <span className="text-white">flush</span>
        <span className="text-fp-teal">pin</span>
      </span>
    ) : (
      <Image
        src="/flushpin-logo-teal.png"
        alt="FlushPin"
        width={Math.round(height * 2.24)}
        height={height}
        style={{ width: 'auto', height }}
        priority
      />
    )

  if (!href) return img

  return (
    <a href={href} className="inline-flex items-center no-underline">
      {img}
    </a>
  )
}
