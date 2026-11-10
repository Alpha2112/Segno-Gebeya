<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property Carbon $expires_at
 * @property Carbon|null $reset_expires_at
 * @property Carbon|null $consumed_at
 * @property Carbon|null $reset_consumed_at
 */
class VerificationChallenge extends Model
{
    protected $attributes = ['attempts' => 0];

    use HasUuids;

    protected $table = 'verification_challenges';

    protected $guarded = [];

    protected $hidden = ['code_hash', 'reset_hash'];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime', 'consumed_at' => 'datetime', 'reset_expires_at' => 'datetime', 'reset_consumed_at' => 'datetime'];
    }
}
