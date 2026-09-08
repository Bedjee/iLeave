<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('leave_credit_certification_details', function (Blueprint $table) {
            $table->id();

            $table->foreignId('leave_credit_certification_id');

            $table->foreign(
                'leave_credit_certification_id',
                'lccd_certification_fk'
            )->references('id')
             ->on('leave_credit_certifications')
             ->cascadeOnDelete();

            $table->foreignId('leave_type_id')
                ->constrained()
                ->restrictOnDelete();

            $table->decimal('total_earned', 10, 4);
            $table->decimal('less_this_application', 10, 4);
            $table->decimal('balance', 10, 4);

            $table->timestamps();

            $table->unique(
                ['leave_credit_certification_id', 'leave_type_id'],
                'lcc_detail_unique'
            );
        });
    }

    public function down()
    {
        Schema::dropIfExists('leave_credit_certification_details');
    }
};
