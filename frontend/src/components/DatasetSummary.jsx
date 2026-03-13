export default function DatasetSummary({ data, quality }) {
  return (
    <div className="panel p-6 space-y-5">
      <h2 className="font-display text-xl font-semibold text-slate-900">Dataset Overview</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Rows" value={data.rows.toLocaleString()} />
        <MetricCard label="Columns" value={data.columns} />
        <MetricCard label="Numeric" value={data.numeric_columns.length} color="text-teal-700" />
        <MetricCard label="Categorical" value={data.categorical_columns.length} color="text-warning" />
      </div>

      {quality && (
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-600">Data Completeness</span>
            <span className="font-medium text-success">{quality.completeness}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-700 to-emerald-500 transition-all duration-700"
              style={{ width: `${quality.completeness}%` }}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
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
              <tr key={col.name} className="border-t border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2 text-slate-500">{i + 1}</td>
                <td className="px-4 py-2 font-medium text-slate-900">{col.name}</td>
                <td className="px-4 py-2">
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs text-slate-600 font-mono border border-slate-200">
                    {col.dtype}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    col.category === 'numeric'
                      ? 'bg-teal-100 text-teal-700'
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
                <td className="px-4 py-2 text-right text-slate-600">{col.unique}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color = 'text-slate-900' }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-600 mt-1">{label}</p>
    </div>
  )
}
