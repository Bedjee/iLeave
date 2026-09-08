<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('admin_delegations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('delegate_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('start_date');
            $table->timestamp('end_date');
            $table->string('status')->default('active'); // active, revoked, expired
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('admin_delegations');
    }
};
