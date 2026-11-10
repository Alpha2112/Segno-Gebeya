<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Fortify;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        Fortify::ignoreRoutes();
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('identity', fn ($r) => [
            Limit::perMinute(30)->by($r->ip()),
            Limit::perMinute(8)->by($r->ip().'|'.strtolower((string) $r->input('identifier', $r->input('challenge_id', 'unknown')))),
        ]);
        RateLimiter::for('mfa', fn ($r) => Limit::perMinute(5)->by((string) $r->user()?->id));
    }
}
