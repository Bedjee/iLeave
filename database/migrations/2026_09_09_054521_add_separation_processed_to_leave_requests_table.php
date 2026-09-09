<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::table('leave_requests', function (Blueprint $table) {
        $table->boolean('separation_processed')->default(false);
    });
}

public function down()
{
    Schema::table('leave_requests', function (Blueprint $table) {
        $table->dropColumn('separation_processed');
    });
}


};
