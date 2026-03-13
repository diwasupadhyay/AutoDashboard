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

app = FastAPI(title="Auto Dashboard Generator API")

# CORS – allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory store (single-user demo)
# ---------------------------------------------------------------------------
_current_df: pd.DataFrame | None = None
_current_filename: str = ""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _classify_columns(df: pd.DataFrame):
    """Return lists of numeric and categorical column names."""
    numeric = df.select_dtypes(include="number").columns.tolist()
    categorical = df.select_dtypes(exclude="number").columns.tolist()
    return numeric, categorical


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
# POST /upload
# ---------------------------------------------------------------------------
@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    global _current_df, _current_filename

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {e}")

    _current_df = df
    _current_filename = file.filename

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
        "filename": file.filename,
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
def get_analytics():
    if _current_df is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded yet.")

    df = _current_df
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
        counts, bin_edges = np.histogram(series, bins=min(20, len(series.unique())))
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
def get_insights():
    if _current_df is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded yet.")

    df = _current_df
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
