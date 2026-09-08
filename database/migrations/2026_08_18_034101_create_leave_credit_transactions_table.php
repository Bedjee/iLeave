<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_credit_transactions', function (Blueprint $table) {
            $table->id();

            // Foreign keys – use RESTRICT to protect historical data
            $table->foreignId('employee_id')
                ->constrained()
                ->restrictOnDelete();

            $table->foreignId('leave_type_id')
                ->constrained()
                ->restrictOnDelete();

            // Transaction type – finalized enum values
            $table->enum('transaction_type', [
                'INITIAL_BALANCE',
                'MONTHLY_ACCRUAL',
                'HR_ADJUSTMENT',
                'LEAVE_DEDUCTION',
                'LEAVE_RETURN',
                'FINAL_ACCRUAL',
            ]);

            // Amount is the movement (not the balance after)
            $table->decimal('amount', 10, 2);

            // Balance after this transaction
            $table->decimal('balance_after', 10, 2);

            // Date the transaction takes effect
            $table->date('transaction_date');

            // Accrual period (for monthly accruals)
            $table->unsignedTinyInteger('period_month')->nullable();
            $table->unsignedSmallInteger('period_year')->nullable();

            // Human-readable description
            $table->text('description')->nullable();

            // Polymorphic reference to the source record (e.g., LeaveRequest, HRAdjustment)
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();

            // Who created the transaction (nullable for automated processes)
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            // Indexes
            $table->index(['employee_id', 'leave_type_id']);
            $table->index(['employee_id', 'transaction_date']);
            $table->index(['transaction_type']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_credit_transactions');
    }
};
