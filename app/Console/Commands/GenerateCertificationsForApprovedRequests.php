<?php

namespace App\Console\Commands;

use App\Models\LeaveRequest;
use App\Services\LeaveCertificationService;
use Illuminate\Console\Command;

class GenerateCertificationsForApprovedRequests extends Command
{
    protected $signature = 'certification:generate-approvals';
    protected $description = 'Generate certifications for all fully approved leave requests that don\'t have one.';

    public function handle()
    {
        $service = new LeaveCertificationService();
        $approvedRequests = LeaveRequest::where('status', 'approved')
            ->whereDoesntHave('certification')
            ->get();

        $this->info("Found {$approvedRequests->count()} approved requests without certification.");

        foreach ($approvedRequests as $request) {
            $service->generateCertification($request);
            $this->info("Generated certification for request #{$request->id}");
        }

        $this->info("Done.");
    }
}
