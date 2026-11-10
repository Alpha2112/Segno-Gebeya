<?php

namespace App\Http\Middleware;

use App\Domain\Identity\Capabilities;
use Closure;
use Illuminate\Http\Request;

final class AdminAccess
{
    public function handle(Request $request, Closure $next): mixed
    {
        abort_unless(Capabilities::isAdmin($request->user()) && ! $request->bearerToken() && $request->hasSession(), 403, 'Administrative access is not available.');
        $verified = (int) $request->session()->get('admin_mfa_at', 0);
        $last = (int) $request->session()->get('admin_last_at', $verified);
        abort_unless($verified && time() - $verified < config('segno.admin_absolute_hours') * 3600 && time() - $last < config('segno.admin_idle_minutes') * 60, 403, 'Complete administrator verification to continue.');
        $request->session()->put('admin_last_at', time());

        return $next($request);
    }
}
