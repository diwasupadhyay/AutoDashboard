export default function InsightsPanel({ data }) {
  const { highest_variance, missing_values, duplicate_rows, top_categorical, data_quality } = data

  return (
    <div className="glass-card p-6 space-y-5 h-full">
      <h2 className="text-xl font-semibold text-text">Key Insights</h2>

      {/* Highest Variance */}
      {highest_variance && (
        <InsightCard
          icon="📊"
          title="Highest Variance"
          color="text-accent-light"
        >
          <span className="font-semibold text-text">{highest_variance.column}</span>
          <span className="ml-2 text-text-muted text-sm">
            σ² = {Number(highest_variance.variance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </InsightCard>
      )}

      {/* Missing Values */}
      <InsightCard
        icon="⚠️"
        title="Missing Values"
        color={missing_values.length > 0 ? 'text-warning' : 'text-success'}
      >
        {missing_values.length === 0 ? (
          <span className="text-success text-sm">No missing values — great data quality!</span>
        ) : (
          <ul className="space-y-1 text-sm">
            {missing_values.map((m) => (
              <li key={m.column} className="flex items-center justify-between text-text-muted">
                <span className="font-medium text-text">{m.column}</span>
                <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs text-warning">
                  {m.count} ({m.percentage}%)
                </span>
              </li>
            ))}
          </ul>
        )}
      </InsightCard>

      {/* Duplicates */}
      <InsightCard
        icon="📋"
        title="Duplicate Rows"
        color={duplicate_rows > 0 ? 'text-danger' : 'text-success'}
      >
        {duplicate_rows > 0 ? (
          <span className="text-danger text-sm font-medium">{duplicate_rows} duplicate rows found</span>
        ) : (
          <span className="text-success text-sm">No duplicate rows</span>
        )}
      </InsightCard>

      {/* Data Quality */}
      {data_quality && (
        <InsightCard icon="✅" title="Data Quality" color="text-success">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-text-dim text-xs">Total Cells</p>
              <p className="font-semibold text-text">{data_quality.total_cells.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-text-dim text-xs">Total Missing</p>
              <p className="font-semibold text-text">{data_quality.total_missing.toLocaleString()}</p>
            </div>
          </div>
        </InsightCard>
      )}

      {/* Top Categorical */}
      {Object.keys(top_categorical).length > 0 && (
        <InsightCard icon="🏷️" title="Top Categorical Values" color="text-accent-light">
          <div className="space-y-3 text-sm max-h-48 overflow-y-auto pr-1">
            {Object.entries(top_categorical).slice(0, 3).map(([col, values]) => (
              <div key={col}>
                <p className="text-text-muted font-medium mb-1">{col}</p>
                <div className="flex flex-wrap gap-1.5">
                  {values.slice(0, 3).map((v) => (
                    <span
                      key={v.value}
                      className="rounded-md bg-surface-alt border border-border px-2 py-0.5 text-xs text-text"
                    >
                      {v.value} <span className="text-text-dim">({v.count})</span>
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
    <div className="rounded-xl bg-surface-alt border border-border p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{icon}</span>
        <h3 className={`text-sm font-semibold ${color}`}>{title}</h3>
      </div>
      {children}
    </div>
  )
}
