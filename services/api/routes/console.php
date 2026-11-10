<?php

use App\Domain\Audit;
use App\Domain\Identity\IdentityService;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

Artisan::command('segno:admin {email}', function () {
    $email = strtolower($this->argument('email'));
    if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $this->error('A valid email is required.');

        return 1;
    }
    if (User::where('email', $email)->exists()) {
        $this->error('Existing identities cannot be promoted through provisioning.');

        return 1;
    }
    $password = $this->secret('Initial password (at least 12 characters)');
    if (strlen($password ?? '') < 12) {
        $this->error('Password is too short.');

        return 1;
    }
    $u = User::create(['name' => 'Administrator', 'email' => $email, 'email_verified_at' => now(), 'password' => $password, 'roles' => ['administrator'], 'locale' => 'en']);
    Audit::record('identity.admin_provisioned', null, (string) $u->id);
    $this->info('Administrator provisioned. MFA enrollment is required on first sign-in.');
})->purpose('Provision an administrator through an operator-controlled console');

Artisan::command('segno:otp {identifier}', function () {
    if (! app()->environment(['local', 'testing']) || ! config('segno.development_otp')) {
        $this->error('Local development capture is disabled.');

        return 1;
    }
    $id = IdentityService::identifier($this->argument('identifier'));
    $m = DB::table('development_messages')->where('identifier', $id)->latest('id')->first();
    if (! $m) {
        $this->error('No captured message.');

        return 1;
    }
    $this->line(Crypt::decryptString($m->payload));
})->purpose('Read an OTP from the isolated local development adapter');
