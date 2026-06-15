'use client'

import { useEffect } from 'react'
import HomePage from '../HomePage'
import { useLang } from '../../lib/LanguageContext'

export default function EsHomePage() {
  const { setLang } = useLang()

  useEffect(() => {
    setLang('es')
  }, [setLang])

  return <HomePage />
}
