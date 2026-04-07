import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="bg-void min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-container/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-surface-variant/40 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[600px] text-primary/5 opacity-30 select-none">local_fire_department</span>
                </div>
            </div>

            {/* Navigation Shell */}
            <nav className="fixed top-0 w-full z-50 bg-[#1d0c26]/60 backdrop-blur-xl flex justify-between items-center px-10 py-6 max-w-screen-2xl mx-auto shadow-[0_10px_30px_rgba(255,87,26,0.1)]">
                <Link to="/" className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#ffb59e] to-[#ff571a] font-headline tracking-tighter uppercase">
                    PHOENIX
                </Link>
                <div className="hidden md:flex gap-8">
                    <Link className="text-purple-200/70 hover:text-orange-200 transition-colors font-headline font-bold tracking-tighter uppercase" to="/">Ascension</Link>
                    <Link className="text-purple-200/70 hover:text-orange-200 transition-colors font-headline font-bold tracking-tighter uppercase" to="/">Ecosystem</Link>
                </div>
                <Link to="/" className="px-6 py-2 bg-gradient-to-br from-[#ffb59e] to-[#ff571a] rounded-full text-on-primary font-headline font-bold uppercase text-sm hover:shadow-[0_0_20px_rgba(255,87,26,0.2)] transition-all">
                    Enter Realm
                </Link>
                <div className="bg-gradient-to-b from-orange-500/10 to-transparent h-[1px] w-full absolute bottom-0 left-0"></div>
            </nav>

            {/* Main Signup Canvas */}
            <main className="relative z-10 w-full max-w-xl px-6 py-24 flex flex-col items-center">
                {/* Header Section */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl md:text-6xl font-headline font-bold tracking-tighter text-on-surface mb-4">
                        Create Your Phoenix Account
                    </h1>
                    <p className="text-lg text-on-surface-variant font-light tracking-wide italic">
                        Start your transformation journey today.
                    </p>
                </div>

                {/* Form Card */}
                <div className="w-full glass-panel p-8 md:p-12 rounded-[2rem] flame-glow border border-outline-variant/10">
                    {/* 
                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-error-container/20 border border-error/20 text-error text-sm font-medium">
                        <span className="material-symbols-outlined text-xl">error</span>
                        Account already exists. Please login.
                    </div>
                </div> 
                */}

                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); }}>
                        {/* Name Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-2">First Name</label>
                                <div className="relative flex items-center bg-surface-container-highest rounded-full border border-outline-variant/30 input-focus-glow transition-all">
                                    <span className="material-symbols-outlined ml-4 text-outline">person</span>
                                    <input className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 px-3 py-4 font-body focus:outline-none" placeholder="First Name" type="text" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-2">Last Name</label>
                                <div className="relative flex items-center bg-surface-container-highest rounded-full border border-outline-variant/30 input-focus-glow transition-all">
                                    <span className="material-symbols-outlined ml-4 text-outline">badge</span>
                                    <input className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 px-3 py-4 font-body focus:outline-none" placeholder="Last Name" type="text" />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-2">Email Address</label>
                            <div className="relative flex items-center bg-surface-container-highest rounded-full border border-outline-variant/30 input-focus-glow transition-all">
                                <span className="material-symbols-outlined ml-4 text-outline">mail</span>
                                <input className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 px-3 py-4 font-body focus:outline-none" placeholder="aelius@phoenix.ascend" type="email" />
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-2">Mobile Number</label>
                            <div className="relative flex items-center bg-surface-container-highest rounded-full border border-outline-variant/30 input-focus-glow transition-all">
                                <span className="material-symbols-outlined ml-4 text-outline">smartphone</span>
                                <input className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 px-3 py-4 font-body focus:outline-none" placeholder="+91 " type="tel" onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9+]/g, ''); }} />
                            </div>
                        </div>

                        {/* Passwords */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-2">Password</label>
                            <div className="relative flex items-center bg-surface-container-highest rounded-full border border-outline-variant/30 input-focus-glow transition-all">
                                <span className="material-symbols-outlined ml-4 text-outline">lock</span>
                                <input className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 px-3 py-4 font-body focus:outline-none" placeholder="••••••••" type={showPassword ? 'text' : 'password'} />
                                <button className="mr-4 text-outline hover:text-primary transition-colors focus:outline-none" type="button" onClick={() => setShowPassword(!showPassword)}>
                                    <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-2">Confirm Password</label>
                            <div className="relative flex items-center bg-surface-container-highest rounded-full border border-outline-variant/30 input-focus-glow transition-all">
                                <span className="material-symbols-outlined ml-4 text-outline">lock_reset</span>
                                <input className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 px-3 py-4 font-body focus:outline-none" placeholder="••••••••" type={showConfirmPassword ? 'text' : 'password'} />
                                <button className="mr-4 text-outline hover:text-primary transition-colors focus:outline-none" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <span className="material-symbols-outlined">{showConfirmPassword ? 'visibility' : 'visibility_off'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            <button className="w-full py-5 bg-gradient-to-r from-primary to-primary-container rounded-full text-on-primary font-headline font-bold text-lg uppercase tracking-widest hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,87,26,0.4)] transition-all duration-300 active:scale-95" type="submit">
                                Sign Up
                            </button>
                        </div>
                    </form>

                    {/* Bottom Link */}
                    <div className="mt-8 text-center">
                        <p className="text-on-surface-variant text-sm font-body">
                            Already have an account?
                            <Link className="text-primary font-bold hover:text-primary-fixed-dim transition-colors ml-1 underline underline-offset-4 decoration-primary/30" to="/login">Login</Link>
                        </p>
                    </div>
                </div>

                {/* Flame Motif Decoration */}
                <div className="mt-12 opacity-40">
                    <div className="flex items-center gap-4 text-outline-variant text-[10px] tracking-[0.4em] uppercase font-bold">
                        <div className="h-[1px] w-12 bg-outline-variant/30"></div>
                        Born from Embers
                        <div className="h-[1px] w-12 bg-outline-variant/30"></div>
                    </div>
                </div>
            </main>

            {/* Decorative Corner Orbs */}
            <div className="fixed top-0 right-0 p-12 pointer-events-none">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-container/20 to-transparent blur-2xl"></div>
            </div>
            <div className="fixed bottom-0 left-0 p-12 pointer-events-none">
                <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-surface-variant/20 to-transparent blur-3xl"></div>
            </div>
        </div>
    );
};

export default SignUp;
