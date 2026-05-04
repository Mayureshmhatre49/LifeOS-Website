<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('security_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event_type', 60)->index();    // e.g. sql_injection, honeypot_triggered
            $table->string('ip_address', 45)->index();    // supports IPv6
            $table->string('user_agent', 500)->nullable();
            $table->string('method', 10)->nullable();
            $table->string('path', 500)->nullable();
            $table->string('detail', 1000)->nullable();
            $table->boolean('blocked')->default(true)->index();
            $table->timestamp('created_at')->useCurrent()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('security_logs');
    }
};
