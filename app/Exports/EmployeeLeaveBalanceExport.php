<?php

namespace App\Exports;

use App\Models\Employee;
use Maatwebsite\Excel\Concerns\Export;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class EmployeeLeaveBalanceExport implements WithMultipleSheets, Export
{
    public function __construct(protected Employee $employee)
    {
    }

    public function sheets(): array
    {
        return [
            'Summary'      => new Sheets\EmployeeSummarySheet($this->employee),
            'Balances'     => new Sheets\EmployeeBalancesSheet($this->employee),
            'Transactions' => new Sheets\EmployeeTransactionsSheet($this->employee),
        ];
    }
}