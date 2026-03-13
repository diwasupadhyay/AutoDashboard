import { useRef, useState } from 'react'

export default function FileUpload({ onUpload }) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState(null)

  const handleFile = (file) => {
    if (!file) return
    setFileName(file.name)
    onUpload(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        panel flex w-full cursor-pointer flex-col items-center justify-center
        gap-3 rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300
        ${dragActive
          ? 'border-teal-700 bg-teal-100 shadow-soft'
          : 'border-slate-200 hover:border-teal-500'
        }
      `}
    >
      <svg className="h-12 w-12 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
      </svg>

      <p className="text-slate-900 font-semibold">
        {fileName ? fileName : 'Drag & drop your CSV here'}
      </p>
      <p className="text-sm text-slate-600">
        or <span className="text-teal-700 underline">browse files</span>
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  )
}
