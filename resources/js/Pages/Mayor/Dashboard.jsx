import MayorLayout from '@/Layouts/MayorLayout';
import { Head, Link } from '@inertiajs/react';
import {
    FileText, Clock, CheckCircle, XCircle, Users, Building2,
    Calendar, AlertCircle, Eye, BarChart3, Shield, FileSpreadsheet,
    ChevronRight, TrendingUp, TrendingDown, Circle
} from 'lucide-react';

export default function Dashboard({ stats, departmentBreakdown, recentHighlights, trendData }) {
    // Fallback values
    const safeStats = stats || {
        totalRequests: 0,
        pendingApprovals: 0,
        approvedLeaves: 0,
        rejectedLeaves: 0,
        activeEmployees: 0,
        departments: 0,
    };
    const safeDepartments = departmentBreakdown || [];
    const safeHighlights = recentHighlights || [];

    // Get current time and date
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    const dateStr = now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Colors
    const RED = '#B91C1C';
    const LIGHT_RED_BG = '#FEF2F2';
    const BORDER_LIGHT = '#E5E7EB';

    // KPI configuration
    const kpiItems = [
        { key: 'totalRequests', label: 'Total Requests', value: safeStats.totalRequests, change: '+12.5%', icon: FileText, color: RED },
        { key: 'pendingApprovals', label: 'Pending Approvals', value: safeStats.pendingApprovals, change: '-3.2%', icon: Clock, color: '#F59E0B' },
        { key: 'approvedLeaves', label: 'Approved', value: safeStats.approvedLeaves, change: '+8.1%', icon: CheckCircle, color: '#10B981' },
        { key: 'rejectedLeaves', label: 'Rejected', value: safeStats.rejectedLeaves, change: '+2.4%', icon: XCircle, color: '#EF4444' },
        { key: 'activeEmployees', label: 'Active Employees', value: safeStats.activeEmployees, change: '+4.6%', icon: Users, color: '#3B82F6' },
        { key: 'departments', label: 'Departments', value: safeStats.departments, change: '0%', icon: Building2, color: '#8B5CF6' },
    ];

    // Department bar chart - compute max for scaling
    const maxRequests = Math.max(...safeDepartments.map(d => d.requests), 1);

    // Department status (for now, we'll assume all active)
    const deptStatus = safeDepartments.map(d => ({ name: d.dept, active: true }));

    // Trend data (placeholder - replace with real data when available)
    const defaultTrend = [12, 19, 15, 22, 30, 28, 35, 42, 38, 45, 50, 55];
    const trend = trendData || defaultTrend;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // SVG line chart dimensions
    const chartHeight = 120;
    const chartWidth = 500;
    const padding = { top: 10, bottom: 20, left: 10, right: 10 };
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;
    const maxVal = Math.max(...trend, 1);
    const points = trend.map((val, i) => {
        const x = padding.left + (i / (trend.length - 1)) * innerWidth;
        const y = padding.top + innerHeight - (val / maxVal) * innerHeight;
        return `${x},${y}`;
    }).join(' ');

    return (
        <MayorLayout>
            <Head title="Mayor Dashboard" />

            {/* Greeting & Date/Time */}
            <div className="flex flex-wrap items-start justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{greeting}, Mayor!</h1>
                    <p className="text-gray-500 mt-1">Here's your leave management overview for the Municipality of Opol.</p>
                </div>
                <div className="flex items-center gap-3 mt-2 sm:mt-0 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-[#E5E7EB]">
                    <Calendar className="w-5 h-5 text-[#DC2626]" />
                    <span className="font-medium">{dateStr}</span>
                    <span className="text-gray-400">•</span>
                    <span>{dayStr} • {timeStr}</span>
                </div>
            </div>

            {/* Pending Approval Alert */}
            <div className="mb-6 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#DC2626] flex items-center justify-center text-white">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[#991B1B]">Pending Leave Approvals</h3>
                        <p className="text-sm text-[#991B1B]/80">
                            You have <span className="font-bold">{safeStats.pendingApprovals}</span> pending leave requests requiring your approval.
                        </p>
                    </div>
                </div>
                <Link
                    href="#"
                    className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1"
                >
                    Review Requests <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                {kpiItems.map((item) => (
                    <div key={item.key} className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-4">
                        <div className="flex items-start justify-between">
                            <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-xs font-medium ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                                {item.change}
                            </span>
                        </div>
                        <div className="mt-3">
                            <div className="text-sm text-gray-500">{item.label}</div>
                            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                            <div className="text-xs text-gray-400 mt-1">{item.key === 'totalRequests' ? 'all time' : ''}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two‑column: Requests by Department (2/3) + Quick Actions & Department Status (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Left: Requests by Department */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Requests by Department</h3>
                            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg border border-[#E5E7EB]">
                                This Month ▼
                            </div>
                        </div>
                        {safeDepartments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No department data available.</div>
                        ) : (
                            <div className="space-y-3">
                                {safeDepartments.map((dept) => {
                                    const pct = Math.round((dept.requests / maxRequests) * 100);
                                    return (
                                        <div key={dept.dept} className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-700 w-40 truncate">{dept.dept}</span>
                                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{ width: `${pct}%`, backgroundColor: RED }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 w-12 text-right">{dept.requests}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Quick Actions */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link href="#" className="group flex items-start gap-3 p-3 rounded-lg hover:bg-[#FEF2F2] transition">
                                <Eye className="w-5 h-5 text-[#DC2626] mt-0.5" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-800">View Municipality-wide Reports</div>
                                    <div className="text-xs text-gray-500">See overall leave statistics</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#DC2626] transition" />
                            </Link>
                            <Link href="#" className="group flex items-start gap-3 p-3 rounded-lg hover:bg-[#FEF2F2] transition">
                                <BarChart3 className="w-5 h-5 text-[#DC2626] mt-0.5" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-800">Department Overview</div>
                                    <div className="text-xs text-gray-500">View department-wise summary</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#DC2626] transition" />
                            </Link>
                            <Link href="#" className="group flex items-start gap-3 p-3 rounded-lg hover:bg-[#FEF2F2] transition">
                                <Shield className="w-5 h-5 text-[#DC2626] mt-0.5" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-800">Policy Oversight</div>
                                    <div className="text-xs text-gray-500">Manage and review leave policies</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#DC2626] transition" />
                            </Link>
                            <Link href="#" className="group flex items-start gap-3 p-3 rounded-lg hover:bg-[#FEF2F2] transition">
                                <FileSpreadsheet className="w-5 h-5 text-[#DC2626] mt-0.5" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-800">Export Summary Report</div>
                                    <div className="text-xs text-gray-500">Download comprehensive report</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#DC2626] transition" />
                            </Link>
                        </div>
                    </div>

                    {/* Department Status */}
                    <div className="mt-6 bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Status</h3>
                        <div className="space-y-2">
                            {deptStatus.map((dept) => (
                                <div key={dept.name} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                                    <span className="text-sm text-gray-700">{dept.name}</span>
                                    <span className="flex items-center gap-1.5 text-xs text-green-600">
                                        <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                                        Active
                                    </span>
                                </div>
                            ))}
                            <Link href="#" className="text-sm text-[#DC2626] hover:underline font-medium block mt-3">
                                View all departments →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom row: Leave Trends (2/3) + Year Overview (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Leave Trends */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Trends</h3>
                        <div className="relative">
                            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto max-h-32">
                                {/* Y‑axis grid lines (light) */}
                                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                                    <line
                                        key={ratio}
                                        x1={padding.left}
                                        y1={padding.top + innerHeight * (1 - ratio)}
                                        x2={chartWidth - padding.right}
                                        y2={padding.top + innerHeight * (1 - ratio)}
                                        stroke="#E5E7EB"
                                        strokeWidth="0.5"
                                    />
                                ))}
                                {/* Line */}
                                <polyline
                                    points={points}
                                    fill="none"
                                    stroke="#DC2626"
                                    strokeWidth="2.5"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                />
                                {/* Area under line (light red) */}
                                <polygon
                                    points={`${padding.left},${chartHeight - padding.bottom} ${points} ${chartWidth - padding.right},${chartHeight - padding.bottom}`}
                                    fill="#FEF2F2"
                                    opacity="0.6"
                                />
                                {/* X‑axis labels */}
                                {months.map((month, i) => {
                                    const x = padding.left + (i / (trend.length - 1)) * innerWidth;
                                    return (
                                        <text
                                            key={month}
                                            x={x}
                                            y={chartHeight - 2}
                                            textAnchor="middle"
                                            fontSize="10"
                                            fill="#94A3B8"
                                        >
                                            {month}
                                        </text>
                                    );
                                })}
                            </svg>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#DC2626]"></span> Total Requests</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#10B981]"></span> Approved</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#94A3B8]"></span> Rejected</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Year Overview */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 h-full flex flex-col justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Year Overview</h3>
                        <div>
                            <p className="text-sm text-gray-500">Total requests this year</p>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-gray-900">{safeStats.totalRequests}</span>
                                <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4" />
                                    12.5% vs last year
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <Link href="#" className="text-[#DC2626] hover:underline text-sm font-medium">
                                View detailed report →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MayorLayout>
    );
}