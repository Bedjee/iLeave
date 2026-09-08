<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('leave_request_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leave_request_id')->constrained()->cascadeOnDelete();

            // Vacation Leave
            $table->enum('location_type', ['within_philippines', 'abroad'])->nullable();
            $table->string('location')->nullable();

            // Sick Leave
            $table->enum('sick_leave_type', ['in_hospital', 'out_patient'])->nullable();
            $table->string('illness')->nullable();

            // Study Leave
            $table->enum('study_purpose', ['masters_completion', 'bar_board_review', 'continuing_education'])->nullable();

            // Other Purpose (Monetization, Terminal Leave)
            $table->enum('other_purpose', ['monetization', 'terminal_leave'])->nullable();

            // Free-text for any additional info
            $table->text('additional_info')->nullable();

            $table->timestamps();

            $table->unique(['leave_request_id']); // one-to-one
        });
    }

    public function down()
    {
        Schema::dropIfExists('leave_request_details');
    }
};
