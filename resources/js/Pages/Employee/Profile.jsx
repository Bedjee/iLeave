import EmployeeLayout from '@/Layouts/EmployeeLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Profile({ employee }) {
    // Profile form
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        lastname: employee.lastname || '',
        firstname: employee.firstname || '',
        middle_initial: employee.middle_initial || '',
        salutation: employee.salutation || '',
        civil_status: employee.civil_status || '',
        gender: employee.gender || '',
        email: employee.email || '',
    });

    // Password form
    const {
        data: passwordData,
        setData: setPasswordData,
        put,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPassword,
        recentlySuccessful: passwordSuccess,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitProfile = (e) => {
        e.preventDefault();
        patch(route('employee.profile.update'));
    };

    const submitPassword = (e) => {
        e.preventDefault();
        put(route('employee.profile.update-password'), {
            onSuccess: () => resetPassword(),
        });
    };

    // Format full name for display
    const fullName = `${employee.firstname || ''} ${employee.lastname || ''}`.trim();

    // Color palette
    const NAVY = '#0F2A52';
    const NAVY_DARK = '#1a3a6a';
    const GOLD = '#ffbf00';

    return (
        <EmployeeLayout>
            <Head title="My Profile" />
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Profile Information Section */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div className="flex size-10 sm:size-12 items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: GOLD }}>
                            <svg className="size-5 sm:size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold" style={{ color: NAVY }}>My Profile</h2>
                            <p className="text-xs sm:text-sm text-gray-500">Update your personal information.</p>
                        </div>
                    </div>

                    {recentlySuccessful && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Profile updated successfully.
                        </div>
                    )}

                    <form onSubmit={submitProfile} className="space-y-4">
                        {/* Read-only Department & Position */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600">Department</label>
                                <input
                                    type="text"
                                    value={employee.department?.department_name || '—'}
                                    disabled
                                    className="mt-1 w-full rounded-lg border-gray-200 bg-gray-50 text-gray-500 shadow-sm cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600">Position</label>
                                <input
                                    type="text"
                                    value={employee.position || '—'}
                                    disabled
                                    className="mt-1 w-full rounded-lg border-gray-200 bg-gray-50 text-gray-500 shadow-sm cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="lastname" className="block text-xs sm:text-sm font-medium text-gray-600">
                                    Last Name <span style={{ color: GOLD }}>*</span>
                                </label>
                                <input
                                    id="lastname"
                                    type="text"
                                    value={data.lastname}
                                    onChange={(e) => setData('lastname', e.target.value)}
                                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#ffbf00] focus:ring-[#ffbf00] transition"
                                />
                                {errors.lastname && <p className="mt-1 text-xs text-red-500">{errors.lastname}</p>}
                            </div>
                            <div>
                                <label htmlFor="firstname" className="block text-xs sm:text-sm font-medium text-gray-600">
                                    First Name <span style={{ color: GOLD }}>*</span>
                                </label>
                                <input
                                    id="firstname"
                                    type="text"
                                    value={data.firstname}
                                    onChange={(e) => setData('firstname', e.target.value)}
                                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#ffbf00] focus:ring-[#ffbf00] transition"
                                />
                                {errors.firstname && <p className="mt-1 text-xs text-red-500">{errors.firstname}</p>}
                            </div>
                        </div>

                        {/* Middle Initial, Salutation, Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="middle_initial" className="block text-xs sm:text-sm font-medium text-gray-600">Middle Initial</label>
                                <input
                                    id="middle_initial"
                                    type="text"
                                    maxLength="1"
                                    value={data.middle_initial}
                                    onChange={(e) => setData('middle_initial', e.target.value)}
                                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#ffbf00] focus:ring-[#ffbf00] transition"
                                />
                            </div>
                            <div>
                                <label htmlFor="salutation" className="block text-xs sm:text-sm font-medium text-gray-600">Salutation</label>
                                <input
                                    id="salutation"
                                    type="text"
                                    value={data.salutation}
                                    onChange={(e) => setData('salutation', e.target.value)}
                                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#ffbf00] focus:ring-[#ffbf00] transition"
                                    placeholder="Mr./Ms./Dr."
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-600">
                                    Email <span style={{ color: GOLD }}>*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#ffbf00] focus:ring-[#ffbf00] transition"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                            </div>
                        </div>

                        {/* Civil Status & Gender */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="civil_status" className="block text-xs sm:text-sm font-medium text-gray-600">Civil Status</label>
                                <select
                                    id="civil_status"
                                    value={data.civil_status}
                                    onChange={(e) => setData('civil_status', e.target.value)}
                                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#ffbf00] focus:ring-[#ffbf00] transition"
                                >
                                    <option value="">Select</option>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                    <option value="divorced">Divorced</option>
                                    <option value="widowed">Widowed</option>
                                </select>
                                {errors.civil_status && <p className="mt-1 text-xs text-red-500">{errors.civil_status}</p>}
                            </div>
                            <div>
                                <label htmlFor="gender" className="block text-xs sm:text-sm font-medium text-gray-600">Gender</label>
                                <select
                                    id="gender"
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#ffbf00] focus:ring-[#ffbf00] transition"
                                >
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                                {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-2 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center px-5 py-2 text-white rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                                style={{ backgroundColor: NAVY }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = NAVY_DARK}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                            >
                                {processing ? 'Saving...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change Password Section */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div className="flex size-10 sm:size-12 items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: GOLD }}>
                            <svg className="size-5 sm:size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold" style={{ color: NAVY }}>Change Password</h2>
                            <p className="text-xs sm:text-sm text-gray-500">Update your password to keep your account secure.</p>
                        </div>
                    </div>

                    {passwordSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Password changed successfully.
                        </div>
                    )}

                    <form onSubmit={submitPassword} className="space-y-4">
                        <div>
                            <label htmlFor="current_password" className="block text-xs sm:text-sm font-medium text-gray-600">
                                Current Password <span style={{ color: GOLD }}>*</span>
                            </label>
                            <input
                                id="current_password"
                                type="password"
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData('current_password', e.target.value)}
                                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#ffbf00] focus:ring-[#ffbf00] transition"
                            />
                            {passwordErrors.current_password && (
                                <p className="mt-1 text-xs text-red-500">{passwordErrors.current_password}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-600">
                                    New Password <span style={{ color: GOLD }}>*</span>
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData('password', e.target.value)}
                                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#ffbf00] focus:ring-[#ffbf00] transition"
                                />
                                {passwordErrors.password && (
                                    <p className="mt-1 text-xs text-red-500">{passwordErrors.password}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="password_confirmation" className="block text-xs sm:text-sm font-medium text-gray-600">
                                    Confirm New Password <span style={{ color: GOLD }}>*</span>
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={passwordData.password_confirmation}
                                    onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#ffbf00] focus:ring-[#ffbf00] transition"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={passwordProcessing}
                                className="inline-flex items-center justify-center px-5 py-2 text-white rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                                style={{ backgroundColor: NAVY }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = NAVY_DARK}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                            >
                                {passwordProcessing ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </EmployeeLayout>
    );
}
