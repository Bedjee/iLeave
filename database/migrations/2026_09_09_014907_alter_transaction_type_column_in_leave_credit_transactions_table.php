<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('leave_credit_transactions', function (Blueprint $table) {
            // Change the column to varchar(50) to accept longer strings
            $table->string('transaction_type', 50)->change();
        });
    }

    public function down()
    {
        Schema::table('leave_credit_transactions', function (Blueprint $table) {
            // Revert to previous type – you may need to adjust
            $table->string('transaction_type', 20)->change();
        });
    }
};
