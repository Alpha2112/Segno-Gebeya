<?php

namespace App\Http\Controllers;

use App\Domain\Audit;
use App\Domain\Identity\Capabilities;
use App\Domain\Identity\IdentityService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

final class IdentityController
{
    public function register(Request $r, IdentityService $identity): mixed
    {
        abort_unless(app()->environment(['local', 'testing']), 503, 'Account registration policy is not qualified for production.');
        $v = $r->validate(['identifier' => 'required|string|max:254', 'password' => 'required|string|min:12|max:128|confirmed', 'locale' => ['required', Rule::in(['en', 'am'])], 'client' => ['required', Rule::in(['mobile', 'web'])], 'terms' => 'accepted']);
        $identifier = IdentityService::identifier($v['identifier']);
        $this->cooldown($identifier);
        if (IdentityService::user($identifier)) {
            Hash::make(Str::random(32));

            return response()->json($this->receipt(), 202);
        }
        $user = User::create(['name' => '', 'password' => $v['password'], 'locale' => $v['locale'], 'roles' => ['customer'], str_contains($identifier, '@') ? 'email' : 'phone' => $identifier]);
        Audit::record('identity.registered', $user->id, (string) $user->id, ['notice' => 'development-pilot-v1']);

        return response()->json($identity->challenge($user, $identifier, 'verify', $v['client']), 202);
    }

    public function challenge(Request $r, IdentityService $identity): mixed
    {
        $v = $r->validate(['identifier' => 'required|string|max:254', 'purpose' => ['required', Rule::in(['verify', 'recover'])], 'client' => ['required', Rule::in(['mobile', 'web'])]]);
        $identifier = IdentityService::identifier($v['identifier']);
        $this->cooldown($identifier);
        $user = IdentityService::user($identifier);
        if ($user && $user->status === 'active' && ($v['purpose'] === 'recover' || ! ($user->email_verified_at || $user->phone_verified_at))) {
            return response()->json($identity->challenge($user, $identifier, $v['purpose'], $v['client']), 202);
        }

        return response()->json($this->receipt(), 202);
    }

    private function receipt(): array
    {
        Hash::make(Str::random(32));

        return ['challenge_id' => (string) Str::uuid(), 'expires_in' => 300, 'retry_after' => 60, 'delivery' => config('segno.development_otp') && app()->environment(['local', 'testing']) ? 'development_capture' : 'configured_channel', 'message' => 'If the request is eligible, verification instructions are available through the selected channel.'];
    }

    private function cooldown(string $identifier): void
    {
        $key = 'challenge:'.hash('sha256', $identifier);
        abort_if(RateLimiter::tooManyAttempts($key, 1), 429, 'Please wait before requesting another code.');
        RateLimiter::hit($key, 60);
    }

    public function verify(Request $r, IdentityService $identity): array
    {
        $v = $r->validate(['challenge_id' => 'required|uuid', 'code' => 'required|digits:6', 'purpose' => ['required', Rule::in(['verify', 'recover'])], 'password' => 'nullable|required_if:purpose,verify|string|min:12|max:128|confirmed', 'device_name' => 'nullable|string|max:80']);

        return $identity->verify($v['challenge_id'], $v['code'], $v['purpose'], $r);
    }

    public function reset(Request $r, IdentityService $identity): array
    {
        $v = $r->validate(['challenge_id' => 'required|uuid', 'token' => 'required|string|size:64', 'password' => 'required|string|min:12|max:128|confirmed']);
        $identity->reset($v['challenge_id'], $v['token'], $v['password']);

        return ['message' => 'Password updated. Sign in again on your devices.'];
    }

    public function login(Request $r, IdentityService $identity): array
    {
        $v = $r->validate(['identifier' => 'required|string|max:254', 'password' => 'required|string|max:128', 'client' => ['required', Rule::in(['web', 'mobile'])], 'area' => ['nullable', Rule::in(['customer', 'merchant', 'admin'])]]);
        $user = IdentityService::user(IdentityService::identifier($v['identifier']));
        if (! $user) {
            Hash::make($v['password']);
        }
        if (! $user || ! Hash::check($v['password'], $user->password) || $user->status !== 'active' || (($v['area'] ?? null) === 'admin' && ! Capabilities::isAdmin($user))) {
            throw ValidationException::withMessages(['identifier' => 'The sign-in details could not be verified.']);
        }
        if (! $user->email_verified_at && ! $user->phone_verified_at) {
            abort(403, 'Verify your account before signing in.');
        }
        if (Hash::needsRehash($user->password)) {
            $user->forceFill(['password' => $v['password']])->save();
        }
        $result = $identity->authenticate($user, $v['client'], $r);
        if (($v['area'] ?? null) === 'admin' && $v['client'] === 'web') {
            $r->session()->put('admin_password_at', time());
        }

        return $result;
    }

