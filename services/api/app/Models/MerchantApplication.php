<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class MerchantApplication extends Model
{
    protected $attributes = ['status' => 'draft', 'revision' => 1];

    use HasUuids;

    protected $table = 'merchant_applications';

    protected $guarded = [];

    protected $hidden = [];

    protected function casts(): array
    {
        return ['submitted_at' => 'datetime'];
    }
}
