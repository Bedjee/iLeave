<?php

namespace App\Http\Controllers\Concerns;

use App\Models\LeaveRequest;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

trait HasUnavailableDates
{
    /**
     * Returns a unique array of dates (Y-m-d strings) that are already
     * covered by any active leave request for the given employee.
     *
     * "Active" = pending, certified, or approved.
     * Rejected and cancelled requests are ignored.
     *
     * Why include pending? A pending request already reserves those dates.
     * If we only blocked approved requests, two overlapping requests could
     * both be pending at the same time, forcing an approver to reject one
     * arbitrarily. If you'd prefer to only block approved requests,
     * change the whereIn below to ->where('status', 'approved').
     */
    protected function getUnavailableDates(int $employeeId): array
    {
        $requests = LeaveRequest::with('dates')
            ->where('employee_id', $employeeId)
            ->whereIn('status', ['pending', 'certified', 'approved'])
            ->get();

        $unavailable = [];

        foreach ($requests as $request) {
            // Case 1: specific dates were filed
            foreach ($request->dates as $date) {
                if ($date->leave_date) {
                    $unavailable[] = Carbon::parse($date->leave_date)->format('Y-m-d');
                }
            }

            // Case 2: a range was filed (start_date → end_date)
            if ($request->start_date && $request->end_date) {
                $period = CarbonPeriod::create(
                    $request->start_date,
                    $request->end_date
                );
                foreach ($period as $date) {
                    $unavailable[] = $date->format('Y-m-d');
                }
            }
        }

        return array_values(array_unique($unavailable));
    }
}