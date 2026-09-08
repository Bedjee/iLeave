<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('leave_credit_certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->restrictOnDelete();
            $table->foreignId('leave_request_id')->nullable()->constrained()->nullOnDelete(); // optional link
            $table->date('certification_date');
            $table->string('certification_number')->unique();
            $table->text('remarks')->nullable();
            $table->foreignId('prepared_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('certified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['employee_id', 'certification_date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('leave_credit_certifications');
    }
};
