<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waitlist', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('referral_code')->nullable();
            $table->string('country')->nullable();
            $table->string('use_case')->nullable(); // personal, professional, family
            $table->string('page_source')->default('homepage');
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waitlist');
    }
};
