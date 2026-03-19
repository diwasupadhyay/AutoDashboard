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
from typing import Any

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


def _compute_advanced_stats(series: pd.Series) -> dict[str, Any]:
    """Compute advanced statistics for a numeric series."""
    clean = series.dropna()
    if len(clean) < 3:
        return {}

    q1 = float(clean.quantile(0.25))
    q3 = float(clean.quantile(0.75))
    iqr = q3 - q1
    mean_val = clean.mean()

    return {
        "sum": _safe_json(clean.sum()),
        "q1": _safe_json(q1),
        "q3": _safe_json(q3),
        "iqr": _safe_json(iqr),
        "skewness": _safe_json(clean.skew()),
        "kurtosis": _safe_json(clean.kurtosis()),
        "cv": _safe_json((clean.std() / mean_val) * 100) if mean_val != 0 else None,
    }


def _detect_outliers(series: pd.Series) -> dict[str, Any]:
    """Detect outliers using IQR method."""
    clean = series.dropna()
    if len(clean) < 4:
        return {"lower_bound": None, "upper_bound": None, "count": 0, "values": []}

    q1 = clean.quantile(0.25)
    q3 = clean.quantile(0.75)
    iqr = q3 - q1
    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr
    outliers = clean[(clean < lower) | (clean > upper)]

    return {
        "lower_bound": _safe_json(lower),
        "upper_bound": _safe_json(upper),
        "count": len(outliers),
        "values": [_safe_json(v) for v in outliers.tolist()[:10]],
    }


def _generate_kpis(df: pd.DataFrame, numeric_cols: list, categorical_cols: list) -> dict:
    """Generate smart KPIs based on column analysis."""
    kpis = {
        "total_records": len(df),
        "numeric_columns": len(numeric_cols),
        "categorical_columns": len(categorical_cols),
        "numeric_totals": {},
        "numeric_averages": {},
        "numeric_ranges": {},
        "category_distributions": {},
    }

    # Detect column types and compute appropriate KPIs
    currency_keywords = ["salary", "price", "amount", "cost", "revenue", "income", "bonus", "payment", "fee"]
    rate_keywords = ["rating", "score", "rate", "percentage", "pct"]

    for col in numeric_cols:
        col_lower = col.lower()
        series = df[col].dropna()
        if len(series) == 0:
            continue

        # Determine KPI type based on column name
        is_currency = any(kw in col_lower for kw in currency_keywords)
        is_rate = any(kw in col_lower for kw in rate_keywords)

        if is_currency:
            kpis["numeric_totals"][col] = _safe_json(series.sum())

        kpis["numeric_averages"][col] = _safe_json(series.mean())
        kpis["numeric_ranges"][col] = {
            "min": _safe_json(series.min()),
            "max": _safe_json(series.max()),
            "is_currency": is_currency,
            "is_rate": is_rate,
        }

    # Top category distributions
    for col in categorical_cols[:3]:
        vc = df[col].value_counts().head(5)
        total = len(df[col].dropna())
        kpis["category_distributions"][col] = {
            str(k): {
                "count": int(v),
                "percentage": round(v / total * 100, 1) if total > 0 else 0
            }
            for k, v in vc.items()
        }

    return kpis


