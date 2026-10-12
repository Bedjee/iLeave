import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link, router } from '@inertiajs/react';
import { UserPlus, CheckCircle2, Clock } from 'lucide-react';

const NAVY = '#0F2A52';
const GOLD = '#ffbf00';

function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function Pending({ pendingUsers }) {
    return (
        <HRMOLayout>
            <Head title="Pending Onboarding" />

            <div className="space-y-5">
                {/* Header */}
                <div
                    className="bg-white rounded-xl border shadow-sm p-5 sm:p-6"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: GOLD }}
                        >
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-bold" style={{ color: NAVY }}>
                                Pending Onboarding
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Users who have signed in via the Opol Portal but
                                don't have an employee profile in iLeave yet.
                            </p>
                        </div>
                    </div>

                    {pendingUsers.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-amber-700">
                            <Clock className="w-3.5 h-3.5" />
                            {pendingUsers.length} user{pendingUsers.length === 1 ? '' : 's'} waiting for onboarding
                        </div>
                    )}
                </div>

                {/* List */}
                <div
                    className="bg-white rounded-xl border shadow-sm overflow-hidden"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    {pendingUsers.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center bg-emerald-50">
                                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                            </div>
                            <p className="mt-4 text-sm font-medium text-gray-700">
                                All caught up
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                No users waiting for onboarding.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">User</th>
                                        <th className="px-5 py-3">Portal ID</th>
                                        <th className="px-5 py-3">Last SSO sign-in</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingUsers.map((u) => (
                                        <tr
                                            key={u.id}
                                            className="border-b border-gray-100 last:border-0"
                                        >
                                            <td className="px-5 py-3">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {u.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {u.email}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3 text-xs font-mono text-gray-500">
                                                {u.portal_user_id}
                                            </td>
                                            <td className="px-5 py-3 text-xs text-gray-500">
                                                {formatDate(u.last_sso_login_at)}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <Link
                                                    href={route('hrmo.employees.link', u.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow-md transition"
                                                    style={{ backgroundColor: NAVY }}
                                                >
                                                    <UserPlus className="w-3.5 h-3.5" />
                                                    Create Profile
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </HRMOLayout>
    );
}