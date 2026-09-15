<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mayor_leave_approvers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leave_request_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('slot'); // 1 or 2
            $table->string('name');
            $table->string('position')->nullable();
            $table->string('role_label'); // "Approved by", "Noted by", etc.
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['leave_request_id', 'slot']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('mayor_leave_approvers');
    }
};