def _generate_auto_insights(
    df: pd.DataFrame,
    numeric_cols: list,
    categorical_cols: list,
    correlation: dict,
    outliers: dict,
) -> list[dict]:
    """Generate human-readable insights automatically."""
    insights = []

    # 1. Total records insight
    insights.append({
        "type": "overview",
        "icon": "database",
        "title": "Dataset Size",
        "text": f"Analyzing {len(df):,} records across {len(df.columns)} columns",
        "priority": 1,
    })

    # 2. Top categorical distributions
    for col in categorical_cols[:2]:
        vc = df[col].value_counts()
        if len(vc) > 0:
            top_val = str(vc.index[0])
            top_pct = round(vc.iloc[0] / len(df) * 100, 1)
            insights.append({
                "type": "distribution",
                "icon": "chart-pie",
                "title": f"Top {col}",
                "text": f'"{top_val}" leads with {top_pct}% of all records',
                "priority": 2,
            })

    # 3. Strong correlations
    if correlation and "matrix" in correlation:
        cols = correlation["columns"]
        matrix = correlation["matrix"]
        found_strong = False
        for i in range(len(cols)):
            for j in range(i + 1, len(cols)):
                corr_val = matrix[i][j]
                if corr_val is not None and abs(corr_val) >= 0.7:
                    if not found_strong:
                        strength = "positive" if corr_val > 0 else "negative"
                        insights.append({
                            "type": "correlation",
                            "icon": "link",
                            "title": "Strong Correlation",
                            "text": f"{cols[i]} and {cols[j]} show strong {strength} correlation ({corr_val:.2f})",
                            "priority": 3,
                        })
                        found_strong = True

    # 4. Outliers detected
    total_outliers = sum(o.get("count", 0) for o in outliers.values())
    if total_outliers > 0:
        cols_with_outliers = [col for col, o in outliers.items() if o.get("count", 0) > 0]
        insights.append({
            "type": "outlier",
            "icon": "alert-triangle",
            "title": "Outliers Detected",
            "text": f"Found {total_outliers} outlier(s) in {', '.join(cols_with_outliers[:3])}",
            "priority": 4,
        })

    # 5. Numeric ranges
    for col in numeric_cols[:2]:
        series = df[col].dropna()
        if len(series) > 0:
            min_val = series.min()
            max_val = series.max()
            spread = max_val - min_val
            avg_val = series.mean()
            insights.append({
                "type": "range",
                "icon": "trending-up",
                "title": f"{col} Overview",
                "text": f"Avg: {avg_val:,.1f} | Range: {min_val:,.0f} to {max_val:,.0f}",
                "priority": 5,
            })

    # Sort by priority
    insights.sort(key=lambda x: x.get("priority", 99))
    return insights[:8]  # Limit to 8 insights


def _find_strong_correlations(correlation: dict, threshold: float = 0.7) -> list[dict]:
    """Extract strong correlations from matrix."""
    if not correlation or "matrix" not in correlation:
        return []

    cols = correlation["columns"]
    matrix = correlation["matrix"]
    strong = []

    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            val = matrix[i][j]
            if val is not None and abs(val) >= threshold:
                strong.append({
                    "col1": cols[i],
                    "col2": cols[j],
                    "value": round(val, 3),
                    "strength": "strong" if abs(val) >= 0.8 else "moderate",
                    "direction": "positive" if val > 0 else "negative",
                })

    return sorted(strong, key=lambda x: abs(x["value"]), reverse=True)


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

    # ---- Summary statistics with advanced metrics ----------------------------
    describe = {}
    if numeric_cols:
        desc = df[numeric_cols].describe()
        for col in numeric_cols:
            base_stats = {
                stat: _safe_json(desc.at[stat, col])
                for stat in desc.index
            }
            # Add advanced statistics
            advanced = _compute_advanced_stats(df[col])
            describe[col] = {**base_stats, **advanced}

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

    # ---- Outliers detection ------------------------------------------------
    outliers = {}
    for col in numeric_cols:
        outlier_data = _detect_outliers(df[col])
        if outlier_data["count"] > 0:
            outliers[col] = outlier_data

    # ---- KPIs generation ---------------------------------------------------
    kpis = _generate_kpis(df, numeric_cols, categorical_cols)

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
        total = len(df[col].dropna())
        bar_charts[col] = [
            {
                "name": str(k),
                "count": int(v),
                "percentage": round(v / total * 100, 1) if total > 0 else 0
            }
            for k, v in vc.items()
        ]

    return {
        "summary_statistics": describe,
        "correlation": correlation,
        "outliers": outliers,
        "kpis": kpis,
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
        total = len(df[col].dropna())
        top_categorical[col] = [
            {
                "value": str(k),
                "count": int(v),
                "percentage": round(v / total * 100, 1) if total > 0 else 0
            }
            for k, v in vc.items()
        ]

    # ---- Basic shape info --------------------------------------------------
    total_cells = int(df.shape[0] * df.shape[1])
    total_missing = int(df.isna().sum().sum())

    # ---- Correlation for insights ------------------------------------------
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

    # ---- Outliers for insights ---------------------------------------------
    outliers = {}
    for col in numeric_cols:
        outlier_data = _detect_outliers(df[col])
        if outlier_data["count"] > 0:
            outliers[col] = outlier_data

    # ---- Auto-generated insights -------------------------------------------
    auto_insights = _generate_auto_insights(
        df, numeric_cols, categorical_cols, correlation, outliers
    )

    # ---- Strong correlations -----------------------------------------------
    strong_correlations = _find_strong_correlations(correlation)

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
        "auto_insights": auto_insights,
        "strong_correlations": strong_correlations,
    }
