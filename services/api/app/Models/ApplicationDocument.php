<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ApplicationDocument extends Model
{
    use HasUuids;

    protected $table = 'application_documents';

    protected $guarded = [];

    protected $hidden = ['path'];

    protected function casts(): array
    {
        return [];
    }
}
