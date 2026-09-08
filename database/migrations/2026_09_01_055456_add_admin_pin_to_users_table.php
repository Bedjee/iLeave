<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('admin_pin')->nullable()->after('password');
            $table->timestamp('admin_pin_set_at')->nullable()->after('admin_pin');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['admin_pin', 'admin_pin_set_at']);
        });
    }
};
