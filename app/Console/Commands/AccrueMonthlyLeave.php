<?php

namespace App\Console\Commands;

use App\Services\LeaveAccrualService;
use Illuminate\Console\Command;

class AccrueMonthlyLeave extends Command
{
    protected $signature = 'leave:accrue-monthly 
                            {--month= : Month to accrue (1-12). Defaults to previous month.}
                            {--year= : Year to accrue. Defaults to previous month\'s year.}
                            {--force : Force processing even if already logged.}';

    protected $description = 'Accrue monthly leave credits for the previous month (or specified month).';

    public function handle(LeaveAccrualService $service)
    {
        $defaultMonth = now()->subMonth()->month;
        $defaultYear = now()->subMonth()->year;

        $month = $this->option('month') ?: $defaultMonth;
        $year = $this->option('year') ?: $defaultYear;
        $force = $this->option('force');

        $this->info("Processing accrual for {$year}-{$month}...");

        $result = $service->runMonthlyAccrual($year, $month, $force);

        if ($result['processed']) {
            $this->info("Accrual completed. Processed {$result['processed_count']} employees for {$result['month']}/{$result['year']}.");
        } else {
            $this->warn("Accrual skipped: {$result['reason']}");
        }

        return 0;
    }
}