<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreMember extends Model
{
    protected $table = 'store_members';

    protected $guarded = [];

    protected $hidden = [];

    protected function casts(): array
    {
        return ['permissions' => 'array', 'active' => 'boolean'];
    }
}
