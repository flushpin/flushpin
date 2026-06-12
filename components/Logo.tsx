type LogoProps = {
  height?: number
  href?: string
}

export default function Logo({ height = 32, href = '/' }: LogoProps) {
  const img = (
    <img
      src="/flushpin-logo.png"
      alt="flushpin"
      height={height}
      style={{ height, width: 'auto', display: 'block' }}
    />
  )

  if (!href) return img

  return (
    <a href={href} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
      {img}
    </a>
  )
}
