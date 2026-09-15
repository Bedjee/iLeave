<?php

namespace App\Exports\Sheets;

use App\Models\Employee;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;

class EmployeeSummarySheet implements FromArray, WithTitle, WithHeadings
{
    public function __construct(protected Employee $employee)
    {
    }

    public function title(): string
    {
        return 'Summary';
    }

    public function headings(): array
    {
        return ['Field', 'Value'];
    }

    public function array(): array
    {
        $e = $this->employee;

        return [
            ['Exported On', now()->format('F d, Y h:i A')],
            ['Employee ID', $e->id],
            ['Full Name', $e->full_name],
            ['Email', $e->email],
            ['Position', $e->position ?? '—'],
            ['Department', $e->department?->department_name ?? '—'],
            ['Employment Status', ucfirst($e->user?->status ?? '—')],
            ['Civil Status', $e->civil_status ?? '—'],
            ['Gender', $e->gender ?? '—'],
            ['Date Hired', $e->created_at?->format('F d, Y') ?? '—'],
        ];
    }
}