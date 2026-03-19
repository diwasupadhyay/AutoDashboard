const CURRENCY_KEYWORDS = ['salary', 'price', 'amount', 'cost', 'revenue', 'income', 'bonus', 'payment', 'fee']
const RATE_KEYWORDS = ['rating', 'score', 'rate']

function detectColumnType(colName) {
  const lower = colName.toLowerCase()
  if (CURRENCY_KEYWORDS.some(kw => lower.includes(kw))) return 'currency'
  if (RATE_KEYWORDS.some(kw => lower.includes(kw))) return 'rate'
  return 'number'
}

function formatValue(value, type) {
  if (value === null || value === undefined) return 'N/A'

  if (type === 'currency') {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  if (type === 'rate') {
    return value.toFixed(1)
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

function formatRange(min, max, type) {
  if (type === 'currency') {
    const formatNum = (n) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n.toLocaleString()}`
    return `${formatNum(min)} - ${formatNum(max)}`
  }
  return `${min.toLocaleString()} - ${max.toLocaleString()}`
}

const KPI_STYLES = {
  currency: {
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  rate: {
    gradient: 'from-amber-400 to-orange-500',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  number: {
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  count: {
    gradient: 'from-sky-500 to-blue-600',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
}

function KPICard({ title, value, subtitle, type = 'number', range }) {
  const style = KPI_STYLES[type] || KPI_STYLES.number

  return (
    <div className="panel p-5 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${style.gradient} opacity-10 group-hover:opacity-15 transition-opacity`} />

      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${style.iconBg} ${style.iconColor}`}>
          {style.icon}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className={`text-2xl font-bold bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
        {range && (
          <p className="text-xs text-slate-400 mt-1">
            Range: {range}
          </p>
        )}
      </div>
    </div>
  )
}

export default function KPICards({ data, summary }) {
  if (!data?.kpis) return null

  const { kpis, summary_statistics } = data
  const kpiList = []

  // 1. Total Records KPI
  kpiList.push({
    title: 'Total Records',
    value: kpis.total_records.toLocaleString(),
    subtitle: `${kpis.numeric_columns} numeric, ${kpis.categorical_columns} categorical`,
    type: 'count',
  })

  // 2. Currency totals (Salary, Bonus, etc.)
  Object.entries(kpis.numeric_totals || {}).slice(0, 2).forEach(([col, total]) => {
    const rangeData = kpis.numeric_ranges?.[col]
    kpiList.push({
      title: `Total ${col}`,
      value: formatValue(total, 'currency'),
      subtitle: `Avg: ${formatValue(kpis.numeric_averages?.[col], 'currency')}`,
      type: 'currency',
      range: rangeData ? formatRange(rangeData.min, rangeData.max, 'currency') : null,
    })
  })

  // 3. Rate/Score averages
  Object.entries(kpis.numeric_ranges || {}).forEach(([col, range]) => {
    if (range.is_rate && !kpis.numeric_totals?.[col]) {
      kpiList.push({
        title: `Avg ${col}`,
        value: formatValue(kpis.numeric_averages?.[col], 'rate'),
        subtitle: `Out of ${range.max.toFixed(1)}`,
        type: 'rate',
        range: `${range.min.toFixed(1)} - ${range.max.toFixed(1)}`,
      })
    }
  })

  // 4. Other numeric averages (limit total to 6 KPIs)
  const remainingSlots = 6 - kpiList.length
  Object.entries(kpis.numeric_averages || {}).slice(0, remainingSlots).forEach(([col, avg]) => {
    const range = kpis.numeric_ranges?.[col]
    if (range && !range.is_currency && !range.is_rate && !kpiList.some(k => k.title.includes(col))) {
      kpiList.push({
        title: `Avg ${col}`,
        value: formatValue(avg, 'number'),
        subtitle: null,
        type: 'number',
        range: formatRange(range.min, range.max, 'number'),
      })
    }
  })

  // Take first 6 KPIs
  const displayKPIs = kpiList.slice(0, 6)

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {displayKPIs.map((kpi, i) => (
        <KPICard key={i} {...kpi} />
      ))}
    </div>
  )
}
