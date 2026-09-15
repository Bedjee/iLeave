import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import ConfirmationModal from '@/Components/ConfirmationModal';

export default function Index({ employees, leaveTypes, selectedEmployeeId, balances }) {
    const [selectedEmployee, setSelectedEmployee] = useState(selectedEmployeeId || '');
    const [balanceInputs, setBalanceInputs] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingPayload, setPendingPayload] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { processing, errors } = useForm();

    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';
    const GOLD_LIGHT = 'rgba(255,191,0,0.12)';

    // Filter employees for combobox
    const filteredEmployees = employees.filter(emp =>
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Initialize balance inputs when employee changes
    useEffect(() => {
        if (selectedEmployee) {
            const initial = {};
            leaveTypes.forEach(type => {
                const bal = balances[type.id]?.balance ?? '';
                initial[type.id] = bal;
            });
            setBalanceInputs(initial);
        } else {
            setBalanceInputs({});
        }
    }, [selectedEmployee, balances, leaveTypes]);

    // Handle employee selection
    const handleEmployeeSelect = (employeeId) => {
        setSelectedEmployee(employeeId);
        setSearchTerm('');
        setIsDropdownOpen(false);
        if (employeeId) {
            router.get(route('hrmo.leave-balances.index', { employee_id: employeeId }), {}, { preserveState: true });
        } else {
            router.get(route('hrmo.leave-balances.index'), {}, { preserveState: true });
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBalanceChange = (leaveTypeId, value) => {
        setBalanceInputs(prev => ({ ...prev, [leaveTypeId]: value }));
    };

    const resetBalances = () => {
        if (selectedEmployee) {
            const initial = {};
            leaveTypes.forEach(type => {
                const bal = balances[type.id]?.balance ?? '';
                initial[type.id] = bal;
            });
            setBalanceInputs(initial);
        }
    };

    // Export individual employee's balances
    const handleExport = () => {
        if (!selectedEmployee) return;
        window.open(route('hrmo.leave-balances.export', selectedEmployee), '_blank');
    };

    // Export all employees' balances
    const handleExportAll = () => {
        window.open(route('hrmo.leave-balances.export-all'), '_blank');
    };

    const submit = (e) => {
        e.preventDefault();
        if (!selectedEmployee) {
            alert('Please select an employee.');
            return;
        }

        const payloadBalances = Object.keys(balanceInputs).map(leaveTypeId => ({
            leave_type_id: parseInt(leaveTypeId, 10),
            balance: parseFloat(balanceInputs[leaveTypeId]) || 0,
        }));

        if (payloadBalances.length === 0) {
            alert('No leave types available to update.');
            return;
        }

        const payload = {
            employee_id: selectedEmployee,
            balances: payloadBalances,
        };

        setPendingPayload(payload);
        setShowConfirmModal(true);
    };

    const handleConfirm = () => {
        setShowConfirmModal(false);
        if (pendingPayload) {
            router.post(route('hrmo.leave-balances.update'), pendingPayload, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['balances'] });
                },
                onError: (err) => {
                    console.error('Validation errors:', err);
                    alert('Validation failed. Check console for details.');
                },
            });
            setPendingPayload(null);
        }
    };

    const handleCancel = () => {
        setShowConfirmModal(false);
        setPendingPayload(null);
    };

    const selectedEmployeeData = employees.find(emp => emp.id === parseInt(selectedEmployee));

    // Compute used days (if default is known and current <= default)
    const getUsedDays = (typeId, current) => {
        const type = leaveTypes.find(t => t.id === typeId);
        const def = type?.default_days;
        if (def !== null && def !== undefined && current <= def) {
            return Math.round((def - current) * 100) / 100;
        }
        return null; // cannot compute
    };

    const getProgressPercentage = (typeId, current) => {
        const type = leaveTypes.find(t => t.id === typeId);
        const def = type?.default_days;
        if (def && def > 0 && current <= def) {
            const used = def - current;
            return Math.min((used / def) * 100, 100);
        }
        return 0;
    };

    // Check if any balance has changed
    const hasChanges = Object.keys(balanceInputs).some(id => {
        const current = balances[id]?.balance ?? 0;
        const input = parseFloat(balanceInputs[id]) || 0;
        return input !== current;
    });

    return (
        <HRMOLayout>
            <Head title="Leave Balances" />
            <div className="space-y-6">

                {/* Header + Export All button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Employee Leave Balances</h2>
                        <p className="text-sm text-gray-500 mt-1">View and manage leave credit balances for each employee.</p>
                    </div>

                    <button
                        type="button"
                        onClick={handleExportAll}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition shadow-sm hover:shadow-md whitespace-nowrap"
                        style={{ backgroundColor: GOLD, color: NAVY }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e6ac00')}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = GOLD)}
                        title="Download a master Excel file with all employees' current leave balances"
                    >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        Export All Employees
                    </button>
                </div>

                {/* Employee Selection */}
                <div className="rounded-2xl bg-white border p-5 shadow-sm" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <div className="relative" ref={dropdownRef}>
                        <label htmlFor="employeeSearch" className="block text-sm font-medium mb-1.5" style={{ color: NAVY }}>
                            Select Employee
                        </label>
                        <div className="relative">
                            <input
                                id="employeeSearch"
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                placeholder="Type name or email..."
                                className="w-full rounded-xl border px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                            />
                            <svg
                                className={`absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {isDropdownOpen && searchTerm.length >= 0 && (
                            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white rounded-xl border shadow-lg" style={{ borderColor: 'rgba(15,42,82,0.1)' }}>
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map(emp => (
                                        <button
                                            key={emp.id}
                                            type="button"
                                            onClick={() => handleEmployeeSelect(emp.id)}
                                            className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition flex items-center gap-3 ${selectedEmployee === emp.id ? 'border-l-2' : ''}`}
                                            style={selectedEmployee === emp.id ? { borderColor: GOLD, backgroundColor: 'rgba(255,191,0,0.05)' } : {}}
                                        >
                                            <div className="flex size-8 items-center justify-center rounded-full text-xs font-medium" style={{ backgroundColor: GOLD_LIGHT, color: GOLD }}>
                                                {emp.full_name?.charAt(0) || 'E'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium" style={{ color: NAVY }}>{emp.full_name}</div>
                                                <div className="text-xs text-gray-500">{emp.email}</div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500">No employees found.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selected Employee Info + Individual Export */}
                    {selectedEmployeeData && (
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl border" style={{ backgroundColor: '#f9fafb', borderColor: 'rgba(15,42,82,0.08)' }}>
                            <div className="flex items-center gap-4">
                                <div className="flex size-10 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: GOLD_LIGHT, color: GOLD }}>
                                    {selectedEmployeeData.full_name?.charAt(0) || 'E'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: NAVY }}>{selectedEmployeeData.full_name}</p>
                                    <p className="text-xs text-gray-500">{selectedEmployeeData.email} · {selectedEmployeeData.position || 'No position'}</p>
                                </div>
                            </div>

                            {/* Export to Excel — individual */}
                            <button
                                type="button"
                                onClick={handleExport}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition shadow-sm hover:shadow-md whitespace-nowrap"
                                style={{ backgroundColor: NAVY }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1a3a6a')}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                                title="Download a complete Excel backup of this employee's leave balances and history"
                            >
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                </svg>
                                Export to Excel
                            </button>
                        </div>
                    )}
                </div>

                {/* Balance Editor */}
                {selectedEmployee && (
                    <form onSubmit={submit} className="space-y-6">
                        <div className="rounded-2xl bg-white border shadow-sm overflow-hidden" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Leave Type
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Entitlement
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Current Balance
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Used
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Usage
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Edit Balance
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {leaveTypes.map(type => {
                                            const currentBalance = balances[type.id]?.balance ?? 0;
                                            const inputValue = balanceInputs[type.id] ?? '';
                                            const isChanged = inputValue !== '' && parseFloat(inputValue) !== currentBalance;
                                            const used = getUsedDays(type.id, parseFloat(inputValue) || currentBalance);
                                            const progress = getProgressPercentage(type.id, parseFloat(inputValue) || currentBalance);
                                            const max = type.default_days;

                                            return (
                                                <tr key={type.id} className={isChanged ? 'bg-yellow-50' : ''}>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium" style={{ color: NAVY }}>{type.name}</div>
                                                            <div className="text-xs text-gray-500">{type.code}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                                                        {max !== null && max !== undefined ? max : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="text-sm font-semibold" style={{ color: NAVY }}>
                                                            {currentBalance}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                                                        {used !== null ? used : 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {used !== null && max > 0 ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full rounded-full transition-all duration-300"
                                                                        style={{
                                                                            width: `${Math.min(progress, 100)}%`,
                                                                            backgroundColor: progress > 80 ? '#EF4444' : progress > 60 ? '#F59E0B' : '#10B981'
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max={max ?? undefined}
                                                            value={inputValue}
                                                            onChange={(e) => handleBalanceChange(type.id, e.target.value)}
                                                            className="w-24 rounded-lg border px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 transition"
                                                            style={{
                                                                borderColor: isChanged ? GOLD : 'rgba(15,42,82,0.2)',
                                                                backgroundColor: isChanged ? '#FFF8E7' : 'white'
                                                            }}
                                                            onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                                            onBlur={(e) => (e.target.style.borderColor = isChanged ? GOLD : 'rgba(15,42,82,0.2)')}
                                                            placeholder="0.00"
                                                        />
                                                        {errors[`balances.${type.id}.balance`] && (
                                                            <p className="text-xs text-red-500 mt-1">{errors[`balances.${type.id}.balance`]}</p>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>
                                    Highlighted rows indicate unsaved changes.
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 justify-end">
                            <button
                                type="button"
                                onClick={resetBalances}
                                disabled={!hasChanges}
                                className={`px-5 py-2.5 rounded-xl transition text-sm font-medium ${!hasChanges ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                                style={{ backgroundColor: '#e5e7eb', color: NAVY }}
                                onMouseOver={(e) => { if (hasChanges) e.currentTarget.style.backgroundColor = '#d1d5db'; }}
                                onMouseOut={(e) => { if (hasChanges) e.currentTarget.style.backgroundColor = '#e5e7eb'; }}
                            >
                                Reset Changes
                            </button>
                            <button
                                type="submit"
                                disabled={processing || !hasChanges}
                                className="px-6 py-2.5 text-white rounded-xl transition text-sm font-semibold shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: NAVY }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a3a6a'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                            >
                                {processing ? 'Updating...' : 'Update Balances'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                title="Confirm Update"
                message="You are about to update employee leave balances. Please verify that all entries are correct and you have the proper authorization to make these changes. This action will be recorded in the audit trail."
                confirmText="Yes, Update Balances"
                cancelText="Cancel"
            />
        </HRMOLayout>
    );
}