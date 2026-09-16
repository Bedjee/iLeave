import DepartmentHeadLayout from '@/Layouts/DepartmentHeadLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import LeaveBalanceCards from '@/Components/Employee/LeaveBalanceCards';
import LeaveDateSelector from '@/Components/Employee/LeaveDateSelector';
import VacationLeaveFields from '@/Components/Employee/VacationLeaveFields';
import SickLeaveFields from '@/Components/Employee/SickLeaveFields';
import StudyLeaveFields from '@/Components/Employee/StudyLeaveFields';
import OtherLeaveFields from '@/Components/Employee/OtherLeaveFields';
import RehabLeaveFields from '@/Components/Employee/RehabLeaveFields';
import MaternityLeaveFields from '@/Components/Employee/MaternityLeaveFields';
import AdoptionLeaveFields from '@/Components/Employee/AdoptionLeaveFields';
import SpecialLeaveFields from '@/Components/Employee/SpecialLeaveFields';
import LeaveRequestReviewModal from '@/Components/Employee/LeaveRequestReviewModal';

// ---------- Helper ----------
function getPayBreakdown(selectedType, requestedDays, balances) {
    if (!selectedType) return null;
    const name = selectedType.name.toLowerCase();
    const isVacationOrSick = name.includes('vacation') || name.includes('sick');
    if (!isVacationOrSick || !selectedType.requires_balance) return null;
    if (requestedDays === 0) return null;
    const currentBalance = parseFloat(balances?.[selectedType.id]) || 0;
    const reserved = 1;
    const availableWithPay = Math.max(0, currentBalance - reserved);
    let withPay = 0, withoutPay = 0;
    if (requestedDays <= availableWithPay) {
        withPay = requestedDays;
        withoutPay = 0;
    } else {
        withPay = Math.floor(availableWithPay);
        withoutPay = requestedDays - Math.floor(availableWithPay);
    }
    return { withPay, withoutPay, availableWithPay, currentBalance, reserved };
}

// ---------- Validation Hook ----------
function useLeaveValidation(
    selectedType,
    data,
    calculatedDays,
    balances,
    hasTakenMaternityLeave = false,
    hasTakenAdoptionLeave = false,
    isSpecialRequest = false,
    specialType = null,
    vlBalance = 0
) {
    const [frontendErrors, setFrontendErrors] = useState({});

    useEffect(() => {
        const errors = {};

        if (isSpecialRequest) {
            if (specialType === 'monetization' && vlBalance < 15) {
                errors.monetization = 'You need at least 15 VL days to apply for monetization.';
            }
            setFrontendErrors(errors);
            return;
        }

        if (!selectedType) {
            errors.leave_type = 'Please select a leave type.';
            setFrontendErrors(errors);
            return;
        }

        const name = selectedType.name.toLowerCase();

        // ---- Date validation ----
        if (selectedType.date_selection_type === 'specific_dates') {
            const validDates = data.dates.filter(d => d !== '');
            if (validDates.length === 0) {
                errors.dates = 'Please select at least one date.';
            }
        } else {
            if (!data.start_date) errors.start_date = 'Please select a start date.';
            if (!data.end_date) errors.end_date = 'Please select an end date.';
            if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
                errors.end_date = 'End date must be after start date.';
            }
        }

        // ---- Balance validation for vacation/sick ----
        if (selectedType.requires_balance && (name.includes('vacation') || name.includes('sick'))) {
            const currentBalance = parseFloat(balances?.[selectedType.id]) || 0;
            const reserved = 1;
            const available = Math.max(0, currentBalance - reserved);
            if (calculatedDays > available) {
                errors.insufficient_balance = `Insufficient balance. You have ${available} days available (${currentBalance} total, ${reserved} day reserved).`;
            }
        }

        // ---- Type‑specific validations ----
        if (name.includes('maternity')) {
            if (hasTakenMaternityLeave) {
                errors.maternity = 'You have already taken Maternity Leave.';
            }
            if (data.detail.expected_delivery_date && data.start_date) {
                const delivery = new Date(data.detail.expected_delivery_date);
                const start = new Date(data.start_date);
                const diff = (delivery - start) / (1000 * 60 * 60 * 24);
                if (diff < -30 || diff > 30) {
                    errors.maternity_dates = 'Maternity leave dates should be close to expected delivery date.';
                }
            }
        }

        if (name.includes('adoption')) {
            if (hasTakenAdoptionLeave) {
                errors.adoption = 'You have already taken Adoption Leave.';
            }
        }

        if (name.includes('study')) {
            if (!data.detail.study_purpose) {
                errors.study_purpose = 'Please specify the study purpose.';
            }
        }

        if (name.includes('rehabilitation')) {
            if (!data.detail.rehab_duration_months) {
                errors.rehab_duration = 'Please specify the rehabilitation duration.';
            }
        }

        if (name.includes('special leave benefits') || name.includes('slbw')) {
            if (!data.detail.slbw_days) {
                errors.slbw_days = 'Please specify the number of days.';
            }
        }

        // ---- Attachment for sick > 6 days ----
        if (name.includes('sick') && calculatedDays >= 6 && !data.attachment) {
            errors.attachment = 'Medical certificate is required for 6 or more sick leave days.';
        }

        setFrontendErrors(errors);
    }, [selectedType, data, calculatedDays, balances, hasTakenMaternityLeave, hasTakenAdoptionLeave, isSpecialRequest, specialType, vlBalance]);

    return { frontendErrors, isValid: Object.keys(frontendErrors).length === 0 };
}

