<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
       Schema::create('departments', function (Blueprint $table) {
    $table->id();
    $table->string('department_name');
    $table->string('department_code')->unique();

    $table->unsignedBigInteger('department_head_id')->nullable();

    $table->enum('status', ['active', 'inactive'])->default('active');
    $table->timestamps();
});
    }

    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
