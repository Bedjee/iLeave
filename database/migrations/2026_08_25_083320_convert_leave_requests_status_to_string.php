<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // If the table doesn't exist yet, create it with a string column.
        // If it exists, we modify the column.
        if (Schema::hasTable('leave_requests')) {
            // Convert existing enum to string (preserves data)
            DB::statement("ALTER TABLE leave_requests MODIFY status VARCHAR(50) NOT NULL DEFAULT 'pending'");
        } else {
            // If the table is not yet created, we can create it with string status.
            // But the table probably already exists. We'll keep this safe.
            // If you're starting fresh, you can modify the original creation migration.
            // We'll assume the table exists.
        }
    }

    public function down(): void
    {
        // Rollback to enum with original statuses (optional)
        // If we need to revert, we can drop the column or change back.
        // For safety, we'll just change back to enum with the original values.
        DB::statement("ALTER TABLE leave_requests MODIFY status ENUM('pending','certified','department_approved','approved','rejected','cancelled') NOT NULL DEFAULT 'pending'");
    }
};