    public function me(Request $r): array
    {
        return ['user' => Capabilities::profile($r->user()), 'admin_verified' => $r->hasSession() && (bool) $r->session()->get('admin_mfa_at')];
    }

    public function profile(Request $r): array
    {
        $v = $r->validate(['name' => 'required|string|max:120', 'username' => ['required', 'regex:/^[a-zA-Z0-9_]{3,40}$/', Rule::unique('users')->ignore($r->user()->id)], 'bio' => 'nullable|string|max:160', 'locale' => ['required', Rule::in(['en', 'am'])]]);
        $r->user()->fill($v)->save();

        return ['user' => Capabilities::profile($r->user())];
    }

    public function logout(Request $r): array
    {
        if ($r->bearerToken()) {
            $r->user()->currentAccessToken()->delete();
        } elseif ($r->hasSession()) {
            Auth::guard('web')->logout();
            $r->session()->invalidate();
            $r->session()->regenerateToken();
        }

        return ['message' => 'Signed out.'];
    }

    public function sessions(Request $r): array
    {
        $user = $r->user();
        $tokens = $user->tokens()->get()->map(fn ($t) => ['id' => 'token:'.$t->id, 'name' => $t->name, 'last_used_at' => $t->last_used_at, 'current' => $r->bearerToken() && (int) $r->user()->currentAccessToken()->id === (int) $t->id]);
        $sessions = DB::table('sessions')->where('user_id', $user->id)->get()->map(fn ($s) => ['id' => 'web:'.hash('sha256', $s->id), 'name' => Str::limit($s->user_agent ?? 'Browser', 80), 'last_used_at' => date('c', $s->last_activity), 'current' => $r->hasSession() && hash_equals($s->id, $r->session()->getId())]);

        return ['sessions' => $tokens->concat($sessions)->values()];
    }

    public function revoke(Request $r, string $id): array
    {
        if (str_starts_with($id, 'token:')) {
            $r->user()->tokens()->whereKey(substr($id, 6))->firstOrFail()->delete();
        } else {
            abort_unless(str_starts_with($id, 'web:'), 404);
            $found = DB::table('sessions')->where('user_id', $r->user()->id)->get()->first(fn ($s) => hash_equals('web:'.hash('sha256', $s->id), $id));
            abort_unless($found !== null, 404);
            DB::table('sessions')->where('id', $found->id)->delete();
            if ($r->hasSession() && hash_equals($found->id, $r->session()->getId())) {
                Auth::guard('web')->logout();
                $r->session()->invalidate();
                $r->session()->regenerateToken();
            }
        }
        Audit::record('identity.session_revoked', $r->user()->id, null);

        return ['message' => 'Session revoked.'];
    }

    public function context(Request $r): array
    {
        $v = $r->validate(['mode' => ['required', Rule::in(['customer', 'merchant'])], 'store_id' => 'nullable|integer']);
        $store = $v['mode'] === 'merchant' ? Capabilities::store($r->user(), (int) ($v['store_id'] ?? 0)) : null;

        return ['mode' => $v['mode'], 'store' => $store ? ['id' => $store->store_id, 'name' => $store->name, 'role' => $store->role] : null];
    }

    public function account(Request $r): array
    {
        $v = $r->validate(['action' => ['required', Rule::in(['deactivate', 'request_deletion'])], 'password' => 'required|string']);
        abort_unless(Hash::check($v['password'], $r->user()->password), 422, 'Confirm your password to continue.');
        $user = $r->user();
        $user->forceFill(['status' => $v['action'] === 'deactivate' ? 'inactive' : 'deletion_requested', 'deletion_requested_at' => $v['action'] === 'request_deletion' ? now() : null])->save();
        $user->tokens()->delete();
        DB::table('sessions')->where('user_id', $user->id)->delete();
        Audit::record('identity.'.$v['action'], $user->id, (string) $user->id);
        if ($r->hasSession()) {
            Auth::guard('web')->logout();
            $r->session()->invalidate();
        }

        return ['message' => 'Your account request was recorded. Retained records are handled under the approved retention policy.'];
    }
}