// ---------- Main Component ----------
export default function Create({ leaveTypes, balances, employee, hasTakenMaternityLeave, hasTakenAdoptionLeave, vlBalance, slBalance, unavailableDates = [] }) {
    const { data, setData, processing, errors } = useForm({
        request_type: 'leave',
        leave_type_id: '',
        start_date: '',
        end_date: '',
        dates: [],
        reason: '',
        commutation: 'not_requested',
        attachment: null,
        monetized_days: '',
        detail: {
            location_type: '',
            location: '',
            sick_leave_type: '',
            illness: '',
            study_purpose: '',
            other_purpose: '',
            additional_info: '',
            rehab_duration_months: '',
            slbw_days: '',
            expected_delivery_date: '',
            prenatal_checkups: '',
            adoption_info: '',
        },
    });

    const [selectedType, setSelectedType] = useState(null);
    const [calculatedDays, setCalculatedDays] = useState(0);
    const [selectedSpecialType, setSelectedSpecialType] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);

    // Sync selectedType with leave_type_id
    useEffect(() => {
        if (selectedSpecialType) {
            setSelectedType(null);
            setData('leave_type_id', '');
            return;
        }
        const type = leaveTypes.find(t => t.id === parseInt(data.leave_type_id));
        setSelectedType(type || null);
    }, [data.leave_type_id, leaveTypes, selectedSpecialType]);

    // Calculate working days
    useEffect(() => {
        if (!selectedType || selectedSpecialType) {
            setCalculatedDays(0);
            return;
        }
        if (selectedType.date_selection_type === 'specific_dates') {
            const validDates = data.dates.filter(d => d !== '');
            setCalculatedDays(validDates.length);
        } else {
            if (data.start_date && data.end_date) {
                const start = new Date(data.start_date);
                const end = new Date(data.end_date);
                let count = 0;
                const current = new Date(start);
                while (current <= end) {
                    const day = current.getDay();
                    if (day !== 0 && day !== 6) count++;
                    current.setDate(current.getDate() + 1);
                }
                setCalculatedDays(count);
            } else {
                setCalculatedDays(0);
            }
        }
    }, [selectedType, data.dates, data.start_date, data.end_date, selectedSpecialType]);

    const { frontendErrors, isValid } = useLeaveValidation(
        selectedType,
        data,
        calculatedDays,
        balances,
        hasTakenMaternityLeave,
        hasTakenAdoptionLeave,
        !!selectedSpecialType,
        selectedSpecialType,
        vlBalance
    );

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setPreviewUrl(null);
            setData('attachment', null);
            return;
        }
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setData('attachment', file);
        } else {
            setPreviewUrl(null);
            setData('attachment', file);
        }
    };

    const removeAttachment = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setData('attachment', null);
        const fileInput = document.getElementById('attachment');
        if (fileInput) fileInput.value = '';
    };

    const breakdown = getPayBreakdown(selectedType, calculatedDays, balances);

    const handleSelectLeaveType = (typeId) => {
        setData('leave_type_id', typeId);
        setData('start_date', '');
        setData('end_date', '');
        setData('dates', []);
        setCalculatedDays(0);
        setSelectedSpecialType(null);
        setData('request_type', 'leave');
        setData('monetized_days', '');
    };

    const handleSelectSpecial = (type) => {
        if (selectedSpecialType === type) {
            setSelectedSpecialType(null);
            setData('request_type', 'leave');
            setData('leave_type_id', '');
            setData('start_date', '');
            setData('end_date', '');
            setData('dates', []);
            setData('monetized_days', '');
            setCalculatedDays(0);
            return;
        }
        setSelectedSpecialType(type);
        setSelectedType(null);
        setData('request_type', type);
        setData('leave_type_id', '');
        setData('start_date', '');
        setData('end_date', '');
        setData('dates', []);
        setCalculatedDays(0);

        if (type === 'monetization') {
            setData('monetized_days', '10');
            if (!data.reason) setData('reason', 'Monetization of 10 VL days.');
        } else if (type === 'terminal_leave') {
            if (!data.reason) setData('reason', 'Terminal Leave request.');
        }
    };

