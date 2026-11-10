<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

final class AccountAccess
{
    public function handle(Request $request, Closure $next): mixed
    {
        $user = $request->user();
        abort_unless($user && $user->status === 'active', 403, 'Account access is not available.');
        abort_unless($user->email_verified_at || $user->phone_verified_at, 403, 'Verify your account before continuing.');
        if (! $request->bearerToken() && $request->hasSession()) {
            $started = (int) $request->session()->get('auth_started_at', 0);
            $last = (int) $request->session()->get('auth_last_at', 0);
            if (! $started || time() - $started > config('segno.web_absolute_hours') * 3600 || time() - $last > config('segno.web_idle_minutes') * 60) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                abort(401, 'Your session expired. Please sign in again.');
            }
            $request->session()->put('auth_last_at', time());
        }

        return $next($request);
    }
}
