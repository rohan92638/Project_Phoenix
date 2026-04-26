"""
Dynamic Financial Persona Engine
==================================
NO hardcoded category lists. NO hardcoded persona maps. NO dead code.

How it works:
  Step 1  -> Auto-discover ALL categories from user's real DB transactions
  Step 2  -> Build a monetary-weight spending vector across those categories
  Step 3  -> Find the user's dominant spend/income category (highest Rs amount)
  Step 4  -> Dynamically generate a persona label using keyword-semantic rules

This means:
  "Dubai Trips"   -> "Traveler     (keyword-matched on 'dubai', 'trip')"
  "Brokerage"     -> "Broker       (keyword-matched on 'broker', 'brokerage')"
  "NFT Sales"     -> "Trader       (keyword-matched on 'nft')"
  "Xyz Unknown"   -> "Xyz Unknown Earner  (graceful fallback - never crashes)"

NOTE on expense_kmeans.pkl / income_kmeans.pkl:
  These files exist from a previous K-Means approach but are NOT used here.
  The dominant-spend method is more accurate for a single user's live data
  because K-Means needs many users to generalize. The .pkl files are kept
  only if you want to extend this in the future with multi-user clustering.
"""

import numpy as np
import re

# =============================================================================
# STEP 1 — CATEGORY DISCOVERY
# Reads whatever categories exist in the user's actual transactions.
# Zero hardcoding. New categories automatically appear here.
# =============================================================================

def discover_categories(transactions) -> list:
    """
    Scan all transactions and return a sorted list of every unique, non-empty
    category. Works for any category name — even ones added months later.
    """
    seen = set()
    for t in transactions:
        cat = t.category
        if cat and str(cat).strip():
            seen.add(str(cat).strip())
    return sorted(seen)


# =============================================================================
# STEP 2 — MONETARY VECTOR BUILDER
# Builds a normalized vector: what fraction of total money went to each cat?
# Monetary amounts are used (not counts) so high-value categories dominate.
# =============================================================================

def build_spending_vector(transactions, categories: list):
    """
    Build a normalized monetary-weight vector across the discovered categories.

    Returns:
        (np.array shape (1, n_categories), categories_list)  on success
        (None, categories_list)                               if total is zero
    """
    if not categories:
        return None, categories

    lower_to_original = {cat.lower(): cat for cat in categories}
    totals = {cat: 0.0 for cat in categories}

    for t in transactions:
        cat_raw = str(t.category).strip() if t.category else ""
        key = cat_raw.lower()
        if key in lower_to_original:
            totals[lower_to_original[key]] += abs(float(t.amount))

    grand_total = sum(totals.values())
    if grand_total == 0:
        return None, categories

    vector = np.array([totals[c] / grand_total for c in categories])
    return vector.reshape(1, -1), categories


# =============================================================================
# STEP 3 — DOMINANT CATEGORY FINDER
# Finds where the user spends/earns the MOST money.
# This is the ground truth — no model can beat actual transaction data.
# =============================================================================

def find_dominant_category(vector: np.ndarray, categories: list) -> str:
    """
    Return the category with the highest monetary proportion in the vector.
    Simple, reliable, zero failure modes.
    """
    dominant_idx = int(np.argmax(vector[0]))
    return categories[dominant_idx]


# =============================================================================
# STEP 4 — DYNAMIC PERSONA LABEL GENERATOR
# No fixed map. Uses keyword semantics on the category string itself.
# Handles any category name — even ones that never existed at build time.
# =============================================================================

# Each rule: ([trigger_keywords], persona_label, emoji)
# Listed in priority order — first match wins.

EXPENSE_SEMANTIC_RULES = [
    (["travel", "trip", "flight", "airline", "hotel", "dubai", "tour", "vacation",
      "holiday", "airbnb", "booking", "resort", "visa", "passport", "abroad",
      "international", "transit", "layover", "cruise", "backpack"],
     "Traveler", "✈️"),

    (["food", "dining", "restaurant", "cafe", "coffee", "snack", "pizza", "burger",
      "grocery", "eat", "lunch", "dinner", "breakfast", "swiggy", "zomato",
      "bigbasket", "blinkit", "instamart"],
     "Food Lover", "🍕"),

    (["rent", "lease", "housing", "flat", "apartment", "pg", "hostel", "home",
      "accommodation", "lodging", "paying guest"],
     "Homebody", "🏠"),

    (["entertainment", "movie", "cinema", "netflix", "spotify", "gaming", "game",
      "theatre", "concert", "show", "ott", "stream", "amazon prime", "hotstar",
      "youtube premium", "event", "ticket"],
     "Entertainer", "🎭"),

    (["transport", "transportation", "uber", "ola", "cab", "taxi", "bus", "metro",
      "fuel", "petrol", "diesel", "auto", "rickshaw", "commute", "train", "rapido"],
     "Commuter", "🚗"),

    (["shopping", "clothes", "fashion", "amazon", "flipkart", "myntra", "shoes",
      "bags", "accessories", "mall", "retail", "apparel", "dress", "meesho"],
     "Shopaholic", "🛍️"),

    (["health", "gym", "fitness", "medicine", "medical", "hospital", "doctor",
      "pharmacy", "clinic", "wellness", "yoga", "supplements", "cult"],
     "Health Conscious", "💪"),

    (["education", "course", "book", "study", "tuition", "school", "college",
      "university", "fee", "coaching", "learning", "udemy", "skill", "coursera"],
     "Knowledge Seeker", "📚"),

    (["investment", "invest", "sip", "mutual fund", "stock", "equity", "crypto",
      "nft", "trading", "brokerage", "portfolio", "demat"],
     "Smart Investor", "📊"),

    (["bill", "bills", "utility", "electricity", "water", "internet", "wifi",
      "mobile", "recharge", "broadband", "dth", "gas", "subscription"],
     "Responsible", "🧾"),
]

