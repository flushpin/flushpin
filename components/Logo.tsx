import Image from 'next/image'

type LogoProps = {
  height?: number
  href?: string
}

export default function Logo({ height = 40, href = '/' }: LogoProps) {
  const img = (
    <Image src="/flushpin-logo-teal.png" alt="FlushPin" width={Math.round(height * 2.24)} height={height} style={{ width: "auto", height }} priority />
  )

  if (!href) return img

  return (
    <a href={href} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
      {img}
    </a>
  )
}
