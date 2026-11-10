<?php

namespace App\Http\Controllers;

use App\Domain\Audit;
use App\Domain\Identity\Capabilities;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use PragmaRX\Google2FA\Google2FA;

final class MfaController
{
    private function access(Request $r): void
    {
        abort_unless(! $r->bearerToken() && $r->hasSession() && Capabilities::isAdmin($r->user()) && time() - (int) $r->session()->get('admin_password_at', 0) < 600, 403, 'Sign in again through administrator access.');
    }

    public function enroll(Request $r, Google2FA $engine): array
    {
        $this->access($r);

        return DB::transaction(function () use ($r, $engine) {
            $user = User::query()->whereKey($r->user()->id)->lockForUpdate()->firstOrFail();
            abort_if($user->mfa_confirmed_at !== null, 409, 'Two-step verification is already enrolled.');
            if (! $user->mfa_secret) {
                $user->forceFill(['mfa_secret' => Crypt::encryptString($engine->generateSecretKey(32))])->save();
            }
            $secret = Crypt::decryptString($user->mfa_secret);
            $identifier = $user->email ?? $user->phone;

            return ['secret' => $secret, 'uri' => 'otpauth://totp/'.rawurlencode('Segno Gebeya:'.$identifier).'?secret='.$secret.'&issuer=Segno%20Gebeya'];
        });
    }

    public function verify(Request $r, Google2FA $engine): array
    {
        $this->access($r);
        $v = $r->validate(['code' => 'nullable|digits:6', 'recovery_code' => 'nullable|string|max:80']);
        $codes = null;
        $valid = DB::transaction(function () use ($r, $engine, $v, &$codes) {
            $u = User::query()->whereKey($r->user()->id)->lockForUpdate()->firstOrFail();
            if (! $u->mfa_secret) {
                return false;
            }
            if (! empty($v['recovery_code']) && $u->mfa_confirmed_at) {
                $hashes = $u->mfa_recovery_hashes ?? [];
                $index = null;
                foreach ($hashes as $i => $h) {
                    if (Hash::check($v['recovery_code'], $h)) {
                        $index = $i;
                        break;
                    }
                }
                if ($index === null) {
                    return false;
                }unset($hashes[$index]);
                $u->forceFill(['mfa_recovery_hashes' => array_values($hashes)])->save();
            } else {
                $counter = $engine->verifyKeyNewer(Crypt::decryptString($u->mfa_secret), $v['code'] ?? '', $u->mfa_last_counter ?? 0, 1);
                if ($counter === false) {
                    return false;
                }
                $u->mfa_last_counter = $counter === true ? $engine->getTimestamp() : $counter;
                if (! $u->mfa_confirmed_at) {
                    $codes = [];
                    for ($i = 0; $i < 8; $i++) {
                        $codes[] = Str::upper(Str::random(8)).'-'.Str::upper(Str::random(8));
                    }$u->mfa_recovery_hashes = array_map(fn ($code) => Hash::make($code), $codes);
                    $u->mfa_confirmed_at = now();
                }
                $u->save();
            }
            Audit::record('identity.admin_mfa_verified', $u->id, (string) $u->id, ['recovery' => ! empty($v['recovery_code'])]);

            return true;
        });
        if (! $valid) {
            throw ValidationException::withMessages(['code' => 'The verification code is invalid or already used.']);
        }
        $r->session()->regenerate();
        $r->session()->put(['admin_mfa_at' => time(), 'admin_last_at' => time()]);

        return ['verified' => true, 'recovery_codes' => $codes];
    }
}
