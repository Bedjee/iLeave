import { useEffect } from 'react';
import {
    X,
    CheckCircle2,
    Calendar,
    FileText,
    Paperclip,
    Banknote,
    Wallet,
    Info,
} from 'lucide-react';

const NAVY = '#0F2A52';
const GOLD = '#ffbf00';

// ---------- Helpers ----------
const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          })
        : '—';

const initials = (name = '') =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase() || '?';

// ---------- Section wrapper ----------
function Section({ icon: Icon, title, children }) {
    return (
        <div
            className="rounded-xl border p-4"
            style={{ borderColor: 'rgba(15,42,82,0.08)' }}
        >
            <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4" style={{ color: GOLD }} />
                <h3
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: NAVY }}
                >
                    {title}
                </h3>
            </div>
            {children}
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">
                {label}
            </p>
            <div className="text-sm text-gray-900">{children}</div>
        </div>
    );
}

// ---------- Regular leave review ----------
function RegularReview({ leaveType, data, calculatedDays, breakdown }) {
    const isRange = leaveType?.date_selection_type === 'range';
    const validDates = (data.dates || []).filter((d) => d && d.trim() !== '');
    const attachmentName = data.attachment?.name || null;

    return (
        <div className="space-y-3">
            {/* Dates */}
            <Section icon={Calendar} title={isRange ? 'Date Range' : 'Selected Dates'}>
                {isRange ? (
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="From">{fmtDate(data.start_date)}</Field>
                        <Field label="To">{fmtDate(data.end_date)}</Field>
                    </div>
                ) : (
                    <>
                        {validDates.length === 0 ? (
                            <span className="text-sm text-gray-400 italic">
                                No dates selected
                            </span>
                        ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {validDates.map((d, i) => (
                                    <span
                                        key={i}
                                        className="inline-block px-2 py-1 rounded-md text-[11px] font-medium"
                                        style={{
                                            backgroundColor: 'rgba(15,42,82,0.06)',
                                            color: NAVY,
                                        }}
                                    >
                                        {fmtDate(d)}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}

                <div
                    className="mt-3 pt-3 border-t flex items-center justify-between"
                    style={{ borderColor: 'rgba(15,42,82,0.06)' }}
                >
                    <span className="text-[11px] text-gray-500">
                        {isRange ? 'Working days' : 'Total selected'}
                    </span>
                    <span className="text-sm font-bold" style={{ color: NAVY }}>
                        {calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}
                    </span>
                </div>
            </Section>

            {/* Pay breakdown */}
            {breakdown && (
                <Section icon={Banknote} title="Pay Breakdown">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">With Pay</span>
                            <span className="text-sm font-semibold text-emerald-600">
                                {breakdown.withPay} days
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Without Pay</span>
                            <span className="text-sm font-semibold text-gray-700">
                                {breakdown.withoutPay} days
                            </span>
                        </div>
                        <div
                            className="flex items-center justify-between pt-2 border-t"
                            style={{ borderColor: 'rgba(15,42,82,0.06)' }}
                        >
                            <span className="text-[11px] text-gray-400">
                                Available balance
                            </span>
                            <span className="text-xs font-medium text-gray-600">
                                {breakdown.currentBalance} days
                            </span>
                        </div>
                    </div>
                </Section>
            )}

            {/* Details */}
            <Section icon={FileText} title="Details">
                <div className="space-y-3">
                    {data.reason && (
                        <Field label="Reason">
                            <p className="whitespace-pre-wrap break-words">
                                {data.reason}
                            </p>
                        </Field>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Commutation">
                            <span className="capitalize">
                                {data.commutation?.replace('_', ' ') || 'Not requested'}
                            </span>
                        </Field>
                        <Field label="Attachment">
                            {attachmentName ? (
                                <span className="inline-flex items-center gap-1 min-w-0">
                                    <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{attachmentName}</span>
                                </span>
                            ) : (
                                <span className="text-gray-400 italic">None</span>
                            )}
                        </Field>
                    </div>
                </div>
            </Section>
        </div>
    );
}

// ---------- Special request review ----------
function SpecialReview({ specialType, data, vlBalance, slBalance }) {
    if (specialType === 'monetization') {
        return (
            <div className="space-y-3">
                <Section icon={Wallet} title="Monetization">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Days to monetize</span>
                        <span
                            className="text-2xl font-extrabold tabular-nums"
                            style={{ color: NAVY }}
                        >
                            {data.monetized_days}
                            <span className="text-xs text-gray-500 font-medium ml-1">
                                days
                            </span>
                        </span>
                    </div>
                    <div
                        className="mt-3 pt-3 border-t flex items-center justify-between text-[11px]"
                        style={{ borderColor: 'rgba(15,42,82,0.06)' }}
                    >
                        <span className="text-gray-500">
                            Current VL balance
                        </span>
                        <span className="font-medium text-gray-700">
                            {vlBalance} days
                        </span>
                    </div>
                </Section>

                {data.reason && (
                    <Section icon={FileText} title="Reason">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                            {data.reason}
                        </p>
                    </Section>
                )}
            </div>
        );
    }

    // Terminal leave
    return (
        <div className="space-y-3">
            <Section icon={Wallet} title="Terminal Leave">
                <p className="text-sm text-gray-700 leading-relaxed">
                    All accumulated Vacation and Sick Leave credits will be
                    monetized. HRMO will compute the final amount upon
                    processing.
                </p>
                <div
                    className="mt-3 pt-3 border-t grid grid-cols-2 gap-3 text-[11px]"
                    style={{ borderColor: 'rgba(15,42,82,0.06)' }}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">VL</span>
                        <span className="font-medium text-gray-700">
                            {vlBalance} days
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">SL</span>
                        <span className="font-medium text-gray-700">
                            {slBalance} days
                        </span>
                    </div>
                </div>
            </Section>

            {data.reason && (
                <Section icon={FileText} title="Reason">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                        {data.reason}
                    </p>
                </Section>
            )}
        </div>
    );
}

// ---------- Main Modal ----------
export default function LeaveRequestReviewModal({
    open,
    onClose,
    onConfirm,
    processing = false,
    leaveType = null,
    specialType = null,
    data = {},
    calculatedDays = 0,
    breakdown = null,
    employee = {},
    vlBalance = 0,
    slBalance = 0,
}) {
    // Escape closes + body scroll lock
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape' && !processing) onClose();
        };
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [open, processing, onClose]);

    if (!open) return null;

    const isSpecial = !!specialType;

    return (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => !processing && onClose()}
                aria-hidden="true"
            />

            {/* Panel — bottom sheet on mobile, centered card on desktop */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="review-modal-title"
                className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in"
            >
                {/* Header */}
                <div
                    className="flex items-start justify-between gap-3 px-5 py-4 border-b flex-shrink-0"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    <div className="flex items-start gap-3 min-w-0">
                        <div
                            className="flex w-10 h-10 items-center justify-center rounded-full flex-shrink-0"
                            style={{
                                backgroundColor: 'rgba(255,191,0,0.15)',
                                color: GOLD,
                            }}
                        >
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h2
                                id="review-modal-title"
                                className="text-base font-semibold"
                                style={{ color: NAVY }}
                            >
                                Review your request
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Confirm the details below before submitting.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition disabled:opacity-40 flex-shrink-0"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {/* Employee card */}
                    <div
                        className="rounded-xl border p-3.5 mb-3 flex items-center gap-3"
                        style={{
                            borderColor: 'rgba(15,42,82,0.08)',
                            backgroundColor: 'rgba(15,42,82,0.02)',
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                            style={{
                                backgroundColor: 'rgba(15,42,82,0.08)',
                                color: NAVY,
                            }}
                        >
                            {initials(employee?.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {employee?.name || 'Employee'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {employee?.position}
                                {employee?.department && ` · ${employee.department}`}
                            </p>
                        </div>
                    </div>

                    {/* Type chip */}
                    <div className="mb-4">
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ring-1 ${
                                isSpecial
                                    ? 'bg-amber-50 text-amber-700 ring-amber-200'
                                    : ''
                            }`}
                            style={
                                !isSpecial
                                    ? {
                                          backgroundColor: 'rgba(15,42,82,0.06)',
                                          color: NAVY,
                                          borderColor: 'rgba(15,42,82,0.1)',
                                      }
                                    : {}
                            }
                        >
                            {isSpecial
                                ? specialType === 'monetization'
                                    ? 'Monetization Request'
                                    : 'Terminal Leave Request'
                                : leaveType?.name || 'Leave Request'}
                        </span>
                    </div>

                    {/* Details */}
                    {isSpecial ? (
                        <SpecialReview
                            specialType={specialType}
                            data={data}
                            vlBalance={vlBalance}
                            slBalance={slBalance}
                        />
                    ) : (
                        <RegularReview
                            leaveType={leaveType}
                            data={data}
                            calculatedDays={calculatedDays}
                            breakdown={breakdown}
                        />
                    )}

                    {/* Info banner */}
                    <div
                        className="mt-4 rounded-xl p-3 flex items-start gap-2"
                        style={{
                            backgroundColor: 'rgba(15,42,82,0.04)',
                            border: '1px solid rgba(15,42,82,0.06)',
                        }}
                    >
                        <Info
                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                            style={{ color: NAVY, opacity: 0.7 }}
                        />
                        <p className="text-[11px] leading-relaxed text-gray-600">
                            Once submitted, your request will be routed to the
                            approvers. You can cancel it from{' '}
                            <span className="font-medium">My Leave Requests</span>{' '}
                            while it is still pending.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="px-5 py-4 border-t flex flex-col-reverse sm:flex-row sm:justify-end gap-2 flex-shrink-0"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50"
                        style={{
                            border: '1px solid rgba(15,42,82,0.12)',
                            color: NAVY,
                        }}
                    >
                        Go back and edit
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm hover:shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ backgroundColor: NAVY }}
                    >
                        {processing ? (
                            <>
                                <svg
                                    className="w-4 h-4 animate-spin"
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
                                Submitting…
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Confirm & Submit
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}