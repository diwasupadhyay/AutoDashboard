"""
Auto Dashboard Generator – FastAPI Backend
Handles CSV upload, analytics computation, and insight generation.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import io
import json
import os
from uuid import uuid4

app = FastAPI(title="Auto Dashboard Generator API")

# CORS
_allowed_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost",
)
_allowed_origins = [o.strip() for o in _allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory store (per-upload session id)
# ---------------------------------------------------------------------------
_datasets: dict[str, dict[str, object]] = {}
_latest_dataset_id: str | None = None
_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _classify_columns(df: pd.DataFrame):
    """Return lists of numeric and categorical column names."""
    numeric = df.select_dtypes(include="number").columns.tolist()
    categorical = df.select_dtypes(exclude="number").columns.tolist()
    return numeric, categorical


def _resolve_dataset(dataset_id: str | None) -> tuple[str, pd.DataFrame, str]:
    """Resolve a dataset id to dataframe + filename with backward-compatible fallback."""
    global _latest_dataset_id

    resolved_id = dataset_id or _latest_dataset_id
    if not resolved_id or resolved_id not in _datasets:
        raise HTTPException(status_code=400, detail="No dataset uploaded yet.")

    dataset = _datasets[resolved_id]
    df = dataset["df"]
    filename = str(dataset["filename"])
    if not isinstance(df, pd.DataFrame):
        raise HTTPException(status_code=500, detail="Stored dataset is invalid.")

    return resolved_id, df, filename


def _safe_json(obj):
    """Convert numpy/pandas types to JSON-safe Python types."""
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return None if np.isnan(obj) else float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    return obj


# ---------------------------------------------------------------------------
# GET /health – Keep-alive endpoint (lightweight, no processing)
# ---------------------------------------------------------------------------
@app.get("/health")
def health_check():
    """Health check endpoint for keep-alive pings to prevent Render free tier spin-down."""
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# POST /upload
# ---------------------------------------------------------------------------
@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    global _latest_dataset_id

    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    contents = await file.read()
    file_size = len(contents)

    if file_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if file_size > _MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 50MB limit.")

    try:
        # Try common UTF encodings first for better portability.
        decoded = contents.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            decoded = contents.decode("latin-1")
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Could not decode file. Please upload UTF-8 or Latin-1 encoded CSV.",
            )

    try:
        df = pd.read_csv(io.StringIO(decoded))
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV contains headers but no data rows.")
    except pd.errors.ParserError as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {e}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {e}")

    dataset_id = str(uuid4())
    _datasets[dataset_id] = {
        "df": df,
        "filename": file.filename,
    }
    _latest_dataset_id = dataset_id

    numeric_cols, categorical_cols = _classify_columns(df)

    column_info = []
    for col in df.columns:
        column_info.append({
            "name": col,
            "dtype": str(df[col].dtype),
            "category": "numeric" if col in numeric_cols else "categorical",
            "missing": int(df[col].isna().sum()),
            "unique": int(df[col].nunique()),
        })

    return {
        "dataset_id": dataset_id,
        "filename": file.filename,
        "file_size_bytes": file_size,
        "rows": len(df),
        "columns": len(df.columns),
        "column_info": column_info,
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "preview": json.loads(df.head(5).to_json(orient="records", default_handler=str)),
    }


# ---------------------------------------------------------------------------
# GET /analytics
# ---------------------------------------------------------------------------
@app.get("/analytics")
def get_analytics(dataset_id: str | None = None):
    _, df, _ = _resolve_dataset(dataset_id)
    numeric_cols, categorical_cols = _classify_columns(df)

    # ---- Summary statistics ------------------------------------------------
    describe = {}
    if numeric_cols:
        desc = df[numeric_cols].describe()
        for col in numeric_cols:
            describe[col] = {
                stat: _safe_json(desc.at[stat, col])
                for stat in desc.index
            }

    # ---- Correlation matrix ------------------------------------------------
    correlation = {}
    if len(numeric_cols) > 1:
        corr = df[numeric_cols].corr()
        correlation = {
            "columns": numeric_cols,
            "matrix": [
                [_safe_json(corr.iat[r, c]) for c in range(len(numeric_cols))]
                for r in range(len(numeric_cols))
            ],
        }

    # ---- Histogram data (numeric) ------------------------------------------
    histograms = {}
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) == 0:
            continue
        unique_values = int(series.nunique())
        bin_count = max(1, min(20, unique_values))
        counts, bin_edges = np.histogram(series, bins=bin_count)
        histograms[col] = {
            "bins": [
                {
                    "range": f"{_safe_json(bin_edges[i]):.2f} – {_safe_json(bin_edges[i+1]):.2f}",
                    "start": _safe_json(bin_edges[i]),
                    "end": _safe_json(bin_edges[i+1]),
                    "count": int(counts[i]),
                }
                for i in range(len(counts))
            ]
        }

    # ---- Bar chart data (categorical) --------------------------------------
    bar_charts = {}
    for col in categorical_cols:
        vc = df[col].value_counts().head(10)
        bar_charts[col] = [
            {"name": str(k), "count": int(v)} for k, v in vc.items()
        ]

    return {
        "summary_statistics": describe,
        "correlation": correlation,
        "histograms": histograms,
        "bar_charts": bar_charts,
    }


# ---------------------------------------------------------------------------
# GET /insights
# ---------------------------------------------------------------------------
@app.get("/insights")
def get_insights(dataset_id: str | None = None):
    _, df, _ = _resolve_dataset(dataset_id)
    numeric_cols, categorical_cols = _classify_columns(df)

    # ---- Highest variance --------------------------------------------------
    highest_variance = None
    if numeric_cols:
        variances = df[numeric_cols].var()
        top_col = variances.idxmax()
        highest_variance = {
            "column": top_col,
            "variance": _safe_json(variances[top_col]),
        }

    # ---- Missing values ----------------------------------------------------
    missing = []
    for col in df.columns:
        n = int(df[col].isna().sum())
        if n > 0:
            missing.append({
                "column": col,
                "count": n,
                "percentage": round(n / len(df) * 100, 2),
            })

    # ---- Duplicates --------------------------------------------------------
    duplicate_count = int(df.duplicated().sum())

    # ---- Top categorical values --------------------------------------------
    top_categorical = {}
    for col in categorical_cols:
        vc = df[col].value_counts().head(5)
        top_categorical[col] = [
            {"value": str(k), "count": int(v)} for k, v in vc.items()
        ]

    # ---- Basic shape info --------------------------------------------------
    total_cells = int(df.shape[0] * df.shape[1])
    total_missing = int(df.isna().sum().sum())

    return {
        "highest_variance": highest_variance,
        "missing_values": missing,
        "duplicate_rows": duplicate_count,
        "top_categorical": top_categorical,
        "data_quality": {
            "total_cells": total_cells,
            "total_missing": total_missing,
            "completeness": round((1 - total_missing / total_cells) * 100, 2) if total_cells else 100,
        },
    }
