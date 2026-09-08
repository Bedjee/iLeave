import React from 'react';

export default function SpecialRequestInfo({ leaveRequest, specialBalanceData }) {
    const lr = leaveRequest;

    if (!lr || !['monetization', 'terminal_leave'].includes(lr.request_type)) {
        return null;
    }

    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';

    const isMonetization = lr.request_type === 'monetization';
    const isTerminalLeave = lr.request_type === 'terminal_leave';

    const formatDays = (days) => {
        const num = Number(days);
        if (isNaN(num)) return '0';
        if (Number.isInteger(num)) return num.toString();
        return parseFloat(num.toFixed(2)).toString();
    };

    const title = isMonetization ? 'Monetization' : 'Terminal Leave';
    const icon = isMonetization ? (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ) : (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    );

    const bgColor = isMonetization ? 'bg-amber-50 border-amber-300' : 'bg-purple-50 border-purple-300';
    const badgeColor = isMonetization ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-purple-100 text-purple-800 border-purple-300';

    // Details
    let details = [];
    let balanceSummary = null;

    if (isMonetization) {
        const days = lr.monetized_days || 0;
        details.push({ label: 'Monetized Days', value: `${formatDays(days)} days` });
        details.push({ label: 'Leave Type', value: lr.leave_type?.name || 'Vacation Leave' });
        details.push({ label: 'Reason', value: lr.reason || '—' });
    } else if (isTerminalLeave) {
        const total = lr.number_of_days || 0;
        details.push({ label: 'Total Days (VL + SL)', value: `${formatDays(total)} days` });
        details.push({ label: 'Reason', value: lr.reason || '—' });

        if (specialBalanceData) {
            balanceSummary = (
                <div className="mt-3 p-3 bg-white/60 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Balance Breakdown</p>
                    <div className="grid grid-cols-3 gap-2 mt-1 text-center">
                        <div>
                            <p className="text-xs text-gray-500">VL</p>
                            <p className="text-sm font-bold" style={{ color: NAVY }}>{formatDays(specialBalanceData.vl)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">SL</p>
                            <p className="text-sm font-bold" style={{ color: NAVY }}>{formatDays(specialBalanceData.sl)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-sm font-bold" style={{ color: GOLD }}>{formatDays(specialBalanceData.total)}</p>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className={`rounded-xl border p-5 mb-6 ${bgColor}`} style={{ borderColor: 'rgba(15,42,82,0.12)' }}>
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${badgeColor} flex items-center justify-center`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: NAVY }}>
                        Special Request: {title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        {details.map((item, idx) => (
                            <div key={idx}>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</p>
                                <p className="text-sm font-medium text-gray-900">{item.value}</p>
                            </div>
                        ))}
                    </div>
                    {balanceSummary}
                    <p className="text-xs text-gray-500 mt-2">
                        This is a special request type that does not require regular leave type selection.
                    </p>
                </div>
            </div>
        </div>
    );
}
