<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_reschedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leave_request_id')->constrained()->cascadeOnDelete();

            // Original dates (for reference)
            $table->date('old_start_date');
            $table->date('old_end_date')->nullable();
            $table->json('old_dates')->nullable();

            // New requested dates
            $table->date('new_start_date');
            $table->date('new_end_date')->nullable();
            $table->json('new_dates')->nullable();

            $table->decimal('old_number_of_days', 10, 4);
            $table->decimal('new_number_of_days', 10, 4);
            $table->decimal('day_difference', 10, 4)->nullable(); // old - new (positive = refund, negative = extra deduction)

            $table->text('reason')->nullable();
            $table->string('attachment')->nullable();

            // Workflow status
            $table->enum('status', ['pending', 'certified', 'approved', 'rejected'])->default('pending');

            // Timestamps for workflow
            $table->timestamp('certified_at')->nullable();
            $table->foreignId('certified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();

            $table->index('leave_request_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_reschedules');
    }
};
