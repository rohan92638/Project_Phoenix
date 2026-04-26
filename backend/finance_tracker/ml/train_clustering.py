"""
Dynamic K-Means Training Script
================================
Trains expense and income persona models from CSV data.

Key difference from old version:
  • Categories are AUTO-DISCOVERED from the CSV — no hardcoded list.
  • The trained model + its category list are saved together in one pickle.
  • Works even if new categories are added to training_data.csv later.

Usage:
    cd backend
    python -m finance_tracker.ml.train_clustering
    # or directly:
    python finance_tracker/ml/train_clustering.py
"""

import pandas as pd
import numpy as np
import pickle
import os
from sklearn.cluster import KMeans

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "training_data.csv")


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def discover_categories_from_df(df: pd.DataFrame) -> list:
    """
    Extract all unique, non-null category values from a dataframe slice.
    No hardcoded list — any future category in the CSV is automatically included.
    """
    cats = df["category"].dropna().str.strip().unique().tolist()
    return sorted(cats)


def build_vectors(df: pd.DataFrame, categories: list, chunk_size: int = 5) -> np.ndarray:
    """
    Split the dataframe into pseudo-users of `chunk_size` rows each.
    For each pseudo-user, build a normalized monetary vector across all categories.

    Using monetary amounts (not counts) so high-value categories have more weight.
    """
    vectors = []
    lower_to_original = {c.lower(): c for c in categories}

    for i in range(0, len(df), chunk_size):
        chunk = df.iloc[i:i + chunk_size]
        if chunk.empty:
            continue

        totals = {cat: 0.0 for cat in categories}

        for _, row in chunk.iterrows():
            cat_key = str(row["category"]).strip().lower()
            amount = abs(float(row.get("amount", 1.0)))  # fallback to 1 if no amount col
            if cat_key in lower_to_original:
                totals[lower_to_original[cat_key]] += amount

        total_spend = sum(totals.values())
        if total_spend == 0:
            continue

        vector = [totals[c] / total_spend for c in categories]
        vectors.append(vector)

    return np.array(vectors) if vectors else np.zeros((1, len(categories)))


def train_and_save(X: np.ndarray, categories: list, n_clusters: int, out_path: str, label: str):
    """
    Train K-Means on X, then save both the model AND the category list
    as a dict so clustering.py can cross-reference them at inference time.
    """
    # Clamp clusters to number of available samples
    k = min(n_clusters, len(X))
    model = KMeans(n_clusters=k, random_state=42, n_init=10)
    model.fit(X)

    bundle = {
        "model": model,
        "categories": categories,  # saved alongside so inference knows the order
        "n_clusters": k,
    }

    with open(out_path, "wb") as f:
        pickle.dump(bundle, f)

    print(f"  [OK] {label} model trained | {k} clusters | {len(categories)} categories: {categories}")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def train_kmeans():
    print("[*] Loading training data from:", CSV_PATH)
    df = pd.read_csv(CSV_PATH)

    # Drop blank rows
    df = df.dropna(subset=["category", "transaction_type"])
    df["category"] = df["category"].str.strip()
    df["transaction_type"] = df["transaction_type"].str.strip().str.upper()

    print(f"  Total rows: {len(df)}")

    # ── EXPENSE MODEL ────────────────────────────────────────────────────────
    print("\n[EXPENSE] Training EXPENSE persona model...")
    expense_df = df[df["transaction_type"] == "EXPENSE"].copy()
    if expense_df.empty:
        print("  [!] No expense rows found -- skipping.")
    else:
        expense_categories = discover_categories_from_df(expense_df)
        X_exp = build_vectors(expense_df, expense_categories)
        exp_path = os.path.join(BASE_DIR, "expense_kmeans.pkl")
        train_and_save(X_exp, expense_categories, n_clusters=4, out_path=exp_path, label="Expense")

    # ── INCOME MODEL ─────────────────────────────────────────────────────────
    print("\n[INCOME] Training INCOME persona model...")
    income_df = df[df["transaction_type"] == "INCOME"].copy()
    if income_df.empty:
        print("  [!] No income rows found -- skipping.")
    else:
        income_categories = discover_categories_from_df(income_df)
        X_inc = build_vectors(income_df, income_categories)
        inc_path = os.path.join(BASE_DIR, "income_kmeans.pkl")
        train_and_save(X_inc, income_categories, n_clusters=4, out_path=inc_path, label="Income")

    print("\n[DONE] All models trained and saved successfully!\n")


if __name__ == "__main__":
    train_kmeans()