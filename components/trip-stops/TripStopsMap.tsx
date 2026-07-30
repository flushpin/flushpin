'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef, useState } from 'react'
import type { GeoJSONSource, Map as MapLibreMap, Marker } from 'maplibre-gl'
import type { LatLng, TripRoute, TripStop } from '../../lib/tripStops'

type Props = {
  route?: TripRoute
  anchor?: LatLng
  stops: TripStop[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'

export default function TripStopsMap({ route, anchor, stops, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<Marker[]>([])
  const onSelectRef = useRef(onSelect)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let cancelled = false

    void import('maplibre-gl').then((maplibregl) => {
      if (cancelled || !containerRef.current || mapRef.current) return
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: [-117.7892, 33.6846],
        zoom: 10,
        attributionControl: { compact: true },
      })
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
      mapRef.current = map
      map.once('load', () => {
        if (!cancelled) setMapReady(true)
      })
    })

    return () => {
      cancelled = true
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    const render = async () => {
      const maplibregl = await import('maplibre-gl')
      const waitForLoad = () =>
        new Promise<void>((resolve) => {
          if (map.loaded()) resolve()
          else map.once('load', () => resolve())
        })
      await waitForLoad()

      if (route?.points.length) {
        const data: GeoJSON.Feature<GeoJSON.LineString> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.points.map((point) => [point.lng, point.lat]),
          },
        }
        const source = map.getSource('trip-route') as GeoJSONSource | undefined
        if (source) source.setData(data)
        else {
          map.addSource('trip-route', { type: 'geojson', data })
          map.addLayer({
            id: 'trip-route-line',
            type: 'line',
            source: 'trip-route',
            paint: {
              'line-color': '#00a886',
              'line-width': 5,
              'line-opacity': 0.9,
            },
          })
        }
      }

      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      if (route) {
        const originEl = document.createElement('div')
        originEl.className = 'trip-map-endpoint'
        originEl.setAttribute('aria-label', 'Starting point')
        markersRef.current.push(
          new maplibregl.Marker({ element: originEl }).setLngLat([route.origin.lng, route.origin.lat]).addTo(map),
        )
        const destinationEl = document.createElement('div')
        destinationEl.className = 'trip-map-endpoint trip-map-endpoint-destination'
        destinationEl.setAttribute('aria-label', 'Destination')
        markersRef.current.push(
          new maplibregl.Marker({ element: destinationEl })
            .setLngLat([route.destination.lng, route.destination.lat])
            .addTo(map),
        )
      } else if (anchor) {
        const anchorEl = document.createElement('div')
        anchorEl.className = 'trip-map-anchor'
        anchorEl.setAttribute('aria-label', 'Destination area')
        markersRef.current.push(
          new maplibregl.Marker({ element: anchorEl }).setLngLat([anchor.lng, anchor.lat]).addTo(map),
        )
      }

      stops.forEach((stop, index) => {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = `trip-map-marker${stop.id === selectedId ? ' is-selected' : ''}`
        button.textContent = String(index + 1)
        button.setAttribute('aria-label', `Select stop ${index + 1}: ${stop.name}`)
        button.addEventListener('click', () => onSelectRef.current(stop.id))
        markersRef.current.push(
          new maplibregl.Marker({ element: button }).setLngLat([stop.lng, stop.lat]).addTo(map),
        )
      })

      const bounds = new maplibregl.LngLatBounds()
      route?.points.forEach((point) => bounds.extend([point.lng, point.lat]))
      if (!route && anchor) bounds.extend([anchor.lng, anchor.lat])
      stops.forEach((stop) => bounds.extend([stop.lng, stop.lat]))
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 48, maxZoom: 13, duration: 0 })
      }
    }

    void render()
  }, [route, anchor, stops, selectedId, mapReady])

  useEffect(() => {
    const map = mapRef.current
    const selected = stops.find((stop) => stop.id === selectedId)
    if (map && selected) {
      map.easeTo({ center: [selected.lng, selected.lat], zoom: Math.max(map.getZoom(), 12), duration: 350 })
    }
  }, [selectedId, stops])

  return (
    <div
      ref={containerRef}
      className="h-[360px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#111816] md:h-[520px]"
      aria-label="Trip Stops map"
    />
  )
}
