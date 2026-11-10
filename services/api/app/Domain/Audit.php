<?php

namespace App\Domain;

use Illuminate\Support\Facades\DB;

final class Audit
{
    public static function record(string $event, ?int $actor = null, ?string $subject = null, array $context = []): void
    {
        DB::table('audit_events')->insert(['actor_id' => $actor, 'event' => $event, 'subject' => $subject, 'context' => json_encode($context, JSON_THROW_ON_ERROR), 'request_id' => app()->bound('request') ? request()->attributes->get('request_id') : null, 'created_at' => now()]);
    }
}
