<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('leave_credit_certifications', function (Blueprint $table) {
            $table->foreignId('prepared_by')->nullable()->change();
            $table->foreignId('certified_by')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('leave_credit_certifications', function (Blueprint $table) {
            $table->foreignId('prepared_by')->nullable(false)->change();
            $table->foreignId('certified_by')->nullable(false)->change();
        });
    }
};
