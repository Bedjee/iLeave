<?php

namespace App\Exports\Sheets;

use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;

class EmployeeBalancesSheet implements FromArray, WithTitle, WithHeadings
{
    public function __construct(protected Employee $employee)
    {
    }

    public function title(): string
    {
        return 'Balances';
    }

    public function headings(): array
    {
        return [
            'Leave Type',
            'Code',
            'Default Entitlement',
            'Current Balance',
            'Used',
            'Requires Balance',
        ];
    }

    public function array(): array
    {
        // All active leave types
        $leaveTypes = LeaveType::where('status', true)->orderBy('name')->get();

        // Current balances keyed by leave_type_id
        $balances = LeaveBalance::where('employee_id', $this->employee->id)
            ->get()
            ->keyBy('leave_type_id');

        $rows = [];

        foreach ($leaveTypes as $type) {
            $bal = $balances->get($type->id);
            $current = $bal ? (float) $bal->balance : 0;
            $default = $type->default_days;

            $used = null;
            if ($default !== null && $current <= $default) {
                $used = round($default - $current, 4);
            }

            $rows[] = [
                $type->name,
                $type->code,
                $default ?? '—',
                $current,
                $used ?? '—',
                $type->requires_balance ? 'Yes' : 'No',
            ];
        }

        // Any balances with leave types not in the active list (historical)
        $activeIds = $leaveTypes->pluck('id')->toArray();
        $orphans = LeaveBalance::with('leaveType')
            ->where('employee_id', $this->employee->id)
            ->whereNotIn('leave_type_id', $activeIds)
            ->get();

        foreach ($orphans as $bal) {
            $rows[] = [
                ($bal->leaveType?->name ?? 'Unknown') . ' (inactive)',
                $bal->leaveType?->code ?? '—',
                '—',
                (float) $bal->balance,
                '—',
                '—',
            ];
        }

        return $rows;
    }
}