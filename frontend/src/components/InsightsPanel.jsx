export default function InsightsPanel({ data }) {
  const { highest_variance, missing_values, duplicate_rows, top_categorical, data_quality } = data

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Data Quality Overview */}
      {data_quality && (
        <QualityCard
          title="Data Quality Score"
          score={data_quality.completeness}
          totalCells={data_quality.total_cells}
          totalMissing={data_quality.total_missing}
        />
      )}

      {/* Missing Values */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-1.5 rounded-lg ${missing_values.length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-700">Missing Values</h3>
        </div>

        {missing_values.length === 0 ? (
          <div className="flex items-center gap-2 text-emerald-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">No missing values!</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {missing_values.map((m) => (
              <div key={m.column} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 font-medium truncate max-w-[120px]" title={m.column}>
                  {m.column}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{m.count}</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-medium">
                    {m.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Duplicates */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-1.5 rounded-lg ${duplicate_rows > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-700">Duplicate Rows</h3>
        </div>

        {duplicate_rows > 0 ? (
          <div className="flex items-center gap-2 text-red-600">
            <span className="text-2xl font-bold">{duplicate_rows}</span>
            <span className="text-sm">duplicate rows found</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">No duplicates</span>
          </div>
        )}
      </div>

      {/* Highest Variance */}
      {highest_variance && (
        <div className="panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-violet-100 text-violet-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Highest Variance</h3>
          </div>

          <div>
            <p className="text-lg font-bold text-slate-900">{highest_variance.column}</p>
            <p className="text-sm text-slate-500">
              σ² = {Number(highest_variance.variance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* Top Categorical Values */}
      {Object.keys(top_categorical).length > 0 && (
        <div className="panel p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-sky-100 text-sky-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Top Categorical Values</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(top_categorical).slice(0, 3).map(([col, values]) => (
              <div key={col} className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{col}</p>
                <div className="space-y-1">
                  {values.slice(0, 3).map((v, i) => (
                    <div key={v.value} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {i + 1}
                        </span>
                        <span className="text-slate-700 truncate max-w-[100px]" title={v.value}>
                          {v.value}
                        </span>
                      </div>
                      <span className="text-slate-500 text-xs">
                        {v.count}
                        {v.percentage !== undefined && ` (${v.percentage}%)`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function QualityCard({ title, score, totalCells, totalMissing }) {
  const getScoreColor = (s) => {
    if (s >= 95) return 'text-emerald-600'
    if (s >= 80) return 'text-amber-600'
    return 'text-red-500'
  }

  const getScoreBg = (s) => {
    if (s >= 95) return 'from-emerald-500 to-teal-500'
    if (s >= 80) return 'from-amber-500 to-yellow-500'
    return 'from-red-500 to-orange-500'
  }

  return (
    <div className="panel p-4 relative overflow-hidden">
      <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full bg-gradient-to-br ${getScoreBg(score)} opacity-10`} />

      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>

      <div className="flex items-end gap-1 mb-3">
        <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-slate-400 text-lg mb-1">%</span>
      </div>

      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden mb-3">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getScoreBg(score)} transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-slate-400">Total Cells</p>
          <p className="font-semibold text-slate-700">{totalCells.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-400">Missing</p>
          <p className="font-semibold text-slate-700">{totalMissing.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
