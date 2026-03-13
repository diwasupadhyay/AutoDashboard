import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#6ee7b7', '#fbbf24']

export default function Histograms({ data }) {
  const columns = Object.keys(data)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {columns.map((col, idx) => (
        <div key={col} className="glass-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wide">
            {col}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data[col].bins} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e45" vertical={false} />
              <XAxis
                dataKey="range"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={{ stroke: '#2a2e45' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: '#1c1f2e',
                  border: '1px solid #2a2e45',
                  borderRadius: 10,
                  fontSize: 12,
                  color: '#e2e8f0',
                }}
              />
              <Bar
                dataKey="count"
                fill={COLORS[idx % COLORS.length]}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  )
}
