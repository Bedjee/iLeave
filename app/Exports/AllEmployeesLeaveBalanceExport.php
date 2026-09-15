<?php

namespace App\Exports;

use App\Models\Employee;
use App\Models\LeaveType;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\Export;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class AllEmployeesLeaveBalanceExport implements FromQuery, WithHeadings, WithMapping, WithTitle, ShouldAutoSize, WithStyles, Export
{
    /**
     * Leave types are computed once in the constructor so all rows
     * use the exact same ordering (and the same columns).
     *
     * @var \Illuminate\Support\Collection
     */
    protected $leaveTypes;

    public function __construct()
    {
        $this->leaveTypes = LeaveType::where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);
    }

    public function title(): string
    {
        return 'Leave Balances';
    }

    /**
     * Build the query. Uses `with()` for eager loading to avoid N+1.
     * `FromQuery` streams through the result, so 200+ employees is fine.
     */
    public function query(): Builder
    {
        return Employee::query()
            ->with(['department', 'leaveBalances'])
            ->whereHas('user', fn ($q) => $q->where('status', '!=', 'inactive'))
            ->orderBy('lastname')
            ->orderBy('firstname');
    }

    /**
     * Column headers: Employee Name | Department | Email | [Leave Type 1] | [Leave Type 2] | ...
     */
    public function headings(): array
    {
        $headings = ['Employee Name', 'Department', 'Email'];

        foreach ($this->leaveTypes as $type) {
            $headings[] = $type->name;
        }

        return $headings;
    }

    /**
     * Map each employee to a row.
     *
     * @param \App\Models\Employee $employee
     */
    public function map($employee): array
    {
        $balances = $employee->leaveBalances->keyBy('leave_type_id');

        $row = [
            $employee->full_name,
            $employee->department?->department_name ?? '—',
            $employee->email,
        ];

        foreach ($this->leaveTypes as $type) {
            $bal = $balances->get($type->id);
            $row[] = $bal ? (float) $bal->balance : 0;
        }

        return $row;
    }

    /**
     * Style the header row for readability.
     */
   public function styles(Worksheet $sheet): ?array
{
    $lastCol = $sheet->getHighestColumn();

    $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
        'font' => [
            'bold' => true,
            'color' => ['rgb' => 'FFFFFF'],
        ],
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'startColor' => ['rgb' => '0F2A52'],
        ],
        'alignment' => [
            'horizontal' => 'center',
            'vertical' => 'center',
        ],
    ]);

    $sheet->freezePane('A2');

    return [];
}



}