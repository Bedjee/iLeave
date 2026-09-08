<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            // Add request_type to distinguish special requests
            $table->enum('request_type', ['leave', 'monetization', 'terminal_leave'])
                  ->default('leave')
                  ->after('id');

            // For monetization: number of days to monetize
            $table->decimal('monetized_days', 10, 2)->nullable()->after('number_of_days');
        });
    }

    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropColumn(['request_type', 'monetized_days']);
        });
    }
};
