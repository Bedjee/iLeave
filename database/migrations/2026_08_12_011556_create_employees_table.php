<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();

            // Link to user account (one-to-one)
            $table->foreignId('user_id')
                  ->unique()
                  ->constrained()
                  ->onDelete('cascade');

            // Department (nullable until assigned)
      $table->foreignId('department_id')
    ->nullable()
    ->constrained('departments')
    ->nullOnDelete();

            // Personal details
            $table->string('lastname');
            $table->string('firstname');
            $table->string('middle_initial', 1)->nullable();
            $table->string('salutation')->nullable();
            $table->string('position')->nullable();

            // Contact and demographic
            $table->string('email')->unique();
            $table->enum('civil_status', ['single', 'married', 'divorced', 'widowed'])->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
