import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const COLORS = ['#f59e0b', '#fb923c', '#fbbf24', '#a78bfa', '#f472b6']
const MAX_LABEL_CHARS = 16

function shortenLabel(value) {
  if (typeof value !== 'string') return value
  return value.length > MAX_LABEL_CHARS ? `${value.slice(0, MAX_LABEL_CHARS - 1)}...` : value
}

function CustomCategoryTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null

  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-900">{point.name}</p>
      <p className="mt-1 text-slate-600">
        Count: <span className="font-medium text-slate-800">{point.count.toLocaleString()}</span>
      </p>
      {point.percentage !== undefined && (
        <p className="text-slate-600">
          Share: <span className="font-medium text-slate-800">{point.percentage}%</span>
        </p>
      )}
    </div>
  )
}

export default function BarCharts({ data }) {
  const columns = Object.keys(data)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {columns.map((col, idx) => {
        const chartData = data[col].map((item) => ({
          ...item,
          shortName: shortenLabel(item.name),
        }))

        return (
          <div key={col} className="panel p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">
            {col}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 4, left: 20 }}
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
                dataKey="shortName"
                tick={{ fill: '#1f2937', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={0}
                minTickGap={0}
                width={132}
              />
              <Tooltip content={<CustomCategoryTooltip />} />
              <Bar
                dataKey="count"
                fill={COLORS[idx % COLORS.length]}
                radius={[0, 6, 6, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        )
      })}
    </div>
  )
}
