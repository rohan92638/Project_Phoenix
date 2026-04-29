"""
date_parser.py
==============
Resolves natural language date strings into (start_date, end_date) tuples.
Returns a SAFE DEFAULT of (30 days ago, today) when input is None/empty/unrecognised.
All return values are Python date objects.
"""

from datetime import datetime, timedelta
import re


def parse_date(date_text: str):
    """
    Convert natural language date → {"start_date": date, "end_date": date}

    Handles:
      today / yesterday / this week / last week / this month / last month /
      this year / last year / last N days / last N weeks / month names
    Always returns a dict (never None) — safe for pipeline use.
    """
    today = datetime.today().date()

    # ── Safe default ──────────────────────────────────────────────────────────
    if not date_text:
        return {"start_date": today - timedelta(days=30), "end_date": today}

    ds = date_text.lower().strip()

    # ── Exact matches ─────────────────────────────────────────────────────────
    if ds == "today":
        return {"start_date": today, "end_date": today}

    if ds == "yesterday":
        y = today - timedelta(days=1)
        return {"start_date": y, "end_date": y}

    if ds in ("this week", "current week"):
        start = today - timedelta(days=today.weekday())   # Monday
        return {"start_date": start, "end_date": today}

    if ds in ("last week", "previous week"):
        end   = today - timedelta(days=today.weekday() + 1)   # last Sunday
        start = end - timedelta(days=6)                        # last Monday
        return {"start_date": start, "end_date": end}

    if ds in ("this month", "current month"):
        return {"start_date": today.replace(day=1), "end_date": today}

    if ds in ("last month", "previous month"):
        first_this      = today.replace(day=1)
        last_month_end  = first_this - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)
        return {"start_date": last_month_start, "end_date": last_month_end}

    if ds in ("this year", "current year"):
        return {"start_date": today.replace(month=1, day=1), "end_date": today}

    if ds in ("last year", "previous year"):
        start = today.replace(year=today.year - 1, month=1, day=1)
        end   = today.replace(year=today.year - 1, month=12, day=31)
        return {"start_date": start, "end_date": end}

    # ── "last N days" / "past N days" ─────────────────────────────────────────
    m = re.search(r'(?:last|past)\s+(\d+)\s+days?', ds)
    if m:
        n = int(m.group(1))
        return {"start_date": today - timedelta(days=n), "end_date": today}

    # ── "last N weeks" / "past N weeks" ───────────────────────────────────────
    m = re.search(r'(?:last|past)\s+(\d+)\s+weeks?', ds)
    if m:
        n = int(m.group(1))
        return {"start_date": today - timedelta(weeks=n), "end_date": today}

    # ── "last N months" ───────────────────────────────────────────────────────
    m = re.search(r'(?:last|past)\s+(\d+)\s+months?', ds)
    if m:
        n = int(m.group(1))
        return {"start_date": today - timedelta(days=n * 30), "end_date": today}

    # ── Named month: "january", "march 2025" ─────────────────────────────────
    month_map = {
        "january": 1, "february": 2, "march": 3, "april": 4,
        "may": 5, "june": 6, "july": 7, "august": 8,
        "september": 9, "october": 10, "november": 11, "december": 12
    }
    for name, month_num in month_map.items():
        if name in ds:
            year_match = re.search(r'\d{4}', ds)
            year = int(year_match.group()) if year_match else today.year
            from calendar import monthrange
            last_day = monthrange(year, month_num)[1]
            start = datetime(year, month_num, 1).date()
            end   = datetime(year, month_num, last_day).date()
            return {"start_date": start, "end_date": min(end, today)}

    # ── Fallback: last 30 days ────────────────────────────────────────────────
    return {"start_date": today - timedelta(days=30), "end_date": today}