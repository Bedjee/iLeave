import EmployeeLayout from '@/Layouts/EmployeeLayout';
import { Head, Link } from '@inertiajs/react';
import {
    CalendarPlus,
    Wallet,
    User as UserIcon,
    FileText,
    Calendar,
    CheckCircle2,
    Clock,
    Activity,
    Sun,
    Sunrise,
    Sunset,
} from 'lucide-react';

const NAVY = '#0F2A52';
const GOLD = '#ffbf00';

// ---------- Helpers ----------
const formatNumber = (value) => {
    const num = Number(value);
    if (isNaN(num)) return '0';
    if (Number.isInteger(num)) return num.toString();
    return parseFloat(num.toFixed(2)).toString();
};

const initials = (name = '') =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'E';

// ---------- Balance card ----------
function BalanceCard({ label, value, accent, barClass, allocation = 15, icon: Icon }) {
    const balance = Number(value) || 0;
    const pct = Math.min(100, Math.max(0, (balance / allocation) * 100));
    const isLow = balance > 0 && balance <= 3;
    const isEmpty = balance === 0;

    return (
        <div
            className="bg-white rounded-xl border shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow"
            style={{ borderColor: 'rgba(15,42,82,0.08)' }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                        <span className="text-xs font-medium text-gray-500 truncate">{label}</span>
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-bold tabular-nums" style={{ color: NAVY }}>
                            {formatNumber(balance)}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                            {balance === 1 ? 'day' : 'days'}
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        {isEmpty
                            ? 'No credits remaining'
                            : isLow
                            ? 'Low balance — plan carefully'
                            : 'available to use'}
                    </p>
                </div>

                <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${accent}15`, color: accent }}
                >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3.5">
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1.5">
                    <span>{allocation}-day allocation</span>
                    <span className="tabular-nums">{Math.round(pct)}% available</span>
                </div>
            </div>
        </div>
    );
}

// ---------- Quick action tile ----------
function QuickAction({ href, icon: Icon, label, tint }) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 bg-white rounded-xl border hover:shadow-md hover:-translate-y-0.5 transition-all"
            style={{ borderColor: 'rgba(15,42,82,0.08)' }}
        >
            <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: tint.bg, color: tint.fg }}
            >
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-gray-700 text-center leading-tight">
                {label}
            </span>
        </Link>
    );
}

// ---------- Status pill ----------
function StatusPill({ status }) {
    const map = {
        approved: 'bg-emerald-50 text-emerald-700',
        rejected: 'bg-red-50 text-red-700',
        pending:  'bg-amber-50 text-amber-700',
        certified:'bg-blue-50 text-blue-700',
        cancelled:'bg-gray-100 text-gray-600',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize whitespace-nowrap ${map[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
}

export default function Dashboard({ employee, leaveCredits, pendingRequests, recentActivity }) {
    const credits     = leaveCredits || { vacation_leave: 0, sick_leave: 0 };
    const totalVac    = Number(credits.vacation_leave) || 0;
    const totalSick   = Number(credits.sick_leave) || 0;
    const pending     = pendingRequests || [];
    const activity    = recentActivity || [];

    const pendingCount  = pending.length;
    const approvedCount = activity.filter((a) => a.status === 'approved').length;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const GreetIcon = hour < 12 ? Sunrise : hour < 17 ? Sun : Sunset;

    const employeeName =
        employee?.first_name ||
        employee?.name?.split(' ')[0] ||
        'Employee';

    const fullName = employee?.name || employeeName;

    return (
        <EmployeeLayout>
            <Head title="Dashboard" />

            <div className="space-y-4 sm:space-y-5">

                {/* ============ Hero ============ */}
                <div className="relative overflow-hidden bg-white rounded-xl sm:rounded-2xl border shadow-sm p-4 sm:p-6"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    {/* Decorative blurs — contained by overflow-hidden */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#ffbf00]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#0F2A52]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

                    <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        {/* Greeting */}
                        <div className="flex items-start gap-3 min-w-0">
                            <div
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: 'rgb(29, 27, 65)', color: GOLD }}
                            >
                                <GreetIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <h1
                                    className="text-lg sm:text-xl md:text-2xl font-bold truncate leading-tight"
                                    style={{ color: NAVY }}
                                >
                                    {greeting}, {employeeName}!
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
                                    {employee?.position && employee?.department
                                        ? `${employee.position} · ${employee.department}`
                                        : 'Welcome to your leave dashboard.'}
                                </p>
                            </div>
                        </div>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                            <Link
                                href={route('employee.leave-requests.create')}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm hover:shadow-md transition"
                                style={{ backgroundColor: NAVY }}
                            >
                                <CalendarPlus className="w-4 h-4" />
                                Request Leave
                            </Link>
                            <Link
                                href={route('employee.leave-balances')}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                            >
                                <Wallet className="w-4 h-4" style={{ color: GOLD }} />
                                View Balances
                            </Link>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="relative mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                            <div className="text-lg sm:text-xl font-bold tabular-nums leading-tight" style={{ color: NAVY }}>
                                {formatNumber(totalVac + totalSick)}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Total Credits</div>
                        </div>
                        <div>
                            <div className="text-lg sm:text-xl font-bold tabular-nums leading-tight" style={{ color: GOLD }}>
                                {pendingCount}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Pending</div>
                        </div>
                        <div>
                            <div className="text-lg sm:text-xl font-bold tabular-nums leading-tight text-emerald-600">
                                {approvedCount}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Approved (YTD)</div>
                        </div>
                        <div>
                            <div className="text-lg sm:text-xl font-bold tabular-nums leading-tight text-gray-700">
                                {activity.length}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Recent</div>
                        </div>
                    </div>
                </div>

                {/* ============ Balances ============ */}
                <div>
                    <div className="flex items-center justify-between mb-2.5">
                        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: NAVY }}>
                            <Wallet className="w-4 h-4" style={{ color: GOLD }} />
                            Leave Balances
                        </h2>
                        <Link
                            href={route('employee.leave-balances')}
                            className="text-xs font-medium hover:underline"
                            style={{ color: GOLD }}
                        >
                            View all →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <BalanceCard
                            label="Vacation Leave"
                            value={totalVac}
                            accent={GOLD}
                            barClass="bg-[#ffbf00]"
                            allocation={15}
                            icon={Calendar}
                        />
                        <BalanceCard
                            label="Sick Leave"
                            value={totalSick}
                            accent="#10B981"
                            barClass="bg-emerald-500"
                            allocation={15}
                            icon={Clock}
                        />
                    </div>
                </div>

                {/* ============ Quick Actions ============ */}
                <div>
                    <h2 className="text-sm font-semibold mb-2.5 flex items-center gap-2" style={{ color: NAVY }}>
                        <Activity className="w-4 h-4" style={{ color: GOLD }} />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                        <QuickAction
                            href={route('employee.leave-requests.create')}
                            icon={CalendarPlus}
                            label="Request Leave"
                            tint={{ bg: 'rgba(255,191,0,0.15)', fg: GOLD }}
                        />
                        <QuickAction
                            href={route('employee.leave-balances')}
                            icon={Wallet}
                            label="My Balances"
                            tint={{ bg: 'rgba(15,42,82,0.08)', fg: NAVY }}
                        />
                        <QuickAction
                            href={route('employee.profile.edit')}
                            icon={UserIcon}
                            label="My Profile"
                            tint={{ bg: 'rgba(139,92,246,0.12)', fg: '#7C3AED' }}
                        />
                        <QuickAction
                            href={route('employee.leave-requests.index')}
                            icon={FileText}
                            label="My Requests"
                            tint={{ bg: 'rgba(249,115,22,0.12)', fg: '#EA580C' }}
                        />
                    </div>
                </div>

                {/* ============ Pending + Activity ============ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    {/* Pending */}
                    <div
                        className="bg-white rounded-xl border shadow-sm p-4"
                        style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: NAVY }}>
                                <Clock className="w-4 h-4" style={{ color: GOLD }} />
                                Pending Requests
                            </h3>
                            {pendingCount > 0 && (
                                <span
                                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: '#B45309' }}
                                >
                                    {pendingCount} pending
                                </span>
                            )}
                        </div>

                        {pending.length === 0 ? (
                            <div className="text-center py-6">
                                <div
                                    className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-emerald-50"
                                >
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                </div>
                                <p className="text-xs font-medium text-gray-700">All caught up</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">No pending requests.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100 -my-1">
                                {pending.map((req) => (
                                    <li key={req.id} className="py-2.5 flex items-center justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-gray-900 truncate">{req.type}</p>
                                            <p className="text-[11px] text-gray-500 truncate">
                                                {req.start} – {req.end}
                                            </p>
                                        </div>
                                        <StatusPill status="pending" />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Recent activity */}
                    <div
                        className="bg-white rounded-xl border shadow-sm p-4"
                        style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: NAVY }}>
                                <Activity className="w-4 h-4 text-blue-500" />
                                Recent Activity
                            </h3>
                            {activity.length > 0 && (
                                <Link
                                    href={route('employee.leave-requests.index')}
                                    className="text-[11px] font-medium text-gray-500 hover:text-gray-800 transition"
                                >
                                    View all →
                                </Link>
                            )}
                        </div>

                        {activity.length === 0 ? (
                            <div className="text-center py-6">
                                <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-gray-50">
                                    <FileText className="w-6 h-6 text-gray-300" />
                                </div>
                                <p className="text-xs font-medium text-gray-700">No recent activity</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    Start by filing a leave request.
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100 -my-1">
                                {activity.slice(0, 5).map((item) => (
                                    <li key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-gray-900 truncate" title={item.description}>
                                                {item.description}
                                            </p>
                                            <p className="text-[11px] text-gray-500 truncate">{item.date}</p>
                                        </div>
                                        <StatusPill status={item.status} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

            </div>
        </EmployeeLayout>
    );
}