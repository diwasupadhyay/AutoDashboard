import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const COLORS = ['#f59e0b', '#fb923c', '#fbbf24', '#a78bfa', '#f472b6']

export default function BarCharts({ data }) {
  const columns = Object.keys(data)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {columns.map((col, idx) => (
        <div key={col} className="panel p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">
            {col}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data[col]}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#d6dbe8" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#d6dbe8' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#1f2937', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={100}
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
