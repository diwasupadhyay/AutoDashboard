import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const COLORS = ['#f59e0b', '#fb923c', '#fbbf24', '#a78bfa', '#f472b6']

export default function BarCharts({ data }) {
  const columns = Object.keys(data)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {columns.map((col, idx) => (
        <div key={col} className="glass-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wide">
            {col}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data[col]}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e45" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#2a2e45' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#e2e8f0', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={100}
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
                radius={[0, 6, 6, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  )
}
