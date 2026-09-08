<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_reschedules', function (Blueprint $table) {
            $table->date('old_start_date')->nullable()->change();
            $table->date('old_end_date')->nullable()->change();
            $table->date('new_start_date')->nullable()->change();
            $table->date('new_end_date')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('leave_reschedules', function (Blueprint $table) {
            $table->date('old_start_date')->nullable(false)->change();
            $table->date('old_end_date')->nullable(false)->change();
            $table->date('new_start_date')->nullable(false)->change();
            $table->date('new_end_date')->nullable(false)->change();
        });
    }
};
