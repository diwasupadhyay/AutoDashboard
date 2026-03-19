import { useState } from 'react'

function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return 'N/A'
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

function getSkewnessInterpretation(skewness) {
  if (skewness === null || skewness === undefined) return null
  if (skewness > 1) return { text: 'Highly right-skewed', color: 'text-amber-600' }
  if (skewness > 0.5) return { text: 'Moderately right-skewed', color: 'text-amber-500' }
  if (skewness < -1) return { text: 'Highly left-skewed', color: 'text-amber-600' }
  if (skewness < -0.5) return { text: 'Moderately left-skewed', color: 'text-amber-500' }
  return { text: 'Approximately symmetric', color: 'text-emerald-600' }
}

function BoxPlotMini({ stats }) {
  if (!stats.min || !stats.max || !stats.q1 || !stats.q3 || !stats['50%']) return null

  const min = stats.min
  const max = stats.max
  const range = max - min
  if (range === 0) return null

  const q1Pos = ((stats.q1 - min) / range) * 100
  const q3Pos = ((stats.q3 - min) / range) * 100
  const medianPos = ((stats['50%'] - min) / range) * 100

  return (
    <div className="mt-3 px-1">
      <div className="relative h-4">
        {/* Track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-slate-200 rounded" />

        {/* Whiskers */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-slate-400"
          style={{ left: '0%', width: `${q1Pos}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-slate-400"
          style={{ left: `${q3Pos}%`, width: `${100 - q3Pos}%` }}
        />

        {/* Min/Max markers */}
        <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-2 bg-slate-400" style={{ left: '0%' }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-2 bg-slate-400" style={{ left: '100%', transform: 'translateX(-100%) translateY(-50%)' }} />

        {/* IQR Box */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 bg-gradient-to-r from-teal-400 to-teal-500 rounded-sm opacity-80"
          style={{ left: `${q1Pos}%`, width: `${q3Pos - q1Pos}%` }}
        />

        {/* Median line */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-teal-700"
          style={{ left: `${medianPos}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>{formatNumber(min, 0)}</span>
        <span>{formatNumber(max, 0)}</span>
      </div>
    </div>
  )
}

function StatCard({ column, stats, outlierData, isExpanded, onToggle }) {
  const skewInfo = getSkewnessInterpretation(stats.skewness)

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
            {column.charAt(0).toUpperCase()}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-900">{column}</h3>
            <p className="text-xs text-slate-500">
              Avg: {formatNumber(stats.mean)} | Median: {formatNumber(stats['50%'])}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {outlierData && outlierData.count > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
              {outlierData.count} outlier{outlierData.count > 1 ? 's' : ''}
            </span>
          )}
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-100">
          {/* Box Plot Visualization */}
          <BoxPlotMini stats={stats} />

          {/* Statistics Grid */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <StatItem label="Count" value={formatNumber(stats.count, 0)} />
            <StatItem label="Mean" value={formatNumber(stats.mean)} />
            <StatItem label="Median" value={formatNumber(stats['50%'])} />
            <StatItem label="Std Dev" value={formatNumber(stats.std)} />
            <StatItem label="Min" value={formatNumber(stats.min)} />
            <StatItem label="Q1 (25%)" value={formatNumber(stats.q1 || stats['25%'])} />
            <StatItem label="Q3 (75%)" value={formatNumber(stats.q3 || stats['75%'])} />
            <StatItem label="Max" value={formatNumber(stats.max)} />
          </div>

          {/* Advanced Statistics */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Advanced Metrics</p>
            <div className="grid grid-cols-3 gap-3">
              <StatItem label="Sum" value={stats.sum ? formatNumber(stats.sum) : 'N/A'} />
              <StatItem label="IQR" value={stats.iqr ? formatNumber(stats.iqr) : 'N/A'} />
              <StatItem label="CV %" value={stats.cv ? `${stats.cv.toFixed(1)}%` : 'N/A'} />
            </div>
          </div>

          {/* Distribution Shape */}
          {(stats.skewness !== null || stats.kurtosis !== null) && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Distribution Shape</p>
              <div className="flex items-center gap-4">
                {stats.skewness !== null && (
                  <div>
                    <span className="text-xs text-slate-500">Skewness: </span>
                    <span className="text-sm font-medium text-slate-700">{stats.skewness.toFixed(2)}</span>
                    {skewInfo && (
                      <span className={`ml-2 text-xs ${skewInfo.color}`}>({skewInfo.text})</span>
                    )}
                  </div>
                )}
                {stats.kurtosis !== null && (
                  <div>
                    <span className="text-xs text-slate-500">Kurtosis: </span>
                    <span className="text-sm font-medium text-slate-700">{stats.kurtosis.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Outliers */}
          {outlierData && outlierData.count > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Outliers (IQR Method)</p>
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">{outlierData.count}</span> value{outlierData.count > 1 ? 's' : ''} outside bounds
                  [{formatNumber(outlierData.lower_bound)} – {formatNumber(outlierData.upper_bound)}]
                </p>
                {outlierData.values.length > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Values: {outlierData.values.slice(0, 5).map(v => formatNumber(v)).join(', ')}
                    {outlierData.values.length > 5 && '...'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatItem({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

export default function StatisticsCards({ data, outliers }) {
  const [expandedCols, setExpandedCols] = useState(new Set())

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="panel p-6 text-center text-slate-500">
        No numeric columns available for statistical analysis.
      </div>
    )
  }

  const toggleExpand = (col) => {
    setExpandedCols(prev => {
      const next = new Set(prev)
      if (next.has(col)) {
        next.delete(col)
      } else {
        next.add(col)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedCols(new Set(Object.keys(data)))
  }

  const collapseAll = () => {
    setExpandedCols(new Set())
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button
          onClick={expandAll}
          className="text-xs text-slate-500 hover:text-teal-600 transition-colors"
        >
          Expand All
        </button>
        <span className="text-slate-300">|</span>
        <button
          onClick={collapseAll}
          className="text-xs text-slate-500 hover:text-teal-600 transition-colors"
        >
          Collapse All
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(data).map(([col, stats]) => (
          <StatCard
            key={col}
            column={col}
            stats={stats}
            outlierData={outliers?.[col]}
            isExpanded={expandedCols.has(col)}
            onToggle={() => toggleExpand(col)}
          />
        ))}
      </div>
    </div>
  )
}
