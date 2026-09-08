<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->timestamp('final_approved_at')->nullable()->after('approved_at');
            $table->foreignId('final_approved_by')->nullable()->constrained('users')->nullOnDelete()->after('final_approved_at');
        });
    }

    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropColumn(['final_approved_at', 'final_approved_by']);
        });
    }
};
