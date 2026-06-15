'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { adminTheme, type DayCount } from '../theme'

type Props = {
  title: string
  data: DayCount[]
  emptyLabel?: string
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: adminTheme.card,
        border: `1px solid ${adminTheme.cardBorder}`,
        borderRadius: 10,
        padding: '10px 12px',
        fontFamily: adminTheme.fontBody,
        fontSize: 12,
        color: adminTheme.text,
      }}
    >
      <div style={{ color: adminTheme.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ color: adminTheme.teal, fontWeight: 700 }}>{payload[0].value.toLocaleString()}</div>
    </div>
  )
}

export default function AdminBarChart({ title, data, emptyLabel = 'No data yet' }: Props) {
  const hasData = data.some((d) => d.count > 0)
  const chartData = data.map((d) => ({ name: d.label, count: d.count }))

  return (
    <div
      style={{
        background: adminTheme.card,
        border: `1px solid ${adminTheme.cardBorder}`,
        borderRadius: 16,
        padding: 20,
        minHeight: 320,
      }}
    >
      <h3
        style={{
          margin: '0 0 16px',
          fontFamily: adminTheme.fontDisplay,
          fontSize: 16,
          fontWeight: 700,
          color: adminTheme.text,
        }}
      >
        {title}
      </h3>

      {!hasData ? (
        <div
          style={{
            height: 240,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: adminTheme.textMuted,
            fontSize: 14,
            fontFamily: adminTheme.fontBody,
          }}
        >
          {emptyLabel}
        </div>
      ) : (
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: adminTheme.textMuted, fontSize: 11, fontFamily: adminTheme.fontBody }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={56}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: adminTheme.textMuted, fontSize: 11, fontFamily: adminTheme.fontBody }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: adminTheme.tealMuted }} />
              <Bar dataKey="count" fill={adminTheme.teal} radius={[6, 6, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
