import { useState } from 'react'
import axios from 'axios'
import FileUpload from './components/FileUpload'
import DatasetSummary from './components/DatasetSummary'
import Histograms from './components/Histograms'
import BarCharts from './components/BarCharts'
import CorrelationHeatmap from './components/CorrelationHeatmap'
import InsightsPanel from './components/InsightsPanel'

export default function App() {
  const [summary, setSummary] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleUpload = async (file) => {
    setLoading(true)
    setError(null)
    setSummary(null)
    setAnalytics(null)
    setInsights(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await axios.post('/upload', formData)
      setSummary(uploadRes.data)

      const [analyticsRes, insightsRes] = await Promise.all([
        axios.get('/analytics'),
        axios.get('/insights'),
      ])
      setAnalytics(analyticsRes.data)
      setInsights(insightsRes.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white font-bold text-sm">
              AD
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-text">
              Auto Dashboard
            </h1>
          </div>
          {summary && (
            <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent-light">
              {summary.filename}
            </span>
          )}
        </div>
      </header>

      {/* ─── Main content ───────────────────────────────────────── */}
      <main className="mx-auto max-w-[1440px] px-6 py-8 space-y-8">
        {/* Upload area */}
        {!summary && !loading && (
          <div className="animate-fade-in flex flex-col items-center justify-center py-20">
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-text">
              Upload your dataset
            </h2>
            <p className="mb-8 text-text-muted max-w-md text-center">
              Drop a CSV file to instantly generate an analytics dashboard with charts, statistics, and AI-powered insights.
            </p>
            <FileUpload onUpload={handleUpload} />
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="h-12 w-12 rounded-full border-4 border-border border-t-accent animate-spin mb-4"></div>
            <p className="text-text-muted">Analyzing your dataset…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="glass-card animate-fade-in mx-auto max-w-lg border-danger/40 p-6 text-center">
            <p className="text-danger font-medium">{error}</p>
            <button
              onClick={() => { setError(null); setSummary(null) }}
              className="mt-4 rounded-lg bg-danger/20 px-4 py-2 text-sm text-danger hover:bg-danger/30 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Dashboard */}
        {summary && analytics && insights && !loading && (
          <div className="space-y-8 animate-fade-in">
            {/* Upload new button */}
            <div className="flex justify-end">
              <button
                onClick={() => { setSummary(null); setAnalytics(null); setInsights(null) }}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-text-muted hover:border-accent hover:text-accent-light transition"
              >
                ← Upload New File
              </button>
            </div>

            {/* Summary + Insights row */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DatasetSummary data={summary} quality={insights.data_quality} />
              </div>
              <div>
                <InsightsPanel data={insights} />
              </div>
            </div>

            {/* Correlation Heatmap */}
            {analytics.correlation?.matrix && (
              <CorrelationHeatmap data={analytics.correlation} />
            )}

            {/* Histograms */}
            {Object.keys(analytics.histograms).length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-semibold text-text">
                  Numeric Distributions
                </h2>
                <Histograms data={analytics.histograms} />
              </section>
            )}

            {/* Bar Charts */}
            {Object.keys(analytics.bar_charts).length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-semibold text-text">
                  Categorical Breakdown
                </h2>
                <BarCharts data={analytics.bar_charts} />
              </section>
            )}
          </div>
        )}
      </main>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-border py-6 text-center text-xs text-text-dim">
        Auto Dashboard Generator &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
