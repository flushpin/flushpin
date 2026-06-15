'use client'

import { useEffect, useRef } from 'react'
import { adminTheme, type LiveActivityPayload } from '../theme'

type Props = {
  data: LiveActivityPayload
}

const SOCAL_CENTER: [number, number] = [33.67, -117.78]

export default function LiveActivityMap({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    let map: import('leaflet').Map | null = null
    let disposed = false

    ;(async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (disposed || !containerRef.current) return

      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      map = L.map(containerRef.current, {
        center: SOCAL_CENTER,
        zoom: 9,
        scrollWheelZoom: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      const bounds: [number, number][] = []

      for (const point of data.points) {
        bounds.push([point.lat, point.lng])
        const recent = point.isRecent

        L.circleMarker([point.lat, point.lng], {
          radius: recent ? 9 : 6,
          color: recent ? '#5DCAA5' : adminTheme.teal,
          weight: recent ? 2 : 1,
          fillColor: recent ? adminTheme.teal : adminTheme.tealMuted,
          fillOpacity: recent ? 0.95 : 0.75,
        })
          .addTo(map)
          .bindPopup(
            `<strong>${escapeHtml(point.name)}</strong><br/>` +
              `${escapeHtml(point.address || 'No address')}<br/>` +
              `<span style="color:#0EB5AB">${recent ? 'Live' : 'Recent'} · ${new Date(point.viewedAt).toLocaleString()}</span>`,
          )
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [36, 36], maxZoom: 12 })
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 12)
      }

      mapRef.current = map
    })()

    return () => {
      disposed = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [data])

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={containerRef}
        style={{
          height: 420,
          width: '100%',
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${adminTheme.cardBorder}`,
          background: '#0a1614',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          zIndex: 500,
          background: 'rgba(11, 31, 29, 0.88)',
          border: `1px solid ${adminTheme.cardBorder}`,
          borderRadius: 8,
          padding: '8px 10px',
          fontSize: 11,
          color: adminTheme.textMuted,
          fontFamily: adminTheme.fontBody,
        }}
      >
        <span style={{ color: adminTheme.teal, fontWeight: 700 }}>●</span> Last {data.recentMinutes}m &nbsp;
        <span style={{ color: adminTheme.textSoft }}>○</span> Last {data.hours}h · {data.mapAttribution}
      </div>
    </div>
  )
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
