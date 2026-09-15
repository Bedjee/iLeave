<?php

namespace App\Exports\Sheets;

use App\Models\Employee;
use App\Models\LeaveCreditTransaction;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;

class EmployeeTransactionsSheet implements FromArray, WithTitle, WithHeadings
{
    public function __construct(protected Employee $employee)
    {
    }

    public function title(): string
    {
        return 'Transactions';
    }

    public function headings(): array
    {
        return [
            'Date',
            'Leave Type',
            'Transaction Type',
            'Amount',
            'Balance After',
            'Period',
            'Description',
            'Created By',
        ];
    }

    public function array(): array
    {
        $transactions = LeaveCreditTransaction::with(['leaveType', 'creator'])
            ->where('employee_id', $this->employee->id)
            ->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return $transactions->map(function ($tx) {
            $period = '—';
            if ($tx->period_month && $tx->period_year) {
                $period = \Carbon\Carbon::create($tx->period_year, $tx->period_month)->format('F Y');
            }

            return [
                $tx->transaction_date?->format('Y-m-d') ?? '—',
                $tx->leaveType?->name ?? '—',
                $tx->transaction_type,
                (float) $tx->amount,
                (float) $tx->balance_after,
                $period,
                $tx->description ?? '—',
                $tx->creator?->name ?? 'System',
            ];
        })->toArray();
    }
}