import React from 'react';

const workflows = {
    // Standard employee workflow
    employee: {
        stages: [
            {
                key: 'submitted',
                label: 'Submitted',
                icon: (
                    <svg className="size-3 sm:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
            {
                key: 'certified',
                label: 'Certified',
                icon: (
                    <svg className="size-3 sm:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
            {
                key: 'department_approved',
                label: 'Dept. Approved',
                icon: (
                    <svg className="size-3 sm:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                ),
            },
            {
                key: 'approved',
                label: 'Final Approved',
                icon: (
                    <svg className="size-3 sm:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
        ],
        order: ['submitted', 'certified', 'department_approved', 'approved'],
    },
    // Admin workflow: HRMO → Mayor → Approved (no Dept Head)
    admin: {
        stages: [
            {
                key: 'submitted',
                label: 'Submitted',
                icon: (
                    <svg className="size-3 sm:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
            {
                key: 'certified',
                label: 'Certified by HRMO',
                icon: (
                    <svg className="size-3 sm:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
            {
                key: 'mayor_pending',
                label: 'Mayor Approval',
                icon: (
                    <svg className="size-3 sm:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
            {
                key: 'approved',
                label: 'Final Approved',
                icon: (
                    <svg className="size-3 sm:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
        ],
        order: ['submitted', 'certified', 'mayor_pending', 'approved'],
    },
    // Mayor's own requests: only Submitted → Certified (HRMO done)
    mayor: {
        stages: [
            {
                key: 'submitted',
                label: 'Submitted',
                icon: (
                    <svg className="size-3 sm:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
            {
                key: 'certified',
                label: 'Certified (Done)',
                icon: (
                    <svg className="size-3 sm:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
        ],
        order: ['submitted', 'certified'],
    },
};

const rejectedStatuses = ['rejected', 'cancelled'];

export default function LeaveRequestProgress({ status, workflow = 'employee' }) {
    // --- Rejected / Cancelled ---
    if (rejectedStatuses.includes(status)) {
        return (
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                <svg className="size-4 sm:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
        );
    }

    const { stages, order } = workflows[workflow] || workflows.employee;
    const idx = order.indexOf(status);
    const currentIndex = idx !== -1 ? idx : -1;

    // --- Pending (not started) ---
    if (currentIndex === -1) {
        return (
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                <svg className="size-4 sm:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending
            </div>
        );
    }

    // --- Render enhanced stepper ---
    const isLastStep = currentIndex === stages.length - 1;
    const nextStepLabel = !isLastStep ? stages[currentIndex + 1].label : null;

    return (
        <div className="w-full">
            {/* Main stepper */}
            <div className="flex items-center justify-between w-full relative">
                {stages.map((stage, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isUpcoming = index > currentIndex;

                    return (
                        <React.Fragment key={stage.key}>
                            {/* Step circle */}
                            <div className="flex flex-col items-center flex-shrink-0 relative">
                                <div
                                    className={`
                                        flex items-center justify-center
                                        w-7 h-7 sm:w-8 sm:h-8
                                        rounded-full text-white
                                        transition-all duration-300
                                        ${isCompleted ? 'bg-green-500 shadow-md' : ''}
                                        ${isCurrent ? 'bg-[#B91C1C] ring-4 ring-[#B91C1C]/30 shadow-lg scale-105' : ''}
                                        ${isUpcoming ? 'bg-gray-200 text-gray-400' : ''}
                                    `}
                                >
                                    {isCompleted ? (
                                        <svg className="size-3.5 sm:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        stage.icon
                                    )}
                                </div>
                                {/* Label - visible on all screens with responsive size */}
                                <span
                                    className={`
                                        text-[10px] sm:text-xs font-medium mt-1.5 text-center
                                        ${isCompleted ? 'text-green-700' : ''}
                                        ${isCurrent ? 'text-[#B91C1C] font-semibold' : ''}
                                        ${isUpcoming ? 'text-gray-400' : ''}
                                        whitespace-nowrap
                                    `}
                                >
                                    {stage.label}
                                </span>
                                {/* Small indicator dot for current step */}
                                {isCurrent && (
                                    <span className="absolute -bottom-5 sm:-bottom-6 w-1.5 h-1.5 rounded-full bg-[#B91C1C] animate-pulse"></span>
                                )}
                            </div>

                            {/* Connecting line */}
                            {index < stages.length - 1 && (
                                <div
                                    className={`
                                        flex-1 h-0.5 mx-1 sm:mx-2
                                        transition-all duration-500
                                        ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}
                                    `}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Next step hint - only if not last step */}
            {!isLastStep && (
                <div className="mt-3 text-xs text-gray-500 text-center sm:text-left">
                    <span className="font-medium">Up next:</span> {nextStepLabel}
                </div>
            )}
        </div>
    );
}