// ---------- SUBMIT: validate, then open review modal ----------
const submit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    setShowReviewModal(true);
};

// ---------- CONFIRM: user pressed "Confirm & Submit" in the modal ----------
const confirmSubmit = () => {
    let payload = { ...data };

    // --- Special requests ---
    if (selectedSpecialType) {
        delete payload.leave_type_id;
        delete payload.start_date;
        delete payload.end_date;
        delete payload.dates;
        payload.request_type = selectedSpecialType;
    } else {
        // --- Regular leave ---
        payload.dates = (data.dates || []).filter(d => d && d.trim() !== '');
        payload.request_type = 'leave';
        payload.number_of_days = calculatedDays;

        if (selectedType && selectedType.date_selection_type === 'specific_dates') {
            const validDates = payload.dates;
            if (validDates.length > 0) {
                const sorted = validDates.slice().sort();
                payload.start_date = sorted[0];
                payload.end_date = sorted[sorted.length - 1];
            } else {
                payload.start_date = '';
                payload.end_date = '';
            }
        } else {
            payload.start_date = data.start_date || '';
            payload.end_date = data.end_date || '';
        }
    }

    // Safety net for request_type
    if (!payload.request_type || payload.request_type === 'null' || payload.request_type === '') {
        payload.request_type = 'leave';
    }

    router.post(route('department-head.my-leave-requests.store'), payload, {
        onSuccess: () => setShowReviewModal(false),
        onError: (err) => {
            console.error('Submission errors:', err);
            setShowReviewModal(false);
        },
        onFinish: () => setShowReviewModal(false),
    });
};



    // ---------- Render fields based on leave type ----------
    const renderLeaveTypeFields = () => {
        if (!selectedType) return null;
        const name = selectedType.name.toLowerCase();
        let startDate = null;
        if (selectedType.date_selection_type === 'specific_dates') {
            const validDates = data.dates.filter(d => d !== '');
            if (validDates.length > 0) startDate = validDates[0];
        } else {
            startDate = data.start_date;
        }

        switch (true) {
            case name.includes('vacation'): return <VacationLeaveFields data={data} setData={setData} errors={{ ...errors, ...frontendErrors }} startDate={startDate} />;
            case name.includes('sick'): return <SickLeaveFields data={data} setData={setData} errors={errors} days={calculatedDays} />;
            case name.includes('study'): return <StudyLeaveFields data={data} setData={setData} errors={errors} />;
            case name.includes('other'): return <OtherLeaveFields data={data} setData={setData} errors={errors} />;
            case name.includes('rehabilitation') || name.includes('rehab'): return <RehabLeaveFields data={data} setData={setData} errors={errors} />;
            case name.includes('maternity'): return <MaternityLeaveFields data={data} setData={setData} errors={errors} />;
            case name.includes('adoption'): return <AdoptionLeaveFields data={data} setData={setData} errors={errors} />;
            case name.includes('special leave benefits') || name.includes('slbw'): return <SpecialLeaveFields data={data} setData={setData} errors={errors} />;
            default: return null;
        }
    };

    // ---------- Render ----------
    return (
        <DepartmentHeadLayout>
            <Head title="File Leave Request" />
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-800">File Leave Request</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {employee?.full_name || 'Employee'} · {employee?.position || ''} · {employee?.department?.department_name || ''}
                    </p>

                    {!isValid && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <h4 className="text-sm font-semibold text-red-800 flex items-center gap-2">
                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Unable to Submit Leave Request
                            </h4>
                            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                                {Object.values(frontendErrors).map((msg, idx) => <li key={idx}>{msg}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="mt-6">
                        <h3 className="text-md font-medium text-gray-700 mb-2">Special Requests</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div onClick={() => handleSelectSpecial('monetization')} className={`p-4 rounded-lg border-2 cursor-pointer transition hover:shadow-md ${selectedSpecialType === 'monetization' ? 'border-[#FF2D20] bg-[#FF2D20]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2"><svg className="size-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><h4 className="text-sm font-semibold text-gray-800">Monetization</h4></div>
                                        <p className="text-xs text-gray-500 mt-1">Convert VL credits to cash. Requires at least 15 VL days.</p>
                                        <p className="text-xs text-gray-500">Your VL: {vlBalance} days</p>
                                    </div>
                                    {selectedSpecialType === 'monetization' && <button onClick={(e) => { e.stopPropagation(); handleSelectSpecial(null); }} className="text-gray-400 hover:text-gray-600"><svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>}
                                </div>
                            </div>
                            <div onClick={() => handleSelectSpecial('terminal_leave')} className={`p-4 rounded-lg border-2 cursor-pointer transition hover:shadow-md ${selectedSpecialType === 'terminal_leave' ? 'border-[#FF2D20] bg-[#FF2D20]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2"><svg className="size-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg><h4 className="text-sm font-semibold text-gray-800">Terminal Leave</h4></div>
                                        <p className="text-xs text-gray-500 mt-1">Monetize all VL + SL credits.</p>
                                        <p className="text-xs text-gray-500">Total: {vlBalance + slBalance} days</p>
                                    </div>
                                    {selectedSpecialType === 'terminal_leave' && <button onClick={(e) => { e.stopPropagation(); handleSelectSpecial(null); }} className="text-gray-400 hover:text-gray-600"><svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>}
                                </div>
                            </div>
                        </div>
                        {selectedSpecialType && <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">Click the selected card again or the × to deselect and choose a regular leave type.</p>}
                    </div>

                    {!selectedSpecialType && (
                        <div className="mt-4">
                            <h3 className="text-md font-medium text-gray-700 mb-2">Your Leave Balances</h3>
                            <LeaveBalanceCards leaveTypes={leaveTypes} balances={balances} selectedId={data.leave_type_id} onSelect={handleSelectLeaveType} />
                        </div>
                    )}

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        {selectedType && (
                            <LeaveDateSelector
    leaveType={selectedType}
    data={data}
    setData={setData}
    errors={{ ...errors, ...frontendErrors }}
    studyMode={selectedType.name.toLowerCase().includes('study')}
    studyPurpose={data.detail.study_purpose}
    rehabMode={selectedType.name.toLowerCase().includes('rehabilitation')}
    maternityMode={selectedType.name.toLowerCase().includes('maternity')}
    adoptionMode={selectedType.name.toLowerCase().includes('adoption')}
    slbwMode={selectedType.name.toLowerCase().includes('special leave benefits') || selectedType.name.toLowerCase().includes('slbw')}
    unavailableDates={unavailableDates}   
/>
                        )}

                        {selectedType && calculatedDays > 0 && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-sm text-blue-700">Total working days: <strong>{calculatedDays}</strong></p>
                            </div>
                        )}

                        {breakdown && (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <p className="text-sm font-medium text-gray-700">Leave Pay Breakdown</p>
                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                    <div className="flex justify-between items-center"><span>With Pay</span><strong className="text-[#FF2D20]">{breakdown.withPay} days</strong></div>
                                    <div className="flex justify-between items-center"><span>Without Pay</span><strong className="text-gray-700">{breakdown.withoutPay} days</strong></div>
                                    <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 pt-1 mt-1"><span>Available: {breakdown.currentBalance} days</span><span>({breakdown.reserved} day reserved)</span></div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
                            <textarea id="reason" rows="3" value={data.reason} onChange={(e) => setData('reason', e.target.value)} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
                            {errors.reason && <p className="text-red-500 text-sm">{errors.reason}</p>}
                        </div>

                        <div>
                            <label htmlFor="commutation" className="block text-sm font-medium text-gray-700">Commutation</label>
                            <select id="commutation" value={data.commutation} onChange={(e) => setData('commutation', e.target.value)} className="mt-1 w-full border-gray-300 rounded-md shadow-sm">
                                <option value="not_requested">Not Requested</option>
                                <option value="requested">Requested</option>
                            </select>
                        </div>

                        {selectedType && (
                            <div>
                                <h3 className="text-md font-medium text-gray-700 mb-2">Additional Details</h3>
                                {renderLeaveTypeFields()}
                                <div className="mt-2">
                                    <label htmlFor="additional_info" className="block text-sm font-medium text-gray-700">Additional Info</label>
                                    <textarea id="additional_info" rows="2" value={data.detail.additional_info} onChange={(e) => setData('detail', { ...data.detail, additional_info: e.target.value })} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">Attachment</label>
                            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-3">
                                <input id="attachment" type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFileChange} className="w-full sm:w-auto border-gray-300 rounded-md shadow-sm" />
                                {previewUrl && (
                                    <div className="relative inline-block">
                                        <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200 shadow-sm" />
                                        <button type="button" onClick={removeAttachment} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition"><svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                    </div>
                                )}
                            </div>
                            {data.attachment && !previewUrl && <p className="mt-1 text-sm text-gray-500">{data.attachment.name}</p>}
                            {errors.attachment && <p className="mt-1 text-sm text-red-500">{errors.attachment}</p>}
                            {frontendErrors.attachment && <p className="mt-1 text-sm text-red-500">{frontendErrors.attachment}</p>}
                            {selectedType && selectedType.name.toLowerCase().includes('sick') && calculatedDays >= 6 && <p className="mt-1 text-xs text-yellow-600">Medical certificate required for 6+ days.</p>}
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" disabled={processing || !isValid} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                Submit Leave Request
                            </button>
                        </div>
                    </form>

                    <LeaveRequestReviewModal
    open={showReviewModal}
    onClose={() => setShowReviewModal(false)}
    onConfirm={confirmSubmit}
    processing={processing}
    leaveType={selectedType}
    specialType={selectedSpecialType}
    data={data}
    calculatedDays={calculatedDays}
    breakdown={breakdown}
    employee={employee}
    vlBalance={vlBalance}
    slBalance={slBalance}
/>
                </div>
            </div>
        </DepartmentHeadLayout>
    );
}