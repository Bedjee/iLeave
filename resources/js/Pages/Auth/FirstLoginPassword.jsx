import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function FirstLoginPassword() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const NAVY = '#0F2A52';
    const NAVY_DARK = '#081A33';
    const GOLD = '#ffbf00';

    const submit = (e) => {
        e.preventDefault();
        post(route('first-login-password.store'));
    };

    // Password strength indicator
    const getPasswordStrength = (pw) => {
        if (!pw) return { score: 0, label: '', color: '' };
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;

        const map = {
            0: { label: 'Too short', color: '#ef4444' },
            1: { label: 'Weak', color: '#ef4444' },
            2: { label: 'Fair', color: '#f59e0b' },
            3: { label: 'Good', color: '#10b981' },
            4: { label: 'Strong', color: '#10b981' },
        };
        return { score, ...map[score] };
    };

    const strength = getPasswordStrength(data.password);

    return (
        <>
            <Head title="Change Password" />
            <div
                className="min-h-screen flex items-center justify-center px-4 py-8"
                style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3a6a 100%)` }}
            >
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: GOLD }}></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: GOLD }}></div>
                </div>

                {/* Card */}
                <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Accent bar */}
                    <div className="h-1.5" style={{ backgroundColor: GOLD }}></div>

                    <div className="p-6 sm:p-8">
                        {/* Logo / Brand */}
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <img
                                src="/images/opol.png"
                                alt="iLeave Logo"
                                className="h-12 w-auto object-contain"
                            />
                            <div>
                                <span className="text-2xl font-extrabold tracking-tight" style={{ color: NAVY }}>
                                    i<span style={{ color: GOLD }}>Leave</span>
                                </span>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                    Municipality of Opol
                                </p>
                            </div>
                        </div>

                        {/* Heading */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: NAVY }}>
                                Set Your New Password
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                This is your first login. Please set a new password to continue.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            {/* New Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: NAVY }}>
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter new password"
                                        className="w-full rounded-lg border px-3 py-2.5 pr-10 text-sm transition focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: errors.password ? '#ef4444' : 'rgba(15,42,82,0.15)',
                                            backgroundColor: '#f9fafb',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = GOLD;
                                            e.target.style.backgroundColor = '#fff';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = errors.password ? '#ef4444' : 'rgba(15,42,82,0.15)';
                                            e.target.style.backgroundColor = '#f9fafb';
                                        }}
                                        required
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        {errors.password}
                                    </p>
                                )}

                                {/* Strength meter */}
                                {data.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full transition-all duration-300"
                                                    style={{
                                                        width: `${(strength.score / 4) * 100}%`,
                                                        backgroundColor: strength.color,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium" style={{ color: strength.color }}>
                                                {strength.label}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm font-medium mb-1" style={{ color: NAVY }}>
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password_confirmation"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Re-enter new password"
                                        className="w-full rounded-lg border px-3 py-2.5 pr-10 text-sm transition focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: errors.password_confirmation ? '#ef4444' : 'rgba(15,42,82,0.15)',
                                            backgroundColor: '#f9fafb',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = GOLD;
                                            e.target.style.backgroundColor = '#fff';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = errors.password_confirmation ? '#ef4444' : 'rgba(15,42,82,0.15)';
                                            e.target.style.backgroundColor = '#f9fafb';
                                        }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition"
                                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirm ? (
                                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            {/* Password requirements hint */}
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <p className="text-xs font-medium text-gray-600 mb-1.5">Password must contain:</p>
                                <ul className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                                    <li className="flex items-center gap-1.5">
                                        <span className={`size-3.5 rounded-full flex items-center justify-center ${data.password.length >= 8 ? 'bg-green-100' : 'bg-gray-200'}`}>
                                            {data.password.length >= 8 && (
                                                <svg className="size-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </span>
                                        At least 8 characters
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <span className={`size-3.5 rounded-full flex items-center justify-center ${/[A-Z]/.test(data.password) ? 'bg-green-100' : 'bg-gray-200'}`}>
                                            {/[A-Z]/.test(data.password) && (
                                                <svg className="size-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </span>
                                        One uppercase letter
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <span className={`size-3.5 rounded-full flex items-center justify-center ${/[0-9]/.test(data.password) ? 'bg-green-100' : 'bg-gray-200'}`}>
                                            {/[0-9]/.test(data.password) && (
                                                <svg className="size-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </span>
                                        One number
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <span className={`size-3.5 rounded-full flex items-center justify-center ${/[^A-Za-z0-9]/.test(data.password) ? 'bg-green-100' : 'bg-gray-200'}`}>
                                            {/[^A-Za-z0-9]/.test(data.password) && (
                                                <svg className="size-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </span>
                                        One special character
                                    </li>
                                </ul>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2.5 px-4 text-white rounded-lg font-semibold text-sm transition shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: NAVY }}
                                onMouseOver={(e) => !processing && (e.currentTarget.style.backgroundColor = NAVY_DARK)}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin size-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Saving...
                                    </span>
                                ) : (
                                    'Change Password'
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <p className="text-center text-xs text-gray-400 mt-6">
                            Local Government Unit of Opol &copy; {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}