<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('leave_request_dates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leave_request_id')->constrained()->cascadeOnDelete();
            $table->date('leave_date');
            $table->timestamps();

            // Ensure no duplicate dates for the same request
            $table->unique(['leave_request_id', 'leave_date']);
            $table->index(['leave_request_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('leave_request_dates');
    }
};