INCOME_SEMANTIC_RULES = [
    (["brokerage", "broker", "arbitrage", "market making", "resell", "commission based"],
     "Broker", "🤝"),

    (["trading", "trade", "stock", "equity", "crypto", "bitcoin", "ethereum",
      "nft", "forex", "option", "future", "derivative", "algo"],
     "Trader", "📈"),

    (["salary", "payroll", "monthly pay", "ctc", "stipend", "wage", "paycheck"],
     "Salary Based", "💼"),

    (["freelance", "client", "project", "contract", "consulting", "gig",
      "upwork", "fiverr", "freelancer", "remote work", "agency"],
     "Freelancer", "💻"),

    (["bonus", "incentive", "performance", "reward", "hike", "appraisal",
      "referral bonus", "annual bonus"],
     "High Achiever", "🎯"),

    (["youtube", "instagram", "tiktok", "content", "creator", "influencer",
      "ads", "sponsorship", "brand deal", "affiliate", "podcast"],
     "Content Creator", "🎥"),

    (["rent", "rental", "lease", "property", "real estate", "tenant",
      "landlord", "airbnb host", "pg owner", "house rent"],
     "Real Estate Investor", "🏘️"),

    (["fd", "fixed deposit", "rd", "recurring deposit", "nsc", "ppf",
      "provident fund", "bond", "debenture", "government scheme"],
     "Safe Saver", "🏦"),

    (["interest", "dividend", "royalty", "passive", "annuity",
      "returns", "yield", "capital gain"],
     "Passive Earner", "💰"),

    (["business", "startup", "entrepreneur", "company", "profit",
      "revenue", "sales", "shop", "store", "venture", "b2b", "product"],
     "Business Minded", "🚀"),

    (["grant", "scholarship", "fellowship", "funding", "prize", "award",
      "competition", "hackathon", "bounty"],
     "Achiever", "🏆"),
]


def _match_rules(category_name: str, rules: list):
    """
    Try to match a category name against keyword rules.
    Uses whole-word matching (regex word boundaries) to avoid false positives.
    E.g., 'rent' won't match 'current'.

    Returns: (label, emoji) on first match, or (None, None).
    """
    cat_lower = category_name.lower()
    for keywords, label, emoji in rules:
        for kw in keywords:
            pattern = r'\b' + re.escape(kw) + r'\b'
            if re.search(pattern, cat_lower):
                return label, emoji
    return None, None


def generate_expense_persona(dominant_category: str) -> str:
    """
    Dynamically generate an expense persona string for ANY category name.
    Falls back to "<Category> Spender" if no keyword match found.
    """
    label, emoji = _match_rules(dominant_category, EXPENSE_SEMANTIC_RULES)
    if label:
        return f"{label} {emoji}"
    return f"{dominant_category.title()} Spender 🏷️"


def generate_income_persona(dominant_category: str) -> str:
    """
    Dynamically generate an income persona string for ANY category name.
    Falls back to "<Category> Earner" if no keyword match found.
    """
    label, emoji = _match_rules(dominant_category, INCOME_SEMANTIC_RULES)
    if label:
        return f"{label} {emoji}"
    return f"{dominant_category.title()} Earner 💡"


# =============================================================================
# PUBLIC API — called by views.py (financial_persona_api)
# =============================================================================

def get_expense_persona(expenses) -> str:
    """
    Detect the user's expense persona from their actual transaction data.

    Pipeline:
      1. Discover all categories from the user's expense transactions
      2. Build a monetary-weight vector
      3. Find the dominant spend category (highest Rs)
      4. Generate a dynamic persona label from that category name
    """
    categories = discover_categories(expenses)
    if not categories:
        return "No Expense Data"

    vector, categories = build_spending_vector(expenses, categories)
    if vector is None:
        return "No Expense Data"

    dominant = find_dominant_category(vector, categories)
    return generate_expense_persona(dominant)


def get_income_persona(incomes) -> str:
    """
    Detect the user's income persona from their actual transaction data.

    Pipeline:
      1. Discover all categories from the user's income transactions
      2. Build a monetary-weight vector
      3. Find the dominant income category (highest Rs earned)
      4. Generate a dynamic persona label from that category name
    """
    categories = discover_categories(incomes)
    if not categories:
        return "No Income Data"

    vector, categories = build_spending_vector(incomes, categories)
    if vector is None:
        return "No Income Data"

    dominant = find_dominant_category(vector, categories)
    return generate_income_persona(dominant)