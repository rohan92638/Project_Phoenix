import React, { useEffect, useState } from 'react';
import { getSpendingPersona } from '../services/api';

// ─── Persona → visual config mapping ─────────────────────────────────────────
// Maps persona label keywords to colors, icons, and gradient accents.
// Works even for new dynamic personas from the ML engine (falls back gracefully).
const PERSONA_STYLES = {
    // Expense personas
    'Traveler':          { color: 'text-sky-400',     border: 'border-sky-500/40',     glow: 'shadow-sky-500/20',    bg: 'from-sky-900/30 to-transparent',     icon: 'flight' },
    'Food Lover':        { color: 'text-orange-400',  border: 'border-orange-500/40',  glow: 'shadow-orange-500/20', bg: 'from-orange-900/30 to-transparent',   icon: 'restaurant' },
    'Homebody':          { color: 'text-purple-400',  border: 'border-purple-500/40',  glow: 'shadow-purple-500/20', bg: 'from-purple-900/30 to-transparent',   icon: 'home' },
    'Entertainer':       { color: 'text-pink-400',    border: 'border-pink-500/40',    glow: 'shadow-pink-500/20',   bg: 'from-pink-900/30 to-transparent',     icon: 'theaters' },
    'Commuter':          { color: 'text-cyan-400',    border: 'border-cyan-500/40',    glow: 'shadow-cyan-500/20',   bg: 'from-cyan-900/30 to-transparent',     icon: 'directions_car' },
    'Shopaholic':        { color: 'text-fuchsia-400', border: 'border-fuchsia-500/40', glow: 'shadow-fuchsia-500/20',bg: 'from-fuchsia-900/30 to-transparent',  icon: 'shopping_bag' },
    'Health Conscious':  { color: 'text-green-400',   border: 'border-green-500/40',   glow: 'shadow-green-500/20',  bg: 'from-green-900/30 to-transparent',    icon: 'fitness_center' },
    'Knowledge Seeker':  { color: 'text-yellow-400',  border: 'border-yellow-500/40',  glow: 'shadow-yellow-500/20', bg: 'from-yellow-900/30 to-transparent',   icon: 'menu_book' },
    'Smart Investor':    { color: 'text-teal-400',    border: 'border-teal-500/40',    glow: 'shadow-teal-500/20',   bg: 'from-teal-900/30 to-transparent',     icon: 'candlestick_chart' },
    'Responsible':       { color: 'text-slate-300',   border: 'border-slate-400/40',   glow: 'shadow-slate-400/20',  bg: 'from-slate-800/30 to-transparent',    icon: 'receipt_long' },
    // Income personas
    'Salary Based':      { color: 'text-emerald-400', border: 'border-emerald-500/40', glow: 'shadow-emerald-500/20',bg: 'from-emerald-900/30 to-transparent',  icon: 'work' },
    'Freelancer':        { color: 'text-blue-400',    border: 'border-blue-500/40',    glow: 'shadow-blue-500/20',   bg: 'from-blue-900/30 to-transparent',     icon: 'laptop_mac' },
    'High Achiever':     { color: 'text-amber-400',   border: 'border-amber-500/40',   glow: 'shadow-amber-500/20',  bg: 'from-amber-900/30 to-transparent',    icon: 'emoji_events' },
    'Trader':            { color: 'text-lime-400',    border: 'border-lime-500/40',    glow: 'shadow-lime-500/20',   bg: 'from-lime-900/30 to-transparent',     icon: 'show_chart' },
    'Broker':            { color: 'text-indigo-400',  border: 'border-indigo-500/40',  glow: 'shadow-indigo-500/20', bg: 'from-indigo-900/30 to-transparent',   icon: 'handshake' },
    'Safe Saver':        { color: 'text-cyan-300',    border: 'border-cyan-400/40',    glow: 'shadow-cyan-400/20',   bg: 'from-cyan-900/30 to-transparent',     icon: 'savings' },
    'Passive Earner':    { color: 'text-violet-400',  border: 'border-violet-500/40',  glow: 'shadow-violet-500/20', bg: 'from-violet-900/30 to-transparent',   icon: 'account_balance' },
    'Business Minded':   { color: 'text-rose-400',    border: 'border-rose-500/40',    glow: 'shadow-rose-500/20',   bg: 'from-rose-900/30 to-transparent',     icon: 'rocket_launch' },
    'Content Creator':   { color: 'text-red-400',     border: 'border-red-500/40',     glow: 'shadow-red-500/20',    bg: 'from-red-900/30 to-transparent',      icon: 'videocam' },
    'Real Estate':       { color: 'text-stone-300',   border: 'border-stone-400/40',   glow: 'shadow-stone-400/20',  bg: 'from-stone-800/30 to-transparent',    icon: 'apartment' },
    'Achiever':          { color: 'text-yellow-300',  border: 'border-yellow-400/40',  glow: 'shadow-yellow-400/20', bg: 'from-yellow-900/30 to-transparent',   icon: 'military_tech' },
};

