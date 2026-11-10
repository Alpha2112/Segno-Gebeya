<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property list<string>|null $roles
 * @property list<string>|null $mfa_recovery_hashes
 * @property Carbon|null $mfa_confirmed_at
 * @property Carbon|null $deletion_requested_at
 */
#[Fillable(['name', 'email', 'phone', 'password', 'locale', 'roles', 'email_verified_at', 'phone_verified_at', 'username', 'bio', 'status', 'mfa_secret', 'mfa_recovery_hashes', 'mfa_last_counter', 'mfa_confirmed_at', 'deletion_requested_at'])]
#[Hidden(['password', 'remember_token', 'mfa_secret', 'mfa_recovery_hashes', 'mfa_last_counter', 'avatar_path'])]
class User extends Authenticatable
{
    protected $attributes = ['status' => 'active', 'name' => '', 'locale' => 'en', 'roles' => '["customer"]'];

    /** @use HasFactory<UserFactory> */
    use HasFactory, \Laravel\Sanctum\HasApiTokens, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'roles' => 'array',
            'phone_verified_at' => 'datetime',
            'mfa_confirmed_at' => 'datetime',
            'mfa_recovery_hashes' => 'array',
            'deletion_requested_at' => 'datetime',
        ];
    }
}
