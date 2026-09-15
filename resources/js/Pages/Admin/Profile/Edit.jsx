import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ShieldCheck,
    User,
    Mail,
    KeyRound,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Calendar,
} from 'lucide-react';

const NAVY = '#0F2A52';
const NAVY_DARK = '#1a3a6a';
const GOLD = '#ffbf00';

// ---------- PIN input with show/hide + numeric-only enforcement ----------
function PinField({ id, label, value, onChange, error, placeholder, hint }) {
    const [visible, setVisible] = useState(false);

    const handleChange = (e) => {
        // Strip any non-digit characters — keeps the value clean even on paste
        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
        onChange(digitsOnly);
    };

    return (
        <div>
            <label htmlFor={id} className="block text-xs font-medium" style={{ color: NAVY }}>
                {label}
            </label>
            <div className="relative mt-1">
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    inputMode="numeric"
                    autoComplete="new-password"
                    maxLength="4"
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full rounded-lg border pl-3 pr-10 py-2 text-sm tracking-[0.4em] font-mono focus:outline-none transition"
                    style={{
                        borderColor: error ? '#FCA5A5' : 'rgba(15,42,82,0.15)',
                        backgroundColor: '#fff',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) =>
                        (e.target.style.borderColor = error ? '#FCA5A5' : 'rgba(15,42,82,0.15)')
                    }
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    tabIndex={-1}
                    aria-label={visible ? 'Hide PIN' : 'Show PIN'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition"
                >
                    {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
            </div>
            {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
            {error && (
                <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {error}
                </p>
            )}
        </div>
    );
}

// ---------- Read-only info row ----------
function InfoRow({ icon: Icon, label, children }) {
    return (
        <div className="flex items-start gap-2.5">
            <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: 'rgba(15,42,82,0.06)', color: NAVY }}
            >
                <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                    {label}
                </div>
                <div className="text-sm text-gray-900 truncate">{children}</div>
            </div>
        </div>
    );
}

// ---------- Section card ----------
function SectionCard({ title, subtitle, icon: Icon, children }) {
    return (
        <div
            className="bg-white rounded-xl border shadow-sm overflow-hidden"
            style={{ borderColor: 'rgba(15,42,82,0.08)' }}
        >
            <div
                className="px-4 sm:px-5 py-3 border-b flex items-center gap-2.5"
                style={{ borderColor: 'rgba(15,42,82,0.06)' }}
            >
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: GOLD }}
                >
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold" style={{ color: NAVY }}>
                        {title}
                    </h3>
                    {subtitle && <p className="text-[11px] text-gray-500">{subtitle}</p>}
                </div>
            </div>
            <div className="p-4 sm:p-5">{children}</div>
        </div>
    );
}

export default function Edit({ user }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        current_pin: '',
        new_pin: '',
        confirm_pin: '',
    });

    const [showSuccess, setShowSuccess] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.profile.update-pin'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowSuccess(true);
                reset('current_pin', 'new_pin', 'confirm_pin');
                setTimeout(() => setShowSuccess(false), 5000);
            },
        });
    };

    const pinSet = !!user.has_pin;

    return (
        <AdminLayout>
            <Head title="Admin Profile" />
            <div className="max-w-2xl mx-auto px-3 sm:px-5 py-3 sm:py-5 space-y-4">

                {/* ========== Header ========== */}
                <div>
                    <h2
                        className="text-lg sm:text-xl font-bold flex items-center gap-2"
                        style={{ color: NAVY }}
                    >
                        <User className="w-5 h-5" style={{ color: GOLD }} />
                        Admin Profile
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Manage your account and security settings.
                    </p>
                </div>

                {/* ========== Success banner ========== */}
                {showSuccess && (
                    <div className="rounded-lg border p-3 flex items-start gap-2.5 bg-emerald-50 border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <p className="font-semibold text-emerald-800">PIN updated successfully</p>
                            <p className="text-emerald-700/80 mt-0.5">
                                Use your new PIN the next time you sign an approval.
                            </p>
                        </div>
                    </div>
                )}

                {/* ========== Account Information ========== */}
                <SectionCard
                    title="Account Information"
                    subtitle="Your registered details"
                    icon={User}
                >
                    <div className="space-y-3">
                        <InfoRow icon={User} label="Name">
                            {user.name}
                        </InfoRow>
                        <InfoRow icon={Mail} label="Email">
                            {user.email}
                        </InfoRow>
                        <InfoRow icon={ShieldCheck} label="PIN Status">
                            {pinSet ? (
                                <span className="inline-flex items-center gap-1.5 flex-wrap">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Set
                                    </span>
                                    {user.pin_set_at && (
                                        <span className="text-[11px] text-gray-500 inline-flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(user.pin_set_at).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    )}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    Not set — set one below
                                </span>
                            )}
                        </InfoRow>
                    </div>
                </SectionCard>

                {/* ========== PIN Security ========== */}
                <SectionCard
                    title={pinSet ? 'Change PIN' : 'Set PIN'}
                    subtitle="4-digit numeric code used to authorize approvals"
                    icon={KeyRound}
                >
                    <form onSubmit={submit} className="space-y-3.5">
                        {pinSet && (
                            <PinField
                                id="current_pin"
                                label="Current PIN"
                                value={data.current_pin}
                                onChange={(v) => setData('current_pin', v)}
                                error={errors.current_pin}
                                placeholder="••••"
                                hint="Required to confirm it's really you."
                            />
                        )}

                        <PinField
                            id="new_pin"
                            label="New PIN"
                            value={data.new_pin}
                            onChange={(v) => setData('new_pin', v)}
                            error={errors.new_pin}
                            placeholder="••••"
                            hint="Exactly 4 digits. Avoid obvious sequences like 1234."
                        />

                        <PinField
                            id="confirm_pin"
                            label="Confirm New PIN"
                            value={data.confirm_pin}
                            onChange={(v) => setData('confirm_pin', v)}
                            error={errors.confirm_pin}
                            placeholder="••••"
                            hint="Re-enter the same 4 digits."
                        />

                        <div
                            className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t"
                            style={{ borderColor: 'rgba(15,42,82,0.06)' }}
                        >
                            <p className="text-[11px] text-gray-400">
                                Your PIN is encrypted and cannot be viewed by anyone.
                            </p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition font-medium text-sm shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                                style={{ backgroundColor: NAVY }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = NAVY_DARK)}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                            >
                                {processing ? (
                                    <>
                                        <svg
                                            className="w-3.5 h-3.5 animate-spin"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                opacity="0.25"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            />
                                        </svg>
                                        Updating…
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="w-3.5 h-3.5" />
                                        {pinSet ? 'Update PIN' : 'Set PIN'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </SectionCard>
            </div>
        </AdminLayout>
    );
}