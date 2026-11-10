<?php

namespace App\Domain\Identity;

use App\Domain\Audit;
use App\Jobs\DeliverVerificationEmail;
use App\Models\User;
use App\Models\VerificationChallenge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class IdentityService
{
    public static function identifier(string $input): string
    {
        $input = trim($input);
        if (str_contains($input, '@')) {
            if (! filter_var($input, FILTER_VALIDATE_EMAIL)) {
                throw ValidationException::withMessages(['identifier' => 'Enter a valid email address.']);
            }

            return Str::lower($input);
        }
        $phone = preg_replace('/[\s()-]/', '', $input);
        if (preg_match('/^0([79][0-9]{8})$/', $phone, $matches)) {
            $phone = '+251'.$matches[1];
        }
        if (preg_match('/^251[79][0-9]{8}$/', $phone)) {
            $phone = '+'.$phone;
        }
        if (! preg_match('/^\+[1-9][0-9]{7,14}$/', $phone)) {
            throw ValidationException::withMessages(['identifier' => 'Use an email address or a valid international phone number.']);
        }

        return $phone;
    }

    public static function user(string $identifier): ?User
    {
        return User::query()->where(str_contains($identifier, '@') ? 'email' : 'phone', $identifier)->first();
    }

    public function challenge(User $user, string $identifier, string $purpose, string $client): array
    {
        return DB::transaction(function () use ($user, $identifier, $purpose, $client) {
            // Serialize resend, expiry and verification for this identity.
            User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $recent = VerificationChallenge::query()->where('identifier', $identifier)->where('created_at', '>', now()->subSeconds(60))->exists();
            abort_if($recent, 429, 'Please wait before requesting another code.');
            VerificationChallenge::query()->where('user_id', $user->id)->where('purpose', $purpose)->whereNull('consumed_at')->update(['consumed_at' => now()]);
            $code = (string) random_int(100000, 999999);
            $challenge = VerificationChallenge::create(['user_id' => $user->id, 'identifier' => $identifier, 'purpose' => $purpose, 'client' => $client, 'code_hash' => Hash::make($code), 'expires_at' => now()->addMinutes(5)]);
            DB::afterCommit(function () use ($identifier, $code, $purpose) {
                if (app()->environment(['local', 'testing']) && config('segno.development_otp')) {
                    DB::table('development_messages')->insert(['identifier' => $identifier, 'payload' => Crypt::encryptString(json_encode(['code' => $code, 'purpose' => $purpose], JSON_THROW_ON_ERROR)), 'created_at' => now(), 'updated_at' => now()]);
                }if (str_contains($identifier, '@')) {
                    DeliverVerificationEmail::dispatch($identifier, $code);
                } elseif (! (app()->environment(['local', 'testing']) && config('segno.development_otp'))) {
                    abort(503, 'Phone verification delivery is not configured. Try another verified method.');
                }
            });

            return ['challenge_id' => $challenge->id, 'expires_in' => 300, 'retry_after' => 60, 'delivery' => config('segno.development_otp') && app()->environment(['local', 'testing']) ? 'development_capture' : 'configured_channel', 'message' => 'If the request is eligible, verification instructions are available through the selected channel.'];
        });
    }

    public function verify(string $id, string $code, string $purpose, Request $request): array
    {
        $outcome = DB::transaction(function () use ($id, $code, $purpose, $request) {
            $c = VerificationChallenge::query()->whereKey($id)->lockForUpdate()->first();
            if (! $c || $c->purpose !== $purpose || $c->consumed_at || $c->expires_at->isPast() || $c->attempts >= 5) {
                return ['invalid' => true];
            }
            $c->increment('attempts');
            if (! Hash::check($code, $c->code_hash)) {
                return ['invalid' => true];
            }
            $c->consumed_at = now();
            if ($purpose === 'recover') {
                $token = Str::random(64);
                $c->reset_hash = hash('sha256', $token);
                $c->reset_expires_at = now()->addMinutes(5);
                $c->save();

                return ['reset_token' => $token, 'challenge_id' => $id];
            }
            $user = User::findOrFail($c->user_id);
            if ($user->status !== 'active') {
                return ['invalid' => true];
            }
            // Credentials are chosen by the party proving channel ownership, including a reclaimed unverified registration.
            $user->forceFill([str_contains($c->identifier, '@') ? 'email_verified_at' : 'phone_verified_at' => now(), 'password' => $request->input('password')])->save();
            $user->tokens()->delete();
            DB::table('sessions')->where('user_id', $user->id)->delete();
            $c->save();
            Audit::record('identity.verified', $user->id, (string) $user->id);

            return ['user' => $user, 'client' => $c->client];
        });
        if (isset($outcome['invalid'])) {
            throw ValidationException::withMessages(['code' => 'This code is incorrect, expired or no longer available.']);
        }

        return isset($outcome['user']) ? $this->authenticate($outcome['user'], $outcome['client'], $request) : $outcome;
    }

    public function authenticate(User $user, string $client, Request $request): array
    {
        if ($client === 'web') {
            abort_unless($request->hasSession(), 422, 'Use a trusted browser session.');
            Auth::guard('web')->login($user);
            $request->session()->regenerate();
            $request->session()->put(['auth_started_at' => time(), 'auth_last_at' => time()]);
            $request->session()->forget(['admin_mfa_at', 'admin_last_at', 'admin_password_at']);
            $token = null;
        } else {
            $token = $user->createToken(Str::limit((string) $request->input('device_name', 'Mobile device'), 80), ['mobile'], now()->addDays(config('segno.token_days')))->plainTextToken;
        }
        Audit::record('identity.signed_in', $user->id, (string) $user->id, ['client' => $client]);

        return ['user' => Capabilities::profile($user), 'token' => $token];
    }

    public function reset(string $id, string $token, string $password): void
    {
        $ok = DB::transaction(function () use ($id, $token, $password) {
            $c = VerificationChallenge::query()->whereKey($id)->lockForUpdate()->first();
            if (! $c || $c->purpose !== 'recover' || ! $c->reset_hash || $c->reset_consumed_at || ! $c->reset_expires_at || $c->reset_expires_at->isPast() || ! hash_equals($c->reset_hash, hash('sha256', $token))) {
                return false;
            }
            $user = User::query()->whereKey($c->user_id)->lockForUpdate()->firstOrFail();
            $user->forceFill(['password' => $password, 'remember_token' => Str::random(60)])->save();
            $user->tokens()->delete();
            DB::table('sessions')->where('user_id', $user->id)->delete();
            $c->reset_consumed_at = now();
            $c->save();
            Audit::record('identity.password_reset', $user->id, (string) $user->id);

            return true;
        });
        if (! $ok) {
            throw ValidationException::withMessages(['token' => 'This recovery request is no longer available.']);
        }
    }
}
