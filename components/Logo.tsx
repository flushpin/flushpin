import Image from 'next/image'

type LogoProps = {
  height?: number
  href?: string
}

export default function Logo({ height = 40, href = '/' }: LogoProps) {
  const img = (
    <Image src="/icon-512.png" alt="FlushPin" width={height} height={height} />
  )

  if (!href) return img

  return (
    <a href={href} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
      {img}
    </a>
  )
}
