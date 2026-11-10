<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->char('country', 2)->default('ET');
            $t->string('avatar_path')->nullable();
        });
        Schema::create('addresses', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('label', 50);
            $t->string('recipient', 120);
            $t->string('phone', 32);
            $t->char('country', 2)->default('ET');
            $t->string('city', 100);
            $t->string('sub_city', 100)->nullable();
            $t->string('woreda', 80)->nullable();
            $t->string('house', 80)->nullable();
            $t->text('directions')->nullable();
            $t->boolean('is_default')->default(false);
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['country', 'avatar_path']));
    }
};
