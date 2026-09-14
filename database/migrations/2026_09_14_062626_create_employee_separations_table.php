<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('employee_separations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->date('separation_date');
            $table->string('reason'); // resigned, retired, separated, deceased, other
            $table->decimal('final_accrual_vl', 10, 4)->default(0);
            $table->decimal('final_accrual_sl', 10, 4)->default(0);
            $table->enum('status', ['active', 'reversed'])->default('active');
            $table->boolean('credits_claimed')->default(false);
            $table->timestamp('reversed_at')->nullable();
            $table->foreignId('reversed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('employee_separations');
    }
};