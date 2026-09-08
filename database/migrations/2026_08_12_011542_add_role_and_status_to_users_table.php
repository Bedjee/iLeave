<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add role enum – default is 'employee'
            $table->enum('role', ['admin', 'hrmo', 'department_head', 'employee', 'mayor'])
                  ->default('employee')
                  ->after('password');

            // Add account status
            $table->enum('status', ['active', 'inactive'])
                  ->default('active')
                  ->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'status']);
        });
    }
};
