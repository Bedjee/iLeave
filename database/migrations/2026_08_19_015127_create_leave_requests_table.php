<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->restrictOnDelete();
            $table->foreignId('leave_type_id')->constrained()->restrictOnDelete();

            // Core dates
            $table->date('date_filed');
            $table->date('start_date');
            $table->date('end_date')->nullable(); // nullable for specific-dates mode
            $table->decimal('number_of_days', 8, 4);
            $table->text('reason')->nullable();

            // Attachments
            $table->string('attachment')->nullable();

            // Commutation
            $table->enum('commutation', ['not_requested', 'requested'])->default('not_requested');

            // Days breakdown
            $table->decimal('days_with_pay', 8, 4)->default(0);
            $table->decimal('days_without_pay', 8, 4)->default(0);

            // Status & remarks
            $table->enum('status', [
                'draft', 'pending', 'certified', 'approved', 'rejected', 'cancelled'
            ])->default('draft');
            $table->text('remarks')->nullable();

            // Historical snapshots for printed forms
            $table->string('office_department_snapshot')->nullable();
            $table->string('employee_name_snapshot')->nullable();
            $table->string('position_snapshot')->nullable();
            $table->string('salary_snapshot')->nullable();

            // Workflow timestamps & actors
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('certified_at')->nullable();
            $table->foreignId('certified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable();
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('cancellation_reason')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['employee_id', 'status']);
            $table->index(['leave_type_id']);
            $table->index(['date_filed']);
            $table->index(['start_date', 'end_date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('leave_requests');
    }
};
