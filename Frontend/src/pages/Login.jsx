import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from "../services/api";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // LOGIN FUNCTION
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await loginUser({ email, password });

            // ✅ Store JWT tokens AND user info
            localStorage.setItem("accessToken",  data.access);
            localStorage.setItem("refreshToken", data.refresh);
            localStorage.setItem("user",         JSON.stringify(data.user));
            localStorage.setItem("isLoggedIn",   "true");

            window.location.href = '/dashboard';

        } catch (err) {
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="bg-background text-on-background font-body min-h-screen flex flex-col selection:bg-primary-container selection:text-white">
            {/* TopAppBar */}
            <header className="bg-transparent text-orange-500 dark:text-orange-400 font-headline tracking-tighter text-3xl uppercase w-full top-0 z-50 fixed">
                <nav className="flex justify-between items-center w-full px-8 py-6 backdrop-blur-xl">
                    <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
                        Project Phoenix
                    </Link>
                    <div className="flex items-center gap-8">
                        <Link className="text-purple-200/60 font-body text-sm tracking-widest uppercase hover:text-orange-400 hover:scale-105 transition-all duration-300" to="/">Support</Link>
                        <Link className="px-6 py-2 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm hover:scale-105 transition-all duration-300 shadow-[0_10px_20px_rgba(255,77,0,0.2)]" to="/signup">Create Account</Link>
                    </div>
                </nav>
            </header>

            {/* Main Content Canvas */}
            <main className="flex-grow flex items-center justify-center relative overflow-hidden px-4 py-20 pt-32">
                {/* Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-tertiary-container/10 rounded-full blur-[120px]"></div>
                    <img className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" alt="abstract ethereal dark background glowing fire particles phoenix wings" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzD0dura1MKzmS9KfSdn-DUovk2Zn8dU2bP6BW0ZkNKuJWHj_tfThZLATqWDUu7-O9qNxD9DxeJ0Bq0P9irVCpJmaDjQ6QDUlFmLvGxv6aWmRy3fb2HML5kCOnYdTg9McKLuOrrR6iRsbI-XIjPtqTo6eSUwqNRAxiFR6L1B9wBUuOnY8lGjioXrX-3A2eQKtJgDvn50FaH_dJlkZjI-fOYlhsl2b2aDH-QS6kzArQiyzuNl50Gd8rGc_Mqk73sqTNBFFW_oNN"/>
                </div>

                {/* Login Container */}
                <div className="relative z-10 w-full max-w-md">
                    {/* Hero Header inside Canvas */}
                    <div className="text-center mb-10">
                        <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-on-surface mb-4">
                            Welcome Back, Phoenix
                        </h1>
                        <p className="text-on-surface-variant text-lg tracking-wide opacity-80">
                            Rise again. Continue your journey.
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="glass-panel p-8 md:p-10 rounded-[2rem] border-t border-white/5 shadow-[0_0_50px_-12px_rgba(255,87,26,0.3)]">
                        <form className="space-y-6" onSubmit={handleLogin}>
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="email">Email Address</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                                        mail
                                    </span>
                                    <input className="w-full bg-surface-container-highest border-none rounded-full py-4 pl-12 pr-6 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                                     id="email"
                                      placeholder="phoenix@celestial.com"
                                       type="email"
                                       value={email}
                                       onChange={(e) => setEmail(e.target.value)}
                                       
                                       />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="password">Password</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                                        lock
                                    </span>
                                    <input className="w-full bg-surface-container-highest border-none rounded-full py-4 pl-12 pr-12 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                                     id="password"
                                     placeholder="••••••••"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors" type="button" onClick={() => setShowPassword(!showPassword)}>
                                        <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                                    </button>
                                </div>
                                <div className="flex justify-end mt-2">
                                    <a className="text-sm text-primary hover:text-secondary-fixed transition-colors font-medium" href="#">Forgot Password?</a>
                                </div>
                            </div>

                            {/* Inline Error */}
                            {error && (
                                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                                    <span className="material-symbols-outlined text-base">error</span>
                                    {error}
                                </div>
                            )}

                            {/* Login Button */}
                            <button
                                className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_20px_40px_rgba(255,87,26,0.15)] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Logging in…" : "Login"}
                            </button>

                            {/* Divider */}
                            <div className="relative flex items-center py-4">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/50">or</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>

                            {/* Google Login Button */}
                            <button className="w-full py-4 rounded-full bg-white/5 border border-white/10 text-on-surface font-bold text-sm flex items-center justify-center gap-3 hover:bg-white/10 transition-all duration-300" type="button">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                </svg>
                                Continue with Google
                            </button>
                        </form>

                        {/* Secondary Action */}
                        <div className="mt-8 text-center">
                            <p className="text-on-surface-variant text-sm">
                                Don’t have an account? 
                                <Link className="text-secondary-fixed font-bold hover:underline underline-offset-4 ml-1" to="/signup">Sign Up</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-transparent text-purple-300/40 font-body text-[0.75rem] tracking-widest uppercase w-full bottom-0 z-10 mt-auto">
                <div className="w-full max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-sm font-black text-purple-400">PROJECT PHOENIX</div>
                    <div className="flex gap-8">
                        <a className="hover:text-orange-300 transition-colors" href="#">Privacy</a>
                        <a className="hover:text-orange-300 transition-colors" href="#">Terms</a>
                        <a className="hover:text-orange-300 transition-colors" href="#">Security</a>
                    </div>
                    <div className="opacity-60">© 2024 Project Phoenix. The Celestial Rebirth.</div>
                </div>
            </footer>
        </div>
    );
};

export default Login;
