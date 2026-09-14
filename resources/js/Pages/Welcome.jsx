import { Head, Link } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const getDashboardRoute = () => {
        if (!auth.user) return route('login');
        const role = auth.user.role;
        switch (role) {
            case 'admin': return route('admin.dashboard');
            case 'hrmo': return route('hrmo.dashboard');
            case 'department_head': return route('department-head.dashboard');
            case 'mayor': return route('mayor.dashboard');
            case 'employee': return route('employee.dashboard');
            default: return route('login');
        }
    };

    const NAVY = '#0F2A52';
    const NAVY_DEEP = '#081A33';
    const GOLD = '#ffbf00';

    const values = [
        {
            title: 'Transparency',
            description: 'Open and accountable service',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"
                    d="M12 4.5c-4.5 0-8 3-9.5 7.5 1.5 4.5 5 7.5 9.5 7.5s8-3 9.5-7.5C20 7.5 16.5 4.5 12 4.5z M12 15a3 3 0 100-6 3 3 0 000 6z" />
            ),
        },
        {
            title: 'Efficiency',
            description: 'Faster, smarter processes',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" />,
        },
        {
            title: 'Integrity',
            description: 'Committed to ethical service',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"
                    d="M12 3l7 3v5.2c0 4.6-3 8.7-7 9.8-4-1.1-7-5.2-7-9.8V6l7-3z M9 12l2 2 4-4.5" />
            ),
        },
        {
            title: 'Excellence',
            description: 'Quality service, always',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"
                    d="M12 3l2.3 4.7 5.2.7-3.8 3.6.9 5.1L12 14.7 7.4 17.1l.9-5.1-3.8-3.6 5.2-.7L12 3z" />
            ),
        },
    ];

    const features = [
        {
            title: 'Easy Application',
            description: 'Submit leave requests in seconds with our intuitive interface.',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M9 12h6m-6 4h6M9 8h1M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
            ),
        },
        {
            title: 'Secure & Reliable',
            description: 'Your data is protected with enterprise-grade security.',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M12 3l7 3v5.5c0 4.7-3 8.9-7 10-4-1.1-7-5.3-7-10V6l7-3z" />
            ),
        },
        {
            title: 'Real-time Tracking',
            description: 'Follow every step of your leave application in real time.',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M4 19V10m6 9V5m6 14v-7" />
            ),
        },
    ];

    return (
        <>
            <Head title="iLeave — Integrated Leave Management System">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-white antialiased flex flex-col text-[14px]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

                {/* ===== HEADER ===== */}
                <header className="relative z-30 border-b border-black/5 flex-shrink-0">
                    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="/images/opol.png"
                                alt="Official seal of the Municipality of Opol"
                                className="h-10 w-10 object-contain shrink-0"
                            />
                            <div className="border-l pl-3" style={{ borderColor: 'rgba(15,42,82,0.14)' }}>
                                <p className="text-[13px] font-bold tracking-tight" style={{ color: NAVY, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                    MUNICIPALITY OF OPOL
                                </p>
                                <p className="text-[10px] text-gray-500">
                                    Province of Misamis Oriental
                                </p>
                            </div>
                        </div>

                        {auth.user ? (
                            <Link
                                href={getDashboardRoute()}
                                className="text-xs font-medium px-3 py-1.5 rounded-md border transition hover:bg-[#0F2A52]/5"
                                style={{ color: NAVY, borderColor: 'rgba(15,42,82,0.25)' }}
                            >
                                Go to dashboard
                            </Link>
                        ) : (
                            <span className="hidden sm:block text-[10px] uppercase tracking-[0.14em] text-gray-400">
                                Employee Portal · Official Use Only
                            </span>
                        )}
                    </div>
                </header>

                {/* ===== HERO ===== */}
                <section className="relative flex-1 flex flex-col justify-center overflow-visible">
                    <div className="absolute bottom-0 left-0 w-full h-[160px] pointer-events-none z-0">
                        <svg className="w-full h-full" viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden="true">
                            <defs>
                                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor={GOLD} stopOpacity="0.3" />
                                    <stop offset="40%" stopColor={GOLD} stopOpacity="1" />
                                    <stop offset="100%" stopColor={GOLD} stopOpacity="0.3" />
                                </linearGradient>
                            </defs>
                            <path d="M0,200 C200,200 900,20 1440,20 L1440,200 Z" fill={NAVY} />
                            <path d="M0,200 C200,200 900,20 1440,20" fill="none" stroke="url(#goldGradient)" strokeWidth="3" />
                        </svg>
                    </div>

                    <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8 py-5 md:py-8 w-full grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
                        {/* Left content */}
                        <div className={`max-w-lg transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
                                Welcome to
                            </span>

                            <h1
                                className="mt-1 text-[40px] sm:text-[48px] lg:text-[56px] font-extrabold leading-[0.95] tracking-tight"
                                style={{ color: NAVY, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            >
                                <span style={{ color: GOLD }}>i</span>Leave
                            </h1>

                            <p className="mt-2 text-base sm:text-lg text-gray-500" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}>
                                Integrated Leave Management System
                            </p>

                            <p className="mt-3 text-[13.5px] leading-relaxed text-gray-600 max-w-md">
                                A secure, streamlined platform for managing employee leave applications,
                                leave credits, certifications, and approvals.
                            </p>

                            {/* Rotating feature highlights */}
                            <div className="mt-4 bg-[#FAFAF9] rounded-lg p-3 border border-gray-200/60 overflow-hidden min-h-[64px]">
                                <div className="flex items-start gap-2.5">
                                    <div className="shrink-0 mt-0.5">
                                        <svg className="w-4 h-4" fill="none" stroke={GOLD} viewBox="0 0 24 24">
                                            {features[activeFeature].icon}
                                        </svg>
                                    </div>
                                    <div className="transition-all duration-500">
                                        <p className="text-[13px] font-semibold" style={{ color: NAVY }}>
                                            {features[activeFeature].title}
                                        </p>
                                        <p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">
                                            {features[activeFeature].description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-center gap-1.5 mt-2">
                                    {features.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveFeature(i)}
                                            className={`h-1 rounded-full transition-all duration-300 ${i === activeFeature ? 'w-4' : 'w-1.5'}`}
                                            style={{ backgroundColor: i === activeFeature ? GOLD : '#D1D5DB' }}
                                            aria-label={`Show feature ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Quick stats */}
                            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#0032A0]">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-[#0F2A52]">1,248 Employees</span>
                                </div>
                                <div className="h-5 w-px bg-gray-300 hidden sm:block" />
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#0032A0]">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-[#0F2A52]">36 Departments</span>
                                </div>
                                <div className="h-5 w-px bg-gray-300 hidden sm:block" />
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#0032A0]">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-[#0F2A52]">97% Satisfaction</span>
                                </div>
                            </div>
                        </div>

                    {/* Conditional Card – Sign-in for guests, Welcome for logged-in users */}
<div className={`relative w-full max-w-sm mx-auto lg:mx-0 lg:justify-self-end z-20 transition-all duration-700 delay-200 ${
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
}`}>
    <div className="rounded-xl bg-white shadow-[0_18px_50px_-15px_rgba(15,42,82,0.22)] border overflow-hidden" style={{ borderColor: 'rgba(15,42,82,0.10)' }}>
        <div className="h-1" style={{ backgroundColor: GOLD }} />

        {auth.user ? (
            /* ===== WELCOME CARD (logged in) ===== */
            <div className="px-6 py-8 text-center">
                <img
                    src="/images/opol.png"
                    alt="Official seal of the Municipality of Opol"
                    className="h-16 w-16 object-contain mx-auto"
                />
                <h2 className="mt-4 text-lg font-bold" style={{ color: NAVY, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Welcome back!
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                    You are signed in as
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: NAVY }}>
                    {auth.user.name || auth.user.full_name || 'User'}
                </p>

                <Link
                    href={getDashboardRoute()}
                    className="mt-5 inline-flex items-center justify-center w-full py-2.5 rounded-lg text-white text-[13px] font-semibold tracking-wide shadow-sm hover:shadow-md transition"
                    style={{ backgroundColor: NAVY }}
                >
                    Go to Dashboard
                    <svg className="size-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="mt-3 block w-full text-center text-[12px] font-medium hover:underline transition"
                    style={{ color: '#6b7280' }}
                >
                    Sign out
                </Link>
            </div>
        ) : (
            /* ===== SIGN-IN CARD (guest) ===== */
            <>
                <div className="px-6 pt-5 pb-4 text-center border-b" style={{ borderColor: 'rgba(15,42,82,0.08)', backgroundColor: '#FAFAF9' }}>
                    <img
                        src="/images/opol.png"
                        alt="Official seal of the Municipality of Opol"
                        className="h-14 w-14 object-contain mx-auto"
                    />
                    <h2 className="mt-3 text-lg font-bold" style={{ color: NAVY, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Sign in to your account
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Enter your credentials to access the system
                    </p>
                </div>

                <form onSubmit={submit} className="px-6 py-4 space-y-3" noValidate>
                    <div>
                        <label htmlFor="email" className="block text-[13px] font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
                                </svg>
                            </span>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 transition`}
                                onFocus={(e) => (e.target.style.borderColor = NAVY)}
                                onBlur={(e) => {
                                    if (!errors.email) e.target.style.borderColor = '';
                                }}
                                placeholder="juan.delacruz"
                                required
                                aria-invalid={!!errors.email}
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-[13px] font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`w-full rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} pl-9 pr-9 py-2 text-[13px] focus:outline-none focus:ring-2 transition`}
                                placeholder="••••••••"
                                required
                                aria-invalid={!!errors.password}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 transition"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none group">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-gray-300 text-[#0F2A52] focus:ring-[#0F2A52] focus:ring-offset-0"
                            />
                            <span className="text-[12px] text-gray-600 group-hover:text-gray-800 transition">Remember me</span>
                        </label>
                        <Link
                            href={route('password.request')}
                            className="text-[12px] font-medium hover:underline transition"
                            style={{ color: NAVY }}
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 rounded-lg text-white text-[13px] font-semibold tracking-wide shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        style={{ backgroundColor: NAVY }}
                    >
                        <span className={`inline-flex items-center transition-all duration-300 ${processing ? 'opacity-0' : 'opacity-100'}`}>
                            Sign In
                        </span>
                        {processing && (
                            <span className="absolute inset-0 flex items-center justify-center">
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            </span>
                        )}
                    </button>
                </form>

                <p className="pb-4 text-center text-[10px] uppercase tracking-[0.12em] text-gray-400">
                    Official use only
                </p>
            </>
        )}
    </div>
</div>
                    </div>
                </section>

                {/* ===== VALUES SECTION ===== */}
                <section className="relative overflow-hidden flex-shrink-0" style={{ backgroundColor: NAVY }}>
                    <div
                        className="pointer-events-none select-none absolute -left-24 -bottom-24 w-[340px] h-[340px] rounded-full opacity-[0.06]"
                        style={{ border: `1.5px solid ${GOLD}` }}
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none select-none absolute -left-8 -bottom-8 w-[240px] h-[240px] rounded-full opacity-[0.06]"
                        style={{ border: `1.5px solid ${GOLD}` }}
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none select-none absolute -right-20 -top-20 w-[160px] h-[160px] rounded-full opacity-[0.04]"
                        style={{ border: `1.5px solid ${GOLD}` }}
                        aria-hidden="true"
                    />

                    <div className="relative max-w-6xl mx-auto px-5 lg:px-8 py-6 md:py-7 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-center">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {values.map((v, i) => (
                                <div key={i} className="group transition-all duration-300 hover:translate-y-[-2px]">
                                    <svg className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke={GOLD} viewBox="0 0 24 24">
                                        {v.icon}
                                    </svg>
                                    <h4 className="text-white text-[13px] font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                        {v.title}
                                    </h4>
                                    <p className="text-white/55 text-[11px] mt-0.5 leading-relaxed">{v.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="lg:border-l lg:pl-8 text-left lg:text-right" style={{ borderColor: 'rgba(198,162,77,0.25)' }}>
                            <p
                                className="text-lg md:text-xl text-white/90 leading-snug"
                                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontStyle: 'italic', fontWeight: 500 }}
                            >
                                "Serbisyong Tapat, Alang sa Katawhan sa Opol."
                            </p>
                            <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-white/40">
                                Municipal Government of Opol
                            </p>
                        </div>
                    </div>
                </section>

                {/* ===== FOOTER ===== */}
                <footer
                    className="border-t flex-shrink-0"
                    style={{ backgroundColor: NAVY_DEEP, borderColor: `rgba(255,191,0,0.2)` }}
                >
                    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-[11px] text-white/45">
                        <p>iLeave · Integrated Leave Management System · Municipality of Opol</p>
                        <p>
                            © {new Date().getFullYear()} Municipality of Opol. All rights reserved.
                            <span className="hidden sm:inline text-white/25"> ·HRIS</span>
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}