<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->string('email')->nullable()->change();
            $t->string('phone', 32)->nullable()->unique();
            $t->string('username', 40)->nullable()->unique();
            $t->text('bio')->nullable();
            $t->string('locale', 5)->default('en');
            $t->string('status', 24)->default('active');
            $t->timestamp('phone_verified_at')->nullable();
            $t->json('roles')->nullable();
            $t->text('mfa_secret')->nullable();
            $t->json('mfa_recovery_hashes')->nullable();
            $t->unsignedBigInteger('mfa_last_counter')->nullable();
            $t->timestamp('mfa_confirmed_at')->nullable();
            $t->timestamp('deletion_requested_at')->nullable();
        });
        Schema::create('personal_access_tokens', function (Blueprint $t) {
            $t->id();
            $t->morphs('tokenable');
            $t->text('name');
            $t->string('token', 64)->unique();
            $t->text('abilities')->nullable();
            $t->timestamp('last_used_at')->nullable();
            $t->timestamp('expires_at')->nullable()->index();
            $t->timestamps();
        });
        Schema::create('verification_challenges', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('purpose', 24);
            $t->string('client', 16);
            $t->string('identifier');
            $t->string('code_hash');
            $t->unsignedTinyInteger('attempts')->default(0);
            $t->timestamp('expires_at');
            $t->timestamp('consumed_at')->nullable();
            $t->string('reset_hash', 64)->nullable();
            $t->timestamp('reset_expires_at')->nullable();
            $t->timestamp('reset_consumed_at')->nullable();
            $t->timestamps();
            $t->index(['identifier', 'purpose', 'created_at']);
        });
        Schema::create('merchant_applications', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignId('user_id')->constrained();
            $t->string('store_name', 120);
            $t->string('business_type', 30);
            $t->string('representative', 120);
            $t->string('status', 30)->default('draft');
            $t->unsignedInteger('revision')->default(1);
            $t->text('review_reason')->nullable();
            $t->foreignId('reviewed_by')->nullable()->constrained('users');
            $t->timestamp('submitted_at')->nullable();
            $t->timestamps();
            $t->index(['user_id', 'status']);
        });
        Schema::create('application_documents', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('merchant_application_id')->constrained()->cascadeOnDelete();
            $t->string('path');
            $t->string('name', 180);
            $t->string('mime', 80);
            $t->unsignedInteger('size');
            $t->timestamps();
        });
        Schema::create('stores', function (Blueprint $t) {
            $t->id();
            $t->foreignUuid('merchant_application_id')->unique()->constrained();
            $t->string('name', 120);
            $t->string('status', 24)->default('active');
            $t->timestamps();
        });
        Schema::create('store_members', function (Blueprint $t) {
            $t->id();
            $t->foreignId('store_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->constrained();
            $t->string('role', 30);
            $t->json('permissions');
            $t->boolean('active')->default(true);
            $t->timestamps();
            $t->unique(['store_id', 'user_id']);
        });
        Schema::create('review_confirmations', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('merchant_application_id')->constrained();
            $t->foreignId('actor_id')->constrained('users');
            $t->string('token_hash', 64);
            $t->unsignedInteger('revision');
            $t->string('action', 30);
            $t->text('reason');
            $t->timestamp('expires_at');
            $t->timestamp('consumed_at')->nullable();
            $t->json('result')->nullable();
            $t->timestamps();
        });
        Schema::create('audit_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('actor_id')->nullable()->constrained('users');
            $t->string('event', 100);
            $t->string('subject', 100)->nullable();
            $t->uuid('request_id')->nullable();
            $t->json('context');
            $t->timestamp('created_at')->useCurrent();
        });
        Schema::create('development_messages', function (Blueprint $t) {
            $t->id();
            $t->string('identifier');
            $t->text('payload');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['development_messages', 'audit_events', 'review_confirmations', 'store_members', 'stores', 'application_documents', 'merchant_applications', 'verification_challenges', 'personal_access_tokens'] as $table) {
            Schema::dropIfExists($table);
        } Schema::table('users', function (Blueprint $t) {
            $t->dropUnique(['phone']);
            $t->dropUnique(['username']);
            $t->dropColumn(['phone', 'username', 'bio', 'locale', 'status', 'phone_verified_at', 'roles', 'mfa_secret', 'mfa_recovery_hashes', 'mfa_last_counter', 'mfa_confirmed_at', 'deletion_requested_at']);
        });
    }
};
