import { useState } from 'react'
import axios from 'axios'
import FileUpload from './components/FileUpload'
import DatasetSummary from './components/DatasetSummary'
import Histograms from './components/Histograms'
import BarCharts from './components/BarCharts'
import InsightsPanel from './components/InsightsPanel'

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || ''
const api = axios.create({ baseURL: API_BASE, timeout: 30000 })

export default function App() {
  const [summary, setSummary] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [insights, setInsights] = useState(null)
  const [datasetId, setDatasetId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleUpload = async (file) => {
    setLoading(true)
    setError(null)
    setSummary(null)
    setAnalytics(null)
    setInsights(null)
    setDatasetId(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await api.post('/upload', formData)
      setSummary(uploadRes.data)
      setDatasetId(uploadRes.data.dataset_id)

      const [analyticsRes, insightsRes] = await Promise.all([
        api.get('/analytics', { params: { dataset_id: uploadRes.data.dataset_id } }),
        api.get('/insights', { params: { dataset_id: uploadRes.data.dataset_id } }),
      ])
      setAnalytics(analyticsRes.data)
      setInsights(insightsRes.data)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const resetDashboard = () => {
    setError(null)
    setSummary(null)
    setAnalytics(null)
    setInsights(null)
    setDatasetId(null)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="bg-orb bg-orb-a" aria-hidden="true" />
      <div className="bg-orb bg-orb-b" aria-hidden="true" />

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-slate-50/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white font-bold text-sm shadow-soft">
              DA
            </div>
            <div>
              <h1 className="font-display text-[1.1rem] font-semibold tracking-tight text-slate-900">
                Auto Dashboard
              </h1>
              <p className="text-xs text-slate-600">CSV Analytics Dashboard Generator</p>
            </div>
          </div>
          {summary && (
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">
                {summary.filename}
              </span>
              {datasetId && (
                <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-medium text-teal-700">
                  Session live
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1320px] px-6 py-8 space-y-8">
        {!summary && !loading && (
          <section className="animate-fade-in grid gap-8 py-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
                Turn raw CSV files into decision-grade dashboards.
              </h2>
              <p className="mt-4 max-w-xl text-base text-slate-600 md:text-lg">
                Upload a dataset and get immediate summary metrics, distribution views, and quality insights in one beautiful, responsive interface.
              </p>
            </div>
            <div className="hero-card">
              <h3 className="mb-2 font-display text-xl font-semibold text-slate-900">Start with a CSV upload</h3>
              <p className="mb-6 text-sm text-slate-600">Files are analyzed in seconds and visualized automatically.</p>
              <FileUpload onUpload={handleUpload} />
            </div>
          </section>
        )}

        {loading && (
          <div className="panel flex flex-col items-center justify-center py-28 animate-fade-in">
            <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-teal-700 animate-spin mb-4"></div>
            <p className="font-medium text-slate-600">Processing dataset and generating charts...</p>
          </div>
        )}

        {error && (
          <div className="panel animate-fade-in mx-auto max-w-2xl border-red-400/40 p-6 text-center">
            <p className="text-red-500 font-semibold">{error}</p>
            <button
              onClick={resetDashboard}
              className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-200 transition"
            >
              Reset and try again
            </button>
          </div>
        )}

        {summary && analytics && insights && !loading && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
                Dashboard Overview
              </h2>
              <button
                onClick={resetDashboard}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-teal-700 hover:text-teal-700 transition"
              >
                Upload new file
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DatasetSummary data={summary} quality={insights.data_quality} />
              </div>
              <div>
                <InsightsPanel data={insights} />
              </div>
            </div>

            {Object.keys(analytics.histograms).length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-xl font-semibold text-slate-900">
                  Numeric Distributions
                </h2>
                <Histograms data={analytics.histograms} />
              </section>
            )}

            {Object.keys(analytics.bar_charts).length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-xl font-semibold text-slate-900">
                  Categorical Breakdown
                </h2>
                <BarCharts data={analytics.bar_charts} />
              </section>
            )}
          </div>
        )}
      </main>

      <footer className="relative z-10 mt-8 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        Auto Dashboard Generator &copy; {new Date().getFullYear()} • Built for fast analytics storytelling
      </footer>
    </div>
  )
}
