<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class Address extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected $hidden = ['user_id'];

    protected function casts(): array
    {
        return ['is_default' => 'boolean'];
    }
}
