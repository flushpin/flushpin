const fs = require('fs')
const path = require('path')

const root = process.cwd()

const checks = [
  {
    file: 'app/HomePage.tsx',
    required: [
      'fp-real-phone',
      'fp-real-screen',
      '/flushpin-app-home-screen.png',
      'FlushPin iPhone app home screen',
    ],
    forbidden: [
      'aria-label="FlushPin map preview"',
      '<div className="fp-phone"',
    ],
  },
  {
    file: 'app/business/page.tsx',
    required: [
      'fp-ipad',
      'fp-ipad-dashboard',
      'FlushPin Business on iPad',
      'Restroom-to-customer dashboard',
      'A shop owner sees restroom requests, offers, code reveals, and repeat demand in one place.',
    ],
    forbidden: [
      'Corner Bakery campaign',
      'fp-map-pin one',
      'Business offer preview',
    ],
  },
]

const requiredFiles = [
  'public/flushpin-app-home-screen.png',
]

const failures = []

for (const relativePath of requiredFiles) {
  const absolutePath = path.join(root, relativePath)
  if (!fs.existsSync(absolutePath)) {
    failures.push(`${relativePath} is missing`)
  }
}

for (const check of checks) {
  const absolutePath = path.join(root, check.file)
  if (!fs.existsSync(absolutePath)) {
    failures.push(`${check.file} is missing`)
    continue
  }

  const source = fs.readFileSync(absolutePath, 'utf8')

  for (const marker of check.required) {
    if (!source.includes(marker)) {
      failures.push(`${check.file} is missing protected marker: ${marker}`)
    }
  }

  for (const marker of check.forbidden) {
    if (source.includes(marker)) {
      failures.push(`${check.file} contains old protected-screen marker: ${marker}`)
    }
  }
}

if (failures.length > 0) {
  console.error('\nProtected FlushPin web hero screens changed without approval.')
  console.error('Do not modify these areas without explicit approval from John:')
  console.error('- Home page iPhone app screenshot hero')
  console.error('- Business page iPad dashboard hero\n')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  console.error('')
  process.exit(1)
}

console.log('Protected web hero screens verified.')
