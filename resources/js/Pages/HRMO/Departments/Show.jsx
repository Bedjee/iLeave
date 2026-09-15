import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    Pencil,
    ArrowLeft,
    Hash,
    UserCog,
    Users,
    Mail,
    AlertCircle,
    Briefcase,
    UserCheck,
} from 'lucide-react';

const NAVY = '#0F2A52';
const NAVY_DARK = '#081A33';
const GOLD = '#ffbf00';

// ---------- Small components ----------
function StatusBadge({ status }) {
    const active = status === 'active';
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
            }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            {status}
        </span>
    );
}

function InfoCard({ icon: Icon, label, children }) {
    return (
        <div
            className="rounded-xl bg-white border shadow-sm p-4"
            style={{ borderColor: 'rgba(15,42,82,0.08)' }}
        >
            <div className="flex items-center gap-2 mb-2">
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(15,42,82,0.06)', color: NAVY }}
                >
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: NAVY, opacity: 0.7 }}
                >
                    {label}
                </span>
            </div>
            <div className="text-sm font-medium text-gray-900">{children}</div>
        </div>
    );
}

// ---------- Page ----------
export default function Show({ department }) {
    const employeeCount = department.employees?.length ?? 0;

    return (
        <HRMOLayout>
            <Head title={department.department_name} />
            <div className="space-y-5">

                {/* ================= Back link ================= */}
                <Link
                    href={route('hrmo.departments.index')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Departments
                </Link>

                {/* ================= Header ================= */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2
                            className="text-xl font-bold flex items-center gap-2 flex-wrap"
                            style={{ color: NAVY }}
                        >
                            <Building2 className="w-5 h-5" style={{ color: GOLD }} />
                            {department.department_name}
                            <span
                                className="inline-block px-2 py-0.5 rounded-md text-[11px] font-mono font-medium"
                                style={{ backgroundColor: 'rgba(15,42,82,0.06)', color: NAVY }}
                            >
                                {department.department_code}
                            </span>
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Department details and assigned personnel.
                        </p>
                    </div>
                    <Link
                        href={route('hrmo.departments.edit', department.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-white rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md"
                        style={{ backgroundColor: NAVY }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = NAVY_DARK)}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                    >
                        <Pencil className="w-4 h-4" />
                        Edit Department
                    </Link>
                </div>

                {/* ================= Info cards ================= */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <InfoCard icon={Hash} label="Department Code">
                        <span className="font-mono">{department.department_code}</span>
                    </InfoCard>

                    <InfoCard icon={UserCog} label="Department Head">
                        {department.head?.full_name || (
                            <span className="text-gray-400 italic font-normal">Unassigned</span>
                        )}
                    </InfoCard>

                    <InfoCard icon={Users} label="Total Employees">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="text-lg font-bold">{employeeCount}</span>
                            <span className="text-xs text-gray-500 font-normal">
                                {employeeCount === 1 ? 'person' : 'people'}
                            </span>
                        </span>
                    </InfoCard>

                    <InfoCard icon={UserCheck} label="Status">
                        <StatusBadge status={department.status} />
                    </InfoCard>
                </div>

                {/* ================= Employees table ================= */}
                <div
                    className="rounded-xl bg-white border shadow-sm overflow-hidden"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    {/* Card header */}
                    <div
                        className="px-4 py-3 border-b flex items-center justify-between"
                        style={{ borderColor: 'rgba(15,42,82,0.06)' }}
                    >
                        <div>
                            <h3
                                className="text-sm font-semibold flex items-center gap-2"
                                style={{ color: NAVY }}
                            >
                                <Users className="w-4 h-4" style={{ color: GOLD }} />
                                Employees in this Department
                            </h3>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                                {employeeCount} {employeeCount === 1 ? 'employee' : 'employees'} assigned
                            </p>
                        </div>
                    </div>

                    {employeeCount === 0 ? (
                        <div className="text-center py-14 px-6">
                            <div
                                className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: 'rgba(15,42,82,0.05)' }}
                            >
                                <AlertCircle className="w-6 h-6" style={{ color: NAVY }} />
                            </div>
                            <p className="text-sm font-medium" style={{ color: NAVY }}>
                                No employees assigned
                            </p>
                            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                                This department doesn't have any employees yet. Assign employees via the employee management page.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead style={{ backgroundColor: '#f8fafc' }}>
                                    <tr className="border-b" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                        {['Employee', 'Position', 'Email'].map((h, i) => (
                                            <th
                                                key={i}
                                                className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-left"
                                                style={{ color: NAVY, opacity: 0.75 }}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'rgba(15,42,82,0.05)' }}>
                                    {department.employees.map((emp) => {
                                        // Initials for avatar
                                        const initials = (emp.full_name || '')
                                            .split(' ')
                                            .filter(Boolean)
                                            .slice(0, 2)
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase();

                                        return (
                                            <tr key={emp.id} className="transition hover:bg-[#f8fafc]">
                                                {/* Employee: avatar + name */}
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                                                            style={{
                                                                backgroundColor: 'rgba(15,42,82,0.08)',
                                                                color: NAVY,
                                                            }}
                                                        >
                                                            {initials || '?'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-gray-900 text-sm whitespace-nowrap">
                                                                {emp.full_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Position */}
                                                <td className="px-4 py-2.5 whitespace-nowrap">
                                                    {emp.position ? (
                                                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                                                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                                            {emp.position}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300 italic text-sm">—</span>
                                                    )}
                                                </td>

                                                {/* Email */}
                                                <td className="px-4 py-2.5 whitespace-nowrap">
                                                    {emp.email ? (
                                                        <a
                                                            href={`mailto:${emp.email}`}
                                                            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition"
                                                        >
                                                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                            {emp.email}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-300 italic text-sm">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </HRMOLayout>
    );
}