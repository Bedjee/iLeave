<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Leave Request Form</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 10px;
            background: #fff;
            margin: 0;
            padding: 20px;
            line-height: 1.3;
        }
        .leave-form-page {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #000;
            padding: 12px 14px;
            background: #fff;
        }
        .form-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 4px;
        }
        .form-number {
            font-size: 9px;
            font-weight: bold;
        }
        .logo-placeholder {
            width: 65px;
            height: 65px;
            border: 1px dashed #aaa;
            text-align: center;
            line-height: 65px;
            font-size: 8px;
            color: #aaa;
        }
        .government-info {
            text-align: center;
            font-size: 9.5px;
            line-height: 1.4;
            margin: 4px 0 6px 0;
            font-weight: 500;
        }
        .form-title {
            text-align: center;
            font-weight: bold;
            font-size: 15px;
            letter-spacing: 1px;
            margin: 6px 0 8px 0;
            text-transform: uppercase;
        }
        .form-info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
        }
        .form-info-table td {
            border: 1px solid #000;
            padding: 4px 6px;
            vertical-align: middle;
            font-size: 10px;
        }
        .section-title {
            font-weight: bold;
            background: #eee;
            padding: 3px 6px;
            border: 1px solid #000;
            margin-bottom: 4px;
            font-size: 11px;
            text-align: center;
            text-transform: uppercase;
        }
        .form-table {
            width: 100%;
            border-collapse: collapse;
        }
        .form-table td {
            border: 1px solid #000;
            padding: 4px 6px;
            vertical-align: top;
            font-size: 9.5px;
        }
        .leave-type-list {
            display: flex;
            flex-direction: column;
            gap: 1px;
        }
        .leave-type-item {
            display: flex;
            align-items: baseline;
            gap: 4px;
            font-size: 9.5px;
        }
        .checkbox {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 10px;
            height: 10px;
            border: 1px solid #000;
            font-size: 8px;
            flex-shrink: 0;
            margin-right: 6px;
            background: #fff;
        }
        .checkbox.checked {
            background: #000;
            color: #fff;
        }
        .inline-label {
            display: inline-block;
            min-width: 100px;
        }
        .blank-line {
            display: inline-block;
            min-width: 120px;
            border-bottom: 1px solid #000;
            margin: 0 4px;
            height: 1em;
        }
        .blank-line-sm {
            min-width: 80px;
        }
        .leave-credits-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
            margin: 4px 0;
            text-align: center;
        }
        .leave-credits-table th,
        .leave-credits-table td {
            border: 1px solid #000;
            padding: 2px 4px;
        }
        .signature-block {
            text-align: center;
            margin-top: 8px;
        }
        .signature-line {
            width: 200px;
            margin: 0 auto;
            border-bottom: 1px solid #000;
            height: 22px;
            line-height: 22px;
            font-weight: bold;
            font-size: 10px;
        }
        .signature-label {
            font-size: 8.5px;
            color: #555;
            margin-top: 2px;
        }
        .signature-sub {
            font-size: 8px;
            font-style: italic;
            color: #777;
        }
        .final-approval-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
        }
        .final-approval-table td {
            border: 1px solid #000;
            padding: 4px 6px;
            vertical-align: top;
            font-size: 9.5px;
        }
        .final-approval-table .no-border {
            border: none;
        }
        .approver-signature {
            text-align: center;
            margin-top: 6px;
        }
        .approver-role {
            font-weight: bold;
            font-size: 9px;
            margin-top: 2px;
        }
        .verification-text {
            font-weight: bold;
            font-style: italic;
            font-size: 8.5px;
            color: #666;
            margin-top: 2px;
        }
        .text-center {
            text-align: center;
        }
        .text-bold {
            font-weight: bold;
        }
        .mt-1 { margin-top: 4px; }
        .mb-1 { margin-bottom: 4px; }
        .mt-2 { margin-top: 8px; }
        .flex { display: flex; align-items: baseline; gap: 4px; flex-wrap: wrap; }
        .flex-column {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .gap-1 { gap: 2px; }
        .field-value {
            display: inline-block;
            font-weight: bold;
            text-decoration: underline;
            padding: 0 2px;
        }
        .field-value-sm {
            min-width: 80px;
        }
        .field-value-lg {
            min-width: 150px;
        }
    </style>
</head>
<body>
    <div class="leave-form-page">

        @php
            $employee = $leaveRequest->employee;
            $leaveType = $leaveRequest->leaveType;
            $detail = $leaveRequest->detail;
            $dates = $leaveRequest->dates;
            $certification = $leaveRequest->certification;
            $certifiedBy = $leaveRequest->certifiedBy;
            $approvedBy = $leaveRequest->approvedBy;
            $finalApprovedBy = $leaveRequest->finalApprovedBy;

            // -------------------- HELPER FUNCTIONS --------------------
            function formatDateDisplay($date) {
                if (!$date) return '______________';
                return \Carbon\Carbon::parse($date)->format('F d, Y');
            }

            function formatNumber($value, $decimals = 2) {
                $num = (float) $value;
                if (floor($num) == $num) {
                    return number_format($num, 0, '.', '');
                }
                return number_format($num, $decimals, '.', '');
            }

            function getCompactDateString($dateStrings) {
                if (empty($dateStrings)) return '';
                $dates = array_map(function($d) { return \Carbon\Carbon::parse($d); }, $dateStrings);
                usort($dates, function($a, $b) { return $a->timestamp - $b->timestamp; });
                $groups = [];
                foreach ($dates as $date) {
                    $key = $date->format('Y-m');
                    if (!isset($groups[$key])) {
                        $groups[$key] = ['month' => $date->format('M'), 'year' => $date->format('Y'), 'days' => []];
                    }
                    $groups[$key]['days'][] = $date->day;
                }
                $outputParts = [];
                foreach ($groups as $group) {
                    $days = $group['days'];
                    sort($days);
                    $ranges = [];
                    $start = $days[0];
                    $end = $days[0];
                    for ($i = 1; $i < count($days); $i++) {
                        if ($days[$i] == $end + 1) {
                            $end = $days[$i];
                        } else {
                            $ranges[] = ($start == $end) ? $start : $start . '-' . $end;
                            $start = $days[$i];
                            $end = $days[$i];
                        }
                    }
                    $ranges[] = ($start == $end) ? $start : $start . '-' . $end;
                    $monthStr = $group['month'] . ' ' . implode(', ', $ranges) . ' ' . $group['year'];
                    $outputParts[] = $monthStr;
                }
                return implode('; ', $outputParts);
            }

            // Helper to get user display name (with salutation & middle initial)
            function getUserDisplayName($user) {
                if (!$user) return '____________________';
                if ($user->employee) {
                    return $user->employee->full_name;
                }
                return $user->name; // fallback
            }

            // Helper to get user role display (based on the 'role' column)
            function getUserRoleDisplay($user) {
                if (!$user) return 'Authorized Personnel';

                // Use the 'role' column from the users table
                $role = $user->role ?? null;

                if ($role) {
                    $map = [
                        'admin'            => 'Admin',
                        'mayor'            => 'Mayor',
                        'hrmo'             => 'HRMO',
                        'department_head'  => 'Department Head',
                        'employee'         => 'Employee',
                    ];
                    return $map[$role] ?? ucfirst($role);
                }

                // Fallback if no role column
                return 'Authorized Personnel';
            }
            // ---------------------------------------------------------

            // Build inclusive dates
            $inclusiveDates = [];
            if ($dates && $dates->count() > 0) {
                $inclusiveDates = $dates->pluck('leave_date')->map(function($d) {
                    return \Carbon\Carbon::parse($d)->format('M d, Y');
                })->toArray();
            } elseif ($leaveRequest->start_date && $leaveRequest->end_date) {
                $start = \Carbon\Carbon::parse($leaveRequest->start_date);
                $end = \Carbon\Carbon::parse($leaveRequest->end_date);
                $current = clone $start;
                while ($current <= $end) {
                    $inclusiveDates[] = $current->format('M d, Y');
                    $current->addDay();
                }
            }

            $compactDateString = getCompactDateString($inclusiveDates);

            $leaveCode = $leaveType ? strtoupper($leaveType->code) : '';
            $leaveName = $leaveType ? strtolower($leaveType->name) : '';

            $vacationLocation = $detail->location_type ?? '';
            $vacationLocationText = $detail->location ?? '';
            $sickType = $detail->sick_leave_type ?? '';
            $illness = $detail->illness ?? '';
            $studyPurpose = $detail->study_purpose ?? '';
            $slbwIllness = $detail->additional_info ?? '';
            $isMonetization = $leaveRequest->request_type === 'monetization';
            $isTerminal = $leaveRequest->request_type === 'terminal_leave';



          // --------------------------------------------------------------
// 1. Get the LeaveType models for Vacation and Sick
// --------------------------------------------------------------
$vlType = \App\Models\LeaveType::where('code', 'VL')->first();
$slType = \App\Models\LeaveType::where('code', 'SL')->first();

// --------------------------------------------------------------
// 2. Fetch current balances from the employee's leave_balances
// --------------------------------------------------------------
$vlBalance = 0;
$slBalance = 0;

if ($employee && $employee->leaveBalances) {
    if ($vlType) {
        $vlBal = $employee->leaveBalances->firstWhere('leave_type_id', $vlType->id);
        $vlBalance = $vlBal ? (float) $vlBal->balance : 0;
    }
    if ($slType) {
        $slBal = $employee->leaveBalances->firstWhere('leave_type_id', $slType->id);
        $slBalance = $slBal ? (float) $slBal->balance : 0;
    }
}

// --------------------------------------------------------------
// 3. Determine how many days are applied for each type
// --------------------------------------------------------------
$daysApplied = (float) $leaveRequest->number_of_days;
$leaveCode = $leaveType ? strtoupper($leaveType->code) : '';

$vlLess = ($leaveCode === 'VL') ? $daysApplied : 0;
$slLess = ($leaveCode === 'SL') ? $daysApplied : 0;

// --------------------------------------------------------------
// 4. Compute "Total Earned" (balance before this deduction)
//    and "Balance" (current balance after all deductions)
// --------------------------------------------------------------
$vlTotalEarned = $vlBalance + $vlLess;
$slTotalEarned = $slBalance + $slLess;

// We'll keep the variable names $vlDetail and $slDetail
// but re-purpose them as arrays for easy display.
$vlDetail = (object) [
    'total_earned'          => $vlTotalEarned,
    'less_this_application' => $vlLess,
    'balance'               => $vlBalance,
];
$slDetail = (object) [
    'total_earned'          => $slTotalEarned,
    'less_this_application' => $slLess,
    'balance'               => $slBalance,
];





            // Get names with salutation & middle initial
            $hrmoName      = getUserDisplayName($certifiedBy);
            $deptHeadName  = getUserDisplayName($approvedBy);
            $adminName     = getUserDisplayName($finalApprovedBy);

            // Dynamically get the final approver's role
            $adminRole     = getUserRoleDisplay($finalApprovedBy);
        @endphp

        <!-- HEADER -->
        <div class="form-header">
            <div class="form-number">Civil Service Form No. 6, Revised 2020</div>
            <img src="{{ public_path('images/opol.png') }}" alt="Municipality of Opol Logo" style="width:65px; height:auto;" />
        </div>
        <div class="government-info">
            Republic of the Philippines<br />
            Local Government Unit of Opol<br />
            Zone 3, Poblacion Opol, Misamis Oriental
        </div>

        <div class="form-title">APPLICATION FOR LEAVE</div>

        <!-- BASIC INFO TABLE -->
        <table class="form-info-table">
            <tbody>
                <tr>
                    <td style="width:50%;">
                        <span class="text-bold">1. Office/Department:</span>
                        <span class="field-value field-value-lg">{{ $employee->department->department_name ?? '______________' }}</span>
                    </td>
                    <td style="width:50%;">
                        <span class="text-bold">2. Name:</span>
                        <span class="field-value field-value-lg">{{ $employee->full_name ?? '______________' }}</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span class="text-bold">3. Date of filing:</span>
                        <span class="field-value field-value-sm">{{ formatDateDisplay($leaveRequest->date_filed) }}</span>
                    </td>
                    <td>
                        <span class="text-bold">4. Position:</span>
                        <span class="field-value field-value-sm">{{ $employee->position ?? '______________' }}</span>
                        <span class="text-bold" style="margin-left:6px;">5. Salary:</span>
                        <span class="field-value field-value-sm">{{ $leaveRequest->salary_snapshot ?? '______________' }}</span>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- SECTION 6 -->
        <div class="section-title">6. DETAILS OF APPLICATION</div>

        <table class="form-table">
            <tbody>
                <!-- Row 1: 6A and 6B -->
                <tr>
                    <td style="width:50%;">
                        <span class="text-bold">6. A TYPE OF LEAVE TO BE AVAILED OF:</span><br /><br />
                        <div class="flex-column">
                            <div class="flex">
                                <span class="checkbox {{ $leaveCode === 'VL' ? 'checked' : '' }}">{!! $leaveCode === 'VL' ? '✓' : '' !!}</span>
                                Vacation Leave
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $leaveCode === 'FL' ? 'checked' : '' }}">{!! $leaveCode === 'FL' ? '✓' : '' !!}</span>
                                Forced Leave
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $leaveCode === 'SL' ? 'checked' : '' }}">{!! $leaveCode === 'SL' ? '✓' : '' !!}</span>
                                Sick Leave
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $leaveCode === 'ML' ? 'checked' : '' }}">{!! $leaveCode === 'ML' ? '✓' : '' !!}</span>
                                Maternity Leave
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $leaveCode === 'PL' ? 'checked' : '' }}">{!! $leaveCode === 'PL' ? '✓' : '' !!}</span>
                                Paternity Leave
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $leaveCode === 'SPL' ? 'checked' : '' }}">{!! $leaveCode === 'SPL' ? '✓' : '' !!}</span>
                                Special Privilege Leave
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $leaveCode === 'SOLOPL' ? 'checked' : '' }}">{!! $leaveCode === 'SOLOPL' ? '✓' : '' !!}</span>
                                Solo Parent Leave
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $leaveCode === 'STL' ? 'checked' : '' }}">{!! $leaveCode === 'STL' ? '✓' : '' !!}</span>
                                Study Leave
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $leaveCode === '10DVL' ? 'checked' : '' }}">{!! $leaveCode === '10DVL' ? '✓' : '' !!}</span>
                                10-Day VAWC Leave
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $leaveCode === 'RL' ? 'checked' : '' }}">{!! $leaveCode === 'RL' ? '✓' : '' !!}</span>
                                Rehabilitation Privilege
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $leaveCode === 'SLBW' ? 'checked' : '' }}">{!! $leaveCode === 'SLBW' ? '✓' : '' !!}</span>
                                Special Leave Benefits for Women
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $leaveCode === 'AL' ? 'checked' : '' }}">{!! $leaveCode === 'AL' ? '✓' : '' !!}</span>
                                Adoption Leave
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $leaveCode === 'WL' ? 'checked' : '' }}">{!! $leaveCode === 'WL' ? '✓' : '' !!}</span>
                                Wellness Leave
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ !in_array($leaveCode, ['VL','FL','SL','ML','PL','SPL','SOLOPL','STL','10DVL','RL','SLBW','AL','WL']) ? 'checked' : '' }}">{!! !in_array($leaveCode, ['VL','FL','SL','ML','PL','SPL','SOLOPL','STL','10DVL','RL','SLBW','AL','WL']) ? '✓' : '' !!}</span>
                                Others: <span class="field-value field-value-sm">{{ in_array($leaveCode, ['VL','FL','SL','ML','PL','SPL','SOLOPL','STL','10DVL','RL','SLBW','AL','WL']) ? '' : ($leaveType->name ?? '') }}</span>
                            </div>
                        </div>
                        <div style="margin-top:4px;">________________________________________</div>
                    </td>
                    <td style="width:50%;">
                        <span class="text-bold">6. B DETAILS OF LEAVE</span><br /><br />

                        <div style="margin-bottom:4px;">
                            <span class="text-bold">In case of Vacation Leave:</span><br />
                            <div class="flex">
                                <span class="checkbox {{ $vacationLocation === 'within_philippines' ? 'checked' : '' }}">{!! $vacationLocation === 'within_philippines' ? '✓' : '' !!}</span>
                                Within the Philippines : <span class="field-value field-value-sm">{{ ($vacationLocation === 'within_philippines' && $vacationLocationText) ? $vacationLocationText : '______________' }}</span>
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $vacationLocation === 'abroad' ? 'checked' : '' }}">{!! $vacationLocation === 'abroad' ? '✓' : '' !!}</span>
                                Abroad (Specify): <span class="field-value field-value-sm">{{ ($vacationLocation === 'abroad' && $vacationLocationText) ? $vacationLocationText : '______________' }}</span>
                            </div>
                        </div>

                        <div style="margin-bottom:4px;">
                            <span class="text-bold">In case of Sick Leave:</span><br />
                            <div class="flex">
                                <span class="checkbox {{ $sickType === 'in_hospital' ? 'checked' : '' }}">{!! $sickType === 'in_hospital' ? '✓' : '' !!}</span>
                                In Hospital (Specify illness): <span class="field-value field-value-sm">{{ ($sickType === 'in_hospital' && $illness) ? $illness : '______________' }}</span>
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $sickType === 'out_patient' ? 'checked' : '' }}">{!! $sickType === 'out_patient' ? '✓' : '' !!}</span>
                                Out Patient (Specify illness): <span class="field-value field-value-sm">{{ ($sickType === 'out_patient' && $illness) ? $illness : '______________' }}</span>
                            </div>
                        </div>

                        <div style="margin-bottom:4px;">
                            <span class="text-bold">In case of Special Leave Benefits for Women:</span><br />
                            <div class="flex">Specify Illness: <span class="field-value field-value-sm">{{ $slbwIllness ?: '______________' }}</span></div>
                        </div>

                        <div style="margin-bottom:4px;">
                            <span class="text-bold">In case of Study Leave:</span><br />
                            <div class="flex">
                                <span class="checkbox {{ $studyPurpose === 'masters_completion' ? 'checked' : '' }}">{!! $studyPurpose === 'masters_completion' ? '✓' : '' !!}</span>
                                Completion of Master's
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $studyPurpose === 'bar_board_review' ? 'checked' : '' }}">{!! $studyPurpose === 'bar_board_review' ? '✓' : '' !!}</span>
                                BAR/Board Exam Review
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $studyPurpose === 'continuing_education' ? 'checked' : '' }}">{!! $studyPurpose === 'continuing_education' ? '✓' : '' !!}</span>
                                Continuing Education
                            </div>
                        </div>

                        <div>
                            <div class="flex">
                                <span class="checkbox {{ $isMonetization ? 'checked' : '' }}">{!! $isMonetization ? '✓' : '' !!}</span>
                                Monetization of Leave Credits
                            </div>
                            <div class="flex">
                                <span class="checkbox {{ $isTerminal ? 'checked' : '' }}">{!! $isTerminal ? '✓' : '' !!}</span>
                                Terminal Leave
                            </div>
                        </div>
                    </td>
                </tr>

                <!-- Row 2: 6C and 6D -->
                <tr>
                    <td>
                        <span class="text-bold">6. C NUMBER OF WORKING DAYS APPLIED FOR</span><br />
                        <span class="text-bold">{{ formatNumber($leaveRequest->number_of_days, 2) }}</span> working days<br /><br />
                        <span class="text-bold">INCLUSIVE DATES:</span><br />
                        <div style="background:#f9f9f9; padding:2px 4px; border:1px solid #ddd; border-radius:2px; font-family:monospace; font-size:8px; min-height:20px; word-break:break-word;">
                            {!! $inclusiveDates ? $compactDateString : '______________' !!}
                        </div>
                    </td>
                    <td>
                        <span class="text-bold">6. D COMMUTATION</span><br />
                        <div class="flex">
                            <span class="checkbox {{ $leaveRequest->commutation === 'not_requested' ? 'checked' : '' }}">{!! $leaveRequest->commutation === 'not_requested' ? '✓' : '' !!}</span>
                            Not Requested
                        </div>
                        <div class="flex">
                            <span class="checkbox {{ $leaveRequest->commutation === 'requested' ? 'checked' : '' }}">{!! $leaveRequest->commutation === 'requested' ? '✓' : '' !!}</span>
                            Requested
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <div style="margin-top: 6px;"></div>

        <!-- SECTION 7 -->
        <div class="section-title">7. DETAILS OF ACTION ON APPLICATION</div>

        <table class="form-table">
            <tbody>
                <tr>
                    <td style="width:50%;">
                        <span class="text-bold">7.A CERTIFICATION OF LEAVE CREDITS</span><br />
                        <div class="text-center" style="margin:4px 0;">
                            As of <span class="field-value field-value-sm">{{ $certification ? formatDateDisplay($certification->certification_date) : '______________' }}</span>
                        </div>

                        <table class="leave-credits-table">
                            <thead>
                                <tr><th></th><th>Vacation Leave</th><th>Sick Leave</th></tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Total Earned</td>
                                    <td>{{ $vlDetail ? formatNumber($vlDetail->total_earned) : '______' }}</td>
                                    <td>{{ $slDetail ? formatNumber($slDetail->total_earned) : '______' }}</td>
                                </tr>
                                <tr>
                                    <td>Less this application</td>
                                    <td>{{ $vlDetail ? formatNumber($vlDetail->less_this_application) : '______' }}</td>
                                    <td>{{ $slDetail ? formatNumber($slDetail->less_this_application) : '______' }}</td>
                                </tr>
                                <tr>
                                    <td>Balance</td>
                                    <td>{{ $vlDetail ? formatNumber($vlDetail->balance) : '______' }}</td>
                                    <td>{{ $slDetail ? formatNumber($slDetail->balance) : '______' }}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="signature-block">
                            <div class="signature-line">Joseph A. Actub</div>
                            <div class="signature-label">Reviewed and Certified by</div>
                            <div class="signature-sub">(HRMO-Designate)</div>
                        </div>
                    </td>

                    <td style="width:50%;">
                        <span class="text-bold">7. B RECOMMENDATION</span><br />
                        <div class="flex"><span class="checkbox checked">✓</span> For approval</div>
                        <div class="flex">
                            <span class="checkbox"></span> For disapproval due to:
                            <span class="field-value field-value-sm">{{ $leaveRequest->rejection_reason ?? '______________' }}</span>
                        </div>
                        <div style="margin:4px 0;"><span class="blank-line" style="display:block; width:80%;"></span></div>

                        <div class="signature-block">
                            <div class="signature-line">{{ $deptHeadName }}</div>
                            <div class="signature-label">Approval Duly Recorded and Authorized in the System by</div>
                            <div class="signature-sub">(Department Head/Authorized Personnel)</div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <div style="margin-top: 6px;"></div>

        <!-- FINAL APPROVAL TABLE -->
        <table class="form-table" style="border:1px solid #000;">
            <tbody>
                <tr>
                    <td style="width:50%; border:1px solid #000; padding:4px 6px;">
                        <span class="text-bold">7.C APPROVED FOR:</span><br />
                        <span class="text-bold">{{ formatNumber($leaveRequest->days_with_pay, 2) }}</span> days with pay<br />
                        <span class="text-bold">{{ formatNumber($leaveRequest->days_without_pay, 2) }}</span> days without pay<br />
                        _____ others (specify)
                    </td>
                    <td style="width:50%; border:1px solid #000; padding:4px 6px;">
                        <span class="text-bold">7. D DISAPPROVED DUE TO:</span><br />
                        <span class="blank-line" style="display:block; width:100%; margin:2px 0;"></span>
                        <span class="blank-line" style="display:block; width:100%;"></span>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" style="border:1px solid #000; padding:8px 6px; text-align:center;">
                        <div class="signature-block">
                            <div class="signature-line">{{ $adminName }}</div>
                            <div class="approver-role">({{ $adminRole }})</div>
                            <div class="verification-text">Approval Duly Recorded and Authorized in the System by</div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

    </div>
</body>
</html>
