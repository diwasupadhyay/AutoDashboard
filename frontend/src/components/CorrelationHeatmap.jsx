import { useMemo } from 'react'

/**
 * Renders a correlation matrix as a colour-coded heatmap using plain SVG.
 * Each cell is coloured on a diverging blue ↔ red scale (−1 … +1).
 */
export default function CorrelationHeatmap({ data }) {
  const { columns, matrix } = data
  const n = columns.length

  const CELL = 56          // cell size in px
  const LABEL_W = 90       // left label width
  const LABEL_H = 90       // top label height
  const width = LABEL_W + n * CELL
  const height = LABEL_H + n * CELL

  // Pre-compute colours
  const cellColors = useMemo(() => {
    return matrix.map((row) =>
      row.map((v) => correlationColor(v))
    )
  }, [matrix])

  return (
    <div className="glass-card p-6">
      <h2 className="mb-4 text-xl font-semibold text-text">Correlation Heatmap</h2>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto"
          style={{ maxWidth: Math.min(width, 700), width: '100%' }}
        >
          {/* Column labels (top) */}
          {columns.map((col, ci) => (
            <text
              key={`top-${ci}`}
              x={LABEL_W + ci * CELL + CELL / 2}
              y={LABEL_H - 8}
              textAnchor="end"
              transform={`rotate(-45 ${LABEL_W + ci * CELL + CELL / 2} ${LABEL_H - 8})`}
              fill="#94a3b8"
              fontSize={11}
              fontFamily="Inter, sans-serif"
            >
              {col}
            </text>
          ))}

          {/* Row labels + cells */}
          {matrix.map((row, ri) => (
            <g key={`row-${ri}`}>
              <text
                x={LABEL_W - 8}
                y={LABEL_H + ri * CELL + CELL / 2 + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize={11}
                fontFamily="Inter, sans-serif"
              >
                {columns[ri]}
              </text>

              {row.map((val, ci) => {
                const displayVal = val != null ? val.toFixed(2) : '–'
                return (
                  <g key={`cell-${ri}-${ci}`}>
                    <rect
                      x={LABEL_W + ci * CELL + 1}
                      y={LABEL_H + ri * CELL + 1}
                      width={CELL - 2}
                      height={CELL - 2}
                      rx={6}
                      fill={cellColors[ri][ci]}
                    />
                    <text
                      x={LABEL_W + ci * CELL + CELL / 2}
                      y={LABEL_H + ri * CELL + CELL / 2 + 4}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize={11}
                      fontWeight={600}
                      fontFamily="Inter, sans-serif"
                    >
                      {displayVal}
                    </text>
                  </g>
                )
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
        <span>−1</span>
        <div
          className="h-3 w-40 rounded-full"
          style={{
            background: 'linear-gradient(to right, #3b82f6, #1e293b, #ef4444)',
          }}
        />
        <span>+1</span>
      </div>
    </div>
  )
}

/** Map correlation value (−1…+1) to a hex colour on a blue ↔ red scale. */
function correlationColor(v) {
  if (v == null) return '#1e293b'
  const t = (v + 1) / 2 // normalise to 0…1
  // Blue (0) → Dark (0.5) → Red (1)
  const r = Math.round(t < 0.5 ? 59 + t * 2 * (30 - 59) : 30 + (t - 0.5) * 2 * (239 - 30))
  const g = Math.round(t < 0.5 ? 130 + t * 2 * (41 - 130) : 41 + (t - 0.5) * 2 * (68 - 41))
  const b = Math.round(t < 0.5 ? 246 + t * 2 * (59 - 246) : 59 + (t - 0.5) * 2 * (68 - 59))
  return `rgb(${r},${g},${b})`
}
