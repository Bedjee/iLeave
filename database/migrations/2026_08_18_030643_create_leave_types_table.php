<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();

            // Core flags
            $table->boolean('earnable')->default(false);
            $table->boolean('deductible')->default(false);
            $table->boolean('deduct_from_vl')->default(false);
            $table->boolean('document_required')->default(false);
            $table->boolean('requires_balance')->default(false);

            // Numeric fields
            $table->decimal('default_days', 8, 2)->nullable();
            $table->decimal('deduction_factor', 5, 2)->default(1.00);

            // Status (active/inactive)
            $table->boolean('status')->default(true);

            // Eligibility
            $table->enum('gender_eligibility', ['all', 'male', 'female'])->default('all');
            $table->json('employment_conditions')->nullable(); // for future expansion

            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_types');
    }
};
