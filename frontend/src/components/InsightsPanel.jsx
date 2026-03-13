export default function InsightsPanel({ data }) {
  const { highest_variance, missing_values, duplicate_rows, top_categorical, data_quality } = data

  return (
    <div className="panel p-6 space-y-5 h-full">
      <h2 className="font-display text-xl font-semibold text-slate-900">Key Insights</h2>

      {highest_variance && (
        <InsightCard
          icon="HV"
          title="Highest Variance"
          color="text-teal-700"
        >
          <span className="font-semibold text-slate-900">{highest_variance.column}</span>
          <span className="ml-2 text-slate-600 text-sm">
            σ² = {Number(highest_variance.variance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </InsightCard>
      )}

      <InsightCard
        icon="MV"
        title="Missing Values"
        color={missing_values.length > 0 ? 'text-warning' : 'text-success'}
      >
        {missing_values.length === 0 ? (
          <span className="text-success text-sm">No missing values — great data quality!</span>
        ) : (
          <ul className="space-y-1 text-sm">
            {missing_values.map((m) => (
              <li key={m.column} className="flex items-center justify-between text-slate-600">
                <span className="font-medium text-slate-900">{m.column}</span>
                <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs text-warning">
                  {m.count} ({m.percentage}%)
                </span>
              </li>
            ))}
          </ul>
        )}
      </InsightCard>

      <InsightCard
        icon="DR"
        title="Duplicate Rows"
        color={duplicate_rows > 0 ? 'text-danger' : 'text-success'}
      >
        {duplicate_rows > 0 ? (
          <span className="text-danger text-sm font-medium">{duplicate_rows} duplicate rows found</span>
        ) : (
          <span className="text-success text-sm">No duplicate rows</span>
        )}
      </InsightCard>

      {data_quality && (
        <InsightCard icon="DQ" title="Data Quality" color="text-success">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-slate-500 text-xs">Total Cells</p>
              <p className="font-semibold text-slate-900">{data_quality.total_cells.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Total Missing</p>
              <p className="font-semibold text-slate-900">{data_quality.total_missing.toLocaleString()}</p>
            </div>
          </div>
        </InsightCard>
      )}

      {Object.keys(top_categorical).length > 0 && (
        <InsightCard icon="TC" title="Top Categorical Values" color="text-teal-700">
          <div className="space-y-3 text-sm max-h-48 overflow-y-auto pr-1">
            {Object.entries(top_categorical).slice(0, 3).map(([col, values]) => (
              <div key={col}>
                <p className="text-slate-600 font-medium mb-1">{col}</p>
                <div className="flex flex-wrap gap-1.5">
                  {values.slice(0, 3).map((v) => (
                    <span
                      key={v.value}
                      className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-900"
                    >
                      {v.value} <span className="text-slate-500">({v.count})</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </InsightCard>
      )}
    </div>
  )
}

function InsightCard({ icon, title, color, children }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-600">
          {icon}
        </span>
        <h3 className={`text-sm font-semibold ${color}`}>{title}</h3>
      </div>
      {children}
    </div>
  )
}
