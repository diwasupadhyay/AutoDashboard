import { useState } from 'react'
import axios from 'axios'
import FileUpload from './components/FileUpload'
import DatasetSummary from './components/DatasetSummary'
import Histograms from './components/Histograms'
import BarCharts from './components/BarCharts'
import InsightsPanel from './components/InsightsPanel'
import KPICards from './components/KPICards'
import StatisticsCards from './components/StatisticsCards'
import AutoInsights from './components/AutoInsights'
import DataPreview from './components/DataPreview'

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || ''
const api = axios.create({ baseURL: API_BASE, timeout: 30000 })

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-xl font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}

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
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
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

      <main className="relative z-10 mx-auto max-w-[1400px] px-6 py-8 space-y-8">
        {!summary && !loading && (
          <section className="animate-fade-in grid gap-8 py-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
                Turn raw CSV files into decision-grade dashboards.
              </h2>
              <p className="mt-4 max-w-xl text-base text-slate-600 md:text-lg">
                Upload a dataset and get immediate KPIs, statistical analysis, and quality metrics in one beautiful, responsive interface.
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
            <p className="font-medium text-slate-600">Processing dataset and generating analytics...</p>
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
          <div className="space-y-10 animate-fade-in">
            {/* Header with Reset Button */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
                  Dashboard Overview
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Comprehensive analytics for {summary.filename}
                </p>
              </div>
              <button
                onClick={resetDashboard}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-teal-700 hover:text-teal-700 transition"
              >
                Upload new file
              </button>
            </div>

            {/* Section 1: KPIs */}
            <section>
              <SectionHeader
                title="Key Performance Indicators"
                subtitle="Automatically detected metrics from your data"
              />
              <KPICards data={analytics} summary={summary} />
            </section>

            {/* Section 2: Overview Grid - Auto Insights + Data Quality */}
            <section className="grid gap-6 lg:grid-cols-2">
              <AutoInsights insights={insights.auto_insights} />
              <DatasetSummary data={summary} quality={insights.data_quality} />
            </section>

            {/* Section 3: Data Preview */}
            {summary.preview && summary.preview.length > 0 && (
              <section>
                <SectionHeader
                  title="Data Preview"
                  subtitle="First records from your dataset"
                />
                <DataPreview data={summary.preview} />
              </section>
            )}

            {/* Section 4: Statistical Summary */}
            {Object.keys(analytics.summary_statistics).length > 0 && (
              <section>
                <SectionHeader
                  title="Statistical Summary"
                  subtitle="Detailed statistics for each numeric column"
                />
                <StatisticsCards
                  data={analytics.summary_statistics}
                  outliers={analytics.outliers}
                />
              </section>
            )}

            {/* Section 5: Numeric Distributions */}
            {Object.keys(analytics.histograms).length > 0 && (
              <section>
                <SectionHeader
                  title="Numeric Distributions"
                  subtitle="Value distribution histograms"
                />
                <Histograms data={analytics.histograms} />
              </section>
            )}

            {/* Section 6: Categorical Analysis */}
            {Object.keys(analytics.bar_charts).length > 0 && (
              <section>
                <SectionHeader
                  title="Categorical Analysis"
                  subtitle="Top values for categorical columns"
                />
                <BarCharts data={analytics.bar_charts} />
              </section>
            )}

            {/* Section 7: Data Quality */}
            <section>
              <SectionHeader
                title="Data Quality Report"
                subtitle="Missing values, duplicates, and data health"
              />
              <InsightsPanel data={insights} />
            </section>
          </div>
        )}
      </main>

      <footer className="relative z-10 mt-8 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        Auto Dashboard Generator &copy; {new Date().getFullYear()} • Built for fast analytics storytelling
      </footer>
    </div>
  )
}
