<?php

namespace Tests\Feature;

use App\Domain\Identity\IdentityService;
use App\Models\MerchantApplication;
use App\Models\Store;
use App\Models\StoreMember;
use App\Models\User;
use App\Models\VerificationChallenge;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class IdentityAndMerchantTest extends TestCase
{
    use RefreshDatabase;

    public function test_channel_owner_replaces_the_password_of_an_unverified_pre_registration(): void
    {
        $u = $this->user(['email_verified_at' => null, 'password' => 'pre-registration password']);
        $receipt = app(IdentityService::class)->challenge($u, $u->email, 'verify', 'mobile');
        VerificationChallenge::findOrFail($receipt['challenge_id'])->update(['code_hash' => Hash::make('123456')]);
        $this->postJson('/api/v1/auth/verify', ['challenge_id' => $receipt['challenge_id'], 'purpose' => 'verify', 'code' => '123456', 'password' => 'owner chosen password', 'password_confirmation' => 'owner chosen password'])->assertOk();
        $this->assertFalse(Hash::check('pre-registration password', $u->fresh()->password));
        $this->assertTrue(Hash::check('owner chosen password', $u->fresh()->password));
    }

    public function test_utf8_password_suffix_after_72_bytes_is_significant(): void
    {
        $password = str_repeat('መ', 30).'correct suffix';
        $user = $this->user(['password' => $password]);
        $this->assertSame('argon2id', password_get_info($user->password)['algoName']);
        $this->postJson('/api/v1/auth/login', ['identifier' => $user->email, 'password' => str_repeat('መ', 30).'wrong suffix', 'client' => 'mobile'])->assertUnprocessable();
        $this->postJson('/api/v1/auth/login', ['identifier' => $user->email, 'password' => $password, 'client' => 'mobile'])->assertOk();
    }

    public function test_unauthenticated_api_is_json_even_without_an_accept_header(): void
    {
        $this->get('/api/v1/me')->assertUnauthorized()->assertHeader('Content-Type', 'application/json');
    }

    private function user(array $attributes = []): User
    {
        return User::create([...['name' => 'Test person', 'email' => fake()->unique()->safeEmail(), 'email_verified_at' => now(), 'password' => 'a safe test password', 'locale' => 'en', 'roles' => ['customer']], ...$attributes]);
    }

    private function token(User $u): string
    {
        return $u->createToken('test device', ['mobile'], now()->addDays(7))->plainTextToken;
    }

    private function admin(User $u): self
    {
        app('auth')->forgetGuards();

        return $this->withHeader('Origin', 'http://localhost:15174')->actingAs($u, 'web')->withSession(['password_hash_web' => $u->getAuthPassword(), 'auth_started_at' => time(), 'auth_last_at' => time(), 'admin_password_at' => time(), 'admin_mfa_at' => time(), 'admin_last_at' => time()]);
    }

    private function application(User $u): MerchantApplication
    {
        return MerchantApplication::create(['user_id' => $u->id, 'store_name' => 'Test store', 'business_type' => 'individual', 'representative' => 'Test person', 'status' => 'submitted']);
    }

    public function test_registration_phone_normalization_otp_replay_and_role_injection(): void
    {
        $r = $this->postJson('/api/v1/auth/register', ['identifier' => '0912345678', 'password' => 'a safe test password', 'password_confirmation' => 'a safe test password', 'locale' => 'am', 'client' => 'mobile', 'terms' => true, 'roles' => ['administrator']])->assertAccepted();
        $u = User::where('phone', '+251912345678')->firstOrFail();
        $this->assertSame(['customer'], $u->roles);
        $c = VerificationChallenge::findOrFail($r->json('challenge_id'));
        // Delivery callbacks run after the outer RefreshDatabase transaction; use a controlled verifier fixture.
        $c->update(['code_hash' => Hash::make('123456')]);
        $this->postJson('/api/v1/auth/verify', ['challenge_id' => $c->id, 'purpose' => 'recover', 'code' => '123456'])->assertUnprocessable();
        $result = $this->postJson('/api/v1/auth/verify', ['challenge_id' => $c->id, 'purpose' => 'verify', 'password' => 'a safe test password', 'password_confirmation' => 'a safe test password', 'code' => '123456'])->assertOk()->assertJsonPath('user.locale', 'am');
        $this->assertNotEmpty($result->json('token'));
        $this->assertNotNull($u->fresh()->phone_verified_at);
        $this->postJson('/api/v1/auth/verify', ['challenge_id' => $c->id, 'purpose' => 'verify', 'password' => 'a safe test password', 'password_confirmation' => 'a safe test password', 'code' => '123456'])->assertUnprocessable();
    }

    public function test_challenges_expire_limit_attempts_and_resends(): void
    {
        $u = $this->user(['email_verified_at' => null]);
        $identity = app(IdentityService::class);
        $receipt = $identity->challenge($u, $u->email, 'verify', 'mobile');
        $c = VerificationChallenge::findOrFail($receipt['challenge_id']);
        $c->update(['code_hash' => Hash::make('123456')]);
        $this->postJson('/api/v1/auth/challenges', ['identifier' => $u->email, 'purpose' => 'verify', 'password' => 'a safe test password', 'password_confirmation' => 'a safe test password', 'client' => 'mobile'])->assertStatus(429);
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/verify', ['challenge_id' => $c->id, 'purpose' => 'verify', 'password' => 'a safe test password', 'password_confirmation' => 'a safe test password', 'code' => '999999'])->assertUnprocessable();
        }
        $this->postJson('/api/v1/auth/verify', ['challenge_id' => $c->id, 'purpose' => 'verify', 'password' => 'a safe test password', 'password_confirmation' => 'a safe test password', 'code' => '123456'])->assertUnprocessable();
        $this->assertSame(5, $c->fresh()->attempts);
        $c->update(['attempts' => 0, 'expires_at' => now()->subSecond()]);
        $this->postJson('/api/v1/auth/verify', ['challenge_id' => $c->id, 'purpose' => 'verify', 'password' => 'a safe test password', 'password_confirmation' => 'a safe test password', 'code' => '123456'])->assertUnprocessable();
    }

    public function test_recovery_is_generic_single_use_and_revokes_devices(): void
    {
        $u = $this->user();
        $token = $this->token($u);
        $known = $this->postJson('/api/v1/auth/challenges', ['identifier' => $u->email, 'purpose' => 'recover', 'client' => 'mobile'])->assertAccepted();
        $unknown = $this->postJson('/api/v1/auth/challenges', ['identifier' => 'unknown@example.test', 'purpose' => 'recover', 'client' => 'mobile'])->assertAccepted();
        foreach (['delivery', 'message', 'expires_in', 'retry_after'] as $key) {
            $this->assertSame($known->json($key), $unknown->json($key));
        }
        $c = VerificationChallenge::findOrFail($known->json('challenge_id'));
        $c->update(['code_hash' => Hash::make('123456')]);
        $r = $this->postJson('/api/v1/auth/verify', ['challenge_id' => $c->id, 'purpose' => 'recover', 'code' => '123456'])->assertOk();
        $body = ['challenge_id' => $c->id, 'token' => $r->json('reset_token'), 'password' => 'a new safe password', 'password_confirmation' => 'a new safe password'];
        $this->postJson('/api/v1/auth/reset-password', $body)->assertOk();
        $this->postJson('/api/v1/auth/reset-password', $body)->assertUnprocessable();
        $this->withToken($token)->getJson('/api/v1/me')->assertUnauthorized();
    }

    public function test_device_expiry_revocation_profile_and_customer_privacy(): void
    {
        $a = $this->user();
        $b = $this->user();
        $token = $this->token($a);
        $foreign = $b->createToken('other device')->accessToken->id;
        $this->withToken($token)->patchJson('/api/v1/profile', ['name' => 'A', 'username' => 'my_name', 'bio' => 'Hello', 'locale' => 'am', 'roles' => ['administrator']])->assertOk()->assertJsonPath('user.roles.0', 'customer');
        $this->deleteJson('/api/v1/sessions/token:'.$foreign)->assertNotFound();
        $id = $a->tokens()->firstOrFail()->id;
        $this->deleteJson('/api/v1/sessions/token:'.$id)->assertOk();
        // Sanctum's resolved guard is request-scoped in production; reset between synthetic requests.
        app('auth')->forgetGuards();
        $this->getJson('/api/v1/me')->assertUnauthorized();
        $expired = $a->createToken('expired', ['mobile'], now()->subMinute())->plainTextToken;
        app('auth')->forgetGuards();
        $this->withToken($expired)->getJson('/api/v1/me')->assertUnauthorized();
    }

    public function test_pending_applicant_cannot_switch_store_or_access_another_application(): void
    {
        Storage::fake('local');
        $a = $this->user();
        $b = $this->user();
        $other = $this->application($b);
        $this->withToken($this->token($a))->patchJson('/api/v1/merchant/applications/'.$other->id, ['store_name' => 'Stolen', 'business_type' => 'individual', 'representative' => 'A', 'revision' => 1])->assertNotFound();
        $create = $this->postJson('/api/v1/merchant/applications', ['store_name' => 'My store', 'business_type' => 'individual', 'representative' => 'A'])->assertOk();
        $id = $create->json('application.id');
        $this->postJson('/api/v1/merchant/applications/'.$id.'/documents', ['document' => UploadedFile::fake()->create('unsafe.html', 1, 'text/html')])->assertUnprocessable();
        $upload = $this->postJson('/api/v1/merchant/applications/'.$id.'/documents', ['document' => UploadedFile::fake()->createWithContent('evidence.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+c2ioAAAAASUVORK5CYII='))])->assertOk();
        $this->assertArrayNotHasKey('path', $upload->json('application.documents.0'));
        $rev = $upload->json('application.revision');
        $this->postJson('/api/v1/merchant/applications/'.$id.'/submit', ['revision' => 1, 'declaration' => true])->assertConflict();
        $this->postJson('/api/v1/merchant/applications/'.$id.'/submit', ['revision' => $rev, 'declaration' => true])->assertOk()->assertJsonPath('application.status', 'submitted');
        $this->putJson('/api/v1/context', ['mode' => 'merchant', 'store_id' => 999])->assertForbidden();
        $this->getJson('/api/v1/admin/applications')->assertForbidden();
    }

    public function test_admin_mfa_totp_replay_and_one_time_recovery(): void
    {
        $u = $this->user(['roles' => ['administrator']]);
        $this->withHeader('Origin', 'http://localhost:15174')->actingAs($u, 'web')->withSession(['auth_started_at' => time(), 'auth_last_at' => time(), 'admin_password_at' => time()]);
        $this->getJson('/api/v1/admin/applications')->assertForbidden();
        $enroll = $this->postJson('/api/v1/admin/mfa/enroll')->assertOk();
        $code = app(Google2FA::class)->getCurrentOtp($enroll->json('secret'));
        $codes = $this->postJson('/api/v1/admin/mfa/verify', ['code' => $code])->assertOk()->json('recovery_codes');
        $this->assertCount(8, $codes);
        $this->postJson('/api/v1/admin/mfa/verify', ['code' => $code])->assertUnprocessable();
        $this->postJson('/api/v1/admin/mfa/verify', ['recovery_code' => $codes[0]])->assertOk();
        $this->postJson('/api/v1/admin/mfa/verify', ['recovery_code' => $codes[0]])->assertUnprocessable();
        $this->getJson('/api/v1/admin/applications')->assertOk();
        $this->postJson('/api/v1/admin/mfa/enroll')->assertStatus(429);
        $this->travel(61)->seconds();
        $this->postJson('/api/v1/admin/mfa/enroll')->assertConflict();
    }

    public function test_review_resubmit_confirmation_conflict_idempotence_and_revocation(): void
    {
        $owner = $this->user();
        $reviewer = $this->user(['roles' => ['administrator']]);
        $app = $this->application($owner);
        $this->admin($reviewer);
        $propose = $this->postJson('/api/v1/admin/applications/'.$app->id.'/decisions', ['revision' => 1, 'action' => 'request_information', 'reason' => 'Please clarify the representative.'])->assertOk();
        $this->assertSame('submitted', $app->fresh()->status);
        $this->postJson('/api/v1/admin/confirmations/'.$propose->json('confirmation_id'), ['token' => $propose->json('token')])->assertOk()->assertJsonPath('application.status', 'information_needed');
        app('auth')->forgetGuards();
        $this->actingAs($owner, 'web')->withSession(['password_hash_web' => $owner->getAuthPassword()]);
        $this->patchJson('/api/v1/merchant/applications/'.$app->id, ['revision' => 2, 'store_name' => 'My store', 'business_type' => 'individual', 'representative' => 'Updated name'])->assertOk();
        $this->postJson('/api/v1/merchant/applications/'.$app->id.'/submit', ['revision' => 3, 'declaration' => true])->assertOk();
        $this->admin($reviewer);
        $a = $this->postJson('/api/v1/admin/applications/'.$app->id.'/decisions', ['revision' => 4, 'action' => 'approve', 'reason' => 'Development checklist reviewed.'])->assertOk();
        $b = $this->postJson('/api/v1/admin/applications/'.$app->id.'/decisions', ['revision' => 4, 'action' => 'reject', 'reason' => 'Conflicting decision.'])->assertOk();
        $url = '/api/v1/admin/confirmations/'.$a->json('confirmation_id');
        $body = ['token' => $a->json('token')];
        $this->postJson($url, $body)->assertOk();
        $this->postJson($url, $body)->assertOk();
        $this->assertSame(1, Store::count());
        $this->assertSame(1, StoreMember::count());
        $this->postJson('/api/v1/admin/confirmations/'.$b->json('confirmation_id'), ['token' => $b->json('token')])->assertConflict();
        $store = Store::firstOrFail();
        app('auth')->forgetGuards();
        $this->actingAs($owner, 'web')->withSession(['password_hash_web' => $owner->getAuthPassword()])->putJson('/api/v1/context', ['mode' => 'merchant', 'store_id' => $store->id])->assertOk();
        StoreMember::query()->update(['active' => false]);
        $this->putJson('/api/v1/context', ['mode' => 'merchant', 'store_id' => $store->id])->assertForbidden();
        $this->putJson('/api/v1/context', ['mode' => 'customer'])->assertOk();
    }

    public function test_support_finance_and_customer_cannot_review_or_read_documents(): void
    {
        $app = $this->application($this->user());
        foreach (['customer', 'support', 'finance'] as $role) {
            $u = $this->user(['roles' => [$role]]);
            $this->admin($u)->getJson('/api/v1/admin/applications/'.$app->id)->assertForbidden();
        }
    }

    public function test_production_submission_fails_closed_and_account_restriction_revokes_access(): void
    {
        $u = $this->user();
        $app = $this->application($u);
        $app->update(['status' => 'draft']);
        config(['segno.merchant_evidence_policy' => 'unqualified']);
        $this->withToken($this->token($u))->postJson('/api/v1/merchant/applications/'.$app->id.'/submit', ['revision' => 1, 'declaration' => true])->assertStatus(503);
        $this->postJson('/api/v1/account/actions', ['action' => 'request_deletion', 'password' => 'a safe test password'])->assertOk();
        $this->assertSame('deletion_requested', $u->fresh()->status);
        $this->assertSame(0, $u->tokens()->count());
    }
}
