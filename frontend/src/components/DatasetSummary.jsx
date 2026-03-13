export default function DatasetSummary({ data, quality }) {
  return (
    <div className="glass-card p-6 space-y-5">
      <h2 className="text-xl font-semibold text-text">Dataset Overview</h2>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Rows" value={data.rows.toLocaleString()} />
        <MetricCard label="Columns" value={data.columns} />
        <MetricCard label="Numeric" value={data.numeric_columns.length} color="text-accent-light" />
        <MetricCard label="Categorical" value={data.categorical_columns.length} color="text-warning" />
      </div>

      {/* Data quality bar */}
      {quality && (
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-text-muted">Data Completeness</span>
            <span className="font-medium text-success">{quality.completeness}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-success transition-all duration-700"
              style={{ width: `${quality.completeness}%` }}
            />
          </div>
        </div>
      )}

      {/* Column table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-alt text-text-muted">
              <th className="px-4 py-2.5 text-left font-medium">#</th>
              <th className="px-4 py-2.5 text-left font-medium">Column</th>
              <th className="px-4 py-2.5 text-left font-medium">Type</th>
              <th className="px-4 py-2.5 text-left font-medium">Category</th>
              <th className="px-4 py-2.5 text-right font-medium">Missing</th>
              <th className="px-4 py-2.5 text-right font-medium">Unique</th>
            </tr>
          </thead>
          <tbody>
            {data.column_info.map((col, i) => (
              <tr key={col.name} className="border-t border-border hover:bg-card-hover transition-colors">
                <td className="px-4 py-2 text-text-dim">{i + 1}</td>
                <td className="px-4 py-2 font-medium text-text">{col.name}</td>
                <td className="px-4 py-2">
                  <span className="rounded-md bg-surface-alt px-2 py-0.5 text-xs text-text-muted font-mono">
                    {col.dtype}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    col.category === 'numeric'
                      ? 'bg-accent/15 text-accent-light'
                      : 'bg-warning/15 text-warning'
                  }`}>
                    {col.category}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  {col.missing > 0
                    ? <span className="text-danger font-medium">{col.missing}</span>
                    : <span className="text-success">0</span>
                  }
                </td>
                <td className="px-4 py-2 text-right text-text-muted">{col.unique}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color = 'text-text' }) {
  return (
    <div className="rounded-xl bg-surface-alt border border-border p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-text-muted mt-1">{label}</p>
    </div>
  )
}