const DEFAULT_STYLE = {
    color: 'text-[#ffb59e]', border: 'border-[#ffb59e]/30', glow: 'shadow-[#ffb59e]/10',
    bg: 'from-[#ff571a]/10 to-transparent', icon: 'person_pin',
};

/** Match a persona string (e.g. "Traveler ✈️") to a style config */
function resolveStyle(personaStr) {
    if (!personaStr) return DEFAULT_STYLE;
    for (const [key, style] of Object.entries(PERSONA_STYLES)) {
        if (personaStr.toLowerCase().includes(key.toLowerCase())) return style;
    }
    return DEFAULT_STYLE;
}

// ─── Skeleton pulse loader ────────────────────────────────────────────────────
const SkeletonRow = () => (
    <div className="animate-pulse space-y-2">
        <div className="h-3 bg-white/10 rounded-full w-20" />
        <div className="h-6 bg-white/10 rounded-full w-40" />
    </div>
);

// ─── Single persona card ──────────────────────────────────────────────────────
const PersonaCard = ({ label, personaStr, isLoading }) => {
    const style = resolveStyle(personaStr);
    const hasData = personaStr && !personaStr.toLowerCase().includes('no ');

    return (
        <div className={`relative rounded-2xl border ${style.border} bg-gradient-to-br ${style.bg} backdrop-blur-sm p-4 overflow-hidden shadow-lg ${style.glow} transition-all duration-300 hover:scale-[1.02]`}>
            {/* Ambient glow blob */}
            <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-30 bg-current ${style.color}`} />

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <span className={`material-symbols-outlined text-base ${style.color}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                    {hasData ? style.icon : 'help_outline'}
                </span>
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant/60">
                    {label}
                </span>
            </div>

            {/* Persona value */}
            {isLoading ? (
                <SkeletonRow />
            ) : (
                <div>
                    {hasData ? (
                        <>
                            <p className={`text-lg font-black font-headline leading-tight ${style.color}`}>
                                {personaStr}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                                <span className="material-symbols-outlined text-[10px] text-on-surface-variant/40"
                                    style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                                <span className="text-[9px] text-on-surface-variant/40 uppercase tracking-widest font-bold">
                                    AI Detected
                                </span>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-on-surface-variant/50 italic">
                            Add more transactions
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────
const SpendingPersona = () => {
    const [data, setData] = useState({ expense_persona: null, income_persona: null });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchPersona = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const res = await getSpendingPersona();
            setData(res);
            setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
        } catch (err) {
            console.error('Persona fetch failed:', err);
            setError('Unable to load persona');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPersona();
    }, []);

    return (
        <div className="glass-card p-6 md:p-7 rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(255,77,0,0.08)] relative overflow-hidden">

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg"
                            style={{ fontVariationSettings: "'FILL' 1" }}>
                            psychology
                        </span>
                        <h4 className="font-headline text-lg font-bold text-secondary">
                            Financial Persona
                        </h4>
                    </div>
                    <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest font-bold mt-0.5 ml-7">
                        AI · ML Powered
                    </p>
                </div>

                {/* Refresh button */}
                <button
                    onClick={() => fetchPersona(true)}
                    disabled={refreshing || loading}
                    title="Refresh persona"
                    className="w-8 h-8 rounded-full bg-surface-container-highest/50 hover:bg-primary/20 border border-outline-variant/20 hover:border-primary/40 flex items-center justify-center transition-all duration-300 disabled:opacity-40"
                >
                    <span className={`material-symbols-outlined text-sm text-on-surface-variant hover:text-primary transition-all ${refreshing ? 'animate-spin' : ''}`}>
                        refresh
                    </span>
                </button>
            </div>

            {/* ── Error state ─────────────────────────────────────────── */}
            {error && (
                <div className="mb-4 px-3 py-2 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-error text-sm">error</span>
                    <span className="text-xs text-error">{error}</span>
                </div>
            )}

            {/* ── Persona cards ────────────────────────────────────────── */}
            <div className="space-y-3">
                <PersonaCard
                    label="Spending Persona"
                    personaStr={data.expense_persona}
                    isLoading={loading}
                />
                <PersonaCard
                    label="Income Persona"
                    personaStr={data.income_persona}
                    isLoading={loading}
                />
            </div>

            {/* ── How it works pill ────────────────────────────────────── */}
            {!loading && (
                <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[12px] text-on-surface-variant/40 mt-0.5"
                        style={{ fontVariationSettings: "'FILL' 1" }}>
                        info
                    </span>
                    <p className="text-[9px] text-on-surface-variant/40 leading-relaxed">
                        Detected by analyzing your actual transaction amounts across categories.
                        Adapts automatically as your spending habits change.
                        {lastUpdated && <span className="ml-1 opacity-70">Updated {lastUpdated}</span>}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SpendingPersona;