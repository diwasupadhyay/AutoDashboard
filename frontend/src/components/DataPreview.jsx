export default function DataPreview({ data, columns }) {
  if (!data || data.length === 0) return null

  const columnNames = columns || Object.keys(data[0] || {})

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-900">Data Preview</h3>
          <p className="text-sm text-slate-500">First {data.length} records</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {columnNames.length} columns
        </span>
      </div>
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              {columnNames.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap px-3 py-2.5 text-left font-semibold text-slate-700 bg-slate-50 first:rounded-tl-lg last:rounded-tr-lg"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                {columnNames.map((col) => (
                  <td
                    key={col}
                    className="whitespace-nowrap px-3 py-2 text-slate-600 max-w-[200px] truncate"
                    title={String(row[col] ?? '')}
                  >
                    {row[col] === null || row[col] === undefined ? (
                      <span className="text-slate-300 italic">null</span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
