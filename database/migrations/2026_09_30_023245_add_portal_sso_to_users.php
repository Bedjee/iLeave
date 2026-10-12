<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // The `sub` claim from the portal's userinfo response.
            // Stable across email changes, name changes, etc.
            $table->string('portal_user_id', 100)
                ->nullable()
                ->unique()
                ->after('id');

            $table->timestamp('last_sso_login_at')
                ->nullable()
                ->after('portal_user_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['portal_user_id', 'last_sso_login_at']);
        });
    }
};