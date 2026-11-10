<?php

use App\Http\Controllers\AdminApplicationController as Admin;
use App\Http\Controllers\IdentityController as Identity;
use App\Http\Controllers\MerchantApplicationController as Merchant;
use App\Http\Controllers\MfaController as Mfa;
use App\Http\Controllers\ProfileResourcesController as Profile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

Route::get('/health', function () {
    try {
        DB::select('SELECT 1');
        Redis::connection()->ping();
        if (! Schema::hasTable('addresses')) {
            throw new RuntimeException('Schema not ready');
        }

        return ['status' => 'ok', 'product' => 'Segno Gebeya', 'schema_version' => config('segno.schema_version')];
    } catch (Throwable) {
        return response()->json(['status' => 'degraded', 'schema_version' => config('segno.schema_version')], 503);
    }
});
Route::prefix('auth')->middleware('throttle:identity')->group(function () {
    Route::post('/register', [Identity::class, 'register']);
    Route::post('/login', [Identity::class, 'login']);
    Route::post('/challenges', [Identity::class, 'challenge']);
    Route::post('/verify', [Identity::class, 'verify']);
    Route::post('/reset-password', [Identity::class, 'reset']);
});
Route::middleware(['auth:sanctum', 'account'])->group(function () {
    Route::get('/me', [Identity::class, 'me']);
    Route::patch('/profile', [Identity::class, 'profile']);
    Route::patch('/preferences', [Profile::class, 'preferences']);
    Route::get('/addresses', [Profile::class, 'addresses']);
    Route::post('/addresses', [Profile::class, 'saveAddress']);
    Route::patch('/addresses/{id}', [Profile::class, 'saveAddress']);
    Route::delete('/addresses/{id}', [Profile::class, 'deleteAddress']);
    Route::post('/account/password', [Profile::class, 'password']);
    Route::get('/profile/photo', [Profile::class, 'photo']);
    Route::post('/profile/photo', [Profile::class, 'uploadPhoto']);
    Route::delete('/profile/photo', [Profile::class, 'deletePhoto']);
    Route::post('/auth/logout', [Identity::class, 'logout']);
    Route::get('/sessions', [Identity::class, 'sessions']);
    Route::delete('/sessions/{id}', [Identity::class, 'revoke']);
    Route::put('/context', [Identity::class, 'context']);
    Route::post('/account/actions', [Identity::class, 'account']);
    Route::post('/admin/mfa/enroll', [Mfa::class, 'enroll'])->middleware('throttle:mfa');
    Route::post('/admin/mfa/verify', [Mfa::class, 'verify'])->middleware('throttle:mfa');
    Route::get('/merchant/applications', [Merchant::class, 'index']);
    Route::post('/merchant/applications', [Merchant::class, 'create']);
    Route::patch('/merchant/applications/{id}', [Merchant::class, 'update']);
    Route::post('/merchant/applications/{id}/documents', [Merchant::class, 'document']);
    Route::delete('/merchant/applications/{id}/documents/{document}', [Merchant::class, 'deleteDocument']);
    Route::post('/merchant/applications/{id}/submit', [Merchant::class, 'submit']);
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/applications', [Admin::class, 'index']);
        Route::get('/applications/{id}', [Admin::class, 'show']);
        Route::post('/applications/{id}/start', [Admin::class, 'start']);
        Route::get('/applications/{id}/documents/{document}', [Admin::class, 'document']);
        Route::post('/applications/{id}/decisions', [Admin::class, 'propose']);
        Route::post('/confirmations/{id}', [Admin::class, 'confirm']);
        Route::post('/stores/{id}/suspend', [Admin::class, 'suspend']);
    });
});
