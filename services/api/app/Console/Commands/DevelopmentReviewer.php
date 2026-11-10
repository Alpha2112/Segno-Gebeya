<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

final class DevelopmentReviewer extends Command
{
    protected $signature = 'segno:test-reviewer {--customer}';

    protected $description = 'Create a random reviewer for isolated local browser tests';

    public function handle(): int
    {
        if (! app()->environment(['local', 'testing']) || ! in_array(config('database.connections.mysql.database'), ['segno_gebeya', 'segno_gebeya_test'], true)) {
            $this->error('Isolated local database required.');

            return 1;
        }
        $password = Str::random(32);
        $email = 'reviewer-'.Str::lower(Str::random(12)).'@example.test';
        $u = User::create(['name' => 'Local test identity', 'email' => $email, 'email_verified_at' => now(), 'password' => $password, 'roles' => [$this->option('customer') ? 'customer' : 'administrator']]);
        $this->line(json_encode(['id' => $u->id, 'email' => $email, 'password' => $password], JSON_THROW_ON_ERROR));

        return 0;
    }
}
