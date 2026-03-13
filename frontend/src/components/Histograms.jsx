import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#6ee7b7', '#fbbf24']

export default function Histograms({ data }) {
  const columns = Object.keys(data)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {columns.map((col, idx) => (
        <div key={col} className="panel p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">
            {col}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data[col].bins} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d6dbe8" vertical={false} />
              <XAxis
                dataKey="range"
                tick={{ fill: '#6b7280', fontSize: 10 }}
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={{ stroke: '#d6dbe8' }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #d6dbe8',
                  borderRadius: 10,
                  fontSize: 12,
                  color: '#0f172a',
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
