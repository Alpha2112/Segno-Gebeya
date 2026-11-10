<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileResourcesTest extends TestCase
{
    use RefreshDatabase;

    private function login(): User
    {
        $u = User::create(['email' => fake()->unique()->safeEmail(), 'email_verified_at' => now(), 'password' => 'a safe test password']);
        $this->withToken($u->createToken('test', ['mobile'])->plainTextToken);

        return $u;
    }

    private function address(string $label = 'Home'): array
    {
        return ['label' => $label, 'recipient' => 'Test recipient', 'phone' => '0912345678', 'country' => 'ET', 'city' => 'Addis Ababa', 'sub_city' => 'Bole', 'woreda' => '03', 'house' => '12', 'directions' => 'Near the community centre', 'is_default' => true];
    }

    public function test_addresses_are_private_normalized_and_have_one_default(): void
    {
        $a = $this->login();
        $first = $this->postJson('/api/v1/addresses', $this->address())->assertOk()->assertJsonPath('address.phone', '+251912345678')->assertJsonPath('address.is_default', true)->json('address.id');
        $this->postJson('/api/v1/addresses', $this->address('Work'))->assertOk();
        $this->assertSame(1, Address::where('user_id', $a->id)->where('is_default', true)->count());
        app('auth')->forgetGuards();
        $this->login();
        $this->getJson('/api/v1/addresses')->assertJsonCount(0, 'addresses');
        $this->patchJson('/api/v1/addresses/'.$first, $this->address())->assertNotFound();
        $this->deleteJson('/api/v1/addresses/'.$first)->assertNotFound();
        $this->postJson('/api/v1/addresses', [...$this->address(), 'country' => 'US'])->assertUnprocessable();
    }

    public function test_preferences_and_photo_preserve_privacy_and_remove_metadata(): void
    {
        Storage::fake('local');
        $u = $this->login();
        $this->patchJson('/api/v1/preferences', ['locale' => 'am', 'country' => 'ET', 'roles' => ['administrator']])->assertOk()->assertJsonPath('user.locale', 'am')->assertJsonPath('user.roles.0', 'customer');
        $this->postJson('/api/v1/profile/photo', ['photo' => UploadedFile::fake()->create('image.svg', 1, 'image/svg+xml')])->assertUnprocessable();
        $this->postJson('/api/v1/profile/photo', ['photo' => UploadedFile::fake()->image('avatar.jpg', 64, 64)])->assertOk()->assertJsonPath('user.has_photo', true);
        $path = $u->fresh()->avatar_path;
        Storage::disk('local')->assertExists($path);
        app('auth')->forgetGuards();
        $this->get('/api/v1/profile/photo')->assertOk()->assertHeader('Content-Type', 'image/png');
        $this->assertSame('image/png', getimagesizefromstring(Storage::disk('local')->get($path))['mime']);
        $this->deleteJson('/api/v1/profile/photo')->assertOk()->assertJsonPath('user.has_photo', false);
        app('auth')->forgetGuards();
        $this->get('/api/v1/profile/photo')->assertNotFound();
    }

    public function test_password_change_requires_current_password_and_revokes_every_device(): void
    {
        $u = $this->login();
        $u->createToken('second device');
        $body = ['current_password' => 'wrong', 'password' => 'a new safe password', 'password_confirmation' => 'a new safe password'];
        $this->postJson('/api/v1/account/password', $body)->assertUnprocessable();
        $this->postJson('/api/v1/account/password', [...$body, 'current_password' => 'a safe test password'])->assertOk();
        $this->assertSame(0, $u->tokens()->count());
        app('auth')->forgetGuards();
        $this->getJson('/api/v1/me')->assertUnauthorized();
    }
}
