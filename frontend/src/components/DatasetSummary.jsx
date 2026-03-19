import { useState } from 'react'

export default function DatasetSummary({ data, quality }) {
  const [showAllColumns, setShowAllColumns] = useState(false)

  const displayedColumns = showAllColumns ? data.column_info : data.column_info.slice(0, 6)
  const hasMoreColumns = data.column_info.length > 6

  return (
    <div className="panel p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          Dataset Overview
        </h3>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard label="Rows" value={data.rows.toLocaleString()} icon="rows" />
        <MetricCard label="Columns" value={data.columns} icon="cols" />
        <MetricCard label="Numeric" value={data.numeric_columns.length} color="text-teal-700" icon="num" />
        <MetricCard label="Categorical" value={data.categorical_columns.length} color="text-amber-600" icon="cat" />
      </div>

      {/* Completeness Bar */}
      {quality && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-slate-600 text-xs font-medium">Data Completeness</span>
            <span className={`font-semibold text-sm ${quality.completeness >= 95 ? 'text-emerald-600' : quality.completeness >= 80 ? 'text-amber-600' : 'text-red-500'}`}>
              {quality.completeness}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                quality.completeness >= 95
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-500'
                  : quality.completeness >= 80
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-red-500 to-red-400'
              }`}
              style={{ width: `${quality.completeness}%` }}
            />
          </div>
        </div>
      )}

      {/* Column Table */}
      <div className="flex-1 overflow-hidden">
        <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-64 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0">
              <tr className="bg-slate-100 text-slate-600">
                <th className="px-3 py-2 text-left font-medium">Column</th>
                <th className="px-3 py-2 text-left font-medium">Type</th>
                <th className="px-3 py-2 text-right font-medium">Missing</th>
                <th className="px-3 py-2 text-right font-medium">Unique</th>
              </tr>
            </thead>
            <tbody>
              {displayedColumns.map((col) => (
                <tr key={col.name} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-1.5 font-medium text-slate-800 truncate max-w-[120px]" title={col.name}>
                    {col.name}
                  </td>
                  <td className="px-3 py-1.5">
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      col.category === 'numeric'
                        ? 'bg-teal-50 text-teal-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {col.category}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {col.missing > 0
                      ? <span className="text-red-500 font-medium">{col.missing}</span>
                      : <span className="text-emerald-600">0</span>
                    }
                  </td>
                  <td className="px-3 py-1.5 text-right text-slate-500">{col.unique}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasMoreColumns && (
          <button
            onClick={() => setShowAllColumns(!showAllColumns)}
            className="mt-2 w-full text-center text-xs text-teal-600 hover:text-teal-700 font-medium"
          >
            {showAllColumns ? 'Show less' : `Show all ${data.column_info.length} columns`}
          </button>
        )}
      </div>
    </div>
  )
}

function MetricCard({ label, value, color = 'text-slate-900', icon }) {
  const icons = {
    rows: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    cols: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
    num: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
    cat: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  }

  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
      <div className="flex items-center gap-2">
        <span className="text-slate-400">{icons[icon]}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className={`text-xl font-bold ${color} mt-1`}>{value}</p>
    </div>
  )
}
