<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('leave_accrual_logs', function (Blueprint $table) {
            $table->id();
            $table->integer('year');
            $table->integer('month');
            $table->timestamp('processed_at')->useCurrent();
            $table->integer('processed_count')->default(0);
            $table->unique(['year', 'month']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('leave_accrual_logs');
    }